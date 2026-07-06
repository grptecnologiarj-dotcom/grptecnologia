"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const transacaoSchema = z.object({
  tipo: z.enum(["receita", "despesa"]),
  categoria: z.string().min(1, "Selecione uma categoria"),
  descricao: z.string().min(2, "Descreva a transação"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  data: z.string(),
  status: z.enum(["pendente", "confirmado", "cancelado"]).default("confirmado"),
  metodo_pagamento: z.string().optional(),
  os_id: z.string().uuid().optional().or(z.literal("")),
  observacoes: z.string().optional(),
});

export async function listarTransacoesAction(filtros?: { mes?: string; tipo?: string }) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const inicio = filtros?.mes ?? `${ano}-${mes}-01`;
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    .toISOString().split("T")[0];

  let query = supabase
    .from("financeiro_transacoes")
    .select("*, ordens_servico(numero), clientes(nome)")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false });

  if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);

  const { data, error } = await query.limit(500);
  if (error) return { error: error.message, data: [] as any[] };
  return { data: data ?? [] };
}

export async function buscarTransacaoAction(id: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("financeiro_transacoes")
    .select("*, ordens_servico(id, numero), clientes(id, nome)")
    .eq("id", id)
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .single();

  if (error) return { error: "Transação não encontrada.", data: null };
  return { data };
}

export async function criarTransacaoAction(formData: FormData) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(
    ["tipo","categoria","descricao","valor","data","status","metodo_pagamento","os_id","observacoes"]
      .map(k => [k, formData.get(k)])
  );
  const parsed = transacaoSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createServerClientInstance();
  const { data, error } = await supabase
    .from("financeiro_transacoes")
    .insert({
      ...parsed.data,
      os_id: parsed.data.os_id || null,
      empresa_id: user.empresaId,
      usuario_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Erro ao criar transação." };

  revalidatePath("/financeiro");
  redirect(`/financeiro/${data.id}`);
}

export async function atualizarTransacaoAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(
    ["tipo","categoria","descricao","valor","data","status","metodo_pagamento","os_id","observacoes"]
      .map(k => [k, formData.get(k)])
  );
  const parsed = transacaoSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createServerClientInstance();
  const { error } = await supabase
    .from("financeiro_transacoes")
    .update({ ...parsed.data, os_id: parsed.data.os_id || null })
    .eq("id", id)
    .eq("empresa_id", user.empresaId);

  if (error) return { error: "Erro ao salvar transação." };
  revalidatePath("/financeiro");
  revalidatePath(`/financeiro/${id}`);
  return { success: true };
}

export async function excluirTransacaoAction(id: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { error } = await supabase
    .from("financeiro_transacoes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("empresa_id", user.empresaId);

  if (error) return { error: "Erro ao excluir transação." };
  revalidatePath("/financeiro");
  return { success: true };
}

export async function resumoFinanceiroAction() {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const hoje = new Date();
  const inicioMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("financeiro_transacoes")
    .select("tipo, valor, status")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .gte("data", inicioMes)
    .neq("status", "cancelado");

  const receitas = data?.filter(t => t.tipo === "receita") ?? [];
  const despesas = data?.filter(t => t.tipo === "despesa") ?? [];

  const receitaMes = receitas.reduce((s, t) => s + Number(t.valor), 0);
  const despesaMes = despesas.reduce((s, t) => s + Number(t.valor), 0);
  const aReceber = receitas
    .filter(t => t.status === "pendente")
    .reduce((s, t) => s + Number(t.valor), 0);
  const aPagar = despesas
    .filter(t => t.status === "pendente")
    .reduce((s, t) => s + Number(t.valor), 0);

  return {
    receitaMes,
    despesaMes,
    saldoMes: receitaMes - despesaMes,
    aReceber,
    aPagar,
    ticketMedio: receitas.length > 0 ? receitaMes / receitas.length : 0,
  };
}
