"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type TransacaoRow = {
  id: string;
  tipo: "receita" | "despesa";
  categoria: string;
  descricao: string;
  valor: number | string;
  data: string;
  status: string;
  metodo_pagamento?: string | null;
  ordens_servico?: { numero: string } | null;
  clientes?: { nome: string } | null;
};

export function FinanceiroListClient({ initialData }: { initialData: TransacaoRow[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const filtrados = useMemo(() => {
    let lista = initialData;
    if (filtro === "receitas") lista = lista.filter(t => t.tipo === "receita");
    if (filtro === "despesas") lista = lista.filter(t => t.tipo === "despesa");
    if (filtro === "pendentes") lista = lista.filter(t => t.status === "pendente");
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(t =>
        t.descricao.toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q) ||
        (t.clientes?.nome ?? "").toLowerCase().includes(q) ||
        (t.ordens_servico?.numero ?? "").toLowerCase().includes(q)
      );
    }
    return lista;
  }, [initialData, busca, filtro]);

  const statusColors: Record<string, string> = {
    confirmado: "text-[var(--color-success)] bg-[var(--color-success-bg)]",
    pendente:   "text-[var(--color-warning)] bg-[var(--color-warning-bg)]",
    cancelado:  "text-[var(--color-fg-subtle)] bg-[var(--color-surface-muted)]",
  };

  const statusLabels: Record<string, string> = {
    confirmado: "Confirmado",
    pendente:   "Pendente",
    cancelado:  "Cancelado",
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {[
            { key: "todas",    label: "Todas" },
            { key: "receitas", label: "Receitas" },
            { key: "despesas", label: "Despesas" },
            { key: "pendentes", label: "Pendentes" },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                filtro === f.key
                  ? "border-[var(--color-brand-600)] text-[var(--color-brand-700)]"
                  : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar transação..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-8 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]" />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="size-3.5 text-[var(--color-fg-subtle)]" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Descrição</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] sm:table-cell">Data</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--color-fg-muted)]">
                    {busca ? `Nenhuma transação encontrada para "${busca}"` : "Nenhuma transação no período"}
                  </td>
                </tr>
              ) : filtrados.map(t => (
                <tr key={t.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      t.tipo === "receita" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                    }`}>
                      {t.tipo === "receita"
                        ? <TrendingUp className="size-3.5" />
                        : <TrendingDown className="size-3.5" />}
                      {t.tipo === "receita" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/financeiro/${t.id}`} className="font-medium hover:text-[var(--color-brand-600)] hover:underline">
                      {t.descricao}
                    </Link>
                    {t.ordens_servico && (
                      <span className="ml-1.5 text-xs text-[var(--color-fg-subtle)]">· {t.ordens_servico.numero}</span>
                    )}
                    {t.clientes && (
                      <span className="ml-1.5 text-xs text-[var(--color-fg-subtle)]">· {t.clientes.nome}</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">{t.categoria}</td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] sm:table-cell">{formatDate(t.data)}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[t.status] ?? ""}`}>
                      {statusLabels[t.status] ?? t.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    t.tipo === "receita" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                  }`}>
                    {t.tipo === "receita" ? "+" : "−"}{formatCurrency(Number(t.valor))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
            {filtrados.length} transaç{filtrados.length !== 1 ? "ões" : "ão"}
          </div>
        )}
      </div>
    </>
  );
}
