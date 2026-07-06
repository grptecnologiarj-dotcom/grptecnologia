# MULTITENANT — DeskControl

> Isolamento perfeito entre empresas. Um banco, zero vazamento.

---

## 1. MODELO DE MULTITENANCY

O DeskControl usa **Pool Model** (banco único, isolamento por RLS), não bancos separados por tenant.

### Por que Pool Model?
- **Custo:** Um Supabase project vs. N projetos
- **Operações:** Migrações em um lugar, não em centenas
- **Escalabilidade:** Vertical no banco vs. gestão de N bancos
- **Tradeoff aceito:** RLS precisa ser perfeito — há mais risco de vazamento se houver bug

### Por que não Silo Model (banco por empresa)?
- Custo inviável no early stage
- Migrações se tornam um pesadelo
- Supabase não foi projetado para isso

---

## 2. IDENTIFICADOR DE TENANT

Toda tabela de negócio tem `empresa_id UUID NOT NULL` como chave de tenant.

```sql
-- Exemplo da estrutura
CREATE TABLE qualquer_tabela (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  -- ... demais campos
);
```

**Regra absoluta:** Nenhuma query de negócio pode ser executada sem filtro por `empresa_id`.

---

## 3. ROW LEVEL SECURITY (IMPLEMENTAÇÃO COMPLETA)

### Função helper (base de todas as políticas)

```sql
-- Retorna empresa_id + role do usuário autenticado
-- SECURITY DEFINER para contornar recursão de RLS
-- STABLE para que o Postgres faça cache por transação
CREATE OR REPLACE FUNCTION auth.get_current_user_info()
RETURNS TABLE(empresa_id UUID, user_id UUID, role user_role) AS $$
  SELECT
    u.empresa_id,
    u.id as user_id,
    u.role
  FROM public.usuarios u
  WHERE u.auth_user_id = auth.uid()
    AND u.deleted_at IS NULL
    AND u.status = 'ativo'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função de conveniência para pegar só empresa_id
CREATE OR REPLACE FUNCTION auth.empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM auth.get_current_user_info();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Verificar se o usuário tem pelo menos um dos roles
CREATE OR REPLACE FUNCTION auth.has_role(roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.get_current_user_info()
    WHERE role = ANY(roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Políticas de RLS por tabela

```sql
-- =========================================================
-- EMPRESAS
-- =========================================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresas_select" ON empresas
  FOR SELECT USING (id = auth.empresa_id());

CREATE POLICY "empresas_update_admin" ON empresas
  FOR UPDATE USING (
    id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin']::user_role[])
  );

-- =========================================================
-- USUARIOS
-- =========================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Todos veem usuários da própria empresa (para listas de técnicos, etc.)
CREATE POLICY "usuarios_select" ON usuarios
  FOR SELECT USING (
    empresa_id = auth.empresa_id()
    AND deleted_at IS NULL
  );

-- Apenas admin cria usuários
CREATE POLICY "usuarios_insert" ON usuarios
  FOR INSERT WITH CHECK (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin']::user_role[])
  );

-- Admin edita qualquer usuário; usuário edita apenas ele mesmo
CREATE POLICY "usuarios_update" ON usuarios
  FOR UPDATE USING (
    empresa_id = auth.empresa_id()
    AND (
      auth.has_role(ARRAY['admin']::user_role[])
      OR id = (SELECT user_id FROM auth.get_current_user_info())
    )
  );

-- =========================================================
-- CLIENTES
-- =========================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes_select" ON clientes
  FOR SELECT USING (empresa_id = auth.empresa_id() AND deleted_at IS NULL);

CREATE POLICY "clientes_insert" ON clientes
  FOR INSERT WITH CHECK (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin','gerente','atendente']::user_role[])
  );

CREATE POLICY "clientes_update" ON clientes
  FOR UPDATE USING (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin','gerente','atendente']::user_role[])
  );

CREATE POLICY "clientes_delete" ON clientes
  FOR DELETE USING (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin']::user_role[])
  );

-- =========================================================
-- ORDENS DE SERVIÇO
-- =========================================================
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;

-- Técnico vê apenas as próprias OS (ou todas, dependendo de config — simplificado aqui)
CREATE POLICY "os_select" ON ordens_servico
  FOR SELECT USING (
    empresa_id = auth.empresa_id()
    AND deleted_at IS NULL
    AND (
      -- Admin, gerente, atendente, financeiro veem todas
      auth.has_role(ARRAY['admin','gerente','atendente','financeiro']::user_role[])
      -- Técnico vê apenas as suas
      OR tecnico_id = (SELECT user_id FROM auth.get_current_user_info())
    )
  );

CREATE POLICY "os_insert" ON ordens_servico
  FOR INSERT WITH CHECK (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin','gerente','atendente']::user_role[])
  );

CREATE POLICY "os_update" ON ordens_servico
  FOR UPDATE USING (
    empresa_id = auth.empresa_id()
    AND deleted_at IS NULL
    AND (
      auth.has_role(ARRAY['admin','gerente','atendente']::user_role[])
      OR tecnico_id = (SELECT user_id FROM auth.get_current_user_info())
    )
  );

CREATE POLICY "os_delete" ON ordens_servico
  FOR DELETE USING (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin']::user_role[])
  );

-- =========================================================
-- OS_EVENTOS (timeline imutável — apenas INSERT e SELECT)
-- =========================================================
ALTER TABLE os_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_eventos_select" ON os_eventos
  FOR SELECT USING (empresa_id = auth.empresa_id());

CREATE POLICY "os_eventos_insert" ON os_eventos
  FOR INSERT WITH CHECK (empresa_id = auth.empresa_id());
-- UPDATE e DELETE bloqueados pelas RULES criadas no DATABASE.md

-- =========================================================
-- OS_FOTOS
-- =========================================================
ALTER TABLE os_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "os_fotos_all" ON os_fotos
  FOR ALL USING (
    os_id IN (
      SELECT id FROM ordens_servico WHERE empresa_id = auth.empresa_id()
    )
  );

-- =========================================================
-- TRANSACOES
-- =========================================================
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transacoes_select" ON transacoes
  FOR SELECT USING (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin','gerente','financeiro']::user_role[])
    AND deleted_at IS NULL
  );

-- Atendente pode registrar pagamentos (insert apenas com status 'pago')
CREATE POLICY "transacoes_insert_atendente" ON transacoes
  FOR INSERT WITH CHECK (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin','gerente','atendente','financeiro']::user_role[])
  );

CREATE POLICY "transacoes_update" ON transacoes
  FOR UPDATE USING (
    empresa_id = auth.empresa_id()
    AND auth.has_role(ARRAY['admin','gerente','financeiro']::user_role[])
  );

-- =========================================================
-- PORTAL DO CLIENTE (acesso sem auth.uid())
-- =========================================================
-- OS acessível pelo portal_token sem autenticação
CREATE POLICY "os_portal_select" ON ordens_servico
  FOR SELECT USING (
    -- Acesso por token público (usuário não autenticado)
    portal_token = current_setting('request.jwt.claims', true)::jsonb->>'portal_token'
    -- OU usuário autenticado da empresa
    OR empresa_id = auth.empresa_id()
  );
```

---

## 4. SEGURANÇA DAS QUERIES NO CÓDIGO

### Regra de ouro: NUNCA confie apenas no RLS

O RLS é a última linha de defesa. O código deve ser explícito:

```typescript
// ❌ ERRADO — depende apenas do RLS
const { data } = await supabase.from('clientes').select('*')

// ✅ CORRETO — filtra explicitamente + RLS como fallback
const { data } = await supabase
  .from('clientes')
  .select('*')
  .eq('empresa_id', empresaId)   // explícito
  .is('deleted_at', null)        // soft delete
  .order('nome')
```

### Server Actions sempre com empresa_id do contexto

```typescript
// lib/actions/clientes.ts
'use server'

export async function listarClientes() {
  const { empresaId } = await requireAuth()  // vem do JWT, não do cliente
  const supabase = await createServerClient()

  return supabase
    .from('clientes')
    .select('*')
    .eq('empresa_id', empresaId)  // sempre explícito
    .is('deleted_at', null)
    .order('nome')
}
```

---

## 5. ISOLAMENTO NO SUPABASE STORAGE

Todos os arquivos são organizados por tenant:

```
deskcontrol-storage/
├── {empresa_id}/
│   ├── os/
│   │   ├── {os_id}/
│   │   │   ├── entrada/
│   │   │   │   ├── foto1.jpg
│   │   │   │   └── foto2.jpg
│   │   │   ├── reparo/
│   │   │   └── saida/
│   ├── assinaturas/
│   │   └── {os_id}/
│   │       └── assinatura.png
│   ├── logos/
│   │   └── logo.png
│   └── documentos/
│       └── contrato.pdf
```

### Políticas de Storage

```sql
-- Bucket: deskcontrol
-- Apenas usuários autenticados da empresa podem acessar seus arquivos

CREATE POLICY "storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'deskcontrol'
    AND (storage.foldername(name))[1] = auth.empresa_id()::text
  );

CREATE POLICY "storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'deskcontrol'
    AND (storage.foldername(name))[1] = auth.empresa_id()::text
  );

CREATE POLICY "storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'deskcontrol'
    AND (storage.foldername(name))[1] = auth.empresa_id()::text
    AND auth.has_role(ARRAY['admin','gerente']::user_role[])
  );
```

---

## 6. ONBOARDING DE NOVA EMPRESA

Quando um novo usuário se registra, o fluxo é:

```
1. Usuário preenche formulário (nome, email, senha, nome da empresa)
2. Supabase Auth cria auth.users
3. Edge Function (service_role) executa:
   a. INSERT INTO empresas (nome, slug, plano='starter', status='trial')
   b. INSERT INTO usuarios (empresa_id, auth_user_id, role='admin')
   c. INSERT INTO configuracoes_empresa (empresa_id, ...defaults)
   d. INSERT INTO categorias_financeiras (...categorias padrão)
   e. INSERT INTO checklist_templates (...templates padrão)
   f. INSERT INTO planos.trial_ate = NOW() + INTERVAL '14 days'
4. Redireciona para /dashboard com onboarding guiado
```

Por que Edge Function com service_role?
- O usuário recém-criado ainda não tem `empresa_id`
- O RLS bloquearia o INSERT em `empresas`
- A Edge Function usa a service_role key (nunca exposta ao cliente)

---

## 7. LIMITES POR PLANO

Os limites são verificados ANTES de criar registros:

```typescript
// lib/utils/plan-limits.ts

export async function checkLimit(
  empresaId: string,
  tipo: 'usuarios' | 'os_mes'
): Promise<{ permitido: boolean; atual: number; limite: number }> {
  const supabase = await createServerClient()

  const { data: empresa } = await supabase
    .from('empresas')
    .select('plano_id, planos(features)')
    .eq('id', empresaId)
    .single()

  const features = empresa?.planos?.features as Record<string, number>
  const limite = features?.[`max_${tipo}`] ?? Infinity

  let atual = 0
  if (tipo === 'usuarios') {
    const { count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .is('deleted_at', null)
    atual = count ?? 0
  }

  // ... outros tipos

  return { permitido: atual < limite, atual, limite }
}
```

---

## 8. ANÁLISE CRÍTICA — O QUE O SCHEMA ATUAL PRECISA CORRIGIR

O schema original (`0001_initial_schema.sql`) tem problemas de multitenancy:

| Problema | Impacto | Correção |
|---|---|---|
| `auth.empresa_id()` faz SELECT toda vez | Performance | Cache via `STABLE` + índice em `auth_user_id` |
| RLS em `os_itens` faz JOIN com `ordens_servico` | Lento em volume | Adicionar `empresa_id` direto em `os_itens` |
| Sem política de DELETE em nenhuma tabela | Bloqueio ou abertura total | Definir explicitamente |
| `user_role` sem `super_admin` e `gerente` | Impossível gerenciar hierarquia | Adicionar os roles |
| Sem soft delete | Dados perdidos permanentemente | Adicionar `deleted_at` em todas |

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
