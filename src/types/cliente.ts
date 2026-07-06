/**
 * Tipos de domínio — Clientes
 * DeskControl
 */

export type TipoPessoa = "fisica" | "juridica";

export interface Cliente {
  id: string;
  empresaId: string;
  nome: string;
  tipoPessoa: TipoPessoa;
  documento: string; // CPF ou CNPJ (normalizado)
  email?: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  observacoes?: string;
  tags?: string[];
  status: "ativo" | "inativo" | "bloqueado";
  createdAt: string;
  updatedAt: string;
}

export interface ClienteResumo {
  id: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  totalOs: number;
  ultimaOs?: string;
}