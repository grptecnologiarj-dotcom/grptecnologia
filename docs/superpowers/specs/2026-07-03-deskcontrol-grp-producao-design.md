# DeskControl × GRP Tecnologia — Spec de Produção

**Data:** 2026-07-03  
**Responsável:** GRP Tecnologia  
**Objetivo:** Levar o DeskControl de demo-mode para produção real, customizado para uso interno da GRP Tecnologia, mantendo arquitetura SaaS reutilizável.

---

## Contexto

O DeskControl já possui 35+ rotas em Next.js 16 App Router com modo demo completo (`isSupabaseConfigured()` + `src/lib/demo-data.ts`). O sistema cobre OS, clientes, equipamentos, estoque, financeiro, agenda, orçamentos, contratos, garantias, WhatsApp, notificações, ranking e relatórios.

A GRP Tecnologia opera com ~2 técnicos + parceiros, atende 40-80 OS/mês, com modelo híbrido (presencial, coleta/entrega, visitas agendadas, suporte remoto, contratos mensais). Equipamentos atendidos: Notebooks, Desktops, Servidores, Redes, Impressoras, CFTV, Infraestrutura TI.

**Timeline:** Go-live em 1-2 semanas.  
**Visão:** O DeskControl se torna o produto principal da GRP — validado internamente, depois comercializado para outras assistências técnicas.

---

## Abordagem Escolhida: "GRP First, SaaS depois"

Conectar Supabase com schema preparado para multi-tenant (`company_id` em todas as tabelas), mas sem implementar toda a lógica SaaS agora. GRP é a empresa 1. Faturamento e self-service de clientes vêm na Fase 3+.

---

## Fase 1 — Go-live (Semana 1)

### 1.1 Supabase — Schema Principal

**Tabelas a criar (migrations sequenciais):**

```sql
companies          -- company_id base (GRP = '1')
users              -- auth.users estendido com role, company_id
clientes           -- company_id, nome, cpf_cnpj, email, whatsapp, endereco
equipamentos       -- company_id, cliente_id, tipo, marca, modelo, serial, senha
estoque_itens      -- company_id, nome, categoria, quantidade, preco_custo, preco_venda
ordens_servico     -- company_id, numero, cliente_id, equipamento_id, tecnico_id, status, prioridade, tipo_atendimento, descricao_problema, diagnostico, data_entrada, data_previsao, data_conclusao, valor_servico, valor_pecas, valor_total, token_acompanhamento
os_itens           -- os_id, tipo (servico/peca), descricao, quantidade, valor_unitario
os_timeline        -- os_id, user_id, acao, de_status, para_status, observacao, created_at
os_fotos           -- os_id, url, tipo (entrada/durante/saida), legenda, created_at
orcamentos         -- company_id, cliente_id, os_id, status, validade, itens (jsonb), total
financeiro         -- company_id, tipo (receita/despesa), categoria, valor, os_id, data, descricao, metodo_pagamento
agenda_eventos     -- company_id, titulo, tipo, tecnico_id, cliente_id, os_id, data_inicio, data_fim, local, status, checklist (jsonb), notas
contratos          -- company_id, cliente_id, numero, tipo, valor_mensal, dia_vencimento, vigencia_inicio, vigencia_fim, equipamentos (jsonb), sla_horas, status
garantias          -- company_id, os_id, cliente_id, tipo, prazo_meses, data_inicio, data_fim, condicoes, status
notificacoes       -- company_id, user_id, tipo, titulo, mensagem, lida, referencia_id, referencia_tipo, created_at
```

**RLS:** Todas as tabelas com policy `company_id = auth.jwt()->>'company_id'` — multi-tenant seguro sem lógica extra no app.

**Storage:** Bucket `os-fotos` com policy de upload autenticado por company.

### 1.2 Auth

- Supabase Auth com email/senha
- Metadados JWT: `{ company_id, role: "admin" | "tecnico" }` 
- Middleware Next.js valida sessão via `@supabase/ssr`
- Sem magic link por ora (simplifica o go-live)

### 1.3 Data Layer

**Padrão:**
- Server Components: Supabase server client (`createServerClient`) via `src/lib/supabase/server.ts`
- Client Components: `createBrowserClient` via `src/lib/supabase/client.ts`
- Manter `isSupabaseConfigured()` como guard — quando env vars presentes, usa Supabase; quando ausentes, cai no demo-data (dev local sem .env)

**Ordem de migração do demo → real:**
1. Clientes (mais simples, base de tudo)
2. Equipamentos
3. Ordens de Serviço + timeline + itens
4. Estoque
5. Financeiro
6. Agenda
7. Orçamentos
8. Contratos + Garantias
9. Notificações

### 1.4 Categorias de Equipamento GRP

Substituir categorias genéricas pelas da GRP:

```ts
export const CATEGORIAS_EQUIPAMENTO = [
  "Notebook",
  "Desktop / All-in-One", 
  "Servidor",
  "Rede (Switch / Roteador / AP)",
  "Impressora / Multifuncional",
  "CFTV (Câmera / DVR / NVR)",
  "Infraestrutura TI",
  "Outros",
] as const;
```

### 1.5 Tipos de Atendimento

Campo `tipo_atendimento` na OS:

```ts
export const TIPOS_ATENDIMENTO = [
  "Bancada (cliente trouxe)",
  "Coleta e Entrega",
  "Visita Técnica",
  "Suporte Remoto",
  "Contrato de Manutenção",
] as const;
```

### 1.6 Branding

- Sidebar: manter "Desk**Control**" + "Desenvolvido por GRP Tecnologia" no footer (já existe)
- Portal `/acompanhar/[token]`: logo GRP no header, cores brand
- Config da empresa: nome "GRP Tecnologia", CNPJ, endereço, WhatsApp no `/configuracoes`
- Não renomear o produto — DeskControl é o produto SaaS; GRP é a operadora

### 1.7 Deploy

- Vercel (projeto novo ou deploy do repo existente)
- Domínio: `app.deskcontrol.com.br` (ou `erp.grptecnologia.com.br` se preferir domínio próprio)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Fase 2 — Diferencial GRP (Semana 2+)

### 2.1 Checklist Técnico por Tipo de Equipamento

Template de checklist diferente por categoria. Exemplos:

**Notebook:**
- [ ] Verificar temperatura e ventilação
- [ ] Testar bateria (capacidade e carga)
- [ ] Verificar teclado e touchpad
- [ ] Testar portas USB, HDMI, áudio
- [ ] Verificar tela (dead pixels, retroiluminação)
- [ ] Executar diagnóstico HDD/SSD (CrystalDiskInfo)
- [ ] Limpar cooler e aplicar pasta térmica

**CFTV:**
- [ ] Verificar conexão das câmeras no DVR/NVR
- [ ] Testar gravação em todas as câmeras
- [ ] Verificar qualidade de imagem (foco, IR noturno)
- [ ] Checar capacidade do HD de gravação
- [ ] Testar acesso remoto (app mobile)
- [ ] Verificar cabeamento e conectores

Checklists ficam em tabela `checklist_templates` com `category` + `items (jsonb)`, editáveis via `/configuracoes`.

### 2.2 Fotos de OS

- Upload no Supabase Storage (`os-fotos/[os_id]/[tipo]/`)
- 3 momentos: `entrada`, `diagnostico`, `saida`
- Compressão client-side antes do upload (max 1MB por foto)
- Galeria na página `/os/[id]` (grid, lightbox)
- Relatório de entrega com fotos gerado em PDF

### 2.3 WhatsApp Real

- Integração via Evolution API (já tem módulo demo)
- Templates automáticos: OS criada, status mudou, orçamento aprovado, OS pronta, avaliação
- Número WhatsApp da GRP configurado via `/configuracoes`
- Log de mensagens enviadas na timeline da OS

### 2.4 Suporte Remoto

- Campo `link_acesso_remoto` na OS (AnyDesk/TeamViewer ID)
- Tipo de atendimento "Suporte Remoto" com campo de duração
- Relatório de horas de suporte remoto no financeiro

### 2.5 Contratos Recorrentes

- Geração automática de OS de manutenção preventiva mensal por contrato
- Alert quando contrato vence em 30 dias
- Histórico de atendimentos por contrato

### 2.6 Assinatura Digital

- Na entrega da OS, gerar link de assinatura
- Cliente assina via portal `/acompanhar/[token]` (canvas touch/mouse)
- Assinatura salva em Storage, vinculada à OS
- Incluída no print da OS

---

## Fase 3 — SaaS Multi-tenant (futuro)

- Self-service de cadastro (nova empresa cria conta, fica com trial)
- Planos de assinatura (Starter / Pro / Enterprise)
- Supabase RLS já preparado — só adicionar billing logic
- White-label: logo e cores personalizáveis por empresa
- App mobile (PWA progressiva)

---

## Decisões de Arquitetura

| Decisão | Escolha | Motivo |
|---|---|---|
| ORM | Supabase SDK direto (sem Prisma) | Simplicidade, RLS automático |
| Auth | Supabase Auth | Integrado, sem config extra |
| Storage | Supabase Storage | Mesma conta, RLS consistente |
| Deploy | Vercel | Já conhecem, CI/CD automático |
| Multi-tenant agora? | Não (company_id no schema, lógica depois) | Go-live rápido |
| WhatsApp real agora? | Não (Fase 2) | Foco no core |
| Checklist Fase 1? | Não (Fase 2) | Demo cobre o basic |

---

## Critérios de Sucesso — Fase 1

- [ ] Login real funcionando (Supabase Auth)
- [ ] Criar e atualizar OS no banco real
- [ ] Portal do cliente carregando OS real pelo token
- [ ] Sistema no ar no Vercel com domínio configurado
- [ ] Equipe GRP consegue usar no dia a dia sem bugs críticos

---

## Pendências Externas (executar pelo Gabriel)

1. Criar projeto Supabase (conta GRP ou pessoal)
2. Rodar migrations SQL no Supabase
3. Criar usuário admin da GRP no Supabase Auth
4. Configurar env vars no Vercel
5. Apontar domínio (se usar domínio próprio)
