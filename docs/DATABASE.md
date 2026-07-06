# DATABASE — DeskControl

> Schema completo, modelado para escala, auditoria e isolamento multi-tenant.

---

## 1. PRINCÍPIOS DO SCHEMA

- **Tenant-first:** `empresa_id` em toda tabela de negócio — sem exceção
- **Soft delete:** `deleted_at TIMESTAMPTZ NULL` — nada é apagado fisicamente
- **Auditoria:** `created_at`, `updated_at`, `created_by`, `updated_by` em toda tabela relevante
- **UUIDs:** PKs como `gen_random_uuid()` — sem inteiros sequenciais que expõem volume
- **Imutabilidade:** tabelas de eventos/timeline nunca têm UPDATE — só INSERT
- **Tipagem forte:** ENUMs para estados com domínio fixo; TEXT para valores dinâmicos

---

## 2. DIAGRAMA DE RELACIONAMENTOS (ERD)

```
empresas ─────────────────────────────────────────────────────┐
    │                                                          │
    ├─── usuarios                                              │
    │       └── (auth.users via auth_user_id)                  │
    │                                                          │
    ├─── clientes ──────────────────────────────────────────┐  │
    │       └─── equipamentos ──────────────────────────┐   │  │
    │                                                    │   │  │
    ├─── ordens_servico ◄────────────────────────────────┘   │  │
    │       │   └── (cliente_id) ◄──────────────────────────┘  │
    │       ├─── os_itens                                       │
    │       ├─── os_eventos (timeline imutável)                 │
    │       ├─── os_fotos                                       │
    │       ├─── os_checklists                                  │
    │       ├─── os_checklist_itens                             │
    │       └─── os_assinatura                                  │
    │                                                          │
    ├─── orcamentos                                             │
    │       └─── orcamento_itens                                │
    │                                                          │
    ├─── produtos (catálogo/estoque)                            │
    │       └─── estoque_movimentacoes                          │
    │                                                          │
    ├─── transacoes                                             │
    │       └─── transacao_parcelas                             │
    │                                                          │
    ├─── caixas                                                 │
    │       └─── caixa_movimentacoes                            │
    │                                                          │
    ├─── contratos                                              │
    │       └─── contrato_os                                    │
    │                                                          │
    ├─── garantias                                              │
    │                                                          │
    ├─── agenda_eventos                                         │
    │                                                          │
    ├─── configuracoes_empresa                                  │
    ├─── notificacoes                                           │
    └─── audit_log                                              │
                                                               │
planos ◄────────────────────────────────────────────────────┘
```

---

## 3. SCHEMA COMPLETO

### ENUM TYPES

```sql
-- Roles de usuário
CREATE TYPE user_role AS ENUM (
  'super_admin',    -- GRP Tecnologia
  'admin',          -- Dono da empresa
  'gerente',        -- Gerente da loja
  'atendente',      -- Recepção / balcão
  'tecnico',        -- Executa OS
  'financeiro',     -- Apenas financeiro
  'cliente'         -- Acesso ao portal do cliente
);

CREATE TYPE user_status AS ENUM ('ativo', 'inativo', 'convite_pendente');

-- Planos SaaS
CREATE TYPE empresa_plano AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE empresa_status AS ENUM ('trial', 'ativo', 'suspenso', 'cancelado');

-- Tipos de pessoa
CREATE TYPE pessoa_tipo AS ENUM ('fisica', 'juridica');

-- Status da OS — fluxo completo
CREATE TYPE os_status AS ENUM (
  'aberta',
  'em_diagnostico',
  'aguardando_aprovacao',
  'aprovada',
  'em_reparo',
  'aguardando_pecas',
  'aguardando_cliente',
  'em_transito',
  'pronto',
  'entregue',
  'em_garantia',
  'cancelada'
);

CREATE TYPE os_prioridade AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE os_origem AS ENUM ('presencial', 'whatsapp', 'email', 'telefone', 'portal', 'contrato');

-- Financeiro
CREATE TYPE transacao_tipo AS ENUM ('receita', 'despesa');
CREATE TYPE transacao_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado', 'estornado');
CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'boleto', 'transferencia', 'cheque', 'outro');

-- Estoque
CREATE TYPE estoque_tipo_mov AS ENUM ('entrada', 'saida', 'ajuste', 'reserva', 'devolucao');

-- Agenda
CREATE TYPE agenda_tipo AS ENUM ('os', 'visita', 'retirada', 'entrega', 'bloqueio', 'outro');
CREATE TYPE agenda_status AS ENUM ('agendado', 'confirmado', 'realizado', 'cancelado', 'reagendado');
```

---

### PLANOS (gerenciado pela GRP)

```sql
CREATE TABLE planos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT NOT NULL,
  slug            empresa_plano NOT NULL UNIQUE,
  preco_mensal    NUMERIC(10,2) NOT NULL,
  preco_anual     NUMERIC(10,2) NOT NULL,
  max_usuarios    INTEGER,           -- NULL = ilimitado
  max_os_mes      INTEGER,           -- NULL = ilimitado
  features        JSONB NOT NULL DEFAULT '{}',
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exemplo de features:
-- {"whatsapp": true, "portal_cliente": true, "api": false, "white_label": false}
```

---

### EMPRESAS

```sql
CREATE TABLE empresas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              TEXT NOT NULL,
  razao_social      TEXT,
  cnpj              TEXT,
  slug              TEXT UNIQUE NOT NULL,
  plano_id          UUID REFERENCES planos(id),
  plano             empresa_plano NOT NULL DEFAULT 'starter',
  status            empresa_status NOT NULL DEFAULT 'trial',
  trial_ate         TIMESTAMPTZ,
  -- Dados de contato
  email             TEXT,
  telefone          TEXT,
  whatsapp          TEXT,
  site              TEXT,
  -- Endereço
  cep               TEXT,
  endereco          TEXT,
  numero            TEXT,
  complemento       TEXT,
  bairro            TEXT,
  cidade            TEXT,
  estado            CHAR(2),
  -- Personalização
  logo_url          TEXT,
  cor_primaria      TEXT DEFAULT '#2563EB',
  -- Metadados
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ        -- soft delete
);

CREATE INDEX idx_empresas_slug ON empresas(slug) WHERE deleted_at IS NULL;
```

---

### USUÁRIOS

```sql
CREATE TABLE usuarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'tecnico',
  status          user_status NOT NULL DEFAULT 'convite_pendente',
  avatar_url      TEXT,
  telefone        TEXT,
  whatsapp        TEXT,
  cor_agenda      TEXT DEFAULT '#3B82F6',  -- cor do técnico na agenda
  comissao_pct    NUMERIC(5,2),            -- % de comissão
  ultimo_acesso   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id),
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_usuarios_email_empresa ON usuarios(empresa_id, email)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_auth ON usuarios(auth_user_id);
```

---

### CONFIGURAÇÕES DA EMPRESA

```sql
CREATE TABLE configuracoes_empresa (
  empresa_id              UUID PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
  -- OS
  os_prefixo              TEXT DEFAULT 'OS',
  os_numero_inicial       INTEGER DEFAULT 1,
  os_numero_atual         INTEGER DEFAULT 0,
  os_prazo_padrao_dias    INTEGER DEFAULT 5,
  os_exigir_foto_entrada  BOOLEAN DEFAULT true,
  os_exigir_foto_saida    BOOLEAN DEFAULT true,
  os_texto_garantia       TEXT DEFAULT 'Garantia de 90 dias para o serviço realizado.',
  -- Financeiro
  usar_caixa              BOOLEAN DEFAULT true,
  formas_pagamento        TEXT[] DEFAULT ARRAY['dinheiro', 'pix', 'cartao_credito'],
  -- WhatsApp
  whatsapp_instancia      TEXT,
  whatsapp_token          TEXT,
  whatsapp_ativo          BOOLEAN DEFAULT false,
  msg_os_criada           TEXT,
  msg_pronto_retirada     TEXT,
  msg_orcamento_enviado   TEXT,
  -- Notificações
  notif_os_sem_atualizacao_h INTEGER DEFAULT 24,
  notif_estoque_minimo    BOOLEAN DEFAULT true,
  -- Portal do cliente
  portal_ativo            BOOLEAN DEFAULT true,
  portal_mostrar_fotos    BOOLEAN DEFAULT true,
  portal_mostrar_orcamento BOOLEAN DEFAULT true,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### CLIENTES

```sql
CREATE TABLE clientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  -- Identificação
  nome            TEXT NOT NULL,
  tipo            pessoa_tipo NOT NULL DEFAULT 'fisica',
  cpf_cnpj        TEXT,
  rg_ie           TEXT,
  data_nascimento DATE,
  -- Contato
  email           TEXT,
  telefone        TEXT,
  whatsapp        TEXT,
  -- Endereço
  cep             TEXT,
  endereco        TEXT,
  numero          TEXT,
  complemento     TEXT,
  bairro          TEXT,
  cidade          TEXT,
  estado          CHAR(2),
  -- CRM
  tags            TEXT[] DEFAULT '{}',
  observacoes     TEXT,
  obs_internas    TEXT,   -- não visível no portal
  -- Full-text search
  fts             TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(nome,'') || ' ' ||
    coalesce(cpf_cnpj,'') || ' ' || coalesce(email,'') || ' ' ||
    coalesce(telefone,'') || ' ' || coalesce(whatsapp,''))
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_clientes_empresa ON clientes(empresa_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clientes_fts ON clientes USING GIN(fts);
CREATE INDEX idx_clientes_cpf ON clientes(empresa_id, cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;
```

---

### EQUIPAMENTOS

```sql
CREATE TABLE equipamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
  -- Identificação
  nome            TEXT NOT NULL,    -- ex: "Notebook Dell"
  tipo            TEXT,             -- ex: "notebook", "smartphone", "impressora"
  marca           TEXT,
  modelo          TEXT,
  numero_serie    TEXT,
  imei            TEXT,
  cor             TEXT,
  ano_fabricacao  INTEGER,
  -- Estado
  foto_url        TEXT,
  observacoes     TEXT,
  -- Full-text search
  fts             TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(nome,'') || ' ' ||
    coalesce(marca,'') || ' ' || coalesce(modelo,'') || ' ' ||
    coalesce(numero_serie,'') || ' ' || coalesce(imei,''))
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_equipamentos_empresa ON equipamentos(empresa_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_equipamentos_cliente ON equipamentos(cliente_id);
CREATE INDEX idx_equipamentos_fts ON equipamentos USING GIN(fts);
CREATE UNIQUE INDEX idx_equipamentos_serie ON equipamentos(empresa_id, numero_serie)
  WHERE numero_serie IS NOT NULL AND deleted_at IS NULL;
```

---

### ORDENS DE SERVIÇO

```sql
CREATE TABLE ordens_servico (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero            TEXT NOT NULL,    -- 'OS-2024-00001'
  -- Partes
  cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  equipamento_id    UUID REFERENCES equipamentos(id) ON DELETE SET NULL,
  tecnico_id        UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  atendente_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  contrato_id       UUID REFERENCES contratos(id) ON DELETE SET NULL,
  -- Status e prioridade
  status            os_status NOT NULL DEFAULT 'aberta',
  prioridade        os_prioridade NOT NULL DEFAULT 'media',
  origem            os_origem NOT NULL DEFAULT 'presencial',
  -- Problema
  problema          TEXT NOT NULL,
  acessorios        TEXT[],           -- lista de acessórios entregues
  senha_equip       TEXT,             -- armazenada criptografada
  condicao_visual   TEXT,             -- 'bom', 'regular', 'com_danos'
  -- Diagnóstico e solução
  diagnostico       TEXT,
  solucao           TEXT,
  -- Orçamento (calculado a partir de os_itens)
  valor_mao_obra    NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_pecas       NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_desconto    NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total       NUMERIC(10,2) GENERATED ALWAYS AS
                    (valor_mao_obra + valor_pecas - valor_desconto) STORED,
  -- Garantia
  garantia_dias     INTEGER DEFAULT 90,
  garantia_expira   TIMESTAMPTZ,      -- preenchido ao marcar como 'entregue'
  -- Datas
  data_abertura     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_previsao     TIMESTAMPTZ,
  data_aprovacao    TIMESTAMPTZ,
  data_fechamento   TIMESTAMPTZ,
  data_entrega      TIMESTAMPTZ,
  -- Metadados
  observacoes       TEXT,
  obs_internas      TEXT,
  portal_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES usuarios(id),
  deleted_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_os_numero ON ordens_servico(empresa_id, numero)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_os_empresa ON ordens_servico(empresa_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_status ON ordens_servico(empresa_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_os_tecnico ON ordens_servico(tecnico_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_os_portal ON ordens_servico(portal_token);
CREATE INDEX idx_os_data ON ordens_servico(empresa_id, data_abertura DESC);
```

---

### OS — ITENS (peças e serviços)

```sql
CREATE TABLE os_itens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id         UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  produto_id    UUID REFERENCES produtos(id) ON DELETE SET NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('servico', 'peca')),
  descricao     TEXT NOT NULL,
  quantidade    NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unit    NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total   NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unit) STORED,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_os_itens_os ON os_itens(os_id);
```

---

### OS — EVENTOS (timeline imutável)

```sql
-- NUNCA fazer UPDATE nessa tabela. Apenas INSERT.
CREATE TABLE os_eventos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id       UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  empresa_id  UUID NOT NULL,
  tipo        TEXT NOT NULL,
  -- Exemplos de tipo:
  -- 'criacao', 'status_alterado', 'tecnico_atribuido', 'foto_adicionada',
  -- 'orcamento_criado', 'orcamento_aprovado', 'mensagem_whatsapp',
  -- 'comentario', 'checklist_concluido', 'entrega_realizada'
  descricao   TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',  -- dados extras (status_anterior, status_novo, etc.)
  usuario_id  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_os_eventos_os ON os_eventos(os_id, created_at DESC);
CREATE INDEX idx_os_eventos_empresa ON os_eventos(empresa_id, created_at DESC);

-- REGRA: proibir UPDATE e DELETE nessa tabela
CREATE RULE os_eventos_no_update AS ON UPDATE TO os_eventos DO INSTEAD NOTHING;
CREATE RULE os_eventos_no_delete AS ON DELETE TO os_eventos DO INSTEAD NOTHING;
```

---

### OS — FOTOS

```sql
CREATE TABLE os_fotos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id       UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  fase        TEXT NOT NULL CHECK (fase IN ('entrada', 'reparo', 'saida', 'outro')),
  storage_path TEXT NOT NULL,   -- path no Supabase Storage
  url_publica TEXT,
  nome        TEXT,
  tamanho     INTEGER,          -- bytes
  mime_type   TEXT,
  hash_sha256 TEXT,             -- integridade
  legenda     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_os_fotos_os ON os_fotos(os_id);
```

---

### OS — CHECKLISTS

```sql
CREATE TABLE checklist_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,   -- ex: "Recebimento de Smartphone"
  tipo_equip      TEXT,            -- aplicar automaticamente para este tipo
  fase            TEXT NOT NULL CHECK (fase IN ('entrada', 'diagnostico', 'qualidade')),
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checklist_template_itens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  obrigatorio     BOOLEAN NOT NULL DEFAULT true,
  ordem           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE os_checklists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id           UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  template_id     UUID REFERENCES checklist_templates(id),
  nome            TEXT NOT NULL,
  fase            TEXT NOT NULL,
  concluido       BOOLEAN NOT NULL DEFAULT false,
  concluido_em    TIMESTAMPTZ,
  concluido_por   UUID REFERENCES usuarios(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE os_checklist_itens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id    UUID NOT NULL REFERENCES os_checklists(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  obrigatorio     BOOLEAN NOT NULL DEFAULT true,
  marcado         BOOLEAN NOT NULL DEFAULT false,
  marcado_em      TIMESTAMPTZ,
  observacao      TEXT,
  ordem           INTEGER NOT NULL DEFAULT 0
);
```

---

### OS — ASSINATURA DIGITAL

```sql
CREATE TABLE os_assinaturas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id           UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL CHECK (tipo IN ('cliente', 'tecnico')),
  nome_assinante  TEXT NOT NULL,
  storage_path    TEXT NOT NULL,   -- imagem da assinatura
  ip_address      INET,
  user_agent      TEXT,
  latitude        NUMERIC(10,8),
  longitude       NUMERIC(11,8),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### ORÇAMENTOS (independentes)

```sql
CREATE TABLE orcamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero          TEXT NOT NULL,
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  os_id           UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'rascunho'
                  CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado', 'expirado')),
  versao          INTEGER NOT NULL DEFAULT 1,
  validade_dias   INTEGER NOT NULL DEFAULT 15,
  validade_ate    DATE,
  valor_total     NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto        NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacoes     TEXT,
  aprovado_em     TIMESTAMPTZ,
  aprovado_por    TEXT,  -- nome (pode ser cliente externo)
  token_aprovacao TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE orcamento_itens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('servico', 'peca')),
  descricao   TEXT NOT NULL,
  quantidade  NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unit  NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unit) STORED
);
```

---

### PRODUTOS / ESTOQUE

```sql
CREATE TABLE produtos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo          TEXT,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  categoria       TEXT,
  marca           TEXT,
  unidade         TEXT DEFAULT 'un',
  preco_custo     NUMERIC(10,2),
  preco_venda     NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque_atual   NUMERIC(10,3) NOT NULL DEFAULT 0,
  estoque_minimo  NUMERIC(10,3) NOT NULL DEFAULT 0,
  localização     TEXT,            -- prateleira, gaveta
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_produtos_codigo ON produtos(empresa_id, codigo)
  WHERE codigo IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_produtos_empresa ON produtos(empresa_id) WHERE deleted_at IS NULL;

CREATE TABLE estoque_movimentacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id      UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo            estoque_tipo_mov NOT NULL,
  quantidade      NUMERIC(10,3) NOT NULL,
  saldo_anterior  NUMERIC(10,3) NOT NULL,
  saldo_posterior NUMERIC(10,3) NOT NULL,
  os_id           UUID REFERENCES ordens_servico(id),
  custo_unit      NUMERIC(10,2),
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id)
);
```

---

### FINANCEIRO

```sql
CREATE TABLE categorias_financeiras (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo        transacao_tipo NOT NULL,
  cor         TEXT DEFAULT '#6B7280',
  ativo       BOOLEAN DEFAULT true
);

CREATE TABLE transacoes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  os_id             UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,
  cliente_id        UUID REFERENCES clientes(id) ON DELETE SET NULL,
  categoria_id      UUID REFERENCES categorias_financeiras(id) ON DELETE SET NULL,
  descricao         TEXT NOT NULL,
  tipo              transacao_tipo NOT NULL,
  valor             NUMERIC(10,2) NOT NULL,
  status            transacao_status NOT NULL DEFAULT 'pendente',
  forma_pagamento   forma_pagamento,
  vencimento        DATE,
  data_pagamento    DATE,
  conta_id          UUID REFERENCES contas_bancarias(id),
  observacoes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES usuarios(id),
  deleted_at        TIMESTAMPTZ
);

CREATE TABLE contas_bancarias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,    -- ex: "Caixa físico", "Conta BB", "Pix"
  tipo        TEXT NOT NULL,    -- 'caixa', 'corrente', 'poupanca', 'digital'
  saldo_atual NUMERIC(12,2) NOT NULL DEFAULT 0,
  ativo       BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE caixas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conta_id        UUID REFERENCES contas_bancarias(id),
  data            DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  saldo_abertura  NUMERIC(12,2) NOT NULL DEFAULT 0,
  saldo_fechamento NUMERIC(12,2),
  aberto_por      UUID REFERENCES usuarios(id),
  fechado_por     UUID REFERENCES usuarios(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### CONTRATOS

```sql
CREATE TABLE contratos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  numero          TEXT NOT NULL,
  nome            TEXT NOT NULL,
  tipo            TEXT,
  status          TEXT NOT NULL DEFAULT 'ativo'
                  CHECK (status IN ('ativo', 'suspenso', 'cancelado', 'expirado')),
  valor_mensal    NUMERIC(10,2),
  dia_vencimento  INTEGER CHECK (dia_vencimento BETWEEN 1 AND 31),
  data_inicio     DATE NOT NULL,
  data_fim        DATE,
  visitas_mes     INTEGER,
  sla_horas       INTEGER,
  descricao       TEXT,
  observacoes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
```

---

### GARANTIAS

```sql
CREATE TABLE garantias (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  os_id           UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  cliente_id      UUID NOT NULL REFERENCES clientes(id),
  equipamento_id  UUID REFERENCES equipamentos(id),
  numero          TEXT NOT NULL UNIQUE,
  descricao       TEXT NOT NULL,
  data_inicio     DATE NOT NULL,
  data_fim        DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'ativa'
                  CHECK (status IN ('ativa', 'usada', 'expirada', 'cancelada')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### AGENDA

```sql
CREATE TABLE agenda_eventos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tecnico_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  os_id           UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo            agenda_tipo NOT NULL DEFAULT 'os',
  status          agenda_status NOT NULL DEFAULT 'agendado',
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  data_inicio     TIMESTAMPTZ NOT NULL,
  data_fim        TIMESTAMPTZ NOT NULL,
  endereco        TEXT,
  latitude        NUMERIC(10,8),
  longitude       NUMERIC(11,8),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_agenda_tecnico ON agenda_eventos(tecnico_id, data_inicio);
CREATE INDEX idx_agenda_empresa ON agenda_eventos(empresa_id, data_inicio);
```

---

### NOTIFICAÇÕES

```sql
CREATE TABLE notificacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,
  titulo      TEXT NOT NULL,
  mensagem    TEXT,
  link        TEXT,
  lida        BOOLEAN NOT NULL DEFAULT false,
  lida_em     TIMESTAMPTZ,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id, lida, created_at DESC);
```

---

### AUDIT LOG

```sql
-- Tabela de auditoria global — imutável
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  empresa_id  UUID,
  usuario_id  UUID,
  tabela      TEXT NOT NULL,
  registro_id UUID NOT NULL,
  operacao    TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  dados_antes JSONB,
  dados_depois JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_empresa ON audit_log(empresa_id, created_at DESC);
CREATE INDEX idx_audit_registro ON audit_log(tabela, registro_id);

-- BIGSERIAL para volume alto sem fragmentação de UUID
-- Nunca expor via API pública — apenas Super Admin
```

---

## 4. FUNÇÕES AUXILIARES

```sql
-- Função robusta para pegar empresa_id + role do usuário autenticado
-- Usa SECURITY DEFINER para contornar RLS circular
CREATE OR REPLACE FUNCTION auth.get_current_user()
RETURNS TABLE(empresa_id UUID, role user_role) AS $$
  SELECT empresa_id, role
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
    AND deleted_at IS NULL
    AND status = 'ativo'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função para gerar próximo número de OS
CREATE OR REPLACE FUNCTION gerar_numero_os(p_empresa_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefixo TEXT;
  v_numero  INTEGER;
BEGIN
  UPDATE configuracoes_empresa
  SET os_numero_atual = os_numero_atual + 1
  WHERE empresa_id = p_empresa_id
  RETURNING os_prefixo, os_numero_atual INTO v_prefixo, v_numero;

  RETURN v_prefixo || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_numero::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## 5. ROW LEVEL SECURITY (RESUMO)

As políticas de RLS são descritas em detalhe em [MULTITENANT.md](MULTITENANT.md) e [SECURITY.md](SECURITY.md).

Princípio:
- Toda tabela com `empresa_id` usa `auth.get_current_user()` para verificar pertencimento
- Super Admin bypassa RLS via `service_role` key (nunca exposta ao cliente)
- Portal do cliente acessa OS via `portal_token` com política específica

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
