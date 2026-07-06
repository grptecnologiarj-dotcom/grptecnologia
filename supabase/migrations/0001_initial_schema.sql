-- ============================================================
-- DeskControl — Schema inicial (Migration 0001)
-- Banco: Supabase (PostgreSQL)
-- Inclui: tabelas, enum types, triggers e Row Level Security
-- ============================================================

-- ========== ENUM TYPES ==========

CREATE TYPE user_role AS ENUM ('admin', 'tecnico', 'atendente', 'financeiro');
CREATE TYPE user_status AS ENUM ('ativo', 'inativo', 'convite_pendente');
CREATE TYPE empresa_plano AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE empresa_status AS ENUM ('trial', 'ativo', 'cancelado', 'suspenso');

CREATE TYPE pessoa_tipo AS ENUM ('fisica', 'juridica');

CREATE TYPE os_status AS ENUM (
  'aberta',
  'em_diagnostico',
  'aguardando_aprovacao',
  'em_reparo',
  'aguardando_pecas',
  'pronto',
  'entregue',
  'cancelada'
);

CREATE TYPE os_prioridade AS ENUM ('baixa', 'media', 'alta', 'urgente');

CREATE TYPE transacao_tipo AS ENUM ('receita', 'despesa');
CREATE TYPE transacao_status AS ENUM ('pendente', 'pago', 'cancelado');

-- ========== HELPERS ==========

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== EMPRESAS ==========

CREATE TABLE empresas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  plano       empresa_plano NOT NULL DEFAULT 'free',
  status      empresa_status NOT NULL DEFAULT 'trial',
  trial_ate   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ========== USUÁRIOS ==========

CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  auth_user_id  UUID UNIQUE, -- referencia auth.users
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'tecnico',
  status        user_status NOT NULL DEFAULT 'convite_pendente',
  avatar_url    TEXT,
  telefone      TEXT,
  ultimo_acesso TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_usuarios_email_empresa ON usuarios(empresa_id, email);
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_auth ON usuarios(auth_user_id);

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ========== CLIENTES ==========

CREATE TABLE clientes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  tipo         pessoa_tipo NOT NULL DEFAULT 'fisica',
  cpf_cnpj     TEXT,
  rg_ie        TEXT,
  email        TEXT,
  telefone     TEXT,
  whatsapp     TEXT,
  cep          TEXT,
  endereco     TEXT,
  numero       TEXT,
  complemento  TEXT,
  bairro       TEXT,
  cidade       TEXT,
  estado       TEXT,
  observacoes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_nome ON clientes(empresa_id, nome);

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ========== EQUIPAMENTOS ==========

CREATE TABLE equipamentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  nome          TEXT NOT NULL,
  marca         TEXT,
  modelo        TEXT,
  numero_serie  TEXT,
  cor           TEXT,
  observacoes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipamentos_empresa ON equipamentos(empresa_id);
CREATE INDEX idx_equipamentos_cliente ON equipamentos(cliente_id);

CREATE TRIGGER trg_equipamentos_updated_at
  BEFORE UPDATE ON equipamentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ========== ORDENS DE SERVIÇO ==========

CREATE TABLE ordens_servico (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero          TEXT NOT NULL,
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  equipamento_id  UUID REFERENCES equipamentos(id) ON DELETE SET NULL,
  tecnico_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  status          os_status NOT NULL DEFAULT 'aberta',
  prioridade      os_prioridade NOT NULL DEFAULT 'media',
  problema        TEXT NOT NULL,
  diagnostico     TEXT,
  solucao         TEXT,
  valor_mao_obra  NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_pecas     NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_desconto  NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total     NUMERIC(10,2) GENERATED ALWAYS AS (valor_mao_obra + valor_pecas - valor_desconto) STORED,
  acessorios      TEXT,
  senha_equip     TEXT,
  observacoes     TEXT,
  data_abertura   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_previsao   TIMESTAMPTZ,
  data_fechamento TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_os_numero_empresa ON ordens_servico(empresa_id, numero);
CREATE INDEX idx_os_empresa ON ordens_servico(empresa_id);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_status ON ordens_servico(empresa_id, status);
CREATE INDEX idx_os_tecnico ON ordens_servico(tecnico_id);

CREATE TRIGGER trg_os_updated_at
  BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ========== ITENS DA OS (mão de obra / peças) ==========

CREATE TABLE os_itens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id      UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL CHECK (tipo IN ('servico', 'peca')),
  descricao  TEXT NOT NULL,
  quantidade NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_os_itens_os ON os_itens(os_id);

-- ========== FINANCEIRO (TRANSAÇÕES) ==========

CREATE TABLE transacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  os_id         UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  descricao     TEXT NOT NULL,
  tipo          transacao_tipo NOT NULL,
  categoria     TEXT,
  valor         NUMERIC(10,2) NOT NULL,
  status        transacao_status NOT NULL DEFAULT 'pendente',
  vencimento    DATE,
  data_pagamento DATE,
  forma_pagamento TEXT,
  observacoes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transacoes_empresa ON transacoes(empresa_id);
CREATE INDEX idx_transacoes_status ON transacoes(empresa_id, status);
CREATE INDEX idx_transacoes_os ON transacoes(os_id);

CREATE TRIGGER trg_transacoes_updated_at
  BEFORE UPDATE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Helper: extrai o empresa_id do usuário autenticado via JWT
CREATE OR REPLACE FUNCTION auth.empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM public.usuarios WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- EMPRESAS: usuários só veem a própria empresa
CREATE POLICY "empresas_select_own" ON empresas
  FOR SELECT USING (id = auth.empresa_id());

-- USUARIOS
CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT USING (empresa_id = auth.empresa_id());

CREATE POLICY "usuarios_insert_admin" ON usuarios
  FOR INSERT WITH CHECK (
    empresa_id = auth.empresa_id()
    AND EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.empresa_id = auth.empresa_id()
        AND u.role = 'admin'
    )
  );

CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- CLIENTES
CREATE POLICY "clientes_all_own" ON clientes
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- EQUIPAMENTOS
CREATE POLICY "equipamentos_all_own" ON equipamentos
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- ORDENS DE SERVIÇO
CREATE POLICY "os_all_own" ON ordens_servico
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());

-- OS ITENS
CREATE POLICY "os_itens_all_own" ON os_itens
  FOR ALL USING (
    os_id IN (SELECT id FROM ordens_servico WHERE empresa_id = auth.empresa_id())
  );

-- TRANSACOES
CREATE POLICY "transacoes_all_own" ON transacoes
  FOR ALL USING (empresa_id = auth.empresa_id())
  WITH CHECK (empresa_id = auth.empresa_id());