import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service role — uso EXCLUSIVO no servidor.
 * Ignora RLS; usar apenas em operações administrativas controladas
 * (registro de nova empresa, criação de membros da equipe).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
