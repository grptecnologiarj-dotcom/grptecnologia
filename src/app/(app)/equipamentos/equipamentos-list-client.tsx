"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

type EquipamentoRow = {
  id: string;
  nome: string;
  categoria?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;
  created_at?: string;
  clientes?: { id: string; nome: string } | null;
};

export function EquipamentosListClient({ initialData }: { initialData: EquipamentoRow[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!busca.trim()) return initialData;
    const q = busca.toLowerCase();
    return initialData.filter(e =>
      e.nome.toLowerCase().includes(q) ||
      (e.marca ?? "").toLowerCase().includes(q) ||
      (e.modelo ?? "").toLowerCase().includes(q) ||
      (e.numero_serie ?? "").toLowerCase().includes(q) ||
      (e.clientes?.nome ?? "").toLowerCase().includes(q) ||
      (e.categoria ?? "").toLowerCase().includes(q)
    );
  }, [initialData, busca]);

  return (
    <>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, marca, modelo ou cliente..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-10 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        />
        {busca && (
          <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Equipamento</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Nº Série</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Cliente</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] xl:table-cell">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[var(--color-fg-muted)]">
                    {busca ? `Nenhum equipamento encontrado para "${busca}"` : "Nenhum equipamento cadastrado"}
                  </td>
                </tr>
              ) : filtrados.map(e => (
                <tr key={e.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                  <td className="px-4 py-3">
                    <Link href={`/equipamentos/${e.id}`} className="font-medium hover:text-[var(--color-brand-600)] hover:underline">
                      {e.nome}
                    </Link>
                    {(e.marca || e.modelo) && (
                      <p className="text-xs text-[var(--color-fg-subtle)]">
                        {[e.marca, e.modelo].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">{e.categoria ?? "—"}</td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-[var(--color-fg-subtle)] lg:table-cell">{e.numero_serie ?? "—"}</td>
                  <td className="px-4 py-3">
                    {e.clientes ? (
                      <Link href={`/clientes/${e.clientes.id}`} className="text-[var(--color-brand-600)] hover:underline">
                        {e.clientes.nome}
                      </Link>
                    ) : <span className="text-[var(--color-fg-subtle)]">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] xl:table-cell">
                    {e.created_at ? formatDate(e.created_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
            {filtrados.length} equipamento{filtrados.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </>
  );
}
