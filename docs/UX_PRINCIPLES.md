# UX PRINCIPLES — DeskControl

> Regras invioláveis de experiência do usuário. Todo componente, toda tela, toda interação segue esses princípios.

---

## 1. LEI FUNDAMENTAL

**O usuário nunca pode ficar perdido, frustrado ou esperando.**

Se algo demora, ele sabe que está carregando.
Se algo deu errado, ele sabe o que deu errado e o que fazer.
Se ele precisa de 3 cliques para fazer algo que faz 50 vezes por dia, repensamos o design.

---

## 2. OS 10 MANDAMENTOS DO DESKCONTROL UX

### I — ZERO AMBIGUIDADE
Cada botão tem um propósito óbvio. Cada rótulo descreve o que faz. Sem ícones sem texto em ações importantes. Sem labels genéricos ("Salvar", "OK", "Confirmar" — prefira "Criar OS", "Enviar orçamento", "Fechar caixa").

### II — BREADCRUMB SEMPRE VISÍVEL
O usuário sempre sabe onde está dentro do sistema.
```
Dashboard > Ordens de Serviço > OS-2024-00123 > Editar
```
Em dispositivos móveis: apenas o nível atual + ícone de voltar.

### III — FEEDBACK IMEDIATO
Toda ação do usuário gera uma resposta visual em menos de 100ms:
- Botão: estado de loading ao clicar
- Formulário: validação em tempo real (não só ao submeter)
- Ação concluída: toast de sucesso no canto inferior direito
- Ação com erro: mensagem clara do que deu errado, sem jargão técnico

### IV — POUCOS CLIQUES
- Abrir nova OS: máximo 2 cliques a partir de qualquer tela
- Buscar cliente: 1 campo, resultado em tempo real
- Mudar status de OS: 1 clique no status atual → dropdown
- Enviar WhatsApp: 1 clique no ícone na OS → seleciona template → envia

**Regra:** Se o usuário faz algo mais de 3 vezes por dia, deve ter um atalho.

### V — DESTRUTIVO SEMPRE PEDE CONFIRMAÇÃO
- Deletar cliente: "Tem certeza? Esta ação não pode ser desfeita."
- Cancelar OS: modal com motivo obrigatório
- Fechar caixa: resumo do dia + confirmação
- **Regra:** Modal de confirmação, nunca confirm() do browser nativo

### VI — ESTADO VAZIO É UMA OPORTUNIDADE
Quando uma lista está vazia, não mostrar apenas "Nenhum resultado".
Mostrar:
- Ilustração relacionada ao contexto
- Título explicativo ("Nenhuma OS aberta hoje")
- Ação primária ("Criar primeira OS")
- Ajuda contextual opcional

### VII — MOBILE FIRST NA PRÁTICA
- Técnico usa no celular na bancada ou em campo — a interface não pode exigir precisão de mouse
- Botões: mínimo 44x44px de área de toque
- Campos de formulário: font-size 16px mínimo (evita zoom no iOS)
- Ações importantes na parte inferior da tela (polegar alcança)
- Swipe para ações comuns (swipe left na OS → mudar status)

### VIII — DENSIDADE DE INFORMAÇÃO ADAPTÁVEL
- **Modo Compacto (padrão desktop):** tabelas densas, muita informação por linha
- **Modo Card (padrão mobile):** cards com as informações mais importantes
- O usuário pode alternar — preferência salva por conta

### IX — VELOCIDADE PERCEBIDA
- Skeleton loaders em vez de spinners para listas
- Optimistic updates: a UI atualiza antes da confirmação do servidor
- Prefetch das páginas mais usadas (hover no link já inicia fetch)
- Cache agressivo: navegar entre telas é instantâneo

### X — ACESSIBILIDADE É OBRIGATÓRIA, NÃO OPCIONAL
- Todo input tem label associado (não apenas placeholder)
- Contraste mínimo WCAG AA (4.5:1 para texto normal)
- Navegação por teclado funcional em 100% das telas
- Focus ring visível em modo de teclado
- Screen reader: aria-labels em ícones, roles semânticos corretos
- Não dependemos de cor apenas para transmitir informação (badges: ícone + cor + texto)

---

## 3. HIERARQUIA DE AÇÕES

### Ações primárias (uma por tela)
- Destaque máximo
- Cor primária do sistema
- Posição: canto superior direito da seção ou área de destaque
- Exemplos: "Nova OS", "Criar cliente", "Enviar orçamento"

### Ações secundárias
- Visual menos chamativo (outline ou ghost)
- Agrupadas com a ação primária
- Exemplos: "Filtrar", "Exportar", "Imprimir"

### Ações destrutivas
- Cor vermelha
- Nunca é a ação primária — sempre secundária ou em dropdown
- Sempre pede confirmação
- Exemplos: "Cancelar OS", "Excluir cliente"

### Ações de navegação
- Não são botões — são links ou tabs
- Não têm estados de loading

---

## 4. PADRÕES DE FORMULÁRIO

### Abertura de OS (tela mais usada do sistema)

**Princípios:**
- Seções progressivas: começa com o mínimo necessário, campos avançados em acordeão
- Auto-save: rascunho salvo a cada 30s (não se perde ao fechar)
- Busca de cliente inline: ao digitar o nome, mostra sugestões sem sair da tela
- Equipamento: após selecionar cliente, sugere equipamentos já cadastrados
- Validação em tempo real: campo de CPF já valida enquanto digita

**Campos obrigatórios:** sempre marcados com `*`, nunca apenas por cor
**Campos opcionais:** label `(opcional)` — não `*`

### Regras gerais de form
- Labels sempre acima do campo (não inline — desaparece ao digitar)
- Placeholder é exemplo, não label: `Ex: "Tela não liga, testei carregador"` — não `"Descrição do problema"`
- Mensagens de erro: abaixo do campo, vermelho, texto claro — não `"Campo inválido"`
- Submit: sempre no final do formulário, nunca no topo
- Cancel: sempre ao lado do submit, nunca mais chamativo

---

## 5. PADRÕES DE NAVEGAÇÃO

### Sidebar
- Fixa no desktop, colapsável com atalho `Ctrl + B`
- Ícone + texto quando expandida, apenas ícone quando colapsada
- Item ativo: destaque visual claro (fundo colorido + texto em negrito)
- Agrupamento por contexto (não por ordem alfabética)
- Favoritos: usuário pode fixar módulos mais usados no topo

### Estrutura da sidebar
```
━━━━━━━━━━━━━━━━━━
  DeskControl [logo]
━━━━━━━━━━━━━━━━━━
  Dashboard
━━━━━━━━━━━━━━━━━━
  OPERAÇÃO
  Ordens de Serviço   ← ícone de badge com OS abertas
  Agenda
  Orçamentos
━━━━━━━━━━━━━━━━━━
  CADASTROS
  Clientes
  Equipamentos
  Produtos/Estoque
━━━━━━━━━━━━━━━━━━
  FINANCEIRO
  Caixa
  Contas a Receber
  Contas a Pagar
  Relatórios
━━━━━━━━━━━━━━━━━━
  GESTÃO
  Contratos
  Garantias
  WhatsApp
━━━━━━━━━━━━━━━━━━
  [avatar do usuário]
  Configurações
  Sair
━━━━━━━━━━━━━━━━━━
```

### Header (barra superior)
- Busca global (`Ctrl + K`)
- Notificações (sino com badge)
- Avatar do usuário com dropdown (perfil, tema, sair)
- Nenhuma ação de negócio no header — só navegação e contexto

---

## 6. ESTADOS VISUAIS

### Estados de OS (cores obrigatórias)
```
aberta              → Azul claro      #DBEAFE / blue-100
em_diagnostico      → Amarelo         #FEF9C3 / yellow-100
aguardando_aprovacao→ Laranja         #FFEDD5 / orange-100
aprovada            → Verde claro     #DCFCE7 / green-100
em_reparo           → Roxo            #EDE9FE / purple-100
aguardando_pecas    → Vermelho claro  #FEE2E2 / red-100
aguardando_cliente  → Cinza           #F3F4F6 / gray-100
em_transito         → Ciano           #CFFAFE / cyan-100
pronto              → Verde           #166534 (texto) / green-800
entregue            → Cinza escuro    #374151 / gray-700
em_garantia         → Índigo          #E0E7FF / indigo-100
cancelada           → Vermelho        #EF4444 / red-500
```

### Prioridade (cores obrigatórias)
```
baixa    → Cinza    ○
media    → Azul     ●
alta     → Laranja  ●
urgente  → Vermelho ● (pulsante)
```

### Estados de carregamento
- Lista/tabela: skeleton com animação pulse
- Dados de detalhe: skeleton da estrutura completa
- Botão em loading: spinner interno + desabilitado + cursor-wait
- Página inteira: nunca — sempre loading parcial

---

## 7. FEEDBACK E NOTIFICAÇÕES

### Toast (feedback de ação)
- Posição: canto inferior direito
- Sucesso: verde, ícone de check, auto-dismiss em 4s
- Erro: vermelho, ícone de X, não auto-dismiss (usuário precisa ler)
- Info: azul, auto-dismiss em 5s
- Warning: amarelo, auto-dismiss em 6s
- Máximo 3 toasts visíveis simultaneamente (fila)

### Notificações in-app
- Sino no header com badge de contagem
- Painel lateral ao clicar (não modal — não bloqueia trabalho)
- Categorias: OS, Financeiro, Sistema
- Marcar como lida ao clicar ou "marcar todas como lidas"
- Link direto para o item relacionado

---

## 8. DARK MODE

O Dark Mode é cidadão de primeira classe — não um afterthought.

**Implementação:**
- Via variáveis CSS (não classes `dark:`)
- Preferência salva no banco (sincroniza entre dispositivos)
- Fallback: `prefers-color-scheme` do sistema operacional
- Troca sem reload

**Paleta dark:**
- Background: `#0F172A` (slate-900)
- Surface: `#1E293B` (slate-800)
- Border: `#334155` (slate-700)
- Text primary: `#F8FAFC` (slate-50)
- Text muted: `#94A3B8` (slate-400)

**Regra:** Todo componente precisa ser testado nos dois modos antes de ser considerado pronto.

---

## 9. RESPONSIVIDADE

### Breakpoints
```
sm: 640px   → Mobile landscape, tablet pequeno
md: 768px   → Tablet
lg: 1024px  → Notebook
xl: 1280px  → Desktop
2xl: 1536px → Desktop grande
```

### Comportamento por breakpoint

| Elemento | Mobile (< 768px) | Tablet (768-1024px) | Desktop (> 1024px) |
|---|---|---|---|
| Sidebar | Bottom tab bar | Sidebar colapsada | Sidebar expandida |
| Tabelas | Cards empilhados | Tabela com menos colunas | Tabela completa |
| Formulários | Full width, seções acordeão | Two-column | Two-column |
| Dashboard | Single column | Two-column | Three/Four column |
| Modais | Full screen | 80% da tela | 600px fixo |

---

## 10. ANIMAÇÕES

Animações devem ser funcionais, não decorativas.

**Regras:**
- Duração: 150–300ms. Nunca mais que 500ms.
- Easing: `ease-out` para entradas, `ease-in` para saídas
- Reduzir movimento: respeitar `prefers-reduced-motion` — sem animações se ativo
- Transição de página: fade sutil (150ms) — não slide dramático

**O que animar:**
- ✅ Abertura de modal (scale + fade)
- ✅ Dropdown (slide down + fade)
- ✅ Toast aparecendo (slide + fade)
- ✅ Mudança de status (cor transita suavemente)
- ✅ Loading skeleton (pulse)

**O que NÃO animar:**
- ❌ Transições de página elaboradas
- ❌ Hover em toda a sidebar
- ❌ Tabelas se reorganizando
- ❌ Qualquer coisa que distraia do trabalho

---

## 11. ATALHOS DE TECLADO

Usuários avançados usam o teclado para ser mais rápidos.

| Atalho | Ação |
|---|---|
| `Ctrl + K` | Abrir busca global |
| `Ctrl + N` | Nova OS (em qualquer tela) |
| `Ctrl + B` | Toggle sidebar |
| `Escape` | Fechar modal/dropdown |
| `Enter` | Confirmar ação primária do modal |
| `?` | Mostrar lista de atalhos |
| `G + D` | Ir para Dashboard |
| `G + O` | Ir para Ordens de Serviço |
| `G + C` | Ir para Clientes |
| `G + F` | Ir para Financeiro |

---

## 12. PRINCÍPIOS DE ESCRITA (MICROCOPY)

**Tom de voz:** Profissional mas humano. Como um colega experiente, não como um manual.

**Regras:**
- Erros: explique o que deu errado e o que fazer. Nunca "Erro 500".
- Confirmações: active voice. "OS criada com sucesso" não "Sua OS foi criada com sucesso".
- Botões: verbo + substantivo. "Criar OS" não "OK".
- Estados vazios: positivo e útil. "Nenhuma OS hoje. Que tal registrar a primeira?" 
- Datas: sempre no formato brasileiro. "15 de jan. de 2024" não "01/15/2024".
- Valores: sempre formatados. "R$ 1.250,00" não "1250".

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
