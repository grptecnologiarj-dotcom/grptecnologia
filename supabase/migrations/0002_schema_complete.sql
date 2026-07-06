-- ============================================================
-- DeskControl — Migration 0002: Schema Completo
-- Adiciona todas as tabelas faltantes ao schema inicial
-- ============================================================

-- ========== NOVOS ENUM VALUES ==========

-- Adicionar roles faltantes
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin' BEFORE 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gerente' BEFORE 'atendente';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cliente' AFTER 'financeiro';

-- Status de OS completos
ALTER TYPE os_status ADD VALUE IF NOT EXISTS 'aprovada' AFTER 'aguardando_aprovacao';
ALTER TYPE os_status ADD VALUE IF NOT EXISTS 'aguardando_cliente' AFTER 'aguardando_pecas';
ALTER TYPE os_status ADD VALUE IF NOT EXISTS 'em_transito' AFTER 'aguardando_cliente';
ALTER TYPE os_status ADD VALUE IF NOT EXISTS 'em_garantia' AFTER 'entregue';

-- Origem da OS
CREATE TYPE IF NOT EXISTS os_origem AS ENUM ('presencial', 'whatsapp', 'email', 'telefone', 'portal', 'contrato');

-- Movimentação de estoque
DO $$ BEGIN
  CREATE TYPE estoque_tipo_mov AS ENUM ('entrada', 'saida', 'ajuste', 'reserva', 'devolucao');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Agenda
DO $$ BEGIN
  CREATE TYPE agenda_tipo AS ENUM ('os', 'visita', 'retirada', 'entrega', 'bloqueio', 'outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE agenda_status AS ENUM ('agendado', 'confirmado', 'realizado', 'cancelado', 'reagendado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Forma de pagamento
DO $$ BEGIN
  CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'boleto', 'transferencia', 'cheque', 'outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========== ALTERAÇÕES NAS TABELAS EXISTENTES ==========

-- Soft delete em todas as tabelas críticas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Campos extras em empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS site TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS estado CHAR(2);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cor_primaria TEXT DEFAULT '#1f47f5';

-- Campos extras em usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cor_agenda TEXT DEFAULT '#3B82F6';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS comissao_pct NUMERIC(5,2);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES usuarios(id);

-- Campos extras em clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS rg_ie TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS obs_internas TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES usuarios(id);

-- Campos extras em equipamentos
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS imei TEXT;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS ano_fabricacao INTEGER;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES usuarios(id);

-- Full-text search em clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fts TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('portuguese',
      coalesce(nome,'') || ' ' ||
      coalesce(cpf_cnpj,'') || ' ' ||
      coalesce(email,'') || ' ' ||
      coalesce(telefone,'') || ' ' ||
      coalesce(whatsapp,'')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_clientes_fts ON clientes USING GIN(fts);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(empresa_id, cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;

-- Full-text search em equipamentos
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS fts TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('portuguese',
      coalesce(nome,'') || ' ' ||
      coalesce(marca,'') || ' ' ||
      coalesce(modelo,'') || ' ' ||
      coalesce(numero_serie,'') || ' ' ||
      coalesce(imei,'')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_equipamentos_fts ON equipamentos USING GIN(fts);

-- Campos extras em ordens_servico
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS atendente_id UUID REFERENCES usuarios(id);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS contrato_id UUID;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS origem os_origem NOT NULL DEFAULT 'presencial';
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS acessorios TEXT[];
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS condicao_visual TEXT;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS garantia_dias INTEGER DEFAULT 90;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS garantia_expira TIMESTAMPTZ;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMPTZ;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS data_entrega TIMESTAMPTZ;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS obs_internas TEXT;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES usuarios(id);

-- Índices extras de OS
CREATE INDEX IF NOT EXISTS idx_os_data ON ordens_servico(empresa_id, data_abertura DESC);

-- ========== CONFIGURAÇÕES DA EMPRESA ==========

CREATE TABLE IF NOT EXISTS configuracoes_empresa (
  empresa_id              UUID PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
  os_prefixo              TEXT NOT NULL DEFAULT 'OS',
  os_numero_inicial       INTEGER NOT NULL DEFAULT 1,
  os_numero_atual         INTEGER NOT NULL DEFAULT 0,
  os_prazo_padrao_dias    INTEGER NOT NULL DEFAULT 5,
  os_exigir_foto_entrada  BOOLEAN NOT NULL DEFAULT true,
  os_exigir_foto_saida    BOOLEAN NOT NULL DEFAULT true,
  os_texto_garantia       TEXT DEFAULT 'Garantia de 90 dias para o serviço realizado.',
  usar_caixa              BOOLEAN NOT NULL DEFAULT true,
  formas_pagamento        TEXT[] DEFAULT ARRAY['dinheiro', 'pix', 'cartao_credito'],
  whatsapp_instancia      TEXT,
  whatsapp_token          TEXT,
  whatsapp_ativo          BOOLEAN NOT NULL DEFAULT false,
  msg_os_criada           TEXT DEFAULT 'Olá {cliente}! Recebemos seu equipamento ({equipamento}) e criamos a OS {numero}. Acompanhe em: {link}',
  msg_pronto_retirada     TEXT DEFAULT 'Olá {cliente}! Seu equipamento {equipamento} está pronto para retirada. OS: {numero}.',
  msg_orcamento_enviado   TEXT DEFAULT 'Olá {cliente}! Enviamos um orçamento de {valor} para seu equipamento {equipamento}. Aprove aqui: {link}',
  portal_ativo            BOOLEAN NOT NULL DEFAULT true,
  portal_mostrar_fotos    BOOLEAN NOT NULL DEFAULT true,
  portal_mostrar_orcamento BOOLEAN NOT NULL DEFAULT true,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE configuracoes_empresa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_empresa_own" ON configuracoes_empresa
  FOR ALL USING (empresa_id = auth.empresa_id());

-- ========== OS — EVENTOS (TIMELINE IMUTÁVEL) ==========

CREATE TABLE IF NOT EXISTS os_eventos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id       UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  empresa_id  UUID NOT NULL,
  tipo        TEXT NOT NULL,
  descricao   TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  usuario_id  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_os_eventos_os ON os_eventos(os_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_os_eventos_empresa ON os_eventos(empresa_id, created_at DESC);

ALTER TABLE os_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_eventos_select" ON os_eventos FOR SELECT USING (empresa_id = auth.empresa_id());
CREATE POLICY "os_eventos_insert" ON os_eventos FOR INSERT WITH CHECK (empresa_id = auth.empresa_id());

-- Bloquear UPDATE e DELETE na timeline
CREATE OR REPLACE RULE os_eventos_no_update AS ON UPDATE TO os_eventos DO INSTEAD NOTHING;
CREATE OR REPLACE RULE os_eventos_no_delete AS ON DELETE TO os_eventos DO INSTEAD NOTHING;

-- ========== OS — FOTOS ==========

CREATE TABLE IF NOT EXISTS os_fotos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id         UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  empresa_id    UUID NOT NULL,
  fase          TEXT NOT NULL DEFAULT 'entrada' CHECK (fase IN ('entrada', 'reparo', 'saida', 'outro')),
  storage_path  TEXT NOT NULL,
  url_publica   TEXT,
  nome          TEXT,
  tamanho       INTEGER,
  mime_type     TEXT,
  hash_sha256   TEXT,
  legenda       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    UUID REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_os_fotos_os ON os_fotos(os_id);

ALTER TABLE os_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_fotos_all" ON os_fotos
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- ========== OS — ASSINATURA DIGITAL ==========

CREATE TABLE IF NOT EXISTS os_assinaturas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id           UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'tecnico')),
  nome_assinante  TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  latitude        NUMERIC(10,8),
  longitude       NUMERIC(11,8),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE os_assinaturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_assinaturas_all" ON os_assinaturas
  FOR ALL USING (
    os_id IN (SELECT id FROM ordens_servico WHERE empresa_id = auth.empresa_id())
  );

-- ========== CHECKLIST TEMPLATES ==========

CREATE TABLE IF NOT EXISTS checklist_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo_equip  TEXT,
  fase        TEXT NOT NULL DEFAULT 'entrada' CHECK (fase IN ('entrada', 'diagnostico', 'qualidade')),
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_template_itens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  descricao   TEXT NOT NULL,
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  ordem       INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_templates_all" ON checklist_templates
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

ALTER TABLE checklist_template_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_template_itens_all" ON checklist_template_itens
  FOR ALL USING (
    template_id IN (SELECT id FROM checklist_templates WHERE empresa_id = auth.empresa_id())
  );

-- ========== OS — CHECKLISTS ==========

CREATE TABLE IF NOT EXISTS os_checklists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id           UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  template_id     UUID REFERENCES checklist_templates(id),
  nome            TEXT NOT NULL,
  fase            TEXT NOT NULL DEFAULT 'entrada',
  concluido       BOOLEAN NOT NULL DEFAULT false,
  concluido_em    TIMESTAMPTZ,
  concluido_por   UUID REFERENCES usuarios(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS os_checklist_itens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES os_checklists(id) ON DELETE CASCADE,
  descricao   TEXT NOT NULL,
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  marcado     BOOLEAN NOT NULL DEFAULT false,
  marcado_em  TIMESTAMPTZ,
  observacao  TEXT,
  ordem       INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE os_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_checklists_all" ON os_checklists
  FOR ALL USING (
    os_id IN (SELECT id FROM ordens_servico WHERE empresa_id = auth.empresa_id())
  );

ALTER TABLE os_checklist_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "os_checklist_itens_all" ON os_checklist_itens
  FOR ALL USING (
    checklist_id IN (
      SELECT oc.id FROM os_checklists oc
      JOIN ordens_servico os ON os.id = oc.os_id
      WHERE os.empresa_id = auth.empresa_id()
    )
  );

-- ========== ORÇAMENTOS (independentes) ==========

CREATE TABLE IF NOT EXISTS orcamentos (
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
  aprovado_por    TEXT,
  token_aprovacao TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id  UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL CHECK (tipo IN ('servico', 'peca')),
  descricao     TEXT NOT NULL,
  quantidade    NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unit    NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total   NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unit) STORED
);

ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orcamentos_all" ON orcamentos
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orcamento_itens_all" ON orcamento_itens
  FOR ALL USING (
    orcamento_id IN (SELECT id FROM orcamentos WHERE empresa_id = auth.empresa_id())
  );

-- ========== FINANCEIRO ==========

CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo        transacao_tipo NOT NULL,
  cor         TEXT DEFAULT '#6B7280',
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contas_bancarias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'caixa',
  saldo_atual NUMERIC(12,2) NOT NULL DEFAULT 0,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS caixas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conta_id          UUID REFERENCES contas_bancarias(id),
  data              DATE NOT NULL DEFAULT CURRENT_DATE,
  status            TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  saldo_abertura    NUMERIC(12,2) NOT NULL DEFAULT 0,
  saldo_fechamento  NUMERIC(12,2),
  aberto_por        UUID REFERENCES usuarios(id),
  fechado_por       UUID REFERENCES usuarios(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar categoria_id e conta_id na tabela transacoes existente
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias_financeiras(id);
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES contas_bancarias(id);
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS caixa_id UUID REFERENCES caixas(id);
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES usuarios(id);

ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_financeiras_all" ON categorias_financeiras
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contas_bancarias_all" ON contas_bancarias
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

ALTER TABLE caixas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caixas_all" ON caixas
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- ========== PRODUTOS / ESTOQUE ==========

CREATE TABLE IF NOT EXISTS produtos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo          TEXT,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  categoria       TEXT,
  marca           TEXT,
  unidade         TEXT NOT NULL DEFAULT 'un',
  preco_custo     NUMERIC(10,2),
  preco_venda     NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque_atual   NUMERIC(10,3) NOT NULL DEFAULT 0,
  estoque_minimo  NUMERIC(10,3) NOT NULL DEFAULT 0,
  localizacao     TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id),
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_codigo
  ON produtos(empresa_id, codigo) WHERE codigo IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON produtos(empresa_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
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

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtos_all" ON produtos
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

ALTER TABLE estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estoque_mov_all" ON estoque_movimentacoes
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- ========== CONTRATOS ==========

CREATE TABLE IF NOT EXISTS contratos (
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
  data_inicio     DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim        DATE,
  visitas_mes     INTEGER,
  sla_horas       INTEGER,
  descricao       TEXT,
  observacoes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contratos_all" ON contratos
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- Vincular contrato em OS
ALTER TABLE ordens_servico ADD CONSTRAINT fk_os_contrato
  FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE SET NULL;

-- ========== GARANTIAS ==========

CREATE TABLE IF NOT EXISTS garantias (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  os_id           UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  cliente_id      UUID NOT NULL REFERENCES clientes(id),
  equipamento_id  UUID REFERENCES equipamentos(id),
  numero          TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  data_inicio     DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim        DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'ativa'
                  CHECK (status IN ('ativa', 'usada', 'expirada', 'cancelada')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_garantias_numero ON garantias(empresa_id, numero);

ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "garantias_all" ON garantias
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- ========== AGENDA ==========

CREATE TABLE IF NOT EXISTS agenda_eventos (
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
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_agenda_tecnico ON agenda_eventos(tecnico_id, data_inicio);
CREATE INDEX IF NOT EXISTS idx_agenda_empresa ON agenda_eventos(empresa_id, data_inicio);

ALTER TABLE agenda_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_all" ON agenda_eventos
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- ========== NOTIFICAÇÕES ==========

CREATE TABLE IF NOT EXISTS notificacoes (
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

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario
  ON notificacoes(usuario_id, lida, created_at DESC);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificacoes_own" ON notificacoes
  FOR ALL USING (
    empresa_id = auth.empresa_id()
    AND usuario_id = (
      SELECT id FROM usuarios WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

-- ========== AUDIT LOG ==========

CREATE TABLE IF NOT EXISTS audit_log (
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

CREATE INDEX IF NOT EXISTS idx_audit_empresa ON audit_log(empresa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_registro ON audit_log(tabela, registro_id);

-- Apenas super_admin pode ler audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_admin" ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
        AND role = 'super_admin'
    )
  );

-- ========== FUNÇÃO ROBUSTA DE AUTH ==========

-- Substitui a função simples anterior
CREATE OR REPLACE FUNCTION auth.empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
    AND deleted_at IS NULL
    AND status = 'ativo'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth.get_current_user_info()
RETURNS TABLE(empresa_id UUID, user_id UUID, role user_role) AS $$
  SELECT u.empresa_id, u.id, u.role
  FROM public.usuarios u
  WHERE u.auth_user_id = auth.uid()
    AND u.deleted_at IS NULL
    AND u.status = 'ativo'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========== FUNÇÃO PARA NÚMERO DE OS ==========

CREATE OR REPLACE FUNCTION gerar_numero_os(p_empresa_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefixo TEXT;
  v_numero  INTEGER;
BEGIN
  -- Garante que a configuração existe
  INSERT INTO configuracoes_empresa (empresa_id)
  VALUES (p_empresa_id)
  ON CONFLICT (empresa_id) DO NOTHING;

  UPDATE configuracoes_empresa
  SET os_numero_atual = os_numero_atual + 1
  WHERE empresa_id = p_empresa_id
  RETURNING os_prefixo, os_numero_atual INTO v_prefixo, v_numero;

  RETURN v_prefixo || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(v_numero::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== TRIGGER: CRIAR EVENTO AO MUDAR STATUS DA OS ==========

CREATE OR REPLACE FUNCTION trigger_os_status_evento()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO os_eventos (os_id, empresa_id, tipo, descricao, metadata)
    VALUES (
      NEW.id,
      NEW.empresa_id,
      'status_alterado',
      'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"',
      jsonb_build_object('status_anterior', OLD.status, 'status_novo', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_os_status_evento
  AFTER UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION trigger_os_status_evento();

-- ========== TRIGGER: CRIAR EVENTO AO CRIAR OS ==========

CREATE OR REPLACE FUNCTION trigger_os_criacao_evento()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO os_eventos (os_id, empresa_id, tipo, descricao)
  VALUES (NEW.id, NEW.empresa_id, 'criacao', 'Ordem de serviço criada');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_os_criacao_evento
  AFTER INSERT ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION trigger_os_criacao_evento();

-- ========== ATUALIZAR RLS EXISTENTE ==========

-- Remover políticas antigas e criar novas mais robustas

DROP POLICY IF EXISTS "os_all_own" ON ordens_servico;

CREATE POLICY "os_select" ON ordens_servico
  FOR SELECT USING (
    empresa_id = auth.empresa_id()
    AND deleted_at IS NULL
  );

CREATE POLICY "os_insert" ON ordens_servico
  FOR INSERT WITH CHECK (empresa_id = auth.empresa_id());

CREATE POLICY "os_update" ON ordens_servico
  FOR UPDATE USING (
    empresa_id = auth.empresa_id()
    AND deleted_at IS NULL
  );

CREATE POLICY "os_delete" ON ordens_servico
  FOR DELETE USING (
    empresa_id = auth.empresa_id()
    AND EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- Atualizar RLS de clientes para incluir soft delete
DROP POLICY IF EXISTS "clientes_all_own" ON clientes;

CREATE POLICY "clientes_select" ON clientes
  FOR SELECT USING (empresa_id = auth.empresa_id() AND deleted_at IS NULL);

CREATE POLICY "clientes_insert" ON clientes
  FOR INSERT WITH CHECK (empresa_id = auth.empresa_id());

CREATE POLICY "clientes_update" ON clientes
  FOR UPDATE USING (empresa_id = auth.empresa_id() AND deleted_at IS NULL);

-- ========== SEED: DADOS PADRÃO ==========

-- Função para criar dados padrão ao registrar empresa
CREATE OR REPLACE FUNCTION criar_dados_padrao_empresa(p_empresa_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Configurações padrão
  INSERT INTO configuracoes_empresa (empresa_id)
  VALUES (p_empresa_id)
  ON CONFLICT DO NOTHING;

  -- Categorias financeiras padrão
  INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor)
  VALUES
    (p_empresa_id, 'Mão de obra', 'receita', '#16a34a'),
    (p_empresa_id, 'Venda de peças', 'receita', '#2563eb'),
    (p_empresa_id, 'Outros serviços', 'receita', '#7c3aed'),
    (p_empresa_id, 'Aluguel', 'despesa', '#dc2626'),
    (p_empresa_id, 'Fornecedores', 'despesa', '#d97706'),
    (p_empresa_id, 'Funcionários', 'despesa', '#0891b2'),
    (p_empresa_id, 'Internet/Telefone', 'despesa', '#475569'),
    (p_empresa_id, 'Outros', 'despesa', '#6b7280')
  ON CONFLICT DO NOTHING;

  -- Conta padrão (caixa físico)
  INSERT INTO contas_bancarias (empresa_id, nome, tipo)
  VALUES (p_empresa_id, 'Caixa', 'caixa')
  ON CONFLICT DO NOTHING;

  -- Checklist padrão de recebimento
  INSERT INTO checklist_templates (empresa_id, nome, fase)
  VALUES (p_empresa_id, 'Recebimento padrão', 'entrada')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
