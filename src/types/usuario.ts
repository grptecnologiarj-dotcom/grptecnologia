/**
 * Tipos de domínio — Usuários, empresas e autenticação
 * DeskControl (multiempresa)
 */

export type UserRole = "admin" | "tecnico" | "atendente" | "financeiro" | "visualizador";

export interface Empresa {
  id: string;
  nome: string;
  slug: string;
  plano: "free" | "pro" | "business" | "enterprise";
  status: "ativo" | "inativo" | "trial";
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  telefone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: "ativo" | "inativo" | "convite_pendente";
  ultimoAcesso?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  empresaId: string;
  role: UserRole;
  exp: number;
}