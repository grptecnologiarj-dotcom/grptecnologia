/**
 * Validações (Zod) — DeskControl
 * Schemas reutilizáveis para formulários e APIs.
 */

import { z } from "zod";

/* ----------------------------- Endereço ----------------------------- */
export const enderecoSchema = z.object({
  cep: z.string().max(9).optional(),
  logradouro: z.string().max(200).optional(),
  numero: z.string().max(20).optional(),
  complemento: z.string().max(100).optional(),
  bairro: z.string().max(100).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.string().length(2).optional(),
});

/* ----------------------------- Cliente ------------------------------ */
export const clienteSchema = z.object({
  nome: z.string().min(2, "Informe o nome").max(200),
  tipoPessoa: z.enum(["fisica", "juridica"]),
  documento: z.string().min(11, "Documento inválido").max(18),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  endereco: enderecoSchema.optional(),
  observacoes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["ativo", "inativo", "bloqueado"]).default("ativo"),
});
export type ClienteForm = z.infer<typeof clienteSchema>;

/* --------------------------- Equipamento ---------------------------- */
export const equipamentoSchema = z.object({
  clienteId: z.string().uuid().optional(),
  nome: z.string().min(2, "Informe o nome").max(200),
  categoria: z.string().min(2, "Informe a categoria").max(100),
  marca: z.string().max(100).optional(),
  modelo: z.string().max(100).optional(),
  numeroSerie: z.string().max(100).optional(),
  acessorios: z.array(z.string()).optional(),
  observacoes: z.string().max(1000).optional(),
  status: z
    .enum(["com_cliente", "na_loja", "em_manutencao", "descartado"])
    .default("com_cliente"),
});
export type EquipamentoForm = z.infer<typeof equipamentoSchema>;

/* ------------------------------- OS --------------------------------- */
export const itemServicoSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  quantidade: z.coerce.number().min(0),
  valorUnitario: z.coerce.number().min(0),
  desconto: z.coerce.number().min(0).optional(),
});

export const itemPecaSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  quantidade: z.coerce.number().min(0),
  valorUnitario: z.coerce.number().min(0),
  estoqueItemId: z.string().uuid().optional(),
});

export const osSchema = z.object({
  clienteId: z.string().uuid("Selecione um cliente"),
  equipamentoId: z.string().uuid().optional(),
  tecnicoId: z.string().uuid().optional(),
  status: z.enum([
    "aberta",
    "em_diagnostico",
    "aguardando_aprovacao",
    "em_reparo",
    "aguardando_pecas",
    "pronto",
    "entregue",
    "cancelada",
  ]),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"]),
  titulo: z.string().min(2, "Informe o título").max(200),
  descricaoProblema: z.string().max(2000).optional(),
  diagnosticoTecnico: z.string().max(2000).optional(),
  solucaoAplicada: z.string().max(2000).optional(),
  itensServico: z.array(itemServicoSchema).default([]),
  itensPeca: z.array(itemPecaSchema).default([]),
  valorDesconto: z.coerce.number().min(0).default(0),
  dataPrevisao: z.string().optional(),
});
export type OSForm = z.infer<typeof osSchema>;

/* --------------------------- Financeiro ----------------------------- */
export const movimentacaoSchema = z.object({
  tipo: z.enum(["receita", "despesa"]),
  descricao: z.string().min(2, "Descrição obrigatória").max(200),
  categoria: z.string().min(2, "Categoria obrigatória").max(100),
  valor: z.coerce.number().min(0.01, "Valor inválido"),
  dataVencimento: z.string().optional(),
  dataPagamento: z.string().optional(),
  formaPagamento: z
    .enum([
      "dinheiro",
      "pix",
      "cartao_credito",
      "cartao_debito",
      "boleto",
      "transferencia",
      "outro",
    ])
    .optional(),
  osId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
  status: z.enum(["pago", "pendente", "cancelado", "parcial"]).default("pendente"),
  observacoes: z.string().max(1000).optional(),
});
export type MovimentacaoForm = z.infer<typeof movimentacaoSchema>;

/* ----------------------------- Estoque ------------------------------ */
export const estoqueItemSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório").max(200),
  sku: z.string().max(50).optional(),
  categoria: z.string().max(100).optional(),
  quantidade: z.coerce.number().min(0),
  quantidadeMinima: z.coerce.number().min(0).default(0),
  valorCusto: z.coerce.number().min(0),
  valorVenda: z.coerce.number().min(0),
  unidade: z.string().max(10).optional(),
  localizacao: z.string().max(100).optional(),
});
export type EstoqueItemForm = z.infer<typeof estoqueItemSchema>;

/* ----------------------------- Login -------------------------------- */
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
export type LoginForm = z.infer<typeof loginSchema>;

/* ---------------------------- Registro ------------------------------ */
export const registroSchema = z
  .object({
    empresaNome: z.string().min(2, "Nome da empresa obrigatório").max(200),
    nome: z.string().min(2, "Informe seu nome").max(200),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo de 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type RegistroForm = z.infer<typeof registroSchema>;