"use client";

import { useState } from "react";
import { Download, TrendingUp, TrendingDown, ClipboardList, Users, Wrench, Star, BarChart2, Target, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, DonutChart } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
const receitaMensal = [12500, 9800, 14200, 11300, 16800, 18750];
const despesaMensal = [6200, 5800, 7100, 6500, 7800, 8320];
const lucroMensal = receitaMensal.map((r, i) => r - despesaMensal[i]);
const osPorMes = [18, 24, 21, 28, 19, 26];
const osConcluidas = [15, 20, 18, 25, 17, 22];
const novosClientes = [4, 6, 3, 8, 5, 7];

const tabs = [
  { key: "geral", label: "Visão Geral" },
  { key: "os", label: "Ordens de Serviço" },
  { key: "financeiro", label: "Financeiro" },
  { key: "tecnicos", label: "Técnicos" },
  { key: "clientes", label: "Clientes" },
];

const tecnicos = [
  { nome: "Carlos Mendes", iniciais: "CM", os: 24, concluidas: 22, taxa: 92, ticket: 342, receita: 8208, avaliacao: 4.8 },
  { nome: "Ana Ribeiro", iniciais: "AR", os: 18, concluidas: 16, taxa: 89, ticket: 280, receita: 4480, avaliacao: 4.6 },
  { nome: "Pedro Atendente", iniciais: "PA", os: 6, concluidas: 5, taxa: 83, ticket: 195, receita: 975, avaliacao: 4.2 },
];

const receitaCategoria = [
  { label: "Mão de obra", value: 9840, color: "#2563eb" },
  { label: "Peças/componentes", value: 4750, color: "#7c3aed" },
  { label: "Contratos", value: 2650, color: "#16a34a" },
  { label: "Outros", value: 1510, color: "#d97706" },
];

const porStatus = [
  { label: "Em reparo", value: 8, color: "#2563eb" },
  { label: "Aguard. peças", value: 4, color: "#f59e0b" },
  { label: "Pronto", value: 5, color: "#16a34a" },
  { label: "Aguard. aprovação", value: 3, color: "#7c3aed" },
  { label: "Em diagnóstico", value: 6, color: "#0ea5e9" },
];

export default function RelatoriosPage() {
  const [aba, setAba] = useState("geral");
  const [periodo, setPeriodo] = useState("semestre");

  const receitaTotal = receitaMensal.reduce((s, v) => s + v, 0);
  const despesaTotal = despesaMensal.reduce((s, v) => s + v, 0);
  const lucroTotal = receitaTotal - despesaTotal;
  const margemBruta = Math.round((lucroTotal / receitaTotal) * 100);
  const totalOS = osPorMes.reduce((s, v) => s + v, 0);
  const totalConcluidas = osConcluidas.reduce((s, v) => s + v, 0);
  const taxaConclusao = Math.round((totalConcluidas / totalOS) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central de Relatórios</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Jan – Jun 2026 · Dados de demonstração</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
            {["semestre", "trimestre", "mes"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  periodo === p ? "bg-[var(--color-brand-600)] text-white" : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
                }`}
              >
                {p === "semestre" ? "6 meses" : p === "trimestre" ? "3 meses" : "Este mês"}
              </button>
            ))}
          </div>
          <Button variant="outline">
            <Download className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setAba(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              aba === t.key
                ? "border-[var(--color-brand-600)] text-[var(--color-brand-700)]"
                : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Aba: Visão Geral */}
      {aba === "geral" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Receita total", value: formatCurrency(receitaTotal), sub: "+12% vs período anterior", icon: TrendingUp, color: "var(--color-success)", bg: "var(--color-success-bg)" },
              { label: "Lucro bruto", value: formatCurrency(lucroTotal), sub: `Margem: ${margemBruta}%`, icon: Target, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
              { label: "OS realizadas", value: totalOS.toString(), sub: `${taxaConclusao}% concluídas`, icon: ClipboardList, color: "var(--color-info)", bg: "var(--color-info-bg)" },
              { label: "Novos clientes", value: novosClientes.reduce((s,v)=>s+v,0).toString(), sub: "no semestre", icon: Users, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] mb-3" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  <kpi.icon className="size-5" />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: kpi.color }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold mb-1">Evolução da receita</h2>
              <p className="text-xs text-[var(--color-fg-muted)] mb-4">Jan–Jun 2026</p>
              <LineChart
                labels={meses}
                datasets={[
                  { label: "Receita", values: receitaMensal, color: "#2563eb", fill: true },
                  { label: "Despesa", values: despesaMensal, color: "#ef4444", fill: false },
                  { label: "Lucro", values: lucroMensal, color: "#16a34a", fill: true },
                ]}
                height={200}
              />
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold mb-1">OS por mês</h2>
              <p className="text-xs text-[var(--color-fg-muted)] mb-4">Abertas vs concluídas</p>
              <BarChart
                labels={meses}
                datasets={[
                  { label: "Abertas", values: osPorMes, color: "#2563eb" },
                  { label: "Concluídas", values: osConcluidas, color: "#16a34a" },
                ]}
                height={200}
                formatValue={(v) => `${v} OS`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Aba: OS */}
      {aba === "os" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total abertas", value: totalOS.toString(), icon: ClipboardList, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
              { label: "Concluídas", value: totalConcluidas.toString(), icon: CheckCircle2, color: "var(--color-success)", bg: "var(--color-success-bg)" },
              { label: "Taxa conclusão", value: `${taxaConclusao}%`, icon: Target, color: "var(--color-info)", bg: "var(--color-info-bg)" },
              { label: "Tempo médio", value: "18h", icon: Clock, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] mb-3" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  <kpi.icon className="size-5" />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold mb-4">Por status atual</h2>
              <DonutChart slices={porStatus} size={120} />
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold mb-1">Volume mensal</h2>
              <p className="text-xs text-[var(--color-fg-muted)] mb-4">Jan–Jun 2026</p>
              <BarChart labels={meses} datasets={[{ label: "OS", values: osPorMes, color: "#2563eb" }]} height={200} formatValue={(v) => `${v} OS`} />
            </div>
          </div>
        </div>
      )}

      {/* Aba: Financeiro */}
      {aba === "financeiro" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Receita total", value: formatCurrency(receitaTotal), icon: TrendingUp, color: "var(--color-success)", bg: "var(--color-success-bg)" },
              { label: "Despesa total", value: formatCurrency(despesaTotal), icon: TrendingDown, color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
              { label: "Lucro bruto", value: formatCurrency(lucroTotal), icon: Target, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
              { label: "Margem bruta", value: `${margemBruta}%`, icon: BarChart2, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] mb-3" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  <kpi.icon className="size-5" />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold mb-4">Receita vs Despesa vs Lucro</h2>
              <LineChart
                labels={meses}
                datasets={[
                  { label: "Receita", values: receitaMensal, color: "#2563eb", fill: true },
                  { label: "Despesa", values: despesaMensal, color: "#ef4444", fill: false },
                  { label: "Lucro", values: lucroMensal, color: "#16a34a", fill: true },
                ]}
                height={220}
              />
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold mb-4">Por categoria</h2>
              <DonutChart slices={receitaCategoria} size={130} />
              <div className="mt-4 space-y-2">
                {receitaCategoria.map((c) => (
                  <div key={c.label} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[var(--color-fg-muted)]">{c.label}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba: Técnicos */}
      {aba === "tecnicos" && (
        <div className="space-y-6">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-semibold">Desempenho por técnico — Jun 2026</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                    {["Técnico","OS","Concluídas","Taxa","Ticket médio","Receita","Avaliação"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {tecnicos.map((tec) => (
                    <tr key={tec.nome} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-bold text-[var(--color-brand-700)]">{tec.iniciais}</div>
                          <span className="font-medium">{tec.nome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold">{tec.os}</td>
                      <td className="px-5 py-3 text-[var(--color-success)] font-semibold">{tec.concluidas}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
                            <div className="h-1.5 rounded-full bg-[var(--color-success)]" style={{ width: `${tec.taxa}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{tec.taxa}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold">{formatCurrency(tec.ticket)}</td>
                      <td className="px-5 py-3 font-bold text-[var(--color-success)]">{formatCurrency(tec.receita)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="size-3.5 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                          <span className="font-semibold">{tec.avaliacao}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aba: Clientes */}
      {aba === "clientes" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total de clientes", value: "38", icon: Users, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
              { label: "Novos no semestre", value: novosClientes.reduce((s,v)=>s+v,0).toString(), icon: TrendingUp, color: "var(--color-success)", bg: "var(--color-success-bg)" },
              { label: "Ticket médio/cliente", value: formatCurrency(Math.round(receitaTotal/38)), icon: Target, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)]" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  <kpi.icon className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="font-semibold mb-1">Novos clientes por mês</h2>
            <p className="text-xs text-[var(--color-fg-muted)] mb-4">Jan–Jun 2026</p>
            <BarChart
              labels={meses}
              datasets={[{ label: "Novos clientes", values: novosClientes, color: "#2563eb" }]}
              height={200}
              formatValue={(v) => `${v} clientes`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
