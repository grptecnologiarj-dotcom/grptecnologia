/**
 * Helpers de autenticação — DeskControl
 * Integração com Supabase Auth + multiempresa
 * Suporta modo demonstração quando o Supabase não está configurado.
 */

import { redirect } from "next/navigation";
import type { Usuario, UserRole } from "@/types";
import { createServerClientInstance } from "./supabase";
import { demoUser } from "./demo-data";

/**
 * Verifica se o Supabase está configurado.
 */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Obtém o usuário autenticado (Supabase) + perfil DeskControl.
 * Redireciona para /login se não autenticado.
 * Em modo demo (sem Supabase), retorna um usuário de demonstração.
 */
export async function getCurrentUser(): Promise<Usuario> {
  // Modo demonstração
  if (!isSupabaseConfigured()) {
    return demoUser as Usuario;
  }

  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!perfil) {
    redirect("/login");
  }

  return perfil as Usuario;
}

/**
 * Obtém o empresa_id ativo do usuário logado.
 */
export async function getCurrentEmpresaId(): Promise<string> {
  const user = await getCurrentUser();
  return user.empresaId;
}

/**
 * Verifica se o usuário possui uma das roles permitidas.
 */
export function hasRole(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

/**
 * Guard de rota (server-side) — redireciona se não autorizado.
 */
export async function requireRole(allowed: UserRole[]): Promise<Usuario> {
  const user = await getCurrentUser();
  if (!hasRole(user.role, allowed)) {
    redirect("/dashboard?erro=acesso_negado");
  }
  return user;
}