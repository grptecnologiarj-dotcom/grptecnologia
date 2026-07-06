# RBAC — DeskControl

> Role-Based Access Control completo. Cada usuário vê e faz exatamente o que deve.

---

## 1. HIERARQUIA DE PERFIS

```
SUPER_ADMIN (GRP Tecnologia)
    └── ADMIN (Dono da empresa)
            ├── GERENTE
            │     ├── ATENDENTE
            │     └── TECNICO
            │           └── FINANCEIRO
            └── CLIENTE (Portal externo)
```

---

## 2. DESCRIÇÃO DOS PERFIS

### SUPER_ADMIN
**Quem:** Equipe da GRP Tecnologia
**Acesso:** Plataforma inteira + dados de todas as empresas
**Escopo:** Fora do sistema de tenant — acesso via service_role + interface dedicada
- Gerenciar empresas (criar, suspender, cancelar, impersonar)
- Ver métricas globais da plataforma
- Configurar planos e feature flags
- Suporte técnico (visualizar dados de qualquer empresa)
- Nunca altera dados de produção sem log de auditoria

### ADMIN
**Quem:** Dono ou sócio da empresa
**Acesso:** Tudo dentro da sua empresa
- Configurações completas da empresa
- Gestão de usuários (criar, editar, inativar, definir roles)
- Acesso a todos os módulos sem restrição
- Relatórios financeiros completos (DRE, margens)
- Pode ver comissões e custo por técnico
- Gestão de plano e assinatura

### GERENTE
**Quem:** Gerente de loja ou supervisor
**Acesso:** Operação completa, exceto configurações críticas
- Tudo que o ATENDENTE faz
- Atribuir OS para técnicos
- Aprovar orçamentos acima de um valor limite
- Ver relatórios operacionais e financeiros (sem DRE completo)
- Configurações operacionais (checklist, templates de mensagem)
- Não pode criar/deletar usuários
- Não pode ver configurações de plano/assinatura

### ATENDENTE
**Quem:** Recepcionista, balconista
**Acesso:** Operação diária de atendimento
- Criar, editar e visualizar OS
- Cadastrar e editar clientes e equipamentos
- Enviar mensagens de WhatsApp (via templates)
- Criar e enviar orçamentos
- Registrar pagamentos (caixa)
- Ver agenda (somente leitura)
- Não vê relatórios financeiros detalhados
- Não vê margem ou custo interno

### TECNICO
**Quem:** Técnico de reparo ou técnico de campo
**Acesso:** Suas próprias OS + operação técnica
- Ver apenas as OS atribuídas a ele (ou todas, se configurado pelo Admin)
- Atualizar status da OS
- Adicionar diagnóstico, solução, fotos, checklist
- Adicionar peças e serviços à OS
- Ver a agenda própria
- Registrar tempo de serviço
- Não vê financeiro (valores) por padrão — Admin pode liberar
- Não cria clientes ou equipamentos (apenas visualiza)

### FINANCEIRO
**Quem:** Contador, responsável financeiro
**Acesso:** Apenas módulos financeiros
- Ver todas as transações
- Registrar pagamentos e despesas
- Gerar relatórios financeiros
- Ver DRE e fluxo de caixa
- Não vê dados técnicos das OS (apenas valor)
- Não pode mudar status de OS
- Não pode criar clientes

### CLIENTE
**Quem:** Cliente da assistência técnica (acesso externo)
**Acesso:** Portal do cliente via token único
- Ver status da própria OS
- Ver fotos autorizadas
- Aprovar orçamento
- Pagar via link
- Não tem login no sistema principal

---

## 3. MATRIZ DE PERMISSÕES

### Legenda
- ✅ Total | 🔶 Parcial (ver descrição) | ❌ Sem acesso

| Módulo / Ação | SUPER_ADMIN | ADMIN | GERENTE | ATENDENTE | TECNICO | FINANCEIRO |
|---|---|---|---|---|---|---|
| **DASHBOARD** | | | | | | |
| Ver dashboard geral | ✅ | ✅ | ✅ | 🔶¹ | 🔶² | 🔶³ |
| **ORDENS DE SERVIÇO** | | | | | | |
| Ver todas as OS | ✅ | ✅ | ✅ | ✅ | 🔶⁴ | 🔶⁵ |
| Criar OS | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Editar OS | ✅ | ✅ | ✅ | ✅ | 🔶⁶ | ❌ |
| Mudar status OS | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Atribuir técnico | ✅ | ✅ | ✅ | 🔶⁷ | ❌ | ❌ |
| Deletar OS | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver valor da OS | ✅ | ✅ | ✅ | ✅ | 🔶⁸ | ✅ |
| **CLIENTES** | | | | | | |
| Ver clientes | ✅ | ✅ | ✅ | ✅ | 🔶⁹ | ❌ |
| Criar/editar clientes | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Deletar clientes | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **EQUIPAMENTOS** | | | | | | |
| Ver equipamentos | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Criar/editar equipamentos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **AGENDA** | | | | | | |
| Ver agenda geral | ✅ | ✅ | ✅ | ✅ | 🔶¹⁰ | ❌ |
| Criar/editar eventos | ✅ | ✅ | ✅ | ✅ | 🔶¹⁰ | ❌ |
| **ORÇAMENTOS** | | | | | | |
| Ver orçamentos | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Criar/enviar orçamentos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Aprovar orçamentos | ✅ | ✅ | 🔶¹¹ | ❌ | ❌ | ❌ |
| **FINANCEIRO** | | | | | | |
| Ver caixa | ✅ | ✅ | ✅ | 🔶¹² | ❌ | ✅ |
| Registrar pagamento | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Ver contas a receber | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Ver contas a pagar | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Ver DRE / relatórios | ✅ | ✅ | 🔶¹³ | ❌ | ❌ | ✅ |
| **ESTOQUE** | | | | | | |
| Ver estoque | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Criar/editar produtos | ✅ | ✅ | ✅ | 🔶¹⁴ | ❌ | ❌ |
| Movimentar estoque | ✅ | ✅ | ✅ | 🔶¹⁵ | ❌ | ❌ |
| **CONTRATOS** | | | | | | |
| Ver contratos | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Criar/editar contratos | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **RELATÓRIOS** | | | | | | |
| Relatórios operacionais | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Relatórios financeiros | ✅ | ✅ | 🔶¹³ | ❌ | ❌ | ✅ |
| **CONFIGURAÇÕES** | | | | | | |
| Dados da empresa | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestão de usuários | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Templates / Checklists | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| WhatsApp / Integrações | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Plano / Assinatura | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **WHATSAPP** | | | | | | |
| Enviar mensagens | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ver histórico mensagens | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Notas:**
1. Dashboard do atendente: OS do dia, caixa — sem financeiro detalhado
2. Dashboard do técnico: apenas suas OS, sem financeiro
3. Dashboard do financeiro: apenas KPIs financeiros
4. Técnico vê apenas as OS atribuídas a ele (configurável pelo Admin)
5. Financeiro vê OS apenas com informações de valor — sem detalhe técnico
6. Técnico edita apenas campos técnicos (diagnóstico, solução, fotos, checklist)
7. Atendente pode atribuir técnico apenas na criação — depois apenas Gerente/Admin
8. Técnico vê valor apenas se Admin configurar "mostrar valores para técnicos"
9. Técnico vê dados básicos do cliente da OS que está atendendo
10. Técnico vê e edita apenas sua própria agenda
11. Gerente aprova orçamentos até um valor limite configurado pelo Admin
12. Atendente vê o caixa do dia mas não relatórios históricos
13. Gerente vê relatórios operacionais mas não DRE completo
14. Atendente pode criar produto mas não definir preço de custo
15. Atendente pode registrar saída de peça vinculada a OS

---

## 4. IMPLEMENTAÇÃO TÉCNICA

### Helper de autorização (Server-side)

```typescript
// lib/auth.ts

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'super_admin' | 'admin' | 'gerente' | 'atendente' | 'tecnico' | 'financeiro'

export interface AuthUser {
  id: string
  empresaId: string
  role: UserRole
  nome: string
}

export async function requireAuth(): Promise<AuthUser> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, empresa_id, role, nome')
    .eq('auth_user_id', user.id)
    .eq('status', 'ativo')
    .single()

  if (!usuario) redirect('/login')

  return {
    id: usuario.id,
    empresaId: usuario.empresa_id,
    role: usuario.role as UserRole,
    nome: usuario.nome,
  }
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  gerente: 60,
  atendente: 40,
  tecnico: 30,
  financeiro: 20,
}

export async function requireRole(user: AuthUser, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Sem permissão para executar esta ação')
  }
}

export function hasRole(user: AuthUser, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole]
}

// Verifica se tem pelo menos o nível do papel mínimo
export async function requireMinRole(user: AuthUser, minRole: UserRole) {
  if (!hasRole(user, minRole)) {
    throw new Error('Sem permissão para executar esta ação')
  }
}
```

### Uso em Server Action

```typescript
// lib/actions/os.ts
'use server'

export async function deletarOS(osId: string) {
  const user = await requireAuth()
  await requireRole(user, ['admin', 'super_admin'])  // só admin pode deletar

  // ... continua
}

export async function atualizarStatusOS(osId: string, status: OSStatus) {
  const user = await requireAuth()
  await requireRole(user, ['admin', 'gerente', 'atendente', 'tecnico'])

  // Técnico só pode mudar status das SUAS OS
  if (user.role === 'tecnico') {
    const supabase = await createServerClient()
    const { data: os } = await supabase
      .from('ordens_servico')
      .select('tecnico_id')
      .eq('id', osId)
      .single()

    if (os?.tecnico_id !== user.id) {
      throw new Error('Técnico só pode atualizar suas próprias OS')
    }
  }

  // ... continua
}
```

### Componentes condicionais

```typescript
// components/shared/can.tsx
'use client'

import { useUser } from '@/lib/hooks/useUser'

interface CanProps {
  role: UserRole | UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ role, children, fallback = null }: CanProps) {
  const { user } = useUser()
  const allowed = Array.isArray(role)
    ? role.includes(user.role)
    : user.role === role

  return allowed ? <>{children}</> : <>{fallback}</>
}

// Uso:
// <Can role={['admin', 'gerente']}>
//   <Button>Deletar</Button>
// </Can>
```

---

## 5. PERMISSÕES GRANULARES (FUTURO — Fase 2)

Para o Enterprise, o Admin poderá customizar permissões além do papel padrão:

```sql
CREATE TABLE permissoes_customizadas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id),
  modulo      TEXT NOT NULL,   -- 'os', 'financeiro', 'estoque'
  acao        TEXT NOT NULL,   -- 'ver', 'criar', 'editar', 'deletar'
  permitido   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Na Fase 1, o RBAC por role é suficiente e correto. Adicionar granularidade prematura cria complexidade desnecessária.

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
