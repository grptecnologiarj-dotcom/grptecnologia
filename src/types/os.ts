/**
 * Tipos de domínio — Ordens de Serviço (OS)
 * Inclui o conceito de evidências (fotos/vídeos)
 * DeskControl
 */

export type StatusOS =
  | "aberta"
  | "em_diagnostico"
  | "aguardando_aprovacao"
  | "em_reparo"
  | "aguardando_pecas"
  | "pronto"
  | "entregue"
  | "cancelada";

export type PrioridadeOS = "baixa" | "media" | "alta" | "urgente";

export type TipoEvidencia = "foto" | "video";

export type CategoriaEvidencia =
  | "entrada" // estado inicial ao receber o equipamento
  | "diagnostico" // diagnóstico / problema identificado
  | "durante" // durante o reparo
  | "final" // estado final / reparo concluído
  | "entrega"; // evidência de entrega ao cliente

export interface Evidencia {
  id: string;
  osId: string;
  tipo: TipoEvidencia;
  categoria: CategoriaEvidencia;
  url: string; // URL pública no storage (Supabase Storage)
  thumbnailUrl?: string;
  legenda?: string;
  criadoPor: string; // userId
  createdAt: string;
}

export interface ItemServico {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  desconto?: number;
}

export interface ItemPeca {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  estoqueItemId?: string;
}

export interface OS {
  id: string;
  empresaId: string;
  numero: string; // número sequencial amigável, ex: OS-2026-0001
  clienteId: string;
  equipamentoId?: string;
  tecnicoId?: string; // usuário responsável
  status: StatusOS;
  prioridade: PrioridadeOS;
  titulo: string;
  descricaoProblema?: string;
  diagnosticoTecnico?: string;
  solucaoAplicada?: string;
  itensServico: ItemServico[];
  itensPeca: ItemPeca[];
  valorServicos: number;
  valorPecas: number;
  valorDesconto: number;
  valorTotal: number;
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  dataEntrega?: string;
  evidencias: Evidencia[];
  assinaturaCliente?: string; // URL ou base64
  createdAt: string;
  updatedAt: string;
}

export interface OSResumo {
  id: string;
  numero: string;
  clienteNome: string;
  equipamentoNome?: string;
  status: StatusOS;
  prioridade: PrioridadeOS;
  tecnicoNome?: string;
  valorTotal: number;
  dataAbertura: string;
  dataPrevisao?: string;
}