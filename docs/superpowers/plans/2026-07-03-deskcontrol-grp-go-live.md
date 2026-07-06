# DeskControl × GRP — Go-live Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar o DeskControl ao Supabase real e migrar todas as páginas de demo-data para dados reais, com constants GRP e pronto para deploy no Vercel.

**Architecture:** Next.js 16 App Router com Supabase SSR. Server actions já existem para OS e Clientes (`src/lib/actions/`). Páginas de listagem são Client Components que ainda usam `demoOS`/`demoClientes` — precisam ser convertidas para buscar dados via server actions ou Server Components. Schema SQL precisa ser criado no Supabase.

**Tech Stack:** Next.js 16, Supabase (PostgreSQL + Auth + Storage), TypeScript strict, Tailwind 4, @supabase/ssr

---

## Estado atual do codebase

| Camada | Status |
|---|---|
| `src/lib/supabase.ts` — createClient / createServerClientInstance | ✅ FEITO |
| `src/lib/auth.ts` — getCurrentUser, isSupabaseConfigured | ✅ FEITO |
| `src/proxy.ts` — middleware auth | ✅ FEITO |
| `src/lib/actions/os.ts` — CRUD completo OS | ✅ FEITO |
| `src/lib/actions/clientes.ts` — CRUD completo Clientes | ✅ FEITO |
| `src/lib/actions/equipamentos.ts` — criar equipamento | ✅ FEITO |
| SQL Schema no Supabase | ❌ FALTA |
| Páginas UI usando demo-data | ❌ MIGRAR |
| Constants GRP (categorias, tipos atendimento) | ❌ FALTA |
| Server actions: estoque, financeiro, agenda | ❌ FALTA |
| Deploy Vercel | ❌ FALTA |

---

## Task 1: SQL Schema — Criar todas as tabelas no Supabase

**Arquivo:** `supabase/migrations/001_schema_inicial.sql`

Este arquivo deve ser executado manualmente no SQL Editor do Supabase (Dashboard → SQL Editor → New query → cole e execute).

- [ ] **Passo 1: Criar o arquivo de migration**

Criar `supabase/migrations/001_schema_inicial.sql` com o conteúdo abaixo:

```sql
-- =========================================================
-- DeskControl × GRP Tecnologia — Schema Inicial
-- Execute no Supabase SQL Editor
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

-- Inserir empresa GRP (empresa_id fixo para facilitar)
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
  role            text not null default 'tecnico' check (role in ('admin','tecnico','atendente','financeiro','visualizador')),
  status          text not null default 'ativo' check (status in ('ativo','inativo','pendente')),
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
  tipo            text not null default 'fisica' check (tipo in ('fisica','juridica')),
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

-- Índices e FTS
create index if not exists clientes_empresa_idx on clientes(empresa_id);
create index if not exists clientes_nome_idx on clientes using gin(nome gin_trgm_ops);
alter table clientes add column if not exists fts tsvector
  generated always as (to_tsvector('portuguese', coalesce(nome,'') || ' ' || coalesce(email,'') || ' ' || coalesce(cpf_cnpj,''))) stored;
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
-- OS ITENS (peças e serviços)
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
-- OS FOTOS
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

-- =========================================================
-- FINANCEIRO
-- =========================================================
create table if not exists financeiro_transacoes (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  tipo            text not null check (tipo in ('receita','despesa')),
  categoria       text not null,
  descricao       text not null,
  valor           numeric(10,2) not null,
  data            date not null default current_date,
  status          text not null default 'confirmado' check (status in ('pendente','confirmado','cancelado')),
  metodo_pagamento text,
  os_id           uuid references ordens_servico(id),
  cliente_id      uuid references clientes(id),
  usuario_id      uuid references usuarios(id),
  observacoes     text,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
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
  status          text not null default 'rascunho' check (status in ('rascunho','enviado','aprovado','recusado','expirado')),
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
  status              text not null default 'ativo' check (status in ('ativo','pausado','encerrado','cancelado')),
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
  status          text not null default 'ativa' check (status in ('ativa','expirada','acionada','cancelada')),
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

-- =========================================================
-- FUNÇÃO: Gerar número da OS
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

create trigger trg_empresas_updated_at before update on empresas
  for each row execute function set_updated_at();
create trigger trg_usuarios_updated_at before update on usuarios
  for each row execute function set_updated_at();
create trigger trg_clientes_updated_at before update on clientes
  for each row execute function set_updated_at();
create trigger trg_equipamentos_updated_at before update on equipamentos
  for each row execute function set_updated_at();
create trigger trg_os_updated_at before update on ordens_servico
  for each row execute function set_updated_at();
create trigger trg_estoque_updated_at before update on estoque_itens
  for each row execute function set_updated_at();
create trigger trg_agenda_updated_at before update on agenda_eventos
  for each row execute function set_updated_at();
create trigger trg_contratos_updated_at before update on contratos
  for each row execute function set_updated_at();
```

- [ ] **Passo 2: Criar arquivo de RLS**

Criar `supabase/migrations/002_rls_policies.sql`:

```sql
-- =========================================================
-- DeskControl — Row Level Security
-- =========================================================

-- Habilitar RLS em todas as tabelas
alter table empresas           enable row level security;
alter table usuarios           enable row level security;
alter table clientes           enable row level security;
alter table equipamentos       enable row level security;
alter table ordens_servico     enable row level security;
alter table os_itens           enable row level security;
alter table os_eventos         enable row level security;
alter table os_fotos           enable row level security;
alter table estoque_itens      enable row level security;
alter table estoque_movimentacoes enable row level security;
alter table financeiro_transacoes enable row level security;
alter table agenda_eventos     enable row level security;
alter table orcamentos         enable row level security;
alter table contratos          enable row level security;
alter table garantias          enable row level security;
alter table notificacoes       enable row level security;

-- Helper: retorna empresa_id do usuário logado
create or replace function get_empresa_id()
returns uuid language sql security definer stable as $$
  select empresa_id from usuarios where auth_user_id = auth.uid() limit 1;
$$;

-- Helper: retorna id do usuário logado (na tabela usuarios)
create or replace function get_usuario_id()
returns uuid language sql security definer stable as $$
  select id from usuarios where auth_user_id = auth.uid() limit 1;
$$;

-- POLÍTICA PADRÃO: usuário acessa apenas dados da sua empresa
create policy "empresa_isolation" on clientes
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on equipamentos
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on ordens_servico
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on os_itens
  using (os_id in (select id from ordens_servico where empresa_id = get_empresa_id()));
create policy "empresa_isolation" on os_eventos
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on os_fotos
  using (os_id in (select id from ordens_servico where empresa_id = get_empresa_id()));
create policy "empresa_isolation" on estoque_itens
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on estoque_movimentacoes
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on financeiro_transacoes
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on agenda_eventos
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on orcamentos
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on contratos
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on garantias
  using (empresa_id = get_empresa_id());
create policy "empresa_isolation" on notificacoes
  using (empresa_id = get_empresa_id() or usuario_id = get_usuario_id());

-- Usuários podem ver colegas da mesma empresa
create policy "empresa_isolation" on usuarios
  using (empresa_id = get_empresa_id());

-- Empresa: usuário pode ler os dados da própria empresa
create policy "read_own_empresa" on empresas
  using (id = get_empresa_id());

-- Portal cliente: acesso público por token (sem auth)
create policy "portal_token_acesso" on ordens_servico
  for select using (token_acompanhamento is not null);
create policy "portal_token_itens" on os_itens
  for select using (true);
create policy "portal_token_fotos" on os_fotos
  for select using (true);
create policy "portal_token_orcamentos" on orcamentos
  for select using (token_aprovacao is not null);
```

- [ ] **Passo 3: Criar arquivo de seed GRP**

Criar `supabase/migrations/003_seed_grp.sql`:

```sql
-- =========================================================
-- Seed inicial para GRP Tecnologia
-- Executar APÓS criar o usuário admin no Supabase Auth
-- Substituir <AUTH_USER_ID> pelo UUID do usuário criado
-- =========================================================

-- Garantir que empresa GRP existe
insert into empresas (id, nome, slug, cnpj, telefone, whatsapp, email, cidade, estado, plano, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'GRP Tecnologia',
  'grp',
  null, -- preencher depois no /configuracoes
  null,
  null,
  'contato@grptecnologia.com.br',
  'Rio de Janeiro',
  'RJ',
  'pro',
  'ativo'
) on conflict (id) do update set nome = excluded.nome;

-- Criar perfil de admin (substituir <AUTH_USER_ID> após criar usuário no Auth)
-- insert into usuarios (auth_user_id, empresa_id, nome, email, role, status)
-- values ('<AUTH_USER_ID>', '00000000-0000-0000-0000-000000000001', 'Gabriel', 'gabriel@grptecnologia.com.br', 'admin', 'ativo');
```

- [ ] **Passo 4: Executar no Supabase**

1. Abrir Supabase Dashboard → projeto GRP → SQL Editor
2. Executar `001_schema_inicial.sql`
3. Executar `002_rls_policies.sql`
4. Criar usuário admin em Authentication → Users → Invite User (e-mail da GRP)
5. Pegar o UUID gerado e descomentar + executar `003_seed_grp.sql` com o UUID real

- [ ] **Passo 5: Commit**

```bash
git add supabase/
git commit -m "feat: SQL schema completo — todas as tabelas, RLS e função gerar_numero_os"
```

---

## Task 2: Constants GRP — Categorias e Tipos de Atendimento

**Arquivo a modificar:** `src/lib/constants.ts` (criar novo)

- [ ] **Criar `src/lib/constants.ts`:**

```typescript
export const CATEGORIAS_EQUIPAMENTO = [
  "Notebook",
  "Desktop / All-in-One",
  "Servidor",
  "Rede (Switch / Roteador / AP)",
  "Impressora / Multifuncional",
  "CFTV (Câmera / DVR / NVR)",
  "Infraestrutura TI",
  "Smartphone / Tablet",
  "Outros",
] as const;

export type CategoriaEquipamento = typeof CATEGORIAS_EQUIPAMENTO[number];

export const TIPOS_ATENDIMENTO = [
  { value: "presencial",          label: "Bancada (cliente trouxe)" },
  { value: "coleta_entrega",      label: "Coleta e Entrega" },
  { value: "visita_tecnica",      label: "Visita Técnica" },
  { value: "suporte_remoto",      label: "Suporte Remoto" },
  { value: "contrato_manutencao", label: "Contrato de Manutenção" },
] as const;

export const ORIGENS_OS = [
  { value: "presencial", label: "Presencial" },
  { value: "whatsapp",   label: "WhatsApp" },
  { value: "telefone",   label: "Telefone" },
  { value: "email",      label: "E-mail" },
  { value: "portal",     label: "Portal do Cliente" },
  { value: "contrato",   label: "Contrato" },
] as const;

export const EMPRESA_ID_GRP = "00000000-0000-0000-0000-000000000001";
```

- [ ] **Commit:**

```bash
git add src/lib/constants.ts
git commit -m "feat: constants GRP — categorias equipamento, tipos atendimento, origens OS"
```

---

## Task 3: Server Actions — Estoque, Financeiro, Agenda, Orcamentos

**Arquivos a criar:**
- `src/lib/actions/estoque.ts`
- `src/lib/actions/financeiro.ts`
- `src/lib/actions/agenda.ts`
- `src/lib/actions/orcamentos.ts`

### 3.1 — `src/lib/actions/estoque.ts`

- [ ] **Criar o arquivo:**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createServerClientInstance } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";

const estoqueSchema = z.object({
  nome: z.string().min(2),
  categoria: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  codigo_barras: z.string().optional(),
  sku: z.string().optional(),
  quantidade: z.coerce.number().min(0),
  quantidade_minima: z.coerce.number().min(0),
  preco_custo: z.coerce.number().min(0),
  preco_venda: z.coerce.number().min(0),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function listarEstoqueAction() {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("estoque_itens")
    .select("*")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .order("nome");

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

export async function buscarItemEstoqueAction(id: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("estoque_itens")
    .select("*, estoque_movimentacoes(id, tipo, quantidade, motivo, created_at, preco_unit)")
    .eq("id", id)
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .single();

  if (error) return { error: "Item não encontrado.", data: null };
  return { data };
}

export async function criarItemEstoqueAction(formData: FormData) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(
    ["nome","categoria","marca","modelo","codigo_barras","sku",
     "quantidade","quantidade_minima","preco_custo","preco_venda","localizacao","observacoes"]
      .map(k => [k, formData.get(k)])
  );
  const parsed = estoqueSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createServerClientInstance();
  const { data, error } = await supabase
    .from("estoque_itens")
    .insert({ ...parsed.data, empresa_id: user.empresaId, created_by: user.id })
    .select("id").single();

  if (error || !data) return { error: "Erro ao criar item." };

  revalidatePath("/estoque");
  redirect(`/estoque/${data.id}`);
}

export async function movimentarEstoqueAction(
  itemId: string,
  tipo: "entrada" | "saida" | "ajuste",
  quantidade: number,
  motivo: string,
  precoUnit?: number
) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data: item } = await supabase
    .from("estoque_itens")
    .select("quantidade")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item não encontrado." };

  const novaQtd =
    tipo === "entrada" ? item.quantidade + quantidade :
    tipo === "saida"   ? item.quantidade - quantidade :
    quantidade; // ajuste = setar diretamente

  if (novaQtd < 0) return { error: "Quantidade insuficiente em estoque." };

  await supabase.from("estoque_movimentacoes").insert({
    empresa_id: user.empresaId,
    item_id: itemId,
    tipo,
    quantidade,
    preco_unit: precoUnit ?? null,
    motivo,
    usuario_id: user.id,
  });

  await supabase
    .from("estoque_itens")
    .update({ quantidade: novaQtd })
    .eq("id", itemId)
    .eq("empresa_id", user.empresaId);

  revalidatePath(`/estoque/${itemId}`);
  revalidatePath("/estoque");
  return { success: true };
}
```

### 3.2 — `src/lib/actions/financeiro.ts`

- [ ] **Criar o arquivo:**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const transacaoSchema = z.object({
  tipo: z.enum(["receita", "despesa"]),
  categoria: z.string().min(1),
  descricao: z.string().min(2),
  valor: z.coerce.number().positive(),
  data: z.string(),
  status: z.enum(["pendente", "confirmado", "cancelado"]).default("confirmado"),
  metodo_pagamento: z.string().optional(),
  os_id: z.string().uuid().optional().or(z.literal("")),
  observacoes: z.string().optional(),
});

export async function listarTransacoesAction(mes?: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const hoje = new Date();
  const inicio = mes ?? `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    .toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("financeiro_transacoes")
    .select("*, ordens_servico(numero), clientes(nome)")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

export async function criarTransacaoAction(formData: FormData) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(
    ["tipo","categoria","descricao","valor","data","status","metodo_pagamento","os_id","observacoes"]
      .map(k => [k, formData.get(k)])
  );
  const parsed = transacaoSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createServerClientInstance();
  const { data, error } = await supabase
    .from("financeiro_transacoes")
    .insert({
      ...parsed.data,
      os_id: parsed.data.os_id || null,
      empresa_id: user.empresaId,
      usuario_id: user.id,
    })
    .select("id").single();

  if (error || !data) return { error: "Erro ao criar transação." };

  revalidatePath("/financeiro");
  redirect(`/financeiro/${data.id}`);
}

export async function resumoFinanceiroAction() {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const hoje = new Date();
  const inicioMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("financeiro_transacoes")
    .select("tipo, valor, status")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .gte("data", inicioMes)
    .neq("status", "cancelado");

  const receitas = data?.filter(t => t.tipo === "receita") ?? [];
  const despesas = data?.filter(t => t.tipo === "despesa") ?? [];

  const receitaMes = receitas.reduce((s, t) => s + Number(t.valor), 0);
  const despesaMes = despesas.reduce((s, t) => s + Number(t.valor), 0);
  const aReceber = receitas.filter(t => t.status === "pendente").reduce((s, t) => s + Number(t.valor), 0);

  return { receitaMes, despesaMes, saldoMes: receitaMes - despesaMes, aReceber };
}
```

### 3.3 — `src/lib/actions/agenda.ts`

- [ ] **Criar o arquivo:**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function listarAgendaAction(inicio?: string, fim?: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const hoje = new Date();
  const inicioSemana = inicio ?? new Date(hoje.setDate(hoje.getDate() - hoje.getDay())).toISOString();
  const fimSemana = fim ?? new Date(hoje.setDate(hoje.getDate() + 6)).toISOString();

  const { data, error } = await supabase
    .from("agenda_eventos")
    .select("*, usuarios!tecnico_id(id, nome, avatar_url), clientes(id, nome), ordens_servico(id, numero, status)")
    .eq("empresa_id", user.empresaId)
    .gte("data_inicio", inicioSemana)
    .lte("data_inicio", fimSemana)
    .order("data_inicio");

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

export async function criarEventoAgendaAction(evento: {
  titulo: string;
  tipo: string;
  tecnico_id?: string;
  cliente_id?: string;
  os_id?: string;
  data_inicio: string;
  data_fim?: string;
  local?: string;
  descricao?: string;
  prioridade?: string;
}) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("agenda_eventos")
    .insert({ ...evento, empresa_id: user.empresaId, created_by: user.id })
    .select("id").single();

  if (error || !data) return { error: "Erro ao criar evento." };

  revalidatePath("/agenda");
  redirect(`/agenda/${data.id}`);
}

export async function atualizarStatusEventoAction(eventoId: string, status: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  await supabase
    .from("agenda_eventos")
    .update({ status })
    .eq("id", eventoId)
    .eq("empresa_id", user.empresaId);

  revalidatePath(`/agenda/${eventoId}`);
  revalidatePath("/agenda");
  return { success: true };
}
```

### 3.4 — Commit

- [ ] **Commit:**

```bash
git add src/lib/actions/
git commit -m "feat: server actions — estoque, financeiro, agenda"
```

---

## Task 4: Migrar `/os/page.tsx` — Lista de OS com dados reais

**Arquivo:** `src/app/(app)/os/page.tsx`

A página atual é Client Component que usa `demoOS`. Converter para Server Component que busca dados reais, mantendo filtros como query params.

- [ ] **Reescrever `src/app/(app)/os/page.tsx`:**

```typescript
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarOSAction } from "@/lib/actions/os";
import { demoOS, statusOSConfig, prioridadeOSConfig } from "@/lib/demo-data";
import { OSListClient } from "./os-list-client";

export const metadata = { title: "Ordens de Serviço" };

const statusAberto = ["aberta", "em_diagnostico", "aguardando_aprovacao", "em_reparo", "aguardando_pecas"];

export default async function OSPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>;
}) {
  const params = await searchParams;

  let osList: any[] = [];
  if (isSupabaseConfigured()) {
    const result = await listarOSAction({ status: params.status, busca: params.busca });
    osList = result.data ?? [];
  } else {
    osList = demoOS.map(o => ({
      id: o.id, numero: o.numero, status: o.status, prioridade: o.prioridade,
      problema: "—", valor_total: o.valorTotal,
      data_abertura: o.dataAbertura, data_previsao: o.dataPrevisao,
      clientes: { nome: o.clienteNome }, equipamentos: { nome: o.equipamentoNome },
      usuarios: { nome: o.tecnicoNome },
    }));
  }

  const osAtrasadas = osList.filter(
    o => o.data_previsao && new Date(o.data_previsao) < new Date() && statusAberto.includes(o.status)
  );
  const abertas = osList.filter(o => statusAberto.includes(o.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {abertas} em aberto
            {osAtrasadas.length > 0 && ` · ${osAtrasadas.length} atrasada(s)`}
            {" · "}{osList.length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/os/nova"><Plus className="size-4" />Nova OS</Link>
        </Button>
      </div>

      {osAtrasadas.length > 0 && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3">
          <ClipboardList className="size-4 shrink-0 text-[var(--color-danger)]" />
          <p className="text-sm text-[var(--color-danger)]">
            <strong>{osAtrasadas.length}</strong> OS com prazo vencido:{" "}
            {osAtrasadas.slice(0, 3).map((o: any) => o.numero).join(", ")}
            {osAtrasadas.length > 3 && ` e mais ${osAtrasadas.length - 3}`}
          </p>
        </div>
      )}

      <OSListClient initialData={osList} statusOSConfig={statusOSConfig} prioridadeOSConfig={prioridadeOSConfig} statusAberto={statusAberto} />
    </div>
  );
}
```

- [ ] **Criar `src/app/(app)/os/os-list-client.tsx`** (filtros e busca client-side):

```typescript
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type Props = {
  initialData: any[];
  statusOSConfig: Record<string, { label: string; bg: string; color: string }>;
  prioridadeOSConfig: Record<string, { label: string; color: string }>;
  statusAberto: string[];
};

const filtros = [
  { key: "todas", label: "Todas" },
  { key: "abertas", label: "Em aberto" },
  { key: "prontas", label: "Prontas" },
  { key: "entregues", label: "Entregues" },
];

export function OSListClient({ initialData, statusOSConfig, prioridadeOSConfig, statusAberto }: Props) {
  const [filtroAtivo, setFiltroAtivo] = useState("todas");
  const [busca, setBusca] = useState("");

  const contadores = useMemo(() => ({
    todas: initialData.length,
    abertas: initialData.filter(o => statusAberto.includes(o.status)).length,
    prontas: initialData.filter(o => o.status === "pronto").length,
    entregues: initialData.filter(o => o.status === "entregue").length,
  }), [initialData]);

  const osFiltradas = useMemo(() => {
    let lista = initialData;
    if (filtroAtivo === "abertas") lista = lista.filter(o => statusAberto.includes(o.status));
    if (filtroAtivo === "prontas") lista = lista.filter(o => o.status === "pronto");
    if (filtroAtivo === "entregues") lista = lista.filter(o => o.status === "entregue");
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(o =>
        o.numero.toLowerCase().includes(q) ||
        (o.clientes?.nome ?? "").toLowerCase().includes(q) ||
        (o.equipamentos?.nome ?? "").toLowerCase().includes(q) ||
        (o.usuarios?.nome ?? "").toLowerCase().includes(q)
      );
    }
    return lista;
  }, [initialData, filtroAtivo, busca]);

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">
        {filtros.map(f => {
          const count = contadores[f.key as keyof typeof contadores];
          const ativo = f.key === filtroAtivo;
          return (
            <button key={f.key} onClick={() => setFiltroAtivo(f.key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                ativo ? "border-[var(--color-brand-600)] text-[var(--color-brand-700)]"
                       : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}>
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                ativo ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
                       : "bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)]"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por número, cliente ou equipamento..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-10 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]" />
        {busca && (
          <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Número</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Cliente</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Equipamento</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Técnico</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Prioridade</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] sm:table-cell">Abertura</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {osFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[var(--color-fg-muted)]">
                    {busca ? `Nenhuma OS encontrada para "${busca}"` : "Nenhuma OS neste filtro"}
                  </td>
                </tr>
              ) : osFiltradas.map(os => {
                const cfg = statusOSConfig[os.status] ?? { label: os.status, bg: "#eee", color: "#333" };
                const prio = prioridadeOSConfig[os.prioridade] ?? { label: os.prioridade, color: "#333" };
                const atrasada = os.data_previsao && new Date(os.data_previsao) < new Date() && statusAberto.includes(os.status);
                return (
                  <tr key={os.id} className={`transition-colors hover:bg-[var(--color-surface-muted)] ${atrasada ? "bg-[var(--color-danger-bg)]/30" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/os/${os.id}`} className="font-semibold text-[var(--color-brand-600)] hover:underline">
                        {os.numero}
                      </Link>
                      {atrasada && <span className="ml-1.5 text-[10px] font-bold text-[var(--color-danger)]">ATRASADA</span>}
                    </td>
                    <td className="px-4 py-3 font-medium">{os.clientes?.nome ?? "—"}</td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">{os.equipamentos?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] lg:table-cell">
                      {os.usuarios?.nome ?? <span className="text-[var(--color-fg-subtle)]">—</span>}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-xs font-medium" style={{ color: prio.color }}>{prio.label}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] sm:table-cell">{formatDate(os.data_abertura)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(os.valor_total) > 0 ? formatCurrency(Number(os.valor_total)) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {osFiltradas.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
            {osFiltradas.length} OS exibida{osFiltradas.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Commit:**

```bash
git add src/app/\(app\)/os/
git commit -m "feat: /os — Server Component com dados reais Supabase, filtros client-side"
```

---

## Task 5: Migrar `/clientes/page.tsx` — Lista de Clientes

**Arquivo:** `src/app/(app)/clientes/page.tsx`

- [ ] **Reescrever para Server Component:**

```typescript
import Link from "next/link";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarClientesAction } from "@/lib/actions/clientes";
import { demoClientes } from "@/lib/demo-data";
import { ClientesListClient } from "./clientes-list-client";

export const metadata = { title: "Clientes" };

export default async function ClientesPage() {
  let clientes: any[] = [];
  if (isSupabaseConfigured()) {
    const result = await listarClientesAction();
    clientes = result.data ?? [];
  } else {
    clientes = demoClientes.map(c => ({
      id: c.id, nome: c.nome, tipo: "fisica",
      telefone: c.telefone, whatsapp: (c as any).whatsapp,
      email: (c as any).email, cpf_cnpj: (c as any).cpf_cnpj,
      cidade: (c as any).cidade, estado: (c as any).estado,
      created_at: (c as any).criadoEm,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{clientes.length} clientes cadastrados</p>
        </div>
        <Button asChild>
          <Link href="/clientes/novo"><Plus className="size-4" />Novo Cliente</Link>
        </Button>
      </div>
      <ClientesListClient initialData={clientes} />
    </div>
  );
}
```

- [ ] **Criar `src/app/(app)/clientes/clientes-list-client.tsx`:**

```typescript
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ClientesListClient({ initialData }: { initialData: any[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!busca.trim()) return initialData;
    const q = busca.toLowerCase();
    return initialData.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      (c.telefone ?? "").includes(q) ||
      (c.cpf_cnpj ?? "").includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.cidade ?? "").toLowerCase().includes(q)
    );
  }, [initialData, busca]);

  return (
    <>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF, e-mail ou cidade..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-10 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]" />
        {busca && (
          <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="size-4 text-[var(--color-fg-subtle)]" />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Nome</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] sm:table-cell">Telefone</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">E-mail</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Cidade</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Cadastro</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--color-fg-muted)]">
                  {busca ? `Nenhum cliente encontrado para "${busca}"` : "Nenhum cliente cadastrado"}
                </td></tr>
              ) : filtrados.map(c => (
                <tr key={c.id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${c.id}`} className="font-medium hover:text-[var(--color-brand-600)] hover:underline">
                      {c.nome}
                    </Link>
                    {c.tipo === "juridica" && (
                      <span className="ml-2 text-[10px] font-bold text-[var(--color-fg-subtle)]">PJ</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] sm:table-cell">{c.telefone ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">{c.email ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] lg:table-cell">
                    {c.cidade ? `${c.cidade}${c.estado ? ` / ${c.estado}` : ""}` : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] lg:table-cell">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {c.whatsapp && (
                      <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener"
                        className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors">
                        <MessageCircle className="size-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
            {filtrados.length} cliente{filtrados.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Commit:**

```bash
git add src/app/\(app\)/clientes/
git commit -m "feat: /clientes — Server Component com dados reais Supabase"
```

---

## Task 6: Migrar `/estoque/page.tsx`, `/financeiro/page.tsx`

**Padrão:** Converter para Server Components que buscam via actions. Manter filtros como Client Components separados.

### 6.1 — Estoque

- [ ] **Reescrever `src/app/(app)/estoque/page.tsx`:**

```typescript
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarEstoqueAction } from "@/lib/actions/estoque";
import { demoProdutos } from "@/lib/demo-data";
import { EstoqueListClient } from "./estoque-list-client";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Estoque" };

export default async function EstoquePage() {
  let itens: any[] = [];
  if (isSupabaseConfigured()) {
    const result = await listarEstoqueAction();
    itens = result.data ?? [];
  } else {
    itens = demoProdutos.map(p => ({
      id: p.id, nome: p.nome, categoria: p.categoria,
      quantidade: p.estoque, quantidade_minima: p.estoqueMinimo ?? 2,
      preco_custo: (p as any).precoCusto ?? 0,
      preco_venda: p.precoVenda ?? 0,
    }));
  }

  const totalItens = itens.length;
  const semEstoque = itens.filter(i => i.quantidade <= 0).length;
  const criticos = itens.filter(i => i.quantidade > 0 && i.quantidade <= i.quantidade_minima).length;
  const valorTotal = itens.reduce((s, i) => s + Number(i.quantidade) * Number(i.preco_custo), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {totalItens} itens · {semEstoque} sem estoque · Valor total: {formatCurrency(valorTotal)}
          </p>
        </div>
        <Button asChild>
          <Link href="/estoque/novo"><Plus className="size-4" />Novo Item</Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total de Itens", value: totalItens, color: "brand" },
          { label: "Sem Estoque", value: semEstoque, color: "danger" },
          { label: "Estoque Crítico", value: criticos, color: "warning" },
          { label: "Valor em Estoque", value: formatCurrency(valorTotal), color: "success" },
        ].map(k => (
          <div key={k.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs text-[var(--color-fg-subtle)]">{k.label}</p>
            <p className={`mt-1 text-2xl font-bold text-[var(--color-${k.color}-600)]`}>{k.value}</p>
          </div>
        ))}
      </div>

      <EstoqueListClient initialData={itens} />
    </div>
  );
}
```

- [ ] **Criar `src/app/(app)/estoque/estoque-list-client.tsx`** com busca client-side (mesmo padrão de ClientesListClient, adaptado para colunas de estoque: nome, categoria, quantidade, estoque mínimo, preço venda).

- [ ] **Commit:**

```bash
git add src/app/\(app\)/estoque/
git commit -m "feat: /estoque — Server Component com dados reais"
```

### 6.2 — Financeiro

- [ ] **Reescrever `src/app/(app)/financeiro/page.tsx`:**

```typescript
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarTransacoesAction, resumoFinanceiroAction } from "@/lib/actions/financeiro";
import { demoTransacoes, demoResumoFinanceiro } from "@/lib/demo-data";
import { FinanceiroListClient } from "./financeiro-list-client";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Financeiro" };

export default async function FinanceiroPage() {
  let transacoes: any[] = [];
  let resumo = demoResumoFinanceiro;

  if (isSupabaseConfigured()) {
    const [transResult, resumoResult] = await Promise.all([
      listarTransacoesAction(),
      resumoFinanceiroAction(),
    ]);
    transacoes = transResult.data ?? [];
    resumo = { ...demoResumoFinanceiro, ...resumoResult };
  } else {
    transacoes = demoTransacoes;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Caixa e transações do mês</p>
        </div>
        <Button asChild>
          <Link href="/financeiro/novo"><Plus className="size-4" />Nova Transação</Link>
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Receita do Mês", value: formatCurrency(resumo.receitaMes), color: "success" },
          { label: "Despesas do Mês", value: formatCurrency(resumo.despesaMes), color: "danger" },
          { label: "Saldo do Mês", value: formatCurrency(resumo.saldoMes), color: resumo.saldoMes >= 0 ? "success" : "danger" },
          { label: "A Receber", value: formatCurrency(resumo.aReceber), color: "warning" },
        ].map(k => (
          <div key={k.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs text-[var(--color-fg-subtle)]">{k.label}</p>
            <p className={`mt-1 text-2xl font-bold text-[var(--color-${k.color}-600)]`}>{k.value}</p>
          </div>
        ))}
      </div>

      <FinanceiroListClient initialData={transacoes} />
    </div>
  );
}
```

- [ ] **Criar `src/app/(app)/financeiro/financeiro-list-client.tsx`** com busca e filtro receita/despesa client-side.

- [ ] **Commit:**

```bash
git add src/app/\(app\)/financeiro/
git commit -m "feat: /financeiro — Server Component com dados reais"
```

---

## Task 7: Migrar `/dashboard/page.tsx` — Dashboard com KPIs reais

- [ ] **Modificar `src/app/(app)/dashboard/page.tsx`:**

Adicionar no início do componente (é Server Component):

```typescript
import { isSupabaseConfigured } from "@/lib/auth";
import { listarOSAction } from "@/lib/actions/os";
import { resumoFinanceiroAction } from "@/lib/actions/financeiro";
import { listarClientesAction } from "@/lib/actions/clientes";
import { listarEstoqueAction } from "@/lib/actions/estoque";

// Substituir bloco de dados no início da função:
export default async function DashboardPage() {
  let osList = demoOS as any[];
  let resumoFin = demoResumoFinanceiro;
  let totalClientes = demoClientes.length;
  let itensSemEstoque = demoProdutos.filter(p => p.estoque === 0).length;

  if (isSupabaseConfigured()) {
    const [osResult, finResult, clientesResult, estoqueResult] = await Promise.all([
      listarOSAction(),
      resumoFinanceiroAction(),
      listarClientesAction(),
      listarEstoqueAction(),
    ]);
    osList = (osResult.data ?? []).map((o: any) => ({
      id: o.id, numero: o.numero, status: o.status, prioridade: o.prioridade,
      dataAbertura: o.data_abertura, dataPrevisao: o.data_previsao,
      clienteNome: o.clientes?.nome, equipamentoNome: o.equipamentos?.nome,
      tecnicoNome: o.usuarios?.nome, valorTotal: Number(o.valor_total ?? 0),
    }));
    resumoFin = { ...demoResumoFinanceiro, ...finResult };
    totalClientes = clientesResult.data?.length ?? 0;
    itensSemEstoque = (estoqueResult.data ?? []).filter((i: any) => i.quantidade <= 0).length;
  }

  // ... resto do componente usa osList, resumoFin, totalClientes, itensSemEstoque
```

- [ ] **Commit:**

```bash
git add src/app/\(app\)/dashboard/
git commit -m "feat: dashboard — KPIs reais do Supabase com fallback demo"
```

---

## Task 8: Migrar `/equipamentos/page.tsx`

**Padrão idêntico:** Server Component + Server Action `listarEquipamentosAction` (criar em `src/lib/actions/equipamentos.ts`) + Client Component de filtros.

- [ ] **Adicionar `listarEquipamentosAction` em `src/lib/actions/equipamentos.ts`:**

```typescript
export async function listarEquipamentosAction(clienteId?: string) {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  let query = supabase
    .from("equipamentos")
    .select("*, clientes(id, nome)")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .order("nome");

  if (clienteId) query = query.eq("cliente_id", clienteId);

  const { data, error } = await query.limit(500);
  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

export async function buscarEquipamentoAction(id: string) {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("equipamentos")
    .select("*, clientes(id, nome, telefone, whatsapp), ordens_servico(id, numero, status, data_abertura, valor_total)")
    .eq("id", id)
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .single();

  if (error) return { error: "Equipamento não encontrado.", data: null };
  return { data };
}
```

- [ ] **Reescrever `/equipamentos/page.tsx`** no mesmo padrão (Server Component + EquipamentosListClient com busca client-side).

- [ ] **Commit:**

```bash
git add src/app/\(app\)/equipamentos/ src/lib/actions/equipamentos.ts
git commit -m "feat: /equipamentos — Server Component com dados reais"
```

---

## Task 9: Adicionar `tipo_atendimento` na OS Nova e Detalhes

**Arquivo:** `src/app/(app)/os/nova/nova-os-form.tsx` e `src/components/equipamentos/equipamento-form.tsx`

- [ ] **Em `nova-os-form.tsx`, adicionar campo `tipo_atendimento`:**

Localizar onde ficam os campos de `origem` e `prioridade`. Adicionar logo após:

```tsx
import { TIPOS_ATENDIMENTO, CATEGORIAS_EQUIPAMENTO } from "@/lib/constants";

// No JSX, após o campo origem:
<div>
  <label className="block text-sm font-medium mb-1">Tipo de Atendimento</label>
  <select name="tipo_atendimento" defaultValue="presencial"
    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
    {TIPOS_ATENDIMENTO.map(t => (
      <option key={t.value} value={t.value}>{t.label}</option>
    ))}
  </select>
</div>
```

- [ ] **Em `equipamento-form.tsx`, adicionar campo `categoria`:**

```tsx
import { CATEGORIAS_EQUIPAMENTO } from "@/lib/constants";

// No JSX, após o campo nome:
<div>
  <label className="block text-sm font-medium mb-1">Categoria</label>
  <select name="categoria" defaultValue={equipamento?.categoria ?? ""}
    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
    <option value="">Selecione...</option>
    {CATEGORIAS_EQUIPAMENTO.map(c => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>
</div>
```

- [ ] **Adicionar `tipo_atendimento` ao schema da OS action:**

Em `src/lib/actions/os.ts`, linha do `criarOSSchema`, adicionar:

```typescript
tipo_atendimento: z.enum(['presencial','coleta_entrega','visita_tecnica','suporte_remoto','contrato_manutencao']).default('presencial'),
```

E no `supabase.from('ordens_servico').insert({...})` adicionar:
```typescript
tipo_atendimento: data.tipo_atendimento,
```

- [ ] **Commit:**

```bash
git add src/app/\(app\)/os/nova/ src/components/ src/lib/actions/os.ts
git commit -m "feat: tipo_atendimento na OS + categoria no equipamento (constants GRP)"
```

---

## Task 10: `.env.local` e Deploy Vercel

- [ ] **Criar `.env.local` (não commitado — apenas localmente):**

```
NEXT_PUBLIC_SUPABASE_URL=https://<SEU_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

- [ ] **Verificar `.gitignore` inclui `.env.local`:**

```bash
grep ".env.local" .gitignore
```

Se não estiver, adicionar.

- [ ] **Testar localmente:**

```bash
npm run dev
```

Abrir http://localhost:3000/login — fazer login com o usuário criado no Supabase Auth.
Verificar: criar OS, listar clientes, ver dashboard com KPIs zerados (empresa nova).

- [ ] **Build de produção:**

```bash
npm run build
```

Verificar: zero erros de TypeScript e build limpo.

- [ ] **Deploy no Vercel:**

Via CLI (se tiver Vercel CLI instalado):
```bash
npx vercel --prod
```

Ou via Vercel Dashboard:
1. Import project → Git repo
2. Framework: Next.js (auto-detect)
3. Environment Variables: copiar as 3 vars do `.env.local`
4. Deploy

- [ ] **Commit final:**

```bash
git add .gitignore
git commit -m "chore: configuração ambiente produção"
```

---

## Checklist de Verificação Go-live

Antes de considerar a Fase 1 concluída:

- [ ] Login com usuário GRP funciona (Supabase Auth)
- [ ] Dashboard carrega com dados (zerados = correto para empresa nova)
- [ ] Criar nova OS → salva no banco → aparece na lista
- [ ] Abrir OS detalhe → timeline, itens, status actions funcionam
- [ ] Criar cliente → aparece na lista
- [ ] Portal `/acompanhar/[token]` carrega OS pelo token
- [ ] Build sem erros TypeScript: `npx tsc --noEmit 2>&1 | Select-String -NotMatch "\.next\\"`
- [ ] URL de produção acessível

---

## Resumo de Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/001_schema_inicial.sql` | Criar |
| `supabase/migrations/002_rls_policies.sql` | Criar |
| `supabase/migrations/003_seed_grp.sql` | Criar |
| `src/lib/constants.ts` | Criar |
| `src/lib/actions/estoque.ts` | Criar |
| `src/lib/actions/financeiro.ts` | Criar |
| `src/lib/actions/agenda.ts` | Criar |
| `src/lib/actions/equipamentos.ts` | Expandir |
| `src/app/(app)/os/page.tsx` | Reescrever → Server Component |
| `src/app/(app)/os/os-list-client.tsx` | Criar |
| `src/app/(app)/clientes/page.tsx` | Reescrever → Server Component |
| `src/app/(app)/clientes/clientes-list-client.tsx` | Criar |
| `src/app/(app)/estoque/page.tsx` | Reescrever → Server Component |
| `src/app/(app)/estoque/estoque-list-client.tsx` | Criar |
| `src/app/(app)/financeiro/page.tsx` | Reescrever → Server Component |
| `src/app/(app)/financeiro/financeiro-list-client.tsx` | Criar |
| `src/app/(app)/equipamentos/page.tsx` | Reescrever → Server Component |
| `src/app/(app)/dashboard/page.tsx` | Modificar → dados reais |
| `src/app/(app)/os/nova/nova-os-form.tsx` | Adicionar campo tipo_atendimento |
| `src/components/equipamentos/equipamento-form.tsx` | Adicionar campo categoria |
| `src/lib/actions/os.ts` | Adicionar tipo_atendimento ao schema |
