"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function listarAgendaAction(inicio?: string, fim?: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const hoje = new Date();
  const diaAtual = hoje.getDay();
  const inicioSemana = inicio ?? new Date(
    hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diaAtual
  ).toISOString();
  const fimSemana = fim ?? new Date(
    hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + (6 - diaAtual), 23, 59, 59
  ).toISOString();

  const { data, error } = await supabase
    .from("agenda_eventos")
    .select(`
      *,
      usuarios!tecnico_id(id, nome, avatar_url),
      clientes(id, nome, telefone, whatsapp),
      ordens_servico(id, numero, status)
    `)
    .eq("empresa_id", user.empresaId)
    .gte("data_inicio", inicioSemana)
    .lte("data_inicio", fimSemana)
    .order("data_inicio");

  if (error) return { error: error.message, data: [] as any[] };
  return { data: data ?? [] };
}

export async function buscarEventoAgendaAction(id: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("agenda_eventos")
    .select(`
      *,
      usuarios!tecnico_id(id, nome, avatar_url, telefone),
      clientes(id, nome, telefone, whatsapp, endereco, cidade),
      ordens_servico(id, numero, status, problema)
    `)
    .eq("id", id)
    .eq("empresa_id", user.empresaId)
    .single();

  if (error) return { error: "Evento não encontrado.", data: null };
  return { data };
}

export async function listarTecnicosAction() {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, role")
    .eq("empresa_id", user.empresaId)
    .in("role", ["tecnico", "admin"])
    .order("nome");

  if (error) return { error: error.message, data: [] as any[] };
  return { data: data ?? [] };
}

export async function criarEventoAgendaAction(formData: FormData) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("agenda_eventos")
    .insert({
      empresa_id: user.empresaId,
      titulo: formData.get("titulo") as string,
      tipo: formData.get("tipo") as string,
      tecnico_id: formData.get("tecnico_id") || null,
      cliente_id: formData.get("cliente_id") || null,
      os_id: formData.get("os_id") || null,
      data_inicio: formData.get("data_inicio") as string,
      data_fim: formData.get("data_fim") || null,
      local: formData.get("local") || null,
      descricao: formData.get("descricao") || null,
      prioridade: formData.get("prioridade") || "normal",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Erro ao criar evento." };

  revalidatePath("/agenda");
  redirect(`/agenda/${data.id}`);
}

export async function atualizarStatusEventoAction(eventoId: string, status: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { error } = await supabase
    .from("agenda_eventos")
    .update({ status })
    .eq("id", eventoId)
    .eq("empresa_id", user.empresaId);

  if (error) return { error: "Erro ao atualizar evento." };

  revalidatePath(`/agenda/${eventoId}`);
  revalidatePath("/agenda");
  return { success: true };
}

export async function atualizarEventoAgendaAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { error } = await supabase
    .from("agenda_eventos")
    .update({
      titulo: formData.get("titulo") as string,
      tipo: formData.get("tipo") as string,
      tecnico_id: formData.get("tecnico_id") || null,
      cliente_id: formData.get("cliente_id") || null,
      os_id: formData.get("os_id") || null,
      data_inicio: formData.get("data_inicio") as string,
      data_fim: formData.get("data_fim") || null,
      local: formData.get("local") || null,
      descricao: formData.get("descricao") || null,
      prioridade: formData.get("prioridade") || "normal",
    })
    .eq("id", id)
    .eq("empresa_id", user.empresaId);

  if (error) return { error: "Erro ao atualizar evento." };

  revalidatePath(`/agenda/${id}`);
  revalidatePath("/agenda");
  redirect(`/agenda/${id}`);
}
