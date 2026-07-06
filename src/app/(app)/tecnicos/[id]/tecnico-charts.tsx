"use client";

import { BarChart } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

interface TecnicoChartsProps {
  produtividadeMensal: number[];
  receitaMensal: number[];
  receitaTotal: number;
}

export function TecnicoCharts({ produtividadeMensal, receitaMensal, receitaTotal }: TecnicoChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-1">OS concluídas por mês</h2>
        <p className="text-xs text-[var(--color-fg-muted)] mb-4">Jan–Jun 2026</p>
        <BarChart
          labels={meses}
          datasets={[{ label: "OS", values: produtividadeMensal, color: "var(--color-brand-500)" }]}
          height={180}
          formatValue={(v) => `${v} OS`}
        />
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-1">Receita gerada por mês</h2>
        <p className="text-xs text-[var(--color-fg-muted)] mb-4">Jan–Jun 2026 · Total: {formatCurrency(receitaTotal)}</p>
        <BarChart
          labels={meses}
          datasets={[{ label: "Receita", values: receitaMensal, color: "var(--color-success)" }]}
          height={180}
          formatValue={(v) => formatCurrency(v)}
        />
      </div>
    </div>
  );
}
