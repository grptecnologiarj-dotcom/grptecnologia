export const CATEGORIAS_EQUIPAMENTO = [
  "Notebook",
  "Desktop / All-in-One",
  "Servidor",
  "Rede (Switch / Roteador / AP)",
  "Impressora / Multifuncional",
  "CFTV (Câmera / DVR / NVR)",
  "Infraestrutura TI",
  "Smartphone / Tablet",
  "Outros",
] as const;

export type CategoriaEquipamento = (typeof CATEGORIAS_EQUIPAMENTO)[number];

export const TIPOS_ATENDIMENTO = [
  { value: "presencial",          label: "Bancada (cliente trouxe)" },
  { value: "coleta_entrega",      label: "Coleta e Entrega" },
  { value: "visita_tecnica",      label: "Visita Técnica" },
  { value: "suporte_remoto",      label: "Suporte Remoto" },
  { value: "contrato_manutencao", label: "Contrato de Manutenção" },
] as const;

export const ORIGENS_OS = [
  { value: "presencial", label: "Presencial" },
  { value: "whatsapp",   label: "WhatsApp" },
  { value: "telefone",   label: "Telefone" },
  { value: "email",      label: "E-mail" },
  { value: "portal",     label: "Portal do Cliente" },
  { value: "contrato",   label: "Contrato" },
] as const;

export const EMPRESA_ID_GRP = "00000000-0000-0000-0000-000000000001" as const;

export const CATEGORIAS_FINANCEIRO_RECEITA = [
  "Mão de obra",
  "Peças e componentes",
  "Contrato de manutenção",
  "Visita técnica",
  "Suporte remoto",
  "Consultoria",
  "Outros",
] as const;

export const CATEGORIAS_FINANCEIRO_DESPESA = [
  "Peças e componentes",
  "Ferramentas e equipamentos",
  "Aluguel",
  "Energia elétrica",
  "Internet",
  "Combustível",
  "Salários e encargos",
  "Software e licenças",
  "Marketing",
  "Outros",
] as const;

export const METODOS_PAGAMENTO = [
  "Dinheiro",
  "PIX",
  "Cartão de débito",
  "Cartão de crédito",
  "Transferência bancária",
  "Boleto",
  "Cheque",
] as const;
