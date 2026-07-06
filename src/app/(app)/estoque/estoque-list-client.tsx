"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type EstoqueRow = {
  id: string;
  nome: string;
  categoria?: string | null;
  marca?: string | null;
  quantidade: number | string;
  quantidade_minima: number | string;
  preco_custo: number | string;
  preco_venda: number | string;
  localizacao?: string | null;
};

export function EstoqueListClient({ initialData }: { initialData: EstoqueRow[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const filtrados = useMemo(() => {
    let lista = initialData;

    if (filtro === "criticos") lista = lista.filter(i => Number(i.quantidade) > 0 && Number(i.quantidade) <= Number(i.quantidade_minima));
    if (filtro === "zerados")  lista = lista.filter(i => Number(i.quantidade) <= 0);

    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(i =>
        i.nome.toLowerCase().includes(q) ||
        (i.categoria ?? "").toLowerCase().includes(q) ||
        (i.marca ?? "").toLowerCase().includes(q)
      );
    }
    return lista;
  }, [initialData, busca, filtro]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Filtro status */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {[
            { key: "todos",    label: "Todos" },
            { key: "criticos", label: "Crítico" },
            { key: "zerados",  label: "Sem estoque" },
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

        {/* Busca */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar item..."
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
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Item</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--color-fg-muted)]">Quantidade</th>
                <th className="hidden px-4 py-3 text-center font-semibold text-[var(--color-fg-muted)] sm:table-cell">Mínimo</th>
                <th className="hidden px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)] lg:table-cell">Custo</th>
                <th className="hidden px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)] lg:table-cell">Venda</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] xl:table-cell">Localização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--color-fg-muted)]">
                    {busca ? `Nenhum item encontrado para "${busca}"` : "Nenhum item no estoque"}
                  </td>
                </tr>
              ) : filtrados.map(item => {
                const qtd = Number(item.quantidade);
                const min = Number(item.quantidade_minima);
                const zerado  = qtd <= 0;
                const critico = qtd > 0 && qtd <= min;
                return (
                  <tr key={item.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3">
                      <Link href={`/estoque/${item.id}`} className="font-medium hover:text-[var(--color-brand-600)] hover:underline">
                        {item.nome}
                      </Link>
                      {item.marca && <span className="ml-1 text-xs text-[var(--color-fg-subtle)]">{item.marca}</span>}
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">{item.categoria ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        zerado  ? "text-[var(--color-danger)]" :
                        critico ? "text-[var(--color-warning)]" :
                        "text-[var(--color-fg)]"
                      }`}>
                        {(zerado || critico) && <AlertTriangle className="size-3.5" />}
                        {qtd}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-center text-[var(--color-fg-subtle)] sm:table-cell">{min}</td>
                    <td className="hidden px-4 py-3 text-right text-[var(--color-fg-muted)] lg:table-cell">
                      {Number(item.preco_custo) > 0 ? formatCurrency(Number(item.preco_custo)) : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-right font-medium lg:table-cell">
                      {Number(item.preco_venda) > 0 ? formatCurrency(Number(item.preco_venda)) : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] xl:table-cell">{item.localizacao ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
            {filtrados.length} item{filtrados.length !== 1 ? "ns" : ""}
          </div>
        )}
      </div>
    </>
  );
}
