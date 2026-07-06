-- =========================================================
-- DeskControl × GRP Tecnologia — Schema Inicial
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =========================================================

-- EXTENSÕES
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- =========================================================
-- EMPRESAS
-- =========================================================
create table if not exists empresas (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  slug        text unique,
  cnpj        text,
  telefone    text,
  whatsapp    text,
  email       text,
  site        text,
  endereco    text,
  cidade      text,
  estado      char(2),
  cep         text,
  logo_url    text,
  plano       text not null default 'pro',
  status      text not null default 'ativo',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Empresa GRP (ID fixo para facilitar seed e configuração)
insert into empresas (id, nome, slug, plano, status)
values ('00000000-0000-0000-0000-000000000001', 'GRP Tecnologia', 'grp', 'pro', 'ativo')
on conflict (id) do nothing;

-- =========================================================
-- USUÁRIOS (estende auth.users)
-- =========================================================
create table if not exists usuarios (
  id              uuid primary key default uuid_generate_v4(),
  auth_user_id    uuid unique references auth.users(id) on delete cascade,
  empresa_id      uuid not null references empresas(id),
  nome            text not null,
  email           text not null,
  role            text not null default 'tecnico'
    check (role in ('admin','tecnico','atendente','financeiro','visualizador')),
  status          text not null default 'ativo'
    check (status in ('ativo','inativo','pendente')),
  avatar_url      text,
  telefone        text,
  ultimo_acesso   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =========================================================
-- CLIENTES
-- =========================================================
create table if not exists clientes (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  tipo            text not null default 'fisica'
    check (tipo in ('fisica','juridica')),
  nome            text not null,
  cpf_cnpj        text,
  email           text,
  telefone        text,
  whatsapp        text,
  cep             text,
  endereco        text,
  numero          text,
  complemento     text,
  bairro          text,
  cidade          text,
  estado          char(2),
  observacoes     text,
  obs_internas    text,
  deleted_at      timestamptz,
  created_by      uuid references usuarios(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists clientes_empresa_idx on clientes(empresa_id);
create index if not exists clientes_nome_trgm_idx on clientes using gin(nome gin_trgm_ops);

alter table clientes
  add column if not exists fts tsvector
    generated always as (
      to_tsvector('portuguese',
        coalesce(nome,'') || ' ' ||
        coalesce(email,'') || ' ' ||
        coalesce(cpf_cnpj,'') || ' ' ||
        coalesce(telefone,'') || ' ' ||
        coalesce(whatsapp,'')
      )
    ) stored;

create index if not exists clientes_fts_idx on clientes using gin(fts);

-- =========================================================
-- EQUIPAMENTOS
-- =========================================================
create table if not exists equipamentos (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  cliente_id      uuid references clientes(id),
  nome            text not null,
  categoria       text,
  marca           text,
  modelo          text,
  numero_serie    text,
  imei            text,
  cor             text,
  senha           text,
  observacoes     text,
  deleted_at      timestamptz,
  created_by      uuid references usuarios(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists equipamentos_empresa_idx on equipamentos(empresa_id);
create index if not exists equipamentos_cliente_idx on equipamentos(cliente_id);

-- =========================================================
-- ORDENS DE SERVIÇO
-- =========================================================
create table if not exists ordens_servico (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references empresas(id),
  numero              text not null,
  status              text not null default 'aberta'
    check (status in ('aberta','em_diagnostico','aguardando_aprovacao','aprovada','em_reparo','aguardando_pecas','pronto','entregue','cancelada')),
  prioridade          text not null default 'media'
    check (prioridade in ('baixa','media','alta','urgente')),
  origem              text default 'presencial'
    check (origem in ('presencial','whatsapp','email','telefone','portal','contrato')),
  tipo_atendimento    text default 'presencial'
    check (tipo_atendimento in ('presencial','coleta_entrega','visita_tecnica','suporte_remoto','contrato_manutencao')),
  cliente_id          uuid references clientes(id),
  equipamento_id      uuid references equipamentos(id),
  tecnico_id          uuid references usuarios(id),
  atendente_id        uuid references usuarios(id),
  problema            text not null,
  acessorios          text[],
  senha_equip         text,
  condicao_visual     text,
  diagnostico         text,
  solucao             text,
  observacoes         text,
  obs_internas        text,
  valor_mao_obra      numeric(10,2) not null default 0,
  valor_pecas         numeric(10,2) not null default 0,
  valor_total         numeric(10,2) generated always as (valor_mao_obra + valor_pecas) stored,
  garantia_dias       int default 90,
  garantia_expira     timestamptz,
  data_abertura       timestamptz not null default now(),
  data_previsao       timestamptz,
  data_aprovacao      timestamptz,
  data_conclusao      timestamptz,
  data_entrega        timestamptz,
  token_acompanhamento text unique default encode(gen_random_bytes(16), 'hex'),
  deleted_at          timestamptz,
  created_by          uuid references usuarios(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index if not exists os_numero_empresa_idx on ordens_servico(empresa_id, numero);
create index if not exists os_empresa_status_idx on ordens_servico(empresa_id, status);
create index if not exists os_cliente_idx on ordens_servico(cliente_id);
create index if not exists os_tecnico_idx on ordens_servico(tecnico_id);
create index if not exists os_token_idx on ordens_servico(token_acompanhamento);

-- =========================================================
-- OS ITENS (peças e serviços por OS)
-- =========================================================
create table if not exists os_itens (
  id              uuid primary key default uuid_generate_v4(),
  os_id           uuid not null references ordens_servico(id) on delete cascade,
  tipo            text not null check (tipo in ('servico','peca')),
  descricao       text not null,
  quantidade      numeric(10,3) not null default 1,
  valor_unit      numeric(10,2) not null default 0,
  valor_total     numeric(10,2) generated always as (quantidade * valor_unit) stored,
  created_by      uuid references usuarios(id),
  created_at      timestamptz not null default now()
);

create index if not exists os_itens_os_idx on os_itens(os_id);

-- =========================================================
-- OS EVENTOS (timeline / auditoria)
-- =========================================================
create table if not exists os_eventos (
  id              uuid primary key default uuid_generate_v4(),
  os_id           uuid not null references ordens_servico(id) on delete cascade,
  empresa_id      uuid not null references empresas(id),
  tipo            text not null,
  descricao       text,
  usuario_id      uuid references usuarios(id),
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists os_eventos_os_idx on os_eventos(os_id);

-- =========================================================
-- OS FOTOS (antes/durante/depois)
-- =========================================================
create table if not exists os_fotos (
  id              uuid primary key default uuid_generate_v4(),
  os_id           uuid not null references ordens_servico(id) on delete cascade,
  fase            text not null check (fase in ('entrada','diagnostico','saida')),
  url_publica     text not null,
  storage_path    text,
  legenda         text,
  created_by      uuid references usuarios(id),
  created_at      timestamptz not null default now()
);

create index if not exists os_fotos_os_idx on os_fotos(os_id);

-- =========================================================
-- ESTOQUE
-- =========================================================
create table if not exists estoque_itens (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references empresas(id),
  nome                text not null,
  categoria           text,
  marca               text,
  modelo              text,
  codigo_barras       text,
  sku                 text,
  quantidade          numeric(10,3) not null default 0,
  quantidade_minima   numeric(10,3) not null default 0,
  preco_custo         numeric(10,2) not null default 0,
  preco_venda         numeric(10,2) not null default 0,
  localizacao         text,
  observacoes         text,
  deleted_at          timestamptz,
  created_by          uuid references usuarios(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists estoque_empresa_idx on estoque_itens(empresa_id);

create table if not exists estoque_movimentacoes (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  item_id         uuid not null references estoque_itens(id),
  os_id           uuid references ordens_servico(id),
  tipo            text not null check (tipo in ('entrada','saida','ajuste')),
  quantidade      numeric(10,3) not null,
  preco_unit      numeric(10,2),
  motivo          text,
  usuario_id      uuid references usuarios(id),
  created_at      timestamptz not null default now()
);

create index if not exists movimentacoes_item_idx on estoque_movimentacoes(item_id);

-- =========================================================
-- FINANCEIRO
-- =========================================================
create table if not exists financeiro_transacoes (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references empresas(id),
  tipo                text not null check (tipo in ('receita','despesa')),
  categoria           text not null,
  descricao           text not null,
  valor               numeric(10,2) not null,
  data                date not null default current_date,
  status              text not null default 'confirmado'
    check (status in ('pendente','confirmado','cancelado')),
  metodo_pagamento    text,
  os_id               uuid references ordens_servico(id),
  cliente_id          uuid references clientes(id),
  usuario_id          uuid references usuarios(id),
  observacoes         text,
  deleted_at          timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists financeiro_empresa_idx on financeiro_transacoes(empresa_id);
create index if not exists financeiro_data_idx on financeiro_transacoes(empresa_id, data);

-- =========================================================
-- AGENDA
-- =========================================================
create table if not exists agenda_eventos (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  titulo          text not null,
  tipo            text not null,
  tecnico_id      uuid references usuarios(id),
  cliente_id      uuid references clientes(id),
  os_id           uuid references ordens_servico(id),
  data_inicio     timestamptz not null,
  data_fim        timestamptz,
  dia_inteiro     boolean default false,
  local           text,
  descricao       text,
  status          text not null default 'agendado',
  prioridade      text default 'normal',
  checklist       jsonb,
  notas           text,
  created_by      uuid references usuarios(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists agenda_empresa_idx on agenda_eventos(empresa_id);
create index if not exists agenda_data_idx on agenda_eventos(empresa_id, data_inicio);

-- =========================================================
-- ORÇAMENTOS
-- =========================================================
create table if not exists orcamentos (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  numero          text not null,
  status          text not null default 'rascunho'
    check (status in ('rascunho','enviado','aprovado','recusado','expirado')),
  cliente_id      uuid references clientes(id),
  os_id           uuid references ordens_servico(id),
  validade        date,
  itens           jsonb not null default '[]',
  subtotal        numeric(10,2) not null default 0,
  desconto        numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  observacoes     text,
  token_aprovacao text unique default encode(gen_random_bytes(16), 'hex'),
  aprovado_em     timestamptz,
  recusado_em     timestamptz,
  deleted_at      timestamptz,
  created_by      uuid references usuarios(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orcamentos_empresa_idx on orcamentos(empresa_id);
create index if not exists orcamentos_token_idx on orcamentos(token_aprovacao);

-- =========================================================
-- CONTRATOS
-- =========================================================
create table if not exists contratos (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references empresas(id),
  numero              text not null,
  cliente_id          uuid references clientes(id),
  tipo                text not null,
  descricao           text,
  valor_mensal        numeric(10,2) not null default 0,
  dia_vencimento      int default 5,
  vigencia_inicio     date not null,
  vigencia_fim        date,
  status              text not null default 'ativo'
    check (status in ('ativo','pausado','encerrado','cancelado')),
  sla_horas           int default 8,
  equipamentos        jsonb default '[]',
  observacoes         text,
  deleted_at          timestamptz,
  created_by          uuid references usuarios(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =========================================================
-- GARANTIAS
-- =========================================================
create table if not exists garantias (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  os_id           uuid references ordens_servico(id),
  cliente_id      uuid references clientes(id),
  tipo            text not null,
  prazo_meses     int not null default 3,
  data_inicio     date not null,
  data_fim        date not null,
  condicoes       text,
  status          text not null default 'ativa'
    check (status in ('ativa','expirada','acionada','cancelada')),
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);

-- =========================================================
-- NOTIFICAÇÕES
-- =========================================================
create table if not exists notificacoes (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  usuario_id      uuid references usuarios(id),
  tipo            text not null,
  titulo          text not null,
  mensagem        text,
  lida            boolean not null default false,
  referencia_id   uuid,
  referencia_tipo text,
  created_at      timestamptz not null default now()
);

create index if not exists notif_usuario_idx on notificacoes(usuario_id, lida);
create index if not exists notif_empresa_idx on notificacoes(empresa_id);

-- =========================================================
-- FUNÇÃO: Gerar número da OS (auto-incremento por empresa + ano)
-- =========================================================
create or replace function gerar_numero_os(p_empresa_id uuid)
returns text language plpgsql as $$
declare
  v_ano int := extract(year from now());
  v_seq int;
  v_numero text;
begin
  select coalesce(max(
    (regexp_match(numero, 'OS-\d{4}-(\d+)'))[1]::int
  ), 0) + 1
  into v_seq
  from ordens_servico
  where empresa_id = p_empresa_id
    and numero like 'OS-' || v_ano || '-%';

  v_numero := 'OS-' || v_ano || '-' || lpad(v_seq::text, 4, '0');
  return v_numero;
end;
$$;

-- =========================================================
-- TRIGGER: updated_at automático
-- =========================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_empresas_updated_at
  before update on empresas for each row execute function set_updated_at();
create trigger trg_usuarios_updated_at
  before update on usuarios for each row execute function set_updated_at();
create trigger trg_clientes_updated_at
  before update on clientes for each row execute function set_updated_at();
create trigger trg_equipamentos_updated_at
  before update on equipamentos for each row execute function set_updated_at();
create trigger trg_os_updated_at
  before update on ordens_servico for each row execute function set_updated_at();
create trigger trg_estoque_updated_at
  before update on estoque_itens for each row execute function set_updated_at();
create trigger trg_agenda_updated_at
  before update on agenda_eventos for each row execute function set_updated_at();
create trigger trg_contratos_updated_at
  before update on contratos for each row execute function set_updated_at();
create trigger trg_orcamentos_updated_at
  before update on orcamentos for each row execute function set_updated_at();
