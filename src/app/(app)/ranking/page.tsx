"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy, Medal, Star, TrendingUp, TrendingDown,
  Clock, CheckCircle2, Wrench, ArrowLeft, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Demo data ────────────────────────────────────────────── */
const PERIODOS = ["Semana", "Mês", "Trimestre", "Ano"] as const;
type Periodo = typeof PERIODOS[number];

const BASE_TECNICOS = [
  {
    id: "tech-1",
    nome: "Carlos Mendes",
    avatar: "CM",
    cargo: "Técnico Sênior",
    cor: "var(--color-brand-600)",
    bg: "var(--color-brand-100)",
    stats: {
      Semana:    { os: 12, concluidas: 11, tempoMedio: 2.1, avaliacaoMedia: 4.9, receita: 4200, naoCompareceu: 0 },
      Mês:       { os: 48, concluidas: 45, tempoMedio: 2.3, avaliacaoMedia: 4.8, receita: 16800, naoCompareceu: 1 },
      Trimestre: { os: 142, concluidas: 135, tempoMedio: 2.4, avaliacaoMedia: 4.8, receita: 51200, naoCompareceu: 2 },
      Ano:       { os: 523, concluidas: 490, tempoMedio: 2.5, avaliacaoMedia: 4.7, receita: 192000, naoCompareceu: 8 },
    },
  },
  {
    id: "tech-2",
    nome: "Ana Ribeiro",
    avatar: "AR",
    cargo: "Técnica Plena",
    cor: "var(--color-success)",
    bg: "#dcfce7",
    stats: {
      Semana:    { os: 9, concluidas: 9, tempoMedio: 1.8, avaliacaoMedia: 5.0, receita: 3600, naoCompareceu: 0 },
      Mês:       { os: 38, concluidas: 38, tempoMedio: 1.9, avaliacaoMedia: 4.9, receita: 14200, naoCompareceu: 0 },
      Trimestre: { os: 112, concluidas: 110, tempoMedio: 2.0, avaliacaoMedia: 4.9, receita: 43800, naoCompareceu: 0 },
      Ano:       { os: 408, concluidas: 400, tempoMedio: 2.0, avaliacaoMedia: 4.9, receita: 162000, naoCompareceu: 1 },
    },
  },
  {
    id: "tech-3",
    nome: "Pedro Sousa",
    avatar: "PS",
    cargo: "Técnico Júnior",
    cor: "var(--color-info)",
    bg: "#dbeafe",
    stats: {
      Semana:    { os: 6, concluidas: 5, tempoMedio: 3.4, avaliacaoMedia: 4.3, receita: 1800, naoCompareceu: 1 },
      Mês:       { os: 24, concluidas: 20, tempoMedio: 3.6, avaliacaoMedia: 4.4, receita: 7200, naoCompareceu: 2 },
      Trimestre: { os: 71, concluidas: 60, tempoMedio: 3.5, avaliacaoMedia: 4.5, receita: 22400, naoCompareceu: 4 },
      Ano:       { os: 241, concluidas: 210, tempoMedio: 3.6, avaliacaoMedia: 4.4, receita: 79000, naoCompareceu: 12 },
    },
  },
  {
    id: "tech-4",
    nome: "Mariana Oliveira",
    avatar: "MO",
    cargo: "Técnica Plena",
    cor: "var(--color-warning)",
    bg: "#fef9c3",
    stats: {
      Semana:    { os: 8, concluidas: 7, tempoMedio: 2.6, avaliacaoMedia: 4.6, receita: 2900, naoCompareceu: 0 },
      Mês:       { os: 31, concluidas: 29, tempoMedio: 2.7, avaliacaoMedia: 4.7, receita: 11200, naoCompareceu: 1 },
      Trimestre: { os: 94, concluidas: 88, tempoMedio: 2.8, avaliacaoMedia: 4.6, receita: 34600, naoCompareceu: 2 },
      Ano:       { os: 347, concluidas: 320, tempoMedio: 2.8, avaliacaoMedia: 4.6, receita: 126000, naoCompareceu: 7 },
    },
  },
];

/* ─── Scoring ────────────────────────────────────────────────── */
function score(stats: (typeof BASE_TECNICOS)[0]["stats"][Periodo]): number {
  const taxa = stats.os > 0 ? (stats.concluidas / stats.os) * 100 : 0;
  return Math.round(
    taxa * 0.35 +
    stats.avaliacaoMedia * 10 * 0.35 +
    Math.min(stats.os * 2, 40) * 0.2 +
    Math.max(0, 10 - stats.tempoMedio * 2) * 0.1
  );
}

const medalConfig = [
  { icon: Crown, color: "#f59e0b", label: "1º lugar" },
  { icon: Medal, color: "#94a3b8", label: "2º lugar" },
  { icon: Medal, color: "#b45309", label: "3º lugar" },
];

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`size-3 ${s <= Math.round(value) ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : "text-[var(--color-border)]"}`}
        />
      ))}
      <span className="text-xs font-semibold ml-0.5">{value.toFixed(1)}</span>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function RankingPage() {
  const [periodo, setPeriodo] = useState<Periodo>("Mês");

  const ranked = useMemo(() => {
    return [...BASE_TECNICOS]
      .map((t) => ({ ...t, score: score(t.stats[periodo]), stats: t.stats[periodo] }))
      .sort((a, b) => b.score - a.score);
  }, [periodo]);

  const leader = ranked[0];
  const maxScore = leader.score;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-warning-bg)]">
            <Trophy className="size-5 text-[var(--color-warning)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ranking de Técnicos</h1>
            <p className="text-sm text-[var(--color-fg-muted)]">Desempenho da equipe em números</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition-colors ${
                periodo === p
                  ? "bg-[var(--color-brand-600)] text-white"
                  : "border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Pódio */}
      <div className="grid grid-cols-3 gap-4">
        {ranked.slice(0, 3).map((t, i) => {
          const medal = medalConfig[i];
          const MedalIcon = medal.icon;
          return (
            <div
              key={t.id}
              className={`relative flex flex-col items-center rounded-[var(--radius-lg)] border p-5 shadow-sm text-center transition-all ${
                i === 0
                  ? "border-[#f59e0b]/40 bg-gradient-to-b from-[#fef9c3] to-[var(--color-surface)] row-start-1"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              <MedalIcon className="size-7 mb-3" style={{ color: medal.color }} />
              <div
                className="flex size-14 items-center justify-center rounded-full text-lg font-black mb-2"
                style={{ backgroundColor: t.bg, color: t.cor }}
              >
                {t.avatar}
              </div>
              <p className="font-bold text-sm leading-tight">{t.nome}</p>
              <p className="text-[10px] text-[var(--color-fg-subtle)] mb-3">{t.cargo}</p>

              {/* Score bar */}
              <div className="w-full">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--color-fg-subtle)]">Score</span>
                  <span className="font-black" style={{ color: t.cor }}>{t.score}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--color-surface-muted)]">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${(t.score / maxScore) * 100}%`, backgroundColor: t.cor }}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-2">
                  <p className="text-lg font-bold">{t.stats.concluidas}</p>
                  <p className="text-[10px] text-[var(--color-fg-subtle)]">OS concluídas</p>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-2">
                  <p className="text-lg font-bold">{t.stats.avaliacaoMedia.toFixed(1)}</p>
                  <p className="text-[10px] text-[var(--color-fg-subtle)]">Avaliação</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela completa */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-5 py-3">
          <h2 className="font-semibold text-sm">Comparativo completo — {periodo}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-fg-subtle)]">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-fg-subtle)]">Técnico</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-[var(--color-fg-subtle)]">OS Total</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-[var(--color-fg-subtle)]">Taxa conclusão</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-[var(--color-fg-subtle)]">Tempo médio</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-[var(--color-fg-subtle)]">Avaliação</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-[var(--color-fg-subtle)]">Receita gerada</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-[var(--color-fg-subtle)]">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {ranked.map((t, i) => {
                const taxa = t.stats.os > 0 ? Math.round((t.stats.concluidas / t.stats.os) * 100) : 0;
                const MedalIcon = i < 3 ? medalConfig[i].icon : null;
                return (
                  <tr key={t.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3 text-center font-bold text-[var(--color-fg-subtle)]">
                      {MedalIcon
                        ? <MedalIcon className="mx-auto size-4" style={{ color: medalConfig[i].color }} />
                        : i + 1
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ backgroundColor: t.bg, color: t.cor }}
                        >
                          {t.avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{t.nome}</p>
                          <p className="text-[11px] text-[var(--color-fg-subtle)]">{t.cargo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold">{t.stats.concluidas}</span>
                      <span className="text-[var(--color-fg-subtle)]">/{t.stats.os}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-bold ${taxa >= 90 ? "text-[var(--color-success)]" : taxa >= 70 ? "text-[var(--color-warning)]" : "text-[var(--color-danger)]"}`}>
                          {taxa}%
                        </span>
                        <div className="h-1 w-16 rounded-full bg-[var(--color-surface-muted)]">
                          <div
                            className={`h-1 rounded-full ${taxa >= 90 ? "bg-[var(--color-success)]" : taxa >= 70 ? "bg-[var(--color-warning)]" : "bg-[var(--color-danger)]"}`}
                            style={{ width: `${taxa}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="size-3 text-[var(--color-fg-subtle)]" />
                        <span className="text-xs">{t.stats.tempoMedio.toFixed(1)}h</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StarRow value={t.stats.avaliacaoMedia} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[var(--color-success)]">
                      {formatCurrency(t.stats.receita)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-black" style={{ color: t.cor }}>{t.score}</span>
                        <div className="h-1.5 w-14 rounded-full bg-[var(--color-surface-muted)]">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${(t.score / maxScore) * 100}%`, backgroundColor: t.cor }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-[var(--color-success)]" />
            <p className="text-xs font-semibold text-[var(--color-success)]">Melhor avaliação</p>
          </div>
          <p className="font-bold">{ranked.reduce((a, b) => a.stats.avaliacaoMedia > b.stats.avaliacaoMedia ? a : b).nome}</p>
          <p className="text-xs text-[var(--color-fg-muted)]">Avaliação média de clientes</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="size-4 text-[var(--color-brand-600)]" />
            <p className="text-xs font-semibold text-[var(--color-brand-600)]">Mais OS no período</p>
          </div>
          <p className="font-bold">{ranked.reduce((a, b) => a.stats.os > b.stats.os ? a : b).nome}</p>
          <p className="text-xs text-[var(--color-fg-muted)]">{Math.max(...ranked.map(t => t.stats.os))} ordens de serviço</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-info)]/30 bg-[var(--color-info-bg)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-[var(--color-info)]" />
            <p className="text-xs font-semibold text-[var(--color-info)]">Mais rápido</p>
          </div>
          <p className="font-bold">{ranked.reduce((a, b) => a.stats.tempoMedio < b.stats.tempoMedio ? a : b).nome}</p>
          <p className="text-xs text-[var(--color-fg-muted)]">Menor tempo médio por OS</p>
        </div>
      </div>

      <p className="text-center text-xs text-[var(--color-fg-subtle)]">
        Score calculado com base em: taxa de conclusão (35%) · avaliação do cliente (35%) · volume (20%) · velocidade (10%)
      </p>
    </div>
  );
}
