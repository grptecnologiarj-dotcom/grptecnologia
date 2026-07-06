import Link from "next/link";
import { Users, Star, TrendingUp, Clock, Award, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Técnicos — DeskControl" };

const tecnicos = [
  {
    id: "tec-1",
    nome: "Carlos Mendes",
    email: "carlos@techrepair.com",
    especialidades: ["Notebooks", "Placas-mãe", "Soldagem"],
    status: "ativo",
    avaliacao: 4.8,
    totalOS: 127,
    osConcluidas: 119,
    osEmAndamento: 3,
    ticketMedio: 342,
    receitaMes: 8400,
  },
  {
    id: "tec-2",
    nome: "Ana Ribeiro",
    email: "ana@techrepair.com",
    especialidades: ["Smartphones", "Telas", "Diagnósticos"],
    status: "ativo",
    avaliacao: 4.6,
    totalOS: 98,
    osConcluidas: 90,
    osEmAndamento: 2,
    ticketMedio: 280,
    receitaMes: 6300,
  },
  {
    id: "tec-3",
    nome: "Pedro Atendente",
    email: "pedro@techrepair.com",
    especialidades: ["Impressoras", "Periféricos", "Suporte"],
    status: "inativo",
    avaliacao: 4.2,
    totalOS: 45,
    osConcluidas: 40,
    osEmAndamento: 0,
    ticketMedio: 195,
    receitaMes: 0,
  },
];

export default function TecnicosPage() {
  const ativos = tecnicos.filter((t) => t.status === "ativo");
  const totalOS = tecnicos.reduce((s, t) => s + t.totalOS, 0);
  const receitaTotal = tecnicos.reduce((s, t) => s + t.receitaMes, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Técnicos</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{ativos.length} ativos · {tecnicos.length} total</p>
        </div>
        <Button asChild>
          <Link href="/usuarios/novo">
            <Plus className="size-4" />
            Novo técnico
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Técnicos ativos", value: ativos.length.toString(), icon: Users, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
          { label: "OS este mês", value: totalOS.toString(), icon: TrendingUp, color: "var(--color-success)", bg: "var(--color-success-bg)" },
          { label: "Receita do mês", value: formatCurrency(receitaTotal), icon: Award, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
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

      {/* Lista de técnicos */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-semibold">Equipe técnica</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {tecnicos.map((tec) => {
            const taxaConclusao = Math.round((tec.osConcluidas / tec.totalOS) * 100);
            const iniciais = tec.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <Link
                key={tec.id}
                href={`/tecnicos/${tec.id}`}
                className="group flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {/* Avatar */}
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-white text-sm ${
                  tec.status === "ativo" ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)]" : "bg-[var(--color-fg-subtle)]"
                }`}>
                  {iniciais}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold group-hover:text-[var(--color-brand-700)] transition-colors">{tec.nome}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      tec.status === "ativo" ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--color-surface-muted)] text-[var(--color-fg-muted)]"
                    }`}>
                      {tec.status === "ativo" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{tec.especialidades.join(" · ")}</p>

                  {/* Barra de taxa conclusão */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-[var(--color-success)]"
                        style={{ width: `${taxaConclusao}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-fg-subtle)]">{taxaConclusao}% conclusão</span>
                  </div>
                </div>

                {/* Métricas */}
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold">{tec.totalOS}</p>
                    <p className="text-[10px] text-[var(--color-fg-subtle)]">OS total</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-0.5 justify-center">
                      <Star className="size-3 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                      <p className="text-lg font-bold">{tec.avaliacao}</p>
                    </div>
                    <p className="text-[10px] text-[var(--color-fg-subtle)]">avaliação</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--color-success)]">{formatCurrency(tec.ticketMedio)}</p>
                    <p className="text-[10px] text-[var(--color-fg-subtle)]">ticket médio</p>
                  </div>
                  {tec.osEmAndamento > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-2.5 py-1">
                      <Clock className="size-3 text-[var(--color-brand-600)]" />
                      <span className="text-xs font-semibold text-[var(--color-brand-700)]">{tec.osEmAndamento} ativas</span>
                    </div>
                  )}
                </div>

                <ChevronRight className="size-4 shrink-0 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-brand-600)] transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
