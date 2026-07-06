"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ClienteRow = {
  id: string;
  nome: string;
  tipo?: string;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  cpf_cnpj?: string | null;
  cidade?: string | null;
  estado?: string | null;
  created_at?: string;
};

export function ClientesListClient({ initialData }: { initialData: ClienteRow[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!busca.trim()) return initialData;
    const q = busca.toLowerCase();
    return initialData.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      (c.telefone ?? "").includes(q) ||
      (c.cpf_cnpj ?? "").includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.cidade ?? "").toLowerCase().includes(q)
    );
  }, [initialData, busca]);

  return (
    <>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF/CNPJ, e-mail ou cidade..."
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
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Nome</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] sm:table-cell">Telefone</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">E-mail</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Cidade</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] xl:table-cell">Cadastro</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--color-fg-muted)]">
                    {busca ? `Nenhum cliente encontrado para "${busca}"` : "Nenhum cliente cadastrado ainda"}
                  </td>
                </tr>
              ) : filtrados.map(c => (
                <tr key={c.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${c.id}`} className="font-medium hover:text-[var(--color-brand-600)] hover:underline">
                      {c.nome}
                    </Link>
                    {c.tipo === "juridica" && (
                      <span className="ml-2 rounded px-1 py-0.5 text-[10px] font-bold bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)]">PJ</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] sm:table-cell">{c.telefone ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">{c.email ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] lg:table-cell">
                    {c.cidade ? `${c.cidade}${c.estado ? ` / ${c.estado}` : ""}` : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] xl:table-cell">
                    {c.created_at ? formatDate(c.created_at) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.whatsapp && (
                      <a
                        href={`https://wa.me/55${c.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
            {filtrados.length} cliente{filtrados.length !== 1 ? "s" : ""}
            {busca && ` · filtrado por "${busca}"`}
          </div>
        )}
      </div>
    </>
  );
}
