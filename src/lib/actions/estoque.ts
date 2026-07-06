"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const estoqueSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  categoria: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  codigo_barras: z.string().optional(),
  sku: z.string().optional(),
  quantidade: z.coerce.number().min(0),
  quantidade_minima: z.coerce.number().min(0),
  preco_custo: z.coerce.number().min(0),
  preco_venda: z.coerce.number().min(0),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function listarEstoqueAction() {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("estoque_itens")
    .select("*")
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .order("nome");

  if (error) return { error: error.message, data: [] as any[] };
  return { data: data ?? [] };
}

export async function buscarItemEstoqueAction(id: string) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("estoque_itens")
    .select("*, estoque_movimentacoes(id, tipo, quantidade, motivo, created_at, preco_unit)")
    .eq("id", id)
    .eq("empresa_id", user.empresaId)
    .is("deleted_at", null)
    .single();

  if (error) return { error: "Item não encontrado.", data: null };
  return { data };
}

export async function criarItemEstoqueAction(formData: FormData) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(
    ["nome","categoria","marca","modelo","codigo_barras","sku",
     "quantidade","quantidade_minima","preco_custo","preco_venda","localizacao","observacoes"]
      .map(k => [k, formData.get(k)])
  );
  const parsed = estoqueSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createServerClientInstance();
  const { data, error } = await supabase
    .from("estoque_itens")
    .insert({ ...parsed.data, empresa_id: user.empresaId, created_by: user.id })
    .select("id")
    .single();

  if (error || !data) return { error: "Erro ao criar item de estoque." };

  revalidatePath("/estoque");
  redirect(`/estoque/${data.id}`);
}

export async function atualizarItemEstoqueAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(
    ["nome","categoria","marca","modelo","codigo_barras","sku",
     "quantidade","quantidade_minima","preco_custo","preco_venda","localizacao","observacoes"]
      .map(k => [k, formData.get(k)])
  );
  const parsed = estoqueSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createServerClientInstance();
  const { error } = await supabase
    .from("estoque_itens")
    .update(parsed.data)
    .eq("id", id)
    .eq("empresa_id", user.empresaId);

  if (error) return { error: "Erro ao atualizar item." };

  revalidatePath(`/estoque/${id}`);
  revalidatePath("/estoque");
  return { success: true };
}

export async function movimentarEstoqueAction(
  itemId: string,
  tipo: "entrada" | "saida" | "ajuste",
  quantidade: number,
  motivo: string,
  precoUnit?: number
) {
  const user = await getCurrentUser();
  const supabase = await createServerClientInstance();

  const { data: item } = await supabase
    .from("estoque_itens")
    .select("quantidade")
    .eq("id", itemId)
    .eq("empresa_id", user.empresaId)
    .single();

  if (!item) return { error: "Item não encontrado." };

  const novaQtd =
    tipo === "entrada" ? Number(item.quantidade) + quantidade :
    tipo === "saida"   ? Number(item.quantidade) - quantidade :
    quantidade;

  if (novaQtd < 0) return { error: "Quantidade insuficiente em estoque." };

  await supabase.from("estoque_movimentacoes").insert({
    empresa_id: user.empresaId,
    item_id: itemId,
    tipo,
    quantidade,
    preco_unit: precoUnit ?? null,
    motivo,
    usuario_id: user.id,
  });

  await supabase
    .from("estoque_itens")
    .update({ quantidade: novaQtd })
    .eq("id", itemId)
    .eq("empresa_id", user.empresaId);

  revalidatePath(`/estoque/${itemId}`);
  revalidatePath("/estoque");
  return { success: true };
}
