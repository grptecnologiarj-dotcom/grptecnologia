-- =========================================================
-- DeskControl — Row Level Security
-- Execute APÓS 001_schema_inicial.sql
-- =========================================================

-- Habilitar RLS em todas as tabelas
alter table empresas                enable row level security;
alter table usuarios                enable row level security;
alter table clientes                enable row level security;
alter table equipamentos            enable row level security;
alter table ordens_servico          enable row level security;
alter table os_itens                enable row level security;
alter table os_eventos              enable row level security;
alter table os_fotos                enable row level security;
alter table estoque_itens           enable row level security;
alter table estoque_movimentacoes   enable row level security;
alter table financeiro_transacoes   enable row level security;
alter table agenda_eventos          enable row level security;
alter table orcamentos              enable row level security;
alter table contratos               enable row level security;
alter table garantias               enable row level security;
alter table notificacoes            enable row level security;

-- =========================================================
-- HELPERS: retornam empresa_id e usuario_id do JWT
-- =========================================================
create or replace function get_empresa_id()
returns uuid language sql security definer stable as $$
  select empresa_id from usuarios where auth_user_id = auth.uid() limit 1;
$$;

create or replace function get_usuario_id()
returns uuid language sql security definer stable as $$
  select id from usuarios where auth_user_id = auth.uid() limit 1;
$$;

-- =========================================================
-- POLÍTICAS: isolamento por empresa_id
-- =========================================================

-- EMPRESAS: usuário lê e atualiza apenas a própria empresa
create policy "empresa_read_own" on empresas
  for select using (id = get_empresa_id());
create policy "empresa_update_own" on empresas
  for update using (id = get_empresa_id());

-- USUÁRIOS: vê e edita colegas da mesma empresa
create policy "usuarios_empresa" on usuarios
  using (empresa_id = get_empresa_id());

-- CLIENTES
create policy "clientes_empresa" on clientes
  using (empresa_id = get_empresa_id());

-- EQUIPAMENTOS
create policy "equipamentos_empresa" on equipamentos
  using (empresa_id = get_empresa_id());

-- ORDENS DE SERVIÇO
-- Acesso autenticado por empresa
create policy "os_empresa" on ordens_servico
  for all using (empresa_id = get_empresa_id());

-- Portal cliente: qualquer um pode ler pelo token (sem auth)
create policy "os_portal_token" on ordens_servico
  for select using (token_acompanhamento is not null and deleted_at is null);

-- OS ITENS
create policy "os_itens_empresa" on os_itens
  using (os_id in (
    select id from ordens_servico where empresa_id = get_empresa_id()
  ));
-- Portal: leitura pública de itens (quantidade/valores do orçamento)
create policy "os_itens_portal" on os_itens
  for select using (true);

-- OS EVENTOS
create policy "os_eventos_empresa" on os_eventos
  using (empresa_id = get_empresa_id());

-- OS FOTOS
create policy "os_fotos_empresa" on os_fotos
  using (os_id in (
    select id from ordens_servico where empresa_id = get_empresa_id()
  ));
create policy "os_fotos_portal" on os_fotos
  for select using (true);

-- ESTOQUE
create policy "estoque_empresa" on estoque_itens
  using (empresa_id = get_empresa_id());
create policy "movimentacoes_empresa" on estoque_movimentacoes
  using (empresa_id = get_empresa_id());

-- FINANCEIRO
create policy "financeiro_empresa" on financeiro_transacoes
  using (empresa_id = get_empresa_id());

-- AGENDA
create policy "agenda_empresa" on agenda_eventos
  using (empresa_id = get_empresa_id());

-- ORÇAMENTOS
create policy "orcamentos_empresa" on orcamentos
  for all using (empresa_id = get_empresa_id());
-- Portal aprovação: leitura pública pelo token
create policy "orcamentos_portal" on orcamentos
  for select using (token_aprovacao is not null and deleted_at is null);

-- CONTRATOS
create policy "contratos_empresa" on contratos
  using (empresa_id = get_empresa_id());

-- GARANTIAS
create policy "garantias_empresa" on garantias
  using (empresa_id = get_empresa_id());

-- NOTIFICAÇÕES: usuário vê as próprias + as da empresa
create policy "notif_usuario" on notificacoes
  using (
    empresa_id = get_empresa_id() and
    (usuario_id is null or usuario_id = get_usuario_id())
  );
