# API STRATEGY — DeskControl

> Como o sistema se comunica internamente, com o mundo exterior e com integrações.

---

## 1. FILOSOFIA

O DeskControl usa **Server Actions como API interna** — não REST endpoints para comunicação front-back.

API Routes são usadas **apenas** para:
1. Webhooks externos (WhatsApp, pagamento)
2. Portal do cliente (acesso sem autenticação)
3. API pública (plano Enterprise — Fase 3)

---

## 2. CAMADAS DE COMUNICAÇÃO

```
┌──────────────────────────────────────────────────────────┐
│  BROWSER (React)                                          │
│  └── Server Actions   ← mutações (criar, editar, deletar)│
│  └── RSC fetch        ← leitura inicial (SSR)            │
│  └── TanStack Query   ← leitura reativa (client-side)    │
├──────────────────────────────────────────────────────────┤
│  EDGE (Supabase Functions)                               │
│  └── Webhooks         ← receber eventos externos         │
│  └── Jobs             ← processamento assíncrono         │
│  └── Scheduled        ← tarefas periódicas               │
├──────────────────────────────────────────────────────────┤
│  BANCO (PostgreSQL + RLS)                                │
│  └── Realtime         ← subscriptions para dashboard     │
│  └── Triggers         ← auditoria, numeração de OS       │
└──────────────────────────────────────────────────────────┘
```

---

## 3. SERVER ACTIONS — CONVENÇÕES

### Nomenclatura
```
criar[Entidade]    → criarOS, criarCliente
atualizar[Entidade]→ atualizarOS, atualizarStatusOS
deletar[Entidade]  → deletarCliente (soft delete)
listar[Entidades]  → listarOS, listarClientes
buscar[Entidade]   → buscarOS (por id)
```

### Estrutura de retorno
```typescript
// Sempre retornar este formato — nunca lançar exceção no cliente
type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Partial<Record<string, string[]>> }

// Uso no componente
const result = await criarOS(formData)
if (!result.success) {
  toast.error(result.error)
  return
}
toast.success('OS criada com sucesso')
router.push(`/os/${result.data.id}`)
```

### Organização por domínio
```
lib/actions/
├── os.ts          → criarOS, atualizarOS, atualizarStatusOS, ...
├── clientes.ts    → criarCliente, atualizarCliente, ...
├── equipamentos.ts
├── financeiro.ts  → registrarPagamento, criarTransacao, ...
├── estoque.ts     → movimentarEstoque, ajustarEstoque, ...
├── agenda.ts
├── whatsapp.ts    → enviarMensagem, ...
└── auth.ts        → login, logout, registrarEmpresa, ...
```

---

## 4. API ROUTES (WEBHOOKS)

### WhatsApp Webhook

```
POST /api/webhooks/whatsapp
Authorization: Bearer {EVOLUTION_API_WEBHOOK_TOKEN}
```

```typescript
// app/api/webhooks/whatsapp/route.ts
export async function POST(request: Request) {
  // 1. Verificar assinatura do webhook
  const signature = request.headers.get('x-hub-signature-256')
  if (!verifyWebhookSignature(signature, await request.text())) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = await request.json()

  // 2. Processar evento via Edge Function (não bloquear resposta)
  await supabaseAdmin.functions.invoke('process-whatsapp-event', {
    body: { event: body }
  })

  // 3. Responder imediatamente (webhook não pode esperar processamento)
  return Response.json({ received: true })
}
```

### Webhook de Pagamento (Pagar.me / Asaas)

```
POST /api/webhooks/pagamento
```

Ao receber confirmação de pagamento:
1. Verificar assinatura (HMAC)
2. Encontrar transação pelo ID externo
3. Marcar como paga
4. Criar evento na OS (se vinculada)
5. Notificar usuário responsável

### Portal do Cliente

```
GET /api/portal/[token]
```

Não usa auth — apenas valida o token e retorna dados limitados da OS.

---

## 5. SUPABASE EDGE FUNCTIONS

### Onde usar Edge Functions

Edge Functions rodam no edge da Cloudflare — próximas ao usuário, sem cold start.
Usar para:
- Processamento assíncrono que não pode bloquear a UI
- Integração com APIs externas (WhatsApp, e-mail)
- Geração de PDFs pesados
- Jobs agendados (lembretes, relatórios)
- Acesso com service_role (sem RLS) para operações administrativas

### Estrutura

```
supabase/functions/
├── send-whatsapp/           → envia mensagens via Evolution API
├── process-whatsapp-event/  → processa webhooks recebidos
├── generate-pdf/            → gera PDF de OS, orçamento
├── send-email/              → e-mails transacionais via Resend
├── schedule-reminders/      → lembretes agendados (cron)
├── onboard-empresa/         → criação de nova empresa (service_role)
└── check-trial-expiry/      → verifica trials vencidos (cron)
```

### Exemplo — send-whatsapp

```typescript
// supabase/functions/send-whatsapp/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { instancia, numero, mensagem, osId } = await req.json()

  const evolutionUrl = Deno.env.get('EVOLUTION_API_URL')
  const evolutionToken = Deno.env.get('EVOLUTION_API_TOKEN')

  const response = await fetch(`${evolutionUrl}/message/sendText/${instancia}`, {
    method: 'POST',
    headers: {
      'apikey': evolutionToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      number: numero,
      text: mensagem
    })
  })

  // Registrar na timeline da OS
  if (osId && response.ok) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    await supabase.from('os_eventos').insert({
      os_id: osId,
      tipo: 'mensagem_whatsapp',
      descricao: `WhatsApp enviado para ${numero}`,
      metadata: { mensagem, numero }
    })
  }

  return new Response(JSON.stringify({ ok: response.ok }))
})
```

---

## 6. REALTIME (SUPABASE)

### Dashboard ao vivo

```typescript
// hooks/useRealtimeDashboard.ts
'use client'

export function useRealtimeDashboard(empresaId: string) {
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel('dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ordens_servico',
        filter: `empresa_id=eq.${empresaId}`
      }, (payload) => {
        // Invalidar cache do dashboard
        mutate('dashboard-stats')
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [empresaId])
}
```

### Notificações em tempo real

```typescript
// Subscrição nas notificações do usuário
const channel = supabase
  .channel('notificacoes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notificacoes',
    filter: `usuario_id=eq.${userId}`
  }, (payload) => {
    // Exibir toast + atualizar badge
    toast.info(payload.new.titulo)
    incrementUnreadCount()
  })
  .subscribe()
```

---

## 7. API PÚBLICA (FASE 3 — ENTERPRISE)

Quando implementada, a API pública seguirá estes princípios:

### Design
- RESTful com padrão de recursos (não RPC)
- Versionamento via header: `API-Version: 2024-01`
- Paginação cursor-based consistente
- Filtros expressivos via query params

### Autenticação
- API Key + Secret (não JWT de usuário)
- Criada pelo Admin nas configurações
- Rate limiting por empresa (não por IP)
- Scopes granulares: `os:read`, `os:write`, `financeiro:read`

### Endpoints (preview)
```
GET    /v1/os                    → listar OS
POST   /v1/os                    → criar OS
GET    /v1/os/{id}               → buscar OS
PATCH  /v1/os/{id}/status        → mudar status
GET    /v1/clientes              → listar clientes
POST   /v1/clientes              → criar cliente
GET    /v1/financeiro/transacoes → listar transações
```

---

## 8. INTEGRAÇÕES PREVISTAS

### Fase 1 — MVP
| Integração | Tipo | Como |
|---|---|---|
| Evolution API | WhatsApp | Edge Function |
| Resend | E-mail | Edge Function |
| ViaCEP | CEP | Client-side fetch |

### Fase 2 — Crescimento
| Integração | Tipo | Como |
|---|---|---|
| Pagar.me / Asaas | Pagamento | Webhook + Edge Function |
| Google Calendar | Agenda | OAuth + Edge Function |
| Nota Fiscal (NFe.io) | NF-e | Edge Function |

### Fase 3 — Expansão
| Integração | Tipo | Como |
|---|---|---|
| Zapier / Make | Automação | API Pública |
| Contabilidade (Omie, Conta Azul) | ERP | API Pública |
| Marketplace de peças | E-commerce | Parceria |

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
