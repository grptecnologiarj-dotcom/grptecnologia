import { TrendingUp, TrendingDown, BarChart2, Target, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, DonutChart } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Relatórios Financeiros — DeskControl" };

const receitaMensal = [12500, 9800, 14200, 11300, 16800, 18750];
const despesaMensal = [6200, 5800, 7100, 6500, 7800, 8320];
const lucroMensal = receitaMensal.map((r, i) => r - despesaMensal[i]);
const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

const categorias = [
  { label: "Mão de obra", value: 9840, color: "#2563eb" },
  { label: "Peças/componentes", value: 4750, color: "#7c3aed" },
  { label: "Contratos", value: 2650, color: "#16a34a" },
  { label: "Outros", value: 1510, color: "#d97706" },
];

const tecnicos = [
  { nome: "Carlos Mendes", os: 24, receita: 8400, ticket: 350, avatar: "CM", pct: 52 },
  { nome: "Ana Ribeiro", os: 18, receita: 6300, ticket: 350, avatar: "AR", pct: 38 },
  { nome: "Pedro Atendente", os: 6, receita: 2050, ticket: 341, avatar: "PA", pct: 12 },
];

export default function RelatoriosPage() {
  const receitaTotal = receitaMensal.reduce((s, v) => s + v, 0);
  const despesaTotal = despesaMensal.reduce((s, v) => s + v, 0);
  const lucroBruto = receitaTotal - despesaTotal;
  const margemBruta = Math.round((lucroBruto / receitaTotal) * 100);
  const crescimento = Math.round(((receitaMensal[5] - receitaMensal[0]) / receitaMensal[0]) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Jan – Jun 2026 · Dados de demonstração</p>
        </div>
        <Button variant="outline">
          <Download className="size-4" />
          Exportar PDF
        </Button>
      </div>

      {/* KPIs semestral */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Receita total", value: formatCurrency(receitaTotal), sub: `+${crescimento}% vs jan`, icon: TrendingUp, color: "var(--color-success)", bg: "var(--color-success-bg)" },
          { label: "Despesa total", value: formatCurrency(despesaTotal), sub: "6 meses acumulado", icon: TrendingDown, color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
          { label: "Lucro bruto", value: formatCurrency(lucroBruto), sub: "Sem impostos", icon: Target, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
          { label: "Margem bruta", value: `${margemBruta}%`, sub: "Meta: 50%", icon: BarChart2, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)]" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                <kpi.icon className="size-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: kpi.color }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de linha interativo — Receita vs Despesa vs Lucro */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Evolução financeira — Jan a Jun 2026</h2>
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">Passe o mouse sobre o gráfico para ver os valores</p>
          </div>
          <div className="flex gap-4 text-xs text-[var(--color-fg-muted)]">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-[#2563eb]" /> Receita
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-[#ef4444]" /> Despesa
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-[#16a34a]" /> Lucro
            </div>
          </div>
        </div>
        <LineChart
          labels={meses}
          datasets={[
            { label: "Receita", values: receitaMensal, color: "#2563eb", fill: true },
            { label: "Despesa", values: despesaMensal, color: "#ef4444", fill: false },
            { label: "Lucro", values: lucroMensal, color: "#16a34a", fill: true },
          ]}
          height={240}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receita por categoria — Donut interativo */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Receita por categoria</h2>
          <DonutChart slices={categorias} size={140} />
          <div className="mt-4 space-y-2">
            {categorias.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[var(--color-fg-muted)]">{cat.label}</span>
                </div>
                <span className="font-semibold">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho por técnico */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Desempenho por técnico</h2>
          <div className="space-y-4">
            {tecnicos.map((tec) => (
              <div key={tec.nome} className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-bold text-[var(--color-brand-700)]">
                      {tec.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tec.nome}</p>
                      <p className="text-[11px] text-[var(--color-fg-subtle)]">{tec.os} OS · ticket {formatCurrency(tec.ticket)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-success)]">{formatCurrency(tec.receita)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-surface)]">
                  <div
                    className="h-1.5 rounded-full bg-[var(--color-brand-500)] transition-all"
                    style={{ width: `${tec.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--color-fg-subtle)] mt-1">{tec.pct}% da receita total</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela DRE simplificado */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold">DRE Simplificado — Junho 2026</h2>
          <span className="text-xs text-[var(--color-fg-subtle)]">Competência: Jun/2026</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {[
            { label: "Receita bruta de serviços", valor: 18750, tipo: "receita" },
            { label: "(-) Custos com peças/materiais", valor: 5200, tipo: "custo" },
            { label: "Receita líquida (Lucro Bruto)", valor: 13550, tipo: "total" },
            { label: "(-) Despesas operacionais (pessoal)", valor: 6000, tipo: "custo" },
            { label: "(-) Despesas fixas (aluguel, util.)", valor: 2320, tipo: "custo" },
            { label: "Resultado operacional (EBITDA)", valor: 5230, tipo: "total" },
          ].map((linha) => (
            <div
              key={linha.label}
              className={`flex items-center justify-between px-5 py-3 ${linha.tipo === "total" ? "bg-[var(--color-surface-muted)]" : ""}`}
            >
              <span className={`text-sm ${linha.tipo === "total" ? "font-semibold" : ""}`}>{linha.label}</span>
              <span className={`text-sm font-semibold tabular-nums ${linha.tipo === "custo" ? "text-[var(--color-danger)]" : linha.tipo === "total" ? "text-[var(--color-success)]" : ""}`}>
                {linha.tipo === "custo" ? "−" : ""}{formatCurrency(linha.valor)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
