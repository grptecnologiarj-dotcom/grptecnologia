# MODULES — DeskControl

> Mapa completo de todos os módulos, funcionalidades e fluxos do sistema.

---

## VISÃO GERAL DOS MÓDULOS

```
┌─────────────────────────────────────────────────────────────────┐
│                        DESKCONTROL                               │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   OPERAÇÃO   │  COMERCIAL   │  FINANCEIRO  │   CONFIGURAÇÃO     │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│ Ordens de    │ Clientes     │ Caixa        │ Empresa            │
│ Serviço ★    │ Equipamentos │ Contas a     │ Usuários           │
│ Agenda       │ Orçamentos   │ Receber      │ Permissões         │
│ Checklist    │ Contratos    │ Contas a     │ Assinaturas        │
│ Estoque      │ Garantias    │ Pagar        │ Integrações        │
│              │ Portal do    │ DRE          │ Notificações       │
│              │ Cliente      │ Relatórios   │                    │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│                    TRANSVERSAIS                                   │
│        WhatsApp | Relatórios | Auditoria | Super Admin           │
└─────────────────────────────────────────────────────────────────┘
```

---

## MÓDULO 1 — DASHBOARD

### Objetivo
Central de inteligência da empresa. Responde em 3 segundos: "Como está minha empresa agora?"

### KPIs em tempo real
- OS abertas hoje / esta semana / este mês
- OS por status (Kanban visual)
- Técnicos ativos (quem está trabalhando agora)
- Ticket médio do mês
- Faturamento do dia / semana / mês vs. mês anterior
- OS atrasadas (previsão vencida)
- Caixa atual
- Orçamentos aguardando aprovação

### Widgets configuráveis
- Usuário pode escolher quais cards exibir e em qual ordem
- Dashboards diferentes por role (Admin vê tudo, Técnico vê apenas suas OS)

### Alertas inteligentes
- OS sem atualização há mais de 24h
- Orçamento aguardando aprovação há mais de 48h
- Peça com estoque crítico
- Conta a receber vencida ontem

---

## MÓDULO 2 — ORDENS DE SERVIÇO ★ (CORAÇÃO DO SISTEMA)

### Fluxo da OS

```
ABERTURA → DIAGNÓSTICO → ORÇAMENTO → APROVAÇÃO → REPARO → PRONTO → ENTREGA
    ↓           ↓             ↓           ↓          ↓        ↓        ↓
  Fotos    Checklist     PDF gerado   WhatsApp   Timeline   Aviso   Assinatura
  obrig.   diagnóstico   automático   do cliente   atualiza  cliente  digital
```

### Status da OS
```
aberta → em_diagnostico → aguardando_aprovacao → aprovada → em_reparo
       → aguardando_pecas → aguardando_cliente → pronto → em_transito
       → entregue → em_garantia → cancelada
```

### Campos da OS

**Identificação:**
- Número único (ex: OS-2024-00001) — gerado automaticamente, configurável
- QR Code para impressão e consulta rápida
- Data de abertura / previsão / fechamento
- Prioridade (baixa, média, alta, urgente) com cor
- Canal de origem (presencial, WhatsApp, e-mail, telefone, portal)

**Cliente e Equipamento:**
- Busca de cliente (nome, CPF, telefone) com autocomplete
- Criação rápida de cliente sem sair da OS
- Equipamento vinculado ao cliente
- Histórico de OS anteriores do mesmo equipamento exibido inline

**Problema:**
- Descrição do problema relatado pelo cliente (voz do cliente)
- Acessórios entregues (lista de checkboxes customizável)
- Senha do equipamento (campo criptografado)
- Condição visual (Bom / Regular / Com danos — com fotos obrigatórias)

**Diagnóstico:**
- Campo de texto rico (markdown simples)
- Sugestão por IA baseada em equipamento + sintomas
- Base de conhecimento: soluções anteriores para problemas similares

**Orçamento (integrado):**
- Lista de serviços com quantidade e valor unitário
- Lista de peças com baixa automática do estoque
- Desconto (valor ou %)
- Subtotal + desconto + total
- PDF do orçamento com um clique
- Link de aprovação para o cliente

**Checklist:**
- Templates de checklist por tipo de equipamento
- Checklist de recebimento (entrada)
- Checklist de diagnóstico
- Checklist de qualidade (antes de entregar)
- Técnico não consegue fechar a OS sem completar o checklist

**Fotos e Vídeos:**
- Upload múltiplo (arrastar e soltar)
- Câmera direto do celular (PWA)
- Fotos organizadas por fase (entrada, durante reparo, saída)
- Anotações nas fotos (círculo vermelho, seta)
- Hash SHA-256 de cada foto (prova de integridade)

**Timeline (imutável):**
- Todo evento é registrado automaticamente:
  - Criação, mudança de status, troca de técnico
  - Upload de foto, criação de orçamento, aprovação
  - Mensagem do WhatsApp enviada
  - Comentário de usuário (com @mencao)
- Nenhum evento pode ser deletado — apenas acrescido
- Exibição estilo "chat" com avatar do usuário

**Assinatura Digital:**
- Na entrega: cliente assina digitalmente na tela
- Geolocalização no momento da assinatura
- Data e hora do servidor (não do cliente)
- Armazenada como imagem no Supabase Storage
- Integrada no relatório de entrega em PDF

**Comunicação:**
- Botão "Avisar cliente por WhatsApp" com templates
- Histórico de mensagens enviadas visível na OS
- Aprovação de orçamento: cliente clica no link e aprova (registrado)

### Listagem de OS
- Filtros: status, técnico, prioridade, período, cliente
- Busca por número, cliente, equipamento, problema
- Kanban por status (drag-and-drop para mudar status)
- Tabela para exportação / relatório
- Ações em lote: atribuir técnico, mudar status, imprimir

---

## MÓDULO 3 — CLIENTES

### Funcionalidades
- Cadastro completo: PF (CPF) e PJ (CNPJ)
- Auto-completar endereço por CEP
- Múltiplos contatos por cliente (e-mail, telefone, WhatsApp)
- Tags customizáveis (VIP, inadimplente, corporativo)
- Score de relacionamento (baseado em histórico)
- Histórico completo: todas as OS, orçamentos, pagamentos
- Linha do tempo do cliente (todos os eventos)
- Equipamentos vinculados
- Observações internas (não visíveis ao cliente)

### Busca inteligente
- Full-text search por nome, CPF/CNPJ, e-mail, telefone
- Sugestão ao digitar (autocomplete)
- Busca pelo número de série do equipamento

---

## MÓDULO 4 — EQUIPAMENTOS

### Funcionalidades
- Vinculado a um cliente (com histórico de propriedade)
- Campos: marca, modelo, número de série, cor, imei
- Tipo de equipamento (notebook, smartphone, impressora, etc.) — configurável
- Fotos do equipamento
- Histórico completo de todas as OS
- Garantias vinculadas
- QR Code de identificação

### Diferencial
- Busca por número de série: digita o número e acha o equipamento + todas as OS
- Histórico de donos: se o equipamento passou de cliente para cliente, rastreamos

---

## MÓDULO 5 — AGENDA

### Visões
- Semana (técnicos como colunas — estilo Google Calendar)
- Mês
- Lista do dia

### Funcionalidades
- Agendamento de visitas técnicas (Field Service)
- Agendamento de retirada/entrega de equipamento
- Vinculado à OS
- Técnico recebe notificação (push + WhatsApp)
- Bloqueio de horário (almoço, folga)
- Tempo estimado por tipo de serviço
- Mapa com endereços dos agendamentos do dia (Google Maps integrado)

---

## MÓDULO 6 — ORÇAMENTOS

### Fluxo independente
- Orçamento pode existir sem OS (para projetos, instalações)
- Orçamento aprovado pode gerar OS automaticamente
- Versionamento: cada revisão é numerada
- Validade configurável (ex: 15 dias)

### Funcionalidades
- Template de orçamento customizável com logo
- PDF profissional gerado automaticamente
- Link público de aprovação (sem precisar de login)
- Aprovação com assinatura digital ou apenas clique
- Controle de aprovados, rejeitados, aguardando

---

## MÓDULO 7 — FINANCEIRO

### Sub-módulos

**7.1 Caixa**
- Abertura e fechamento de caixa diário
- Entradas e saídas do dia
- Formas de pagamento (dinheiro, cartão, Pix, boleto)
- Sangria e suprimento
- Relatório de fechamento

**7.2 Contas a Receber**
- Gerado automaticamente ao finalizar OS
- Parcelamento configurável
- Envio de link de pagamento (Pix, cartão)
- Alerta de vencimento (D-1, vencido)
- Baixa manual ou automática (webhook do gateway)
- Relatório de inadimplência

**7.3 Contas a Pagar**
- Despesas operacionais
- Categorias customizáveis
- Recorrentes (aluguel, internet)
- Alertas de vencimento

**7.4 DRE (Demonstrativo de Resultados)**
- Receita bruta por período
- Deduções (desconto, cancelamentos)
- Custo de peças
- Resultado por técnico
- Margem por tipo de serviço

**7.5 Fluxo de Caixa**
- Projeção dos próximos 30/60/90 dias
- Baseado em contas a receber e a pagar previstas

---

## MÓDULO 8 — ESTOQUE

### Funcionalidades
- Cadastro de produtos/peças com código
- Múltiplos fornecedores por produto
- Estoque mínimo com alerta automático
- Entradas: nota fiscal manual ou por leitura de código de barras
- Saídas: manual ou automática (ao fechar OS com peças)
- Localização no estoque (prateleira, gaveta)
- Histórico de movimentações
- Relatório de giro de estoque
- Inventário (contagem periódica)

### Integração com OS
- Ao criar orçamento: busca peça no estoque, reserva quantidade
- Ao fechar OS: baixa confirmada automaticamente
- Alerta se peça não tem estoque ao ser adicionada na OS

---

## MÓDULO 9 — GARANTIAS

### Funcionalidades
- Gerada automaticamente ao entregar uma OS
- Período configurável por tipo de serviço e por empresa
- Número de garantia único com QR Code
- Portal do cliente: consulta de garantia por número
- Alerta 30 dias antes do vencimento (oportunidade de contato)
- Acionamento de garantia gera nova OS vinculada à original

---

## MÓDULO 10 — CONTRATOS

### Tipos de contrato
- Manutenção preventiva (mensal, trimestral, anual)
- Suporte de TI (horas mensais + SLA)
- CFTV / Rede (monitoramento + visitas)
- Campo livre (qualquer tipo de contrato recorrente)

### Funcionalidades
- Valor mensal / anual
- Número de visitas/atendimentos inclusos
- Geração automática de OS de manutenção (mensal/trimestral)
- Geração automática de cobrança recorrente
- Status do contrato (ativo, suspenso, cancelado)
- Histórico de todas as OS vinculadas ao contrato
- Documento do contrato em PDF

---

## MÓDULO 11 — PORTAL DO CLIENTE

### Acesso
- Link único enviado por WhatsApp/e-mail
- Sem necessidade de criar conta
- Token seguro com expiração

### Funcionalidades
- Acompanhar status da OS em tempo real
- Ver fotos do equipamento
- Aprovar orçamento (ou solicitar contato)
- Pagar (link de pagamento integrado)
- Histórico de todas as OS anteriores
- Download do laudo / relatório de serviço
- Chat com a assistência (integrado ao WhatsApp)

---

## MÓDULO 12 — WHATSAPP

### Tipos de mensagem
- **Notificações automáticas:**
  - OS criada (confirmação de recebimento)
  - Status mudou (diagnóstico concluído, pronto para retirada)
  - Orçamento aprovado / aguardando aprovação
  - Lembrete de retirada (D+3 sem retirar = alerta)
  - Garantia vencendo

- **Mensagens manuais:**
  - Templates customizáveis por empresa
  - Envio direto da OS
  - Histórico de mensagens na timeline da OS

- **Recebimento:**
  - Cliente responde → mensagem aparece na OS
  - Bot de status: cliente manda "status OS 2024-0001" → recebe atualização automática

### Configuração
- Instância própria via Evolution API
- QR Code para conectar
- Status de conexão visível no dashboard

---

## MÓDULO 13 — RELATÓRIOS

### Relatórios pré-construídos
- OS por período (quantidade, valor, status)
- Produtividade por técnico (OS fechadas, tempo médio, valor)
- Ticket médio por tipo de serviço
- Equipamentos mais reparados (marca, modelo, defeito)
- Financeiro mensal (DRE simplificado)
- Inadimplência

### Exportação
- PDF formatado com logo da empresa
- Excel / CSV para análise externa
- E-mail agendado (relatório semanal automático)

---

## MÓDULO 14 — CONFIGURAÇÕES

### Empresa
- Dados da empresa (logo, nome, CNPJ, endereço)
- Personalização visual (cor primária, template de OS)
- Numeração de OS (prefixo, número inicial)
- Horário de funcionamento
- Texto padrão de garantia
- Termos e condições

### Operação
- Status customizados (adicionar novos status à OS)
- Tipos de equipamento personalizados
- Checklist templates por tipo de equipamento
- Categorias financeiras customizadas
- Formas de pagamento aceitas

### Notificações
- Quais eventos geram notificação (por canal: email, WhatsApp, push)
- Templates de mensagem customizáveis
- Horário de envio (não enviar fora do horário comercial)

---

## MÓDULO 15 — USUÁRIOS E PERMISSÕES

- CRUD de usuários
- Convite por e-mail
- Definição de role (perfil)
- Permissões granulares por módulo
- Histórico de acessos
- Reset de senha

---

## MÓDULO 16 — SUPER ADMIN (GRP Tecnologia)

### Exclusivo para administradores da GRP

- Listagem de todas as empresas
- Métricas da plataforma (usuários ativos, OS criadas, receita MRR)
- Gestão de planos e assinaturas
- Impersonação de conta (para suporte)
- Suspensão / cancelamento de conta
- Configuração de feature flags por empresa
- Log de todos os eventos da plataforma

---

## FUNCIONALIDADES TRANSVERSAIS

### Busca global
- Atalho: `Ctrl + K` abre buscador universal
- Busca em: clientes, OS, equipamentos, produtos
- Resultado instantâneo com preview

### Notificações in-app
- Sino no header com badge de não lidas
- Notificações push (PWA)
- Tipos: OS atribuída, orçamento aprovado, alerta de estoque

### Modo Offline (PWA para técnicos)
- Service Worker com cache das OS do dia
- Registro de fotos, peças e checklist offline
- Sincronização automática ao reconectar

### Impressão
- Qualquer OS pode ser impressa em A4 ou papel 80mm (impressora térmica)
- Etiqueta de OS com QR Code (58mm)
- Relatório de entrega com assinatura

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
