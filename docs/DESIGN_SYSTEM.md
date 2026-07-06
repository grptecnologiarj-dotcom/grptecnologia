# DESIGN SYSTEM — DeskControl

> Guia completo de componentes, tokens e padrões visuais. Toda tela do sistema usa este guia.

---

## 1. TOKENS DE DESIGN

### Paleta de Cores

#### Cor Primária (Brand)
```css
--color-primary-50:  #EFF6FF;
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;  /* principal */
--color-primary-600: #2563EB;  /* hover */
--color-primary-700: #1D4ED8;  /* active */
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;
```

#### Neutros
```css
--color-gray-50:  #F8FAFC;
--color-gray-100: #F1F5F9;
--color-gray-200: #E2E8F0;
--color-gray-300: #CBD5E1;
--color-gray-400: #94A3B8;
--color-gray-500: #64748B;
--color-gray-600: #475569;
--color-gray-700: #334155;
--color-gray-800: #1E293B;
--color-gray-900: #0F172A;
```

#### Semânticas
```css
--color-success-50:  #F0FDF4;
--color-success-500: #22C55E;
--color-success-700: #15803D;

--color-warning-50:  #FFFBEB;
--color-warning-500: #F59E0B;
--color-warning-700: #B45309;

--color-danger-50:  #FFF1F2;
--color-danger-500: #EF4444;
--color-danger-700: #B91C1C;

--color-info-50:  #EFF6FF;
--color-info-500: #3B82F6;
--color-info-700: #1D4ED8;
```

#### Variáveis de tema (light/dark)
```css
:root {
  --bg-base:      var(--color-gray-50);
  --bg-surface:   #FFFFFF;
  --bg-elevated:  #FFFFFF;
  --bg-muted:     var(--color-gray-100);

  --text-primary:  var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --text-muted:    var(--color-gray-400);
  --text-inverse:  #FFFFFF;

  --border-default: var(--color-gray-200);
  --border-focus:   var(--color-primary-500);
  --border-error:   var(--color-danger-500);
}

.dark {
  --bg-base:      #0F172A;
  --bg-surface:   #1E293B;
  --bg-elevated:  #334155;
  --bg-muted:     #1E293B;

  --text-primary:  #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted:    #64748B;
  --text-inverse:  #0F172A;

  --border-default: #334155;
  --border-focus:   #60A5FA;
  --border-error:   #F87171;
}
```

---

### Tipografia

**Fonte principal:** Inter (Google Fonts)
**Fonte mono:** JetBrains Mono (para números de OS, códigos)

```css
/* Escala tipográfica */
--text-xs:   0.75rem;   /* 12px — labels, badges */
--text-sm:   0.875rem;  /* 14px — body padrão, inputs */
--text-base: 1rem;      /* 16px — conteúdo principal */
--text-lg:   1.125rem;  /* 18px — headings de seção */
--text-xl:   1.25rem;   /* 20px — títulos de página */
--text-2xl:  1.5rem;    /* 24px — títulos de modal */
--text-3xl:  1.875rem;  /* 30px — dashboard KPIs */

/* Pesos */
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;

/* Line height */
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

### Espaçamento

**Base:** 4px (0.25rem)

```css
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

### Border Radius

```css
--radius-sm:   0.25rem;  /* 4px  — inputs, chips */
--radius-md:   0.5rem;   /* 8px  — cards, dropdowns */
--radius-lg:   0.75rem;  /* 12px — modais */
--radius-xl:   1rem;     /* 16px — cards grandes */
--radius-full: 9999px;   /* badges, avatars */
```

---

### Sombras

```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.07);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.08);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 2. COMPONENTES

### Button

```tsx
// Variantes
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

// primary — ação principal da tela
<Button variant="primary">Nova OS</Button>

// secondary — ação secundária
<Button variant="secondary">Filtrar</Button>

// ghost — ação terciária ou em contextos densos
<Button variant="ghost">Exportar</Button>

// danger — ação destrutiva
<Button variant="danger">Cancelar OS</Button>

// outline — alternativa ao secondary
<Button variant="outline">Imprimir</Button>
```

**Especificações:**
```
size sm:  h-8  px-3 text-sm gap-1.5 (ações em tabela)
size md:  h-10 px-4 text-sm gap-2   (padrão)
size lg:  h-11 px-5 text-base gap-2 (CTAs principais)

Estados:
- default: bg-primary-600 text-white
- hover:   bg-primary-700 (transição 150ms)
- active:  bg-primary-800 scale-[0.98]
- loading: opacity-80, cursor-wait, spinner interno
- disabled: opacity-50, cursor-not-allowed
```

---

### Input

```tsx
<FormField>
  <Label htmlFor="cliente">Nome do cliente *</Label>
  <Input
    id="cliente"
    placeholder="Ex: João Silva"
    error="Nome é obrigatório"
  />
  <FieldError>Nome é obrigatório</FieldError>
</FormField>
```

**Especificações:**
```
height: 40px (h-10)
padding: 12px horizontal
border: 1px solid var(--border-default)
border-radius: var(--radius-sm)
font-size: 14px (0.875rem)

Estados:
- default: border-gray-200
- focus:   border-primary-500, ring-2 ring-primary-100
- error:   border-danger-500, ring-2 ring-danger-100
- disabled: bg-gray-50, cursor-not-allowed
```

---

### Badge / Status

Badges comunicam estado — sempre ícone + cor + texto.

```tsx
// Status de OS
<StatusBadge status="em_reparo" />
// Renderiza: ● Em reparo (roxo)

// Prioridade
<PriorityBadge priority="urgente" />
// Renderiza: ● Urgente (vermelho, pulsante)

// Badges genéricos
<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Trial</Badge>
<Badge variant="danger">Suspenso</Badge>
<Badge variant="gray">Inativo</Badge>
```

**Especificações:**
```
height: 20px
padding: 2px 8px
border-radius: var(--radius-full)
font-size: 12px font-medium
```

---

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Subtítulo opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* conteúdo */}
  </CardContent>
  <CardFooter>
    {/* ações */}
  </CardFooter>
</Card>
```

**Especificações:**
```
background: var(--bg-surface)
border: 1px solid var(--border-default)
border-radius: var(--radius-md)
shadow: var(--shadow-sm)
padding: 24px (padrão), 16px (compacto)
```

---

### DataTable

Componente central do sistema — usado em OS, Clientes, Financeiro.

```tsx
<DataTable
  columns={columns}
  data={data}
  loading={isLoading}
  pagination={{ page, pageSize, total }}
  filters={<OSFilters />}
  actions={<Button>Nova OS</Button>}
  emptyState={{
    icon: <FileText />,
    title: "Nenhuma OS encontrada",
    description: "Tente ajustar os filtros ou crie uma nova OS.",
    action: <Button>Nova OS</Button>
  }}
/>
```

**Funcionalidades obrigatórias:**
- Colunas clicáveis para ordenação (asc/desc com ícone)
- Skeleton de carregamento (não spinner)
- Estado vazio com ilustração e ação
- Paginação cursor-based (não offset)
- Seleção de linhas com checkbox (para ações em lote)
- Sticky header ao rolar
- Responsive: vira cards em mobile

---

### Modal

```tsx
<Modal open={isOpen} onClose={close} size="md">
  <ModalHeader>
    <ModalTitle>Cancelar OS</ModalTitle>
  </ModalHeader>
  <ModalContent>
    <p>Tem certeza que deseja cancelar esta OS?</p>
    <Textarea label="Motivo do cancelamento *" />
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost" onClick={close}>Voltar</Button>
    <Button variant="danger" loading={isSaving}>Cancelar OS</Button>
  </ModalFooter>
</Modal>
```

**Especificações:**
```
sizes:
  sm:  max-w-sm  (confirmações simples)
  md:  max-w-lg  (formulários simples)
  lg:  max-w-2xl (formulários complexos)
  xl:  max-w-4xl (visualizadores, previews)
  full: fullscreen (mobile, formulários muito grandes)

backdrop: bg-black/50 blur-sm
animation: scale(0.95) → scale(1) + fade (150ms ease-out)
border-radius: var(--radius-lg)
shadow: var(--shadow-xl)
```

---

### Toast

```tsx
import { toast } from '@/lib/toast'

toast.success('OS criada com sucesso')
toast.error('Erro ao salvar. Verifique os campos.')
toast.warning('Estoque abaixo do mínimo para este produto.')
toast.info('Orçamento enviado por WhatsApp.')
```

**Especificações:**
```
position: bottom-right
width: 360px
border-radius: var(--radius-md)
shadow: var(--shadow-lg)
animation: slide-up + fade (200ms)
auto-dismiss: success/info 4s, warning 6s, error nunca
max visible: 3 (queue)
```

---

### Timeline (OS Events)

```tsx
<Timeline>
  {eventos.map(evento => (
    <TimelineEvent
      key={evento.id}
      tipo={evento.tipo}
      descricao={evento.descricao}
      usuario={evento.usuario}
      createdAt={evento.created_at}
      metadata={evento.metadata}
    />
  ))}
</Timeline>
```

**Visual:**
```
Linha vertical à esquerda
Círculo colorido por tipo de evento
Avatar do usuário
Texto da ação
Data/hora relativa (hover: data completa)
Eventos de sistema: fundo levemente diferente
```

---

### Sidebar

```
┌──────────────────┐
│  ◈ DeskControl   │  ← logo + nome (colapsável: só ◈)
├──────────────────┤
│  🏠 Dashboard    │
├──────────────────┤
│  OPERAÇÃO        │  ← section header (texto/linha)
│  📋 Ordens (12)  │  ← badge com contagem de OS abertas
│  📅 Agenda       │
│  💰 Orçamentos   │
├──────────────────┤
│  CADASTROS       │
│  👥 Clientes     │
│  💻 Equipamentos │
│  📦 Estoque      │
├──────────────────┤
│  ...             │
├──────────────────┤
│  ─────────────── │
│  [avatar] João   │  ← nome + role
│  ⚙ Configurações │
└──────────────────┘
```

**Especificações:**
```
width expandida:  240px
width colapsada:  64px
transition: 200ms ease

item height: 40px
item padding: 8px 12px
item border-radius: 8px (dentro da sidebar)
item active: bg-primary-50 text-primary-700 font-medium
item hover: bg-gray-100
```

---

### KPI Card (Dashboard)

```tsx
<KPICard
  title="OS Abertas"
  value={42}
  change={+8}          // vs. período anterior
  changeLabel="vs mês passado"
  icon={<FileText />}
  color="blue"
  link="/os?status=aberta"
/>
```

**Visual:**
```
Card com borda sutil
Ícone colorido no canto superior direito
Valor grande (text-3xl font-bold)
Label abaixo (text-sm text-muted)
Variação percentual (verde se positivo, vermelho se negativo)
Clicável → filtra a lista correspondente
```

---

### SearchCommand (Busca Global)

Abre com `Ctrl + K`. Inspirado no command palette do VSCode/Linear.

```
┌─────────────────────────────────────┐
│ 🔍 Buscar clientes, OS, equipamentos│
├─────────────────────────────────────┤
│ RECENTES                             │
│ 📋 OS-2024-00123 — João Silva        │
│ 👤 Maria Santos                      │
├─────────────────────────────────────┤
│ AÇÕES RÁPIDAS                        │
│ + Nova OS                            │
│ + Novo cliente                       │
└─────────────────────────────────────┘
```

---

## 3. PADRÕES DE PÁGINA

### Layout padrão (app)

```
┌─────────────────────────────────────────────┐
│ SIDEBAR (240px) │ CONTEÚDO                  │
│                 │ ┌───────────────────────┐ │
│                 │ │ PAGE HEADER           │ │
│                 │ │ título + breadcrumb   │ │
│                 │ │ ação primária         │ │
│                 │ ├───────────────────────┤ │
│                 │ │ FILTROS (quando houver│ │
│                 │ ├───────────────────────┤ │
│                 │ │ CONTEÚDO PRINCIPAL    │ │
│                 │ │ tabela / cards / form │ │
│                 │ └───────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Page Header padrão

```tsx
<PageHeader
  title="Ordens de Serviço"
  description="Gerencie todas as OS da empresa"
  breadcrumb={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Ordens de Serviço' }
  ]}
  actions={
    <Button variant="primary" asChild>
      <Link href="/os/nova">
        <Plus className="w-4 h-4" />
        Nova OS
      </Link>
    </Button>
  }
/>
```

---

## 4. ÍCONES

**Biblioteca:** Lucide React (consistente, open source, treeshakeable)

**Tamanhos padrão:**
```
sidebar:    w-5 h-5 (20px)
botões:     w-4 h-4 (16px)
headlines:  w-6 h-6 (24px)
KPI cards:  w-8 h-8 (32px)
empty state: w-12 h-12 (48px)
```

**Ícones reservados por módulo:**
```
Dashboard:        LayoutDashboard
Ordens de Serviço: ClipboardList
Clientes:         Users
Equipamentos:     Laptop
Agenda:           Calendar
Orçamentos:       FileText
Financeiro:       DollarSign
Caixa:            Landmark
Estoque:          Package
Garantias:        Shield
Contratos:        ScrollText
WhatsApp:         MessageCircle
Relatórios:       BarChart2
Configurações:    Settings
Usuários:         UserCog
```

---

## 5. IMPRESSÃO

Toda OS deve poder ser impressa em:
- **A4** — laudo completo com logo, dados, timeline, assinatura
- **Papel 80mm** (impressora térmica) — versão compacta com QR Code
- **Etiqueta 58mm** — número da OS + QR Code + nome do cliente

Implementação via CSS `@media print` e componentes separados que só renderizam ao imprimir.

---

## 6. CONVENÇÕES DE IMPLEMENTAÇÃO

### Classes Tailwind — order obrigatória
```
Layout → Display → Position → Size → Spacing → Typography → Colors → Borders → Effects
```

### Naming de componentes
- Componentes de UI base: `Button`, `Input`, `Card` (shadcn base)
- Componentes de domínio: `OSCard`, `ClienteForm`, `FinanceiroKPI`
- Componentes de layout: `PageHeader`, `Sidebar`, `DataTable`
- Prefixo `use` para hooks: `useOS`, `useClientes`, `useAuth`

### Arquivos de estilo
- Estilos globais: apenas em `globals.css` (tokens de design)
- Estilos de componente: Tailwind inline
- Nunca CSS Modules
- Nunca `style={}` inline (exceto valores dinâmicos como cor de técnico na agenda)

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
