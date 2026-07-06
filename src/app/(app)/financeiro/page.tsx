import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarTransacoesAction, resumoFinanceiroAction } from "@/lib/actions/financeiro";
import { demoTransacoes, demoResumoFinanceiro } from "@/lib/demo-data";
import { FinanceiroListClient } from "./financeiro-list-client";

export const metadata = { title: "Financeiro" };

export default async function FinanceiroPage() {
  let transacoes: any[] = [];
  let resumo = { ...demoResumoFinanceiro, aPagar: 0 };

  if (isSupabaseConfigured()) {
    const [transResult, resumoResult] = await Promise.all([
      listarTransacoesAction(),
      resumoFinanceiroAction(),
    ]);
    transacoes = transResult.data ?? [];
    resumo = { ...resumo, ...resumoResult };
  } else {
    transacoes = (demoTransacoes as any[]).map(t => ({
      id: t.id,
      tipo: t.tipo,
      categoria: t.categoria,
      descricao: t.descricao,
      valor: t.valor,
      data: t.data,
      status: t.status === "pago" ? "confirmado" : t.status,
      metodo_pagamento: (t as any).metodoPagamento,
      ordens_servico: null,
      clientes: null,
    }));
  }

  const kpis = [
    { label: "Receita do Mês",   value: formatCurrency(resumo.receitaMes),  color: "success" },
    { label: "Despesas do Mês",  value: formatCurrency(resumo.despesaMes),  color: "danger"  },
    { label: "Saldo do Mês",     value: formatCurrency(resumo.saldoMes),    color: resumo.saldoMes >= 0 ? "success" : "danger" },
    { label: "A Receber",        value: formatCurrency(resumo.aReceber),    color: "warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Caixa e transações do mês atual</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/financeiro/relatorios">Relatórios</Link>
          </Button>
          <Button asChild>
            <Link href="/financeiro/novo">
              <Plus className="size-4" />
              Nova Transação
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs text-[var(--color-fg-subtle)]">{k.label}</p>
            <p className={`mt-1 text-xl font-bold text-[var(--color-${k.color}-600)]`}>{k.value}</p>
          </div>
        ))}
      </div>

      <FinanceiroListClient initialData={transacoes} />
    </div>
  );
}
