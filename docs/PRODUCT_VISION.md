# PRODUCT VISION — DeskControl

> "O software que finalmente entende como uma assistência técnica funciona de verdade."

---

## 1. OBJETIVO

O DeskControl não é mais um sistema de OS.

É o **ERP operacional** para empresas de assistência técnica — uma plataforma que resolve todos os problemas operacionais, financeiros e de relacionamento com o cliente em um único lugar, com uma experiência que faz o usuário sentir que o sistema foi construído por alguém que viveu dentro de uma assistência técnica.

**Missão:** Ser o sistema operacional das empresas de suporte técnico e manutenção no Brasil.

**Visão 5 anos:** Referência nacional em gestão de Field Service — com marketplace de peças integrado, IA para diagnóstico, aplicativo nativo para técnicos e ecossistema de parceiros.

---

## 2. MERCADO

### Tamanho do mercado

- **Brasil:** ~180.000 empresas de assistência técnica, suporte de TI e manutenção registradas
- **Técnicos autônomos:** ~500.000 profissionais (fonte: SEBRAE)
- **TAM estimado:** R$ 2,4 bilhões/ano em software de gestão para esse setor
- **SAM imediato:** ~60.000 empresas que faturam acima de R$ 10k/mês e não têm sistema adequado
- **SOM realista (2 anos):** 3.000 clientes pagantes

### Segmentos prioritários

| Segmento | Dor principal | Prioridade |
|---|---|---|
| Assistência Técnica de Eletrônicos | Rastreabilidade da OS, prova de estado do equipamento | Alta |
| Suporte de TI / Help Desk | Gestão de chamados, SLA, Base de conhecimento | Alta |
| Field Service / Manutenção | Agenda de técnicos externos, GPS, relatório de visita | Alta |
| Redes e CFTV | Contratos de manutenção, garantias, projetos | Média |
| Telefonia / Automação | Gestão de projetos + OS híbrido | Média |
| Técnicos Autônomos | Simplicidade total, WhatsApp integrado | Alta |

---

## 3. PÚBLICO-ALVO

### Persona 1 — Dono da Assistência Técnica (Decisor)
- **Nome fictício:** Carlos, 38 anos
- **Empresa:** Assistência técnica com 3–15 funcionários
- **Dores:** Perde OS, não sabe o status de cada equipamento, o técnico não registra nada, cliente liga perguntando, não sabe o que entra e sai do caixa
- **O que quer:** Controle total com pouco esforço. Saber o que está acontecendo pelo celular
- **Trigger de compra:** Um cliente reclamou que o celular voltou com mais problema do que entrou

### Persona 2 — Atendente / Recepcionista
- **Dores:** Sistema lento, muito campo para preencher, difícil encontrar cliente no histórico
- **O que quer:** Abrir uma OS em menos de 2 minutos

### Persona 3 — Técnico de Campo
- **Dores:** Recebe instrução por WhatsApp, não tem onde registrar fotos, cliente pede comprovante
- **O que quer:** App simples no celular, tirar foto, assinar e fechar

### Persona 4 — Gestor de TI Corporativo
- **Dores:** SLA descontrolado, sem relatórios para diretoria, sem base de conhecimento
- **O que quer:** Dashboard com KPIs, relatórios automáticos, gestão de SLA

### Persona 5 — Técnico Autônomo
- **Dores:** Planilha no Excel, nota fiscal manual, cliente não paga
- **O que quer:** WhatsApp + OS + link de pagamento. Tudo pelo celular

---

## 4. PROBLEMAS RESOLVIDOS

### Operacionais
- ❌ OS perdida em papel → ✅ OS digital com número único, QR Code, busca instantânea
- ❌ Cliente liga perguntando o status → ✅ Portal do cliente com acompanhamento em tempo real
- ❌ "Meu equipamento não estava assim" → ✅ Fotos obrigatórias na entrada + assinatura digital
- ❌ Técnico não registra o que fez → ✅ Checklist obrigatório + Timeline imutável
- ❌ Peça usada sem registro → ✅ Baixa automática no estoque ao fechar OS

### Financeiros
- ❌ Não sabe o que entrou no caixa hoje → ✅ Dashboard financeiro em tempo real
- ❌ Orçamento aprovado por WhatsApp sem registro → ✅ Aprovação digital com aceite gravado
- ❌ Inadimplência descontrolada → ✅ Gestão de contas a receber + alertas automáticos
- ❌ Não sabe se a empresa dá lucro → ✅ DRE automático, custo por OS, margem por serviço

### Relacionamento
- ❌ Perde histórico do cliente → ✅ Linha do tempo completa de cada cliente e equipamento
- ❌ Não faz follow-up → ✅ Automações de WhatsApp (garantia vencendo, revisão programada)
- ❌ Sem fidelização → ✅ Programa de garantia, contratos de manutenção

---

## 5. DIFERENCIAIS COMPETITIVOS

### Frente aos concorrentes (Tomticket, Octadesk, Orçafácil, SysOS, SSOS)

| Diferencial | O que fazemos diferente |
|---|---|
| **OS como Central de Evidências** | Fotos obrigatórias na entrada + saída, hash de integridade, assinatura digital com geolocalização — ninguém pode dizer que entregamos diferente |
| **Timeline imutável** | Cada ação na OS gera um evento permanente. Não se edita, não se apaga. O histórico é uma prova legal |
| **WhatsApp nativo** | Notificações automáticas, aprovação de orçamento por link, acompanhamento de status — sem precisar de integração de terceiros |
| **Técnico Mobile First** | App PWA offline-first para técnicos. Registra fotos, peças, tempo e assinatura sem internet, sincroniza quando conectar |
| **Zero treinamento** | A OS abre em menos de 90 segundos. O sistema guia o usuário. Onboarding assistido por IA |
| **IA para Diagnóstico** | Base de conhecimento com resolução de problemas. O sistema sugere diagnóstico baseado em equipamento + sintoma |
| **Portal do cliente que não é vergonhoso** | Link público, atualização em tempo real, aprovação de orçamento, pagamento inline |
| **Financeiro integrado** | DRE automático, custo por OS, comissão de técnico, controle de caixa — não precisa de planilha |
| **Multi-device perfeito** | Desktop para atendente, tablet para recepção, mobile para técnico — mesma base, experiências otimizadas |

---

## 6. ESTRATÉGIA SAAS

### Modelo de precificação

```
STARTER — R$ 79/mês
├── Até 2 usuários
├── Até 100 OS/mês
├── Módulos: OS, Clientes, Equipamentos, Financeiro básico
└── WhatsApp: apenas notificações

PROFESSIONAL — R$ 149/mês
├── Até 10 usuários
├── OS ilimitadas
├── Todos os módulos
├── WhatsApp completo
├── Portal do cliente
└── Relatórios avançados

ENTERPRISE — R$ 299/mês
├── Usuários ilimitados
├── API completa
├── White-label (domínio próprio)
├── SLA garantido
├── Onboarding dedicado
└── Suporte prioritário
```

### Estratégia de aquisição
1. **Freemium limitado:** 14 dias trial com todos os recursos — o usuário não sabe o que está perdendo até usar
2. **Indicação:** Desconto de 20% para quem indicar (B2B viral)
3. **Parceiros:** Integradores, distribuidores de peças, associações de assistência técnica
4. **SEO:** Ranquear para "sistema OS assistência técnica", "software help desk TI"
5. **YouTube:** Tutoriais e cases de uso — marketing educacional

### Estratégia de retenção
- Onboarding guiado (3 etapas gamificadas)
- Health score: sistema monitora engajamento e aciona CS proativamente
- Relatório semanal automático por email ("seu resumo da semana")
- Upsell natural: quando atinge limite do plano, oferta é exibida no contexto certo

---

## 7. ESCALABILIDADE

### Técnica
- Supabase: horizontal scaling automático
- Edge Functions para lógica crítica
- CDN para assets (imagens de OS)
- Filas para processamento assíncrono (WhatsApp, notificações, relatórios)
- Cache em Redis para dados quentes (dashboard, listagens)

### Negócio
- Multi-tenant desde o dia 1 — cada empresa é completamente isolada
- Planos configuráveis via feature flags — sem redeploy para mudar limites
- API pública desde o Professional — ecossistema de integrações
- Marketplace de extensões (Fase 3) — terceiros constroem sobre a plataforma

---

## 8. ROADMAP DE PRODUTO (ALTO NÍVEL)

### Fase 0 — Fundação (concluída parcialmente)
Schema inicial, autenticação, estrutura Next.js

### Fase 1 — MVP Comercial (prioridade máxima)
OS completa, Clientes, Equipamentos, Dashboard, Financeiro básico, Portal do Cliente

### Fase 2 — Crescimento
Estoque, Agenda, WhatsApp, Contratos, Garantias, App Mobile (PWA)

### Fase 3 — Expansão
IA de diagnóstico, Marketplace de peças, API pública, White-label, Relatórios avançados

### Fase 4 — Ecossistema
Marketplace de extensões, Franquias, Internacionalização (PT-BR → ES → EN)

---

## 9. ANÁLISE CRÍTICA DO ESTADO ATUAL

### O que está bom no schema atual
- Estrutura multi-tenant com `empresa_id` em todas as tabelas ✅
- RLS ativado com políticas básicas ✅
- Trigger de `updated_at` automático ✅
- Enum types bem definidos para status ✅

### O que precisa ser corrigido / adicionado

**Crítico:**
- `os_status` incompleto — falta `em_garantia`, `aguardando_cliente`, `em_transito`
- `usuarios` tem apenas 4 roles — falta `gerente`, `cliente`, `super_admin`
- Não existe tabela de `os_eventos` (timeline imutável) — **é o coração do sistema**
- Não existe `os_fotos` — diferencial competitivo principal
- Não existe `os_checklists` — necessário para padronização
- Não existe `orcamentos` — orçamento é separado de OS em muitos fluxos
- Não existe `estoque` / `produtos` — geração automática de baixa ao fechar OS
- Não existe `agenda` — técnicos precisam de calendário
- Não existe `contratos` — receita recorrente da empresa
- Não existe `garantias` — rastreabilidade pós-entrega
- Não existe `categorias_financeiras` — o financeiro atual é muito plano
- Não existe `configuracoes_empresa` — cada empresa precisa de suas regras
- Não existe `audit_log` — para compliance e investigação
- Equipamentos sem `historico_propriedade` — equipamento pode mudar de dono
- `transacoes` sem `conta_bancaria` — empresas têm múltiplas contas

**Importante:**
- RLS muito simplista — precisa de função robusta que cache `empresa_id` + `role`
- Não existe índice fulltext em `clientes.nome` — busca vai ser lenta com volume
- Sem `soft_delete` em nenhuma tabela — exclusão permanente é perigosa

---

## 10. FUTURO DO PRODUTO

### 18 meses
- IA embarcada: sugere diagnóstico, prevê peças necessárias, detecta padrões de falha
- Integração com fornecedores de peças: orçamento automático de peças diretamente na OS
- Aplicativo nativo (React Native) para técnicos

### 3 anos
- Marketplace de peças: técnicos compram e vendem peças dentro da plataforma
- Certificação de técnicos: badge de qualidade verificada pela GRP
- Analytics de mercado: benchmarks anonimizados ("sua margem está X% abaixo do setor")
- Franquias: empresa pode gerenciar rede de assistências com relatório consolidado

### 5 anos
- Internacionalização: América Latina (ES) e EUA (EN)
- Ecossistema de parceiros: desenvolvedores constroem integrações sobre API pública
- DeskControl Pay: gateway de pagamento próprio com split para técnicos

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
