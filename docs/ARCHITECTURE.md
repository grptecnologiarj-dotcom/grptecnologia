# ARCHITECTURE — DeskControl

> Arquitetura pensada para durar 10 anos, não para funcionar hoje.

---

## 1. VISÃO GERAL

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
│   Browser (Desktop)    Browser (Mobile)    PWA (Técnico)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                    NEXT.JS 16 (App Router)                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Server      │  │ Server       │  │ API Routes       │   │
│  │ Components  │  │ Actions      │  │ (webhooks/jobs)  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       SUPABASE                               │
│                                                              │
│  ┌──────────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │  PostgreSQL  │  │  Auth    │  │  Storage (Fotos/   │   │
│  │  + RLS       │  │  (JWT)   │  │  Documentos)       │   │
│  └──────────────┘  └──────────┘  └────────────────────┘   │
│  ┌──────────────┐  ┌──────────┐                            │
│  │  Realtime    │  │  Edge    │                            │
│  │  (Websocket) │  │ Functions│                            │
│  └──────────────┘  └──────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICA

### Frontend
| Tecnologia | Versão | Motivo |
|---|---|---|
| Next.js | 16.x (App Router) | SSR, RSC, Server Actions, melhor SEO |
| React | 19.x | Concurrent features, Suspense |
| TypeScript | 5.x | Tipagem forte, segurança em refatoração |
| Tailwind CSS | 4.x | Consistência visual, performance |
| Shadcn/ui | latest | Componentes acessíveis e customizáveis |
| Lucide React | latest | Ícones consistentes |
| React Hook Form | 7.x | Formulários performáticos |
| Zod | 4.x | Validação compartilhada front/back |
| TanStack Query | 5.x | Cache, revalidação, optimistic updates |
| date-fns | 3.x | Manipulação de datas |

### Backend / BaaS
| Tecnologia | Motivo |
|---|---|
| Supabase | PostgreSQL gerenciado, Auth, Storage, Realtime, Edge Functions |
| PostgreSQL | Relacionamentos complexos, RLS, Full-text search |
| Row Level Security | Isolamento multi-tenant no nível do banco |
| Supabase Storage | Fotos de OS, documentos, assinaturas |
| Supabase Realtime | Dashboard ao vivo, notificações em tempo real |
| Edge Functions (Deno) | Webhooks, integrações, processamento assíncrono |

### Integrações externas
| Serviço | Uso |
|---|---|
| Evolution API | WhatsApp (mensagens, notificações, aprovação de orçamento) |
| Resend | E-mails transacionais |
| ViaCEP | Auto-completar endereço |
| Stripe (futuro) | Cobrança de assinaturas SaaS |
| Pagar.me / Asaas | Pagamento dos clientes da assistência técnica |

---

## 3. ESTRUTURA DE PASTAS

```
desk-control/
├── docs/                          # Documentação estratégica
├── public/                        # Assets estáticos
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Rotas públicas (login, registro)
│   │   │   ├── login/
│   │   │   └── registro/
│   │   ├── (app)/                 # Rotas protegidas (dashboard)
│   │   │   ├── layout.tsx         # Layout principal com sidebar
│   │   │   ├── dashboard/
│   │   │   ├── clientes/
│   │   │   ├── equipamentos/
│   │   │   ├── os/                # Ordens de Serviço
│   │   │   │   ├── page.tsx       # Listagem
│   │   │   │   ├── nova/          # Criação
│   │   │   │   └── [id]/          # Detalhe/edição
│   │   │   ├── agenda/
│   │   │   ├── orcamentos/
│   │   │   ├── financeiro/
│   │   │   │   ├── caixa/
│   │   │   │   ├── contas-receber/
│   │   │   │   ├── contas-pagar/
│   │   │   │   └── relatorios/
│   │   │   ├── estoque/
│   │   │   ├── garantias/
│   │   │   ├── contratos/
│   │   │   ├── relatorios/
│   │   │   ├── configuracoes/
│   │   │   ├── usuarios/
│   │   │   └── whatsapp/
│   │   ├── (portal)/              # Portal do cliente (público com token)
│   │   │   └── acompanhar/[token]/
│   │   ├── (super-admin)/         # Super Admin GRP
│   │   │   └── admin/
│   │   └── api/                   # API Routes (webhooks)
│   │       ├── webhooks/
│   │       │   ├── whatsapp/
│   │       │   └── pagamento/
│   │       └── portal/
│   ├── components/                # Componentes reutilizáveis
│   │   ├── ui/                    # Design system base (shadcn)
│   │   ├── layout/                # Sidebar, Navbar, Breadcrumb
│   │   ├── os/                    # Componentes específicos de OS
│   │   ├── financeiro/
│   │   ├── forms/                 # Formulários reutilizáveis
│   │   ├── tables/                # Tabelas com filtros/paginação
│   │   └── shared/                # Componentes genéricos
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client (RSC/Actions)
│   │   │   └── admin.ts           # Service role (apenas Edge Functions)
│   │   ├── actions/               # Server Actions organizadas por domínio
│   │   │   ├── os.ts
│   │   │   ├── clientes.ts
│   │   │   ├── financeiro.ts
│   │   │   └── ...
│   │   ├── validations/           # Schemas Zod compartilhados
│   │   │   ├── os.ts
│   │   │   ├── clientes.ts
│   │   │   └── ...
│   │   ├── hooks/                 # React hooks customizados
│   │   ├── utils/                 # Funções utilitárias puras
│   │   └── constants/             # Enums, constantes, configurações
│   └── types/
│       ├── database.ts            # Tipos gerados do Supabase
│       ├── domain.ts              # Tipos de domínio
│       └── api.ts                 # Tipos de request/response
├── supabase/
│   ├── migrations/                # Migrações SQL numeradas
│   ├── functions/                 # Edge Functions
│   │   ├── whatsapp-webhook/
│   │   ├── send-notification/
│   │   └── generate-relatorio/
│   └── seed.sql                   # Dados iniciais de dev
└── ...configs
```

---

## 4. CAMADAS DA APLICAÇÃO

### Camada de Apresentação (Client Components)
- Apenas UI interativa: formulários, modais, dropdowns, drag-and-drop
- Zero lógica de negócio
- Props tipadas via TypeScript
- Estado local apenas quando necessário (prefer server state)

### Camada de Composição (Server Components)
- Busca de dados diretamente no Supabase
- Composição de layouts complexos
- Sem estado — apenas render
- Passam dados como props para Client Components

### Camada de Ações (Server Actions)
- Toda mutação passa por Server Action
- Validação com Zod antes de tocar no banco
- Verificação de permissão RBAC antes de executar
- Retornam `{ success: true, data }` ou `{ success: false, error }`
- Revalidam apenas os paths necessários (não revalida tudo)

### Camada de Dados (Supabase + RLS)
- RLS como última linha de defesa (não depender só do front)
- Queries organizadas por domínio em `lib/actions/`
- Tipos gerados automaticamente pelo Supabase CLI
- Sem queries SQL dispersas — tudo centralizado

---

## 5. PADRÕES OBRIGATÓRIOS

### Server Actions
```typescript
// lib/actions/os.ts
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { criarOSSchema } from '@/lib/validations/os'
import { revalidatePath } from 'next/cache'

export async function criarOS(input: unknown) {
  // 1. Autenticação
  const { user, empresaId } = await requireAuth()

  // 2. Autorização (RBAC)
  await requireRole(user, ['admin', 'atendente', 'gerente'])

  // 3. Validação
  const data = criarOSSchema.parse(input)

  // 4. Lógica de negócio
  const supabase = await createServerClient()
  const { data: os, error } = await supabase
    .from('ordens_servico')
    .insert({ ...data, empresa_id: empresaId })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // 5. Revalidação seletiva
  revalidatePath('/os')

  return { success: true, data: os }
}
```

### Validação com Zod
```typescript
// lib/validations/os.ts
import { z } from 'zod'

export const criarOSSchema = z.object({
  cliente_id: z.string().uuid(),
  equipamento_id: z.string().uuid().optional(),
  problema: z.string().min(10, 'Descreva o problema com pelo menos 10 caracteres'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
  data_previsao: z.string().datetime().optional(),
  acessorios: z.string().optional(),
  senha_equip: z.string().optional(),
  observacoes: z.string().optional(),
})
```

### Componentes
```typescript
// Sempre tipado
interface OSCardProps {
  os: OrdemServico
  onStatusChange?: (id: string, status: OSStatus) => void
}

// Server Component por padrão
export default function OSCard({ os, onStatusChange }: OSCardProps) { ... }

// Client Component apenas quando necessário
'use client'
export function OSStatusDropdown({ os, onChange }: ...) { ... }
```

---

## 6. PERFORMANCE

### Estratégias
- **RSC por padrão:** componentes são Server Components; client apenas para interatividade
- **Streaming:** Suspense boundaries nos blocos pesados (tabelas, dashboards)
- **Paginação cursor-based:** não usar `OFFSET` — usar `created_at < cursor`
- **Full-text search:** `tsvector` no banco para busca de clientes/equipamentos
- **Índices compostos:** todos os filtros comuns têm índice no banco
- **Image optimization:** Next.js Image para todas as fotos
- **Lazy loading:** modais e tabs carregam componentes sob demanda
- **Optimistic updates:** ações comuns atualizam UI antes da confirmação do servidor

### Caching
```
┌─────────────────────────────────────────────────────────────┐
│ NÍVEL 1 — React cache() + Next.js full route cache          │
│ Dados que não mudam por usuário: planos, configurações       │
├─────────────────────────────────────────────────────────────┤
│ NÍVEL 2 — Next.js revalidate por tag                        │
│ Listagens: revalidate tag 'os', 'clientes', etc.            │
├─────────────────────────────────────────────────────────────┤
│ NÍVEL 3 — TanStack Query (client-side)                      │
│ Dados interativos: dashboard em tempo real, notificações     │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. TRATAMENTO DE ERROS

### Hierarquia
1. **Zod** valida input antes de qualquer operação
2. **requireAuth / requireRole** verifica permissões
3. **Server Action** captura erros do Supabase e retorna formato padrão
4. **Client** usa `useFormState` ou `useTransition` para exibir feedback

### Formato padrão de resposta
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

---

## 8. DECISÕES ARQUITETURAIS CRÍTICAS

### Por que Server Actions em vez de API Routes?
- Colocação com o componente que usa
- Type-safety automático (sem serialização manual)
- Sem boilerplate de fetch/parse
- Revalidação integrada com o cache do Next.js

**Exceção:** API Routes para webhooks externos (WhatsApp, pagamento) que precisam de URL pública.

### Por que não usar ORM (Prisma, Drizzle)?
- Supabase já gera tipos TypeScript do schema
- RLS funciona diretamente no cliente do Supabase
- Menos uma camada = menos bugs = mais performance
- Queries SQL diretas são mais previsíveis para otimização

### Por que não Zustand / Redux para estado global?
- Server Components eliminam a necessidade de estado global para dados
- Estado de UI (sidebar aberta, modal visível) é local — não precisa de store global
- TanStack Query gerencia estado de servidor no client

### Por que Supabase e não Firebase / PlanetScale?
- PostgreSQL: relacionamentos complexos, JOINs, RLS nativo
- RLS: isolamento multi-tenant no nível do banco — a camada mais segura
- Open source: possibilidade de self-host se necessário
- Storage + Realtime + Auth + Functions tudo integrado

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
