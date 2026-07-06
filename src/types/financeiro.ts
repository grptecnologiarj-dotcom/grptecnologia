/**
 * Tipos de domínio — Financeiro
 * DeskControl
 */

export type TipoMovimentacao = "receita" | "despesa";

export type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "boleto"
  | "transferencia"
  | "outro";

export type StatusPagamento = "pago" | "pendente" | "cancelado" | "parcial";

export interface Movimentacao {
  id: string;
  empresaId: string;
  tipo: TipoMovimentacao;
  descricao: string;
  categoria: string; // ex.: "Reparo", "Compra de Peças", "Aluguel"
  valor: number;
  dataVencimento?: string;
  dataPagamento?: string;
  formaPagamento?: FormaPagamento;
  osId?: string; // vínculo com OS (opcional)
  clienteId?: string;
  status: StatusPagamento;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumoFinanceiro {
  receitaMes: number;
  despesaMes: number;
  saldoMes: number;
  aReceber: number;
  aPagar: number;
  ticketMedio: number;
}

export interface EstoqueItem {
  id: string;
  empresaId: string;
  nome: string;
  sku?: string;
  categoria?: string;
  quantidade: number;
  quantidadeMinima: number;
  valorCusto: number;
  valorVenda: number;
  unidade?: string; // ex.: "un", "mt", "lt"
  localizacao?: string;
  createdAt: string;
  updatedAt: string;
}