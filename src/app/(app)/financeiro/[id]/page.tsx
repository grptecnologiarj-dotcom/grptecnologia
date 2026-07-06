import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { demoTransacoes } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { buscarTransacaoAction } from "@/lib/actions/financeiro";
import { TransacaoForm } from "./transacao-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Transação ${id.slice(0, 8)} — DeskControl` };
}

export default async function TransacaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const demo = demoTransacoes.find(t => t.id === id) ?? demoTransacoes[0];
  let transacao = {
    id: demo.id,
    tipo: demo.tipo as "receita" | "despesa",
    descricao: demo.descricao,
    valor: demo.valor,
    data: demo.data ?? new Date().toISOString(),
    status: demo.status === "pago" ? "confirmado" : demo.status,
    categoria: demo.categoria,
    metodo_pagamento: (demo as any).formaPagamento ?? null,
    observacoes: null as string | null,
    os_id: null as string | null,
    isSupabase: false,
  };

  if (isSupabaseConfigured()) {
    const result = await buscarTransacaoAction(id);
    if (!result.data) return notFound();
    const d = result.data as any;
    transacao = {
      id: d.id,
      tipo: d.tipo,
      descricao: d.descricao,
      valor: Number(d.valor),
      data: d.data,
      status: d.status,
      categoria: d.categoria,
      metodo_pagamento: d.metodo_pagamento ?? null,
      observacoes: d.observacoes ?? null,
      os_id: d.os_id ?? null,
      isSupabase: true,
    };
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/financeiro"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detalhe da transação</h1>
          <p className="text-sm text-[var(--color-fg-muted)] truncate max-w-sm">{transacao.descricao}</p>
        </div>
      </div>

      <TransacaoForm transacao={transacao} />
    </div>
  );
}
