"use client";

import { ClipboardList, TrendingUp, Clock, CheckCircle2, XCircle, Wrench, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, DonutChart } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

const osPorMes = [18, 24, 21, 28, 19, 26];
const osConcluidas = [15, 20, 18, 25, 17, 22];
const osCanceladas = [1, 2, 1, 1, 0, 2];

const porStatus = [
  { label: "Em reparo", value: 8, color: "#2563eb" },
  { label: "Aguardando peças", value: 4, color: "#f59e0b" },
  { label: "Pronto p/ retirada", value: 5, color: "#16a34a" },
  { label: "Aguardando aprovação", value: 3, color: "#7c3aed" },
  { label: "Em diagnóstico", value: 6, color: "#0ea5e9" },
];

const porPrioridade = [
  { label: "Urgente", value: 3, color: "#ef4444" },
  { label: "Alta", value: 9, color: "#f97316" },
  { label: "Média", value: 14, color: "#2563eb" },
  { label: "Baixa", value: 10, color: "#94a3b8" },
];

const porOrigem = [
  { label: "Presencial", value: 22, color: "#2563eb" },
  { label: "WhatsApp", value: 10, color: "#25d366" },
  { label: "Telefone", value: 4, color: "#f59e0b" },
  { label: "Site / E-mail", value: 2, color: "#7c3aed" },
];

const tecnicos = [
  { nome: "Carlos Mendes", iniciais: "CM", total: 24, concluidas: 22, media: 18, ticket: 342, receita: 8208 },
  { nome: "Ana Ribeiro", iniciais: "AR", total: 18, concluidas: 16, media: 12, ticket: 280, receita: 4480 },
  { nome: "Pedro Atendente", iniciais: "PA", total: 6, concluidas: 5, media: 28, ticket: 195, receita: 975 },
];

const totalOS = osPorMes.reduce((s, v) => s + v, 0);
const totalConcluidas = osConcluidas.reduce((s, v) => s + v, 0);
const taxaConclusao = Math.round((totalConcluidas / totalOS) * 100);
const tempoMedioGlobal = Math.round(tecnicos.reduce((s, t) => s + t.media * t.total, 0) / tecnicos.reduce((s, t) => s + t.total, 0));

export default function OSRelatoriosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatório de Ordens de Serviço</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Jan – Jun 2026 · Dados de demonstração</p>
        </div>
        <Button variant="outline">
          <Download className="size-4" />
          Exportar PDF
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de OS", value: totalOS.toString(), sub: "no semestre", icon: ClipboardList, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
          { label: "Taxa de conclusão", value: `${taxaConclusao}%`, sub: `${totalConcluidas} concluídas`, icon: CheckCircle2, color: "var(--color-success)", bg: "var(--color-success-bg)" },
          { label: "Tempo médio", value: `${tempoMedioGlobal}h`, sub: "por OS", icon: Clock, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
          { label: "Receita gerada", value: formatCurrency(tecnicos.reduce((s, t) => s + t.receita, 0)), sub: "mão de obra + peças", icon: TrendingUp, color: "var(--color-info)", bg: "var(--color-info-bg)" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] mb-3" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
              <kpi.icon className="size-5" />
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de volume mensal */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">Volume de OS por mês</h2>
          <div className="flex gap-4 text-xs text-[var(--color-fg-muted)]">
            <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-[#2563eb]" /> Abertas</div>
            <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-[#16a34a]" /> Concluídas</div>
            <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-[#ef4444]" /> Canceladas</div>
          </div>
        </div>
        <p className="text-xs text-[var(--color-fg-muted)] mb-4">Jan–Jun 2026 · Passe o mouse para ver detalhes</p>
        <BarChart
          labels={meses}
          datasets={[
            { label: "Abertas", values: osPorMes, color: "#2563eb" },
            { label: "Concluídas", values: osConcluidas, color: "#16a34a" },
            { label: "Canceladas", values: osCanceladas, color: "#ef4444" },
          ]}
          height={220}
          formatValue={(v) => `${v} OS`}
        />
      </div>

      {/* Donut charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { titulo: "Por status atual", slices: porStatus },
          { titulo: "Por prioridade", slices: porPrioridade },
          { titulo: "Por origem", slices: porOrigem },
        ].map(({ titulo, slices }) => (
          <div key={titulo} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">{titulo}</h2>
            <DonutChart slices={slices} size={110} />
            <div className="mt-4 space-y-1.5">
              {slices.map((s) => {
                const total = slices.reduce((acc, x) => acc + x.value, 0);
                return (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-[var(--color-fg-muted)] text-xs">{s.label}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{s.value} <span className="font-normal text-[var(--color-fg-subtle)]">({Math.round((s.value/total)*100)}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desempenho por técnico */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-semibold">Desempenho por técnico — Junho 2026</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                {["Técnico", "Total OS", "Concluídas", "Taxa", "Tempo médio", "Ticket médio", "Receita"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {tecnicos.map((tec) => {
                const taxa = Math.round((tec.concluidas / tec.total) * 100);
                return (
                  <tr key={tec.nome} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-bold text-[var(--color-brand-700)]">
                          {tec.iniciais}
                        </div>
                        <span className="font-medium">{tec.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{tec.total}</td>
                    <td className="px-5 py-3 text-[var(--color-success)] font-semibold">{tec.concluidas}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
                          <div className="h-1.5 rounded-full bg-[var(--color-success)]" style={{ width: `${taxa}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{taxa}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--color-fg-muted)]">{tec.media}h</td>
                    <td className="px-5 py-3 font-semibold">{formatCurrency(tec.ticket)}</td>
                    <td className="px-5 py-3 font-bold text-[var(--color-success)]">{formatCurrency(tec.receita)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicadores de qualidade */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "OS retrabalho", value: "3", sub: "2,1% do total", icon: Wrench, color: "var(--color-danger)", bg: "var(--color-danger-bg)", ok: false },
          { label: "OS canceladas", value: osCanceladas.reduce((s,v)=>s+v,0).toString(), sub: `${Math.round(osCanceladas.reduce((s,v)=>s+v,0)/totalOS*100)}% do total`, icon: XCircle, color: "var(--color-warning)", bg: "var(--color-warning-bg)", ok: true },
          { label: "Satisfação NPS", value: "4.7★", sub: "baseado em 38 avaliações", icon: CheckCircle2, color: "var(--color-success)", bg: "var(--color-success-bg)", ok: true },
        ].map((item) => (
          <div key={item.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: item.bg, color: item.color }}>
              <item.icon className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-[var(--color-fg-subtle)]">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
