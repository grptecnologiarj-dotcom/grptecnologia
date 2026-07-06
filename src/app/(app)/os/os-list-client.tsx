"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type OSRow = {
  id: string;
  numero: string;
  status: string;
  prioridade: string;
  valor_total: number | string;
  data_abertura: string;
  data_previsao?: string | null;
  clientes?: { nome: string } | null;
  equipamentos?: { nome: string } | null;
  usuarios?: { nome: string } | null;
};

type Props = {
  initialData: OSRow[];
  statusOSConfig: Record<string, { label: string; bg: string; color: string }>;
  prioridadeOSConfig: Record<string, { label: string; color: string }>;
  statusAberto: string[];
};

const filtros = [
  { key: "todas",     label: "Todas" },
  { key: "abertas",   label: "Em aberto" },
  { key: "prontas",   label: "Prontas" },
  { key: "entregues", label: "Entregues" },
];

export function OSListClient({ initialData, statusOSConfig, prioridadeOSConfig, statusAberto }: Props) {
  const [filtroAtivo, setFiltroAtivo] = useState("todas");
  const [busca, setBusca] = useState("");

  const contadores = useMemo(() => ({
    todas:     initialData.length,
    abertas:   initialData.filter(o => statusAberto.includes(o.status)).length,
    prontas:   initialData.filter(o => o.status === "pronto").length,
    entregues: initialData.filter(o => o.status === "entregue").length,
  }), [initialData, statusAberto]);

  const osFiltradas = useMemo(() => {
    let lista = initialData;
    if (filtroAtivo === "abertas")   lista = lista.filter(o => statusAberto.includes(o.status));
    if (filtroAtivo === "prontas")   lista = lista.filter(o => o.status === "pronto");
    if (filtroAtivo === "entregues") lista = lista.filter(o => o.status === "entregue");
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(o =>
        o.numero.toLowerCase().includes(q) ||
        (o.clientes?.nome ?? "").toLowerCase().includes(q) ||
        (o.equipamentos?.nome ?? "").toLowerCase().includes(q) ||
        (o.usuarios?.nome ?? "").toLowerCase().includes(q)
      );
    }
    return lista;
  }, [initialData, filtroAtivo, busca, statusAberto]);

  return (
    <>
      {/* Filtros por aba */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">
        {filtros.map(f => {
          const count = contadores[f.key as keyof typeof contadores];
          const ativo = f.key === filtroAtivo;
          return (
            <button
              key={f.key}
              onClick={() => setFiltroAtivo(f.key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                ativo
                  ? "border-[var(--color-brand-600)] text-[var(--color-brand-700)]"
                  : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                ativo
                  ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)]"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por número, cliente ou equipamento..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-10 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        />
        {busca && (
          <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Número</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Cliente</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Equipamento</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Técnico</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Prioridade</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] sm:table-cell">Abertura</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] xl:table-cell">Previsão</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {osFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-[var(--color-fg-muted)]">
                    {busca ? `Nenhuma OS encontrada para "${busca}"` : "Nenhuma OS neste filtro"}
                  </td>
                </tr>
              ) : osFiltradas.map(os => {
                const cfg = statusOSConfig[os.status] ?? { label: os.status, bg: "var(--color-surface-muted)", color: "var(--color-fg)" };
                const prio = prioridadeOSConfig[os.prioridade] ?? { label: os.prioridade, color: "var(--color-fg)" };
                const atrasada = os.data_previsao && new Date(os.data_previsao) < new Date() && statusAberto.includes(os.status);
                return (
                  <tr key={os.id} className={`transition-colors hover:bg-[var(--color-surface-muted)] ${atrasada ? "bg-[var(--color-danger-bg)]/30" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/os/${os.id}`} className="font-semibold text-[var(--color-brand-600)] hover:underline">
                        {os.numero}
                      </Link>
                      {atrasada && <span className="ml-1.5 text-[10px] font-bold text-[var(--color-danger)]">ATRASADA</span>}
                    </td>
                    <td className="px-4 py-3 font-medium">{os.clientes?.nome ?? "—"}</td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">{os.equipamentos?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] lg:table-cell">
                      {os.usuarios?.nome ?? <span className="text-[var(--color-fg-subtle)]">—</span>}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-xs font-medium" style={{ color: prio.color }}>{prio.label}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] sm:table-cell">{formatDate(os.data_abertura)}</td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      {os.data_previsao ? (
                        <span className={atrasada ? "font-semibold text-[var(--color-danger)]" : "text-[var(--color-fg-subtle)]"}>
                          {formatDate(os.data_previsao)}
                        </span>
                      ) : <span className="text-[var(--color-fg-subtle)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(os.valor_total) > 0 ? formatCurrency(Number(os.valor_total)) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {osFiltradas.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
            {osFiltradas.length} OS exibida{osFiltradas.length !== 1 ? "s" : ""}
            {busca && ` · filtrado por "${busca}"`}
          </div>
        )}
      </div>
    </>
  );
}
