# ROADMAP — DeskControl

> Do MVP comercial ao ERP completo. Cada fase entrega valor real ao cliente.

---

## PRINCÍPIO DO ROADMAP

**Ship early, ship often.** Cada fase é deployável e vendável.
Não esperamos ter tudo pronto para começar a vender.

---

## FASE 0 — FUNDAÇÃO (Status: Parcialmente concluída)

**Meta:** Base técnica sólida. Sem features de negócio.

### Concluído ✅
- [x] Projeto Next.js 16 configurado
- [x] Supabase conectado
- [x] Schema inicial (empresas, usuários, clientes, equipamentos, OS, financeiro)
- [x] Autenticação básica (login/registro)
- [x] RLS básico ativado
- [x] Estrutura de rotas (dashboard, clientes, OS, financeiro)

### Pendente desta fase ⚠️
- [ ] **CRÍTICO:** Corrigir schema — adicionar tabelas faltantes (os_eventos, os_fotos, os_checklists, etc.)
- [ ] Middleware de proteção de rotas
- [ ] Layout principal completo (sidebar, header, breadcrumb)
- [ ] Design system base (tokens, componentes ui/)
- [ ] Sistema de roles no JWT (custom claims)
- [ ] Fluxo de onboarding completo (registro → cria empresa → dashboard)

**Estimativa:** 1 semana

---

## FASE 1 — MVP COMERCIAL (Prioridade máxima)

**Meta:** Sistema vendável. Uma assistência técnica pode substituir o papel.

**Critério de saída:** Pelo menos 5 empresas usando em produção por 30 dias sem reclamação crítica.

### 1.1 Autenticação e Onboarding
- [ ] Registro de empresa completo (com criação automática via Edge Function)
- [ ] Onboarding guiado (3 passos: configurar empresa → convidar primeiro técnico → criar primeira OS)
- [ ] Convite de usuários por e-mail
- [ ] Perfil do usuário
- [ ] Recuperação de senha

### 1.2 Design System completo
- [ ] Componentes base: Button, Input, Select, Textarea, Card, Badge, Modal, Toast, DataTable
- [ ] Layout: Sidebar, PageHeader, Breadcrumb
- [ ] Estados: Loading (skeleton), Empty, Error
- [ ] Dark mode
- [ ] Responsivo

### 1.3 Ordens de Serviço (módulo principal)
- [ ] Listagem com filtros (status, técnico, prioridade, período)
- [ ] Kanban por status (drag-and-drop)
- [ ] Criação de OS em menos de 90 segundos
- [ ] Detalhe da OS completo:
  - [ ] Informações gerais + edição inline
  - [ ] Timeline de eventos imutável
  - [ ] Upload de fotos (entrada/reparo/saída) com hash
  - [ ] Checklist (templates + customização)
  - [ ] Itens de serviço e peças (orçamento inline)
  - [ ] Mudança de status com log automático
  - [ ] Campo de diagnóstico e solução
- [ ] Impressão da OS (A4)
- [ ] QR Code na OS

### 1.4 Clientes
- [ ] Listagem com busca full-text
- [ ] Cadastro/edição completo (PF e PJ)
- [ ] Auto-completar CEP
- [ ] Histórico de OS do cliente

### 1.5 Equipamentos
- [ ] Listagem e busca por número de série
- [ ] Cadastro/edição
- [ ] Histórico de OS do equipamento

### 1.6 Financeiro básico
- [ ] Registrar pagamento na OS
- [ ] Lista de transações do dia
- [ ] Resumo: total recebido hoje, esta semana, este mês

### 1.7 Dashboard
- [ ] KPIs: OS abertas, faturamento do mês, ticket médio
- [ ] OS por status (gráfico de pizza)
- [ ] OS atrasadas (lista)
- [ ] Últimas OS criadas

### 1.8 Usuários e permissões
- [ ] CRUD de usuários
- [ ] Atribuição de roles
- [ ] RBAC implementado em todos os módulos da Fase 1

### 1.9 Configurações básicas
- [ ] Dados da empresa (logo, nome, CNPJ)
- [ ] Prefixo e numeração de OS
- [ ] Texto de garantia padrão

**Estimativa:** 4–6 semanas

---

## FASE 2 — CRESCIMENTO

**Meta:** Sistema completo. Pode substituir qualquer concorrente atual.

**Critério de saída:** NPS acima de 8 com amostra de 20+ empresas.

### 2.1 Portal do Cliente
- [ ] Página pública `/acompanhar/{token}`
- [ ] Status em tempo real
- [ ] Fotos do equipamento
- [ ] Aprovação de orçamento online
- [ ] Link de pagamento
- [ ] Download do laudo

### 2.2 Orçamentos independentes
- [ ] Criação de orçamento sem OS
- [ ] PDF profissional com logo da empresa
- [ ] Envio por WhatsApp/e-mail
- [ ] Aprovação digital com link único
- [ ] Conversão de orçamento em OS

### 2.3 WhatsApp integrado
- [ ] Configuração de instância (QR Code)
- [ ] Templates de mensagem customizáveis
- [ ] Notificações automáticas (OS criada, pronto, orçamento)
- [ ] Envio manual da OS
- [ ] Histórico de mensagens na timeline

### 2.4 Estoque completo
- [ ] Cadastro de produtos/peças
- [ ] Entradas e saídas manuais
- [ ] Baixa automática ao fechar OS com peças
- [ ] Alertas de estoque mínimo
- [ ] Relatório de giro

### 2.5 Agenda
- [ ] Calendário semanal com técnicos como colunas
- [ ] Agendamento vinculado à OS
- [ ] Notificação de agendamento para técnico
- [ ] Vista mobile-friendly para técnico de campo

### 2.6 Financeiro completo
- [ ] Caixa (abertura, fechamento, sangria)
- [ ] Contas a receber (parcelamento, vencimento)
- [ ] Contas a pagar (despesas)
- [ ] Relatório mensal simplificado
- [ ] Múltiplas formas de pagamento

### 2.7 Contratos de manutenção
- [ ] Cadastro de contratos
- [ ] Geração automática de OS periódicas
- [ ] Cobrança recorrente

### 2.8 Garantias
- [ ] Geração automática ao entregar OS
- [ ] Portal de consulta de garantia
- [ ] Acionamento de garantia → nova OS vinculada

### 2.9 Relatórios
- [ ] Produtividade por técnico
- [ ] OS por período (quantidade, valor, status)
- [ ] Equipamentos mais reparados
- [ ] Financeiro mensal
- [ ] Export PDF e Excel

### 2.10 PWA para Técnicos
- [ ] Instalável no celular (Android e iOS)
- [ ] Funciona offline: ver OS do dia, adicionar fotos/checklist
- [ ] Sincronização ao reconectar
- [ ] Câmera nativa para fotos

**Estimativa:** 8–12 semanas

---

## FASE 3 — EXPANSÃO

**Meta:** Ecossistema. Difícil de abandonar.

### 3.1 IA de diagnóstico
- [ ] Base de conhecimento: técnicos registram soluções
- [ ] Sugestão automática: equipamento + sintoma → possíveis causas
- [ ] Tempo médio estimado por tipo de reparo

### 3.2 Assinatura digital com validade jurídica
- [ ] Integração com DocuSign / ClickSign
- [ ] Laudo assinado digitalmente válido legalmente

### 3.3 API pública
- [ ] Documentação Swagger/OpenAPI
- [ ] SDKs (Python, JS)
- [ ] Webhooks configuráveis pelo cliente

### 3.4 White-label
- [ ] Domínio próprio por empresa
- [ ] Logo e cores customizáveis
- [ ] E-mails com domínio do cliente

### 3.5 Multi-filial
- [ ] Empresa com múltiplas lojas
- [ ] Relatório consolidado
- [ ] OS pode ser transferida entre lojas

### 3.6 Marketplace de peças (pesquisa)
- [ ] Integração com distribuidores de peças
- [ ] Orçamento de peças diretamente na OS
- [ ] Pedido de compra integrado

**Estimativa:** 12–16 semanas (paralelo ao crescimento de clientes)

---

## FASE 4 — ECOSSISTEMA

**Meta:** Plataforma. Outros constroem sobre o DeskControl.

### 4.1 App nativo (React Native)
- [ ] iOS + Android
- [ ] Câmera nativa com anotações
- [ ] GPS integrado para field service
- [ ] Notificações push nativas

### 4.2 DeskControl Pay
- [ ] Gateway de pagamento próprio
- [ ] Split automático para técnicos
- [ ] Boleto, Pix, cartão

### 4.3 Certificação de técnicos
- [ ] Badge verificado pela GRP
- [ ] Marketplace de técnicos (futuro)

### 4.4 Franquias
- [ ] Rede de assistências sob uma marca
- [ ] Relatório consolidado da rede
- [ ] Benchmarks entre lojas

### 4.5 Internacionalização
- [ ] PT-BR → ES (Argentina, Chile, Colômbia)
- [ ] EN (EUA, Portugal)

**Estimativa:** 6–12 meses após Fase 3

---

## DECISÃO CRÍTICA ANTES DE COMEÇAR A FASE 1

### O schema atual precisa ser corrigido ANTES de qualquer feature

O `0001_initial_schema.sql` atual é um rascunho. Para a Fase 1 funcionar, precisamos de:

**Migration 0002 — Schema completo:**
- Adicionar roles faltantes (`gerente`, `super_admin`, `cliente`)
- Adicionar `os_eventos` (timeline imutável — não existe ainda)
- Adicionar `os_fotos`, `os_checklists`, `os_checklist_itens`, `os_assinaturas`
- Adicionar `configuracoes_empresa`
- Adicionar soft delete (`deleted_at`) em todas as tabelas
- Adicionar `fts` (full-text search) em clientes e equipamentos
- Refatorar RLS com a função robusta `auth.get_current_user_info()`
- Adicionar `audit_log`
- Corrigir `os_status` (adicionar os novos status)
- Adicionar `categorias_financeiras`, `contas_bancarias`, `caixas`

**Recomendação:** Criar uma Migration 0002 que altera o schema existente, ou reescrever completamente o Migration 0001 e fazer reset do banco de desenvolvimento.

---

## CRITÉRIOS DE QUALIDADE (GATE DE CADA FASE)

Nenhuma fase é considerada concluída sem:

- [ ] Todos os fluxos principais funcionando em desktop e mobile
- [ ] Dark mode em todas as telas novas
- [ ] Nenhum dado visível sem autenticação
- [ ] Multitenancy validado (empresa A não vê dados da empresa B)
- [ ] Feedback visual em todas as ações (loading, sucesso, erro)
- [ ] Estados vazios implementados
- [ ] Pelo menos um usuário real testou e não ficou perdido

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
