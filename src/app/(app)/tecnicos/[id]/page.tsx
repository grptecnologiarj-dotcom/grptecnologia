import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Wrench, TrendingUp, Clock, Award, Edit, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TecnicoCharts } from "./tecnico-charts";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tec = tecnicos.find((t) => t.id === id);
  return { title: tec ? `${tec.nome} — DeskControl` : "Técnico não encontrado" };
}

const tecnicos = [
  {
    id: "tec-1",
    nome: "Carlos Mendes",
    email: "carlos@techrepair.com",
    especialidades: ["Notebooks", "Placas-mãe", "Soldagem"],
    status: "ativo" as const,
    usuarioId: "usr-1",
    avaliacao: 4.8,
    totalOS: 127,
    osConcluidas: 119,
    osEmAndamento: 3,
    ticketMedio: 342,
    receitaTotal: 43434,
    tempoMedioHoras: 18,
    produtividadeMensal: [18, 24, 21, 28, 19, 24],
    receitaMensal: [6300, 8400, 7350, 9800, 6650, 8400],
  },
  {
    id: "tec-2",
    nome: "Ana Ribeiro",
    email: "ana@techrepair.com",
    especialidades: ["Smartphones", "Telas", "Diagnósticos"],
    status: "ativo" as const,
    usuarioId: "usr-2",
    avaliacao: 4.6,
    totalOS: 98,
    osConcluidas: 90,
    osEmAndamento: 2,
    ticketMedio: 280,
    receitaTotal: 27440,
    tempoMedioHoras: 12,
    produtividadeMensal: [14, 18, 16, 21, 15, 18],
    receitaMensal: [3920, 5040, 4480, 5880, 4200, 5040],
  },
  {
    id: "tec-3",
    nome: "Pedro Atendente",
    email: "pedro@techrepair.com",
    especialidades: ["Impressoras", "Periféricos", "Suporte"],
    status: "inativo" as const,
    usuarioId: "usr-3",
    avaliacao: 4.2,
    totalOS: 45,
    osConcluidas: 40,
    osEmAndamento: 0,
    ticketMedio: 195,
    receitaTotal: 8775,
    tempoMedioHoras: 24,
    produtividadeMensal: [6, 8, 7, 9, 6, 8],
    receitaMensal: [1170, 1560, 1365, 1755, 1170, 1560],
  },
];

export default async function TecnicoPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tec = tecnicos.find((t) => t.id === id) ?? (id === "demo" ? tecnicos[0] : null);
  if (!tec) return notFound();

  const taxaConclusao = Math.round((tec.osConcluidas / tec.totalOS) * 100);
  const iniciais = tec.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Voltar */}
      <div>
        <Link
          href="/usuarios"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Voltar para Usuários
        </Link>
      </div>

      {/* Card de perfil */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-2xl font-bold text-white">
            {iniciais}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{tec.nome}</h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  tec.status === "ativo"
                    ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-fg-muted)]"
                }`}
              >
                {tec.status === "ativo" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {tec.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="text-sm text-[var(--color-fg-muted)] mt-0.5">{tec.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < Math.floor(tec.avaliacao) ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : "text-[var(--color-border)]"}`}
                />
              ))}
              <span className="text-sm font-semibold ml-1">{tec.avaliacao}</span>
              <span className="text-xs text-[var(--color-fg-subtle)]">· média das avaliações</span>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {tec.especialidades.map((esp) => (
                <span key={esp} className="rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                  {esp}
                </span>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/usuarios/${tec.usuarioId}/editar`}>
              <Edit className="size-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de OS", value: tec.totalOS, icon: Wrench, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
          { label: "Taxa de conclusão", value: `${taxaConclusao}%`, icon: TrendingUp, color: "var(--color-success)", bg: "var(--color-success-bg)" },
          { label: "Ticket médio", value: formatCurrency(tec.ticketMedio), icon: Award, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
          { label: "Tempo médio", value: `${tec.tempoMedioHoras}h`, icon: Clock, color: "var(--color-info)", bg: "var(--color-info-bg)" },
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

      <TecnicoCharts
        produtividadeMensal={tec.produtividadeMensal}
        receitaMensal={tec.receitaMensal}
        receitaTotal={tec.receitaTotal}
      />

      {/* Resumo de status */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Status das OS</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Concluídas", value: tec.osConcluidas, color: "var(--color-success)" },
            { label: "Em andamento", value: tec.osEmAndamento, color: "var(--color-brand-600)" },
            { label: "Pendentes", value: tec.totalOS - tec.osConcluidas - tec.osEmAndamento, color: "var(--color-warning)" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-4">
              <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-[var(--color-fg-subtle)] mb-1">
            <span>Taxa de conclusão</span>
            <span>{taxaConclusao}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
            <div
              className="h-2 rounded-full bg-[var(--color-success)] transition-all"
              style={{ width: `${taxaConclusao}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
