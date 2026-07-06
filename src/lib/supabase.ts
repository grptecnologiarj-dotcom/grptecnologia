/**
 * Clientes Supabase — DeskControl
 * Usa @supabase/ssr para suporte a App Router (Server + Client components)
 *
 * Variáveis de ambiente esperadas (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 */

import { createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso amigável em desenvolvimento; em produção, falhará ao usar.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[DeskControl] Variáveis NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas. " +
        "Configure o arquivo .env.local antes de usar o Supabase."
    );
  }
}

/**
 * Cliente para uso em Client Components (browser).
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Cliente para uso em Server Components, Route Handlers e Server Actions.
 */
export async function createServerClientInstance() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // O método set só pode ser chamado em Server Components/Route Handlers.
          // Se chamado em Server Components, pode ser ignorado com segurança.
        }
      },
    },
  });
}