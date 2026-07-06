"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured, getCurrentUser } from "@/lib/auth";
import { createServerClientInstance } from "@/lib/supabase";

export async function criarEquipamentoAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  if (!isSupabaseConfigured()) {
    revalidatePath("/equipamentos");
    redirect("/equipamentos");
  }

  const supabase = await createServerClientInstance();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("id, empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!perfil) return { error: "Perfil não encontrado." };

  const { error } = await supabase.from("equipamentos").insert({
    empresa_id: perfil.empresa_id,
    cliente_id: formData.get("cliente_id") || null,
    nome: formData.get("nome"),
    categoria: formData.get("categoria") || null,
    marca: formData.get("marca") || null,
    modelo: formData.get("modelo") || null,
    numero_serie: formData.get("numero_serie") || null,
    imei: formData.get("imei") || null,
    cor: formData.get("cor") || null,
    senha: formData.get("senha") || null,
    observacoes: formData.get("observacoes") || null,
    created_by: perfil.id,
  });

  if (error) return { error: "Erro ao salvar equipamento." };

  revalidatePath("/equipamentos");
  redirect("/equipamentos");
}

export async function atualizarEquipamentoAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { error } = await supabase
    .from("equipamentos")
    .update({
      nome: formData.get("nome"),
      categoria: formData.get("categoria") || null,
      marca: formData.get("marca") || null,
      modelo: formData.get("modelo") || null,
      numero_serie: formData.get("numero_serie") || null,
      imei: formData.get("imei") || null,
      cor: formData.get("cor") || null,
      senha: formData.get("senha") || null,
      observacoes: formData.get("observacoes") || null,
    })
    .eq("id", id)
    .eq("empresa_id", user.empresaId);

  if (error) return { error: "Erro ao atualizar equipamento." };

  revalidatePath(`/equipamentos/${id}`);
  revalidatePath("/equipamentos");
  return { success: true };
}

export async function listarEquipamentosAction(clienteId?: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  let query = supabase
    .from("equipamentos")
    .select("*, clientes(id, nome)")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .order("nome");

  if (clienteId) query = query.eq("cliente_id", clienteId);

  const { data, error } = await query.limit(500);
  if (error) return { error: error.message, data: [] as any[] };
  return { data: data ?? [] };
}

export async function buscarEquipamentoAction(id: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("equipamentos")
    .select(`
      *,
      clientes(id, nome, telefone, whatsapp),
      ordens_servico(id, numero, status, data_abertura, valor_total, problema)
    `)
    .eq("id", id)
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .single();

  if (error) return { error: "Equipamento não encontrado.", data: null };
  return { data };
}
