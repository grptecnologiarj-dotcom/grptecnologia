"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ClipboardList, Users, Package, Laptop,
  FileText, ScrollText, ShieldCheck, X, ArrowRight,
} from "lucide-react";
import { demoOS, demoClientes, demoEquipamentos, demoProdutos, demoOrcamentos, demoContratos, demoGarantias } from "@/lib/demo-data";

type ResultItem = {
  id: string;
  tipo: string;
  label: string;
  sub: string;
  href: string;
  icon: React.ElementType;
  cor: string;
};

function buildIndex(): ResultItem[] {
  const items: ResultItem[] = [];

  demoOS.forEach((o) => items.push({
    id: o.id, tipo: "OS", label: o.numero,
    sub: `${o.clienteNome} · ${o.equipamentoNome ?? ""}`,
    href: `/os/${o.id}`, icon: ClipboardList, cor: "var(--color-brand-600)",
  }));

  demoClientes.forEach((c) => items.push({
    id: c.id, tipo: "Cliente", label: c.nome,
    sub: (c as any).telefone ?? (c as any).email ?? "",
    href: `/clientes/${c.id}`, icon: Users, cor: "var(--color-success)",
  }));

  (demoEquipamentos as any[]).forEach((e) => items.push({
    id: e.id, tipo: "Equipamento", label: e.nome,
    sub: `${e.marca ?? ""} ${e.modelo ?? ""}`.trim(),
    href: `/equipamentos/${e.id}`, icon: Laptop, cor: "#7c3aed",
  }));

  demoProdutos.forEach((p) => items.push({
    id: p.id, tipo: "Estoque", label: p.nome,
    sub: `${p.categoria ?? ""} · ${p.estoque} em estoque`,
    href: `/estoque/${p.id}`, icon: Package, cor: "var(--color-warning)",
  }));

  (demoOrcamentos as any[]).forEach((o) => items.push({
    id: o.id, tipo: "Orçamento", label: o.numero,
    sub: `${o.clienteNome} · ${o.titulo ?? ""}`,
    href: `/orcamentos/${o.id}`, icon: FileText, cor: "#0ea5e9",
  }));

  (demoContratos as any[]).forEach((c) => items.push({
    id: c.id, tipo: "Contrato", label: (c as any).numero ?? c.id,
    sub: c.clienteNome ?? "",
    href: `/contratos/${c.id}`, icon: ScrollText, cor: "var(--color-danger)",
  }));

  (demoGarantias as any[]).forEach((g) => items.push({
    id: g.id, tipo: "Garantia", label: g.numero ?? g.id,
    sub: `${g.clienteNome} · ${g.equipamentoNome ?? ""}`,
    href: `/garantias/${g.id}`, icon: ShieldCheck, cor: "#16a34a",
  }));

  return items;
}

const INDEX = buildIndex();

const QUICK_LINKS = [
  { label: "Nova OS", href: "/os/nova", icon: ClipboardList },
  { label: "Novo cliente", href: "/clientes/novo", icon: Users },
  { label: "Novo orçamento", href: "/orcamentos/novo", icon: FileText },
  { label: "Nova garantia", href: "/garantias/nova", icon: ShieldCheck },
];

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length >= 1
    ? INDEX.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.sub.toLowerCase().includes(q) ||
          item.tipo.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const navigate = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((v) => Math.min(v + 1, (results.length || QUICK_LINKS.length) - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (results.length > 0 && results[selected]) navigate(results[selected].href);
        else if (results.length === 0 && QUICK_LINKS[selected]) navigate(QUICK_LINKS[selected].href);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, selected, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search className="size-5 shrink-0 text-[var(--color-fg-subtle)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar OS, clientes, equipamentos, estoque..."
            className="flex-1 bg-transparent text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
              <X className="size-4" />
            </button>
          )}
          <kbd className="rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-fg-subtle)]">Esc</kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
                Resultados ({results.length})
              </p>
              {results.map((item, i) => (
                <button
                  key={item.id + item.tipo}
                  onClick={() => navigate(item.href)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i === selected ? "bg-[var(--color-brand-50)]" : "hover:bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                    style={{ backgroundColor: item.cor + "18", color: item.cor }}>
                    <item.icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: item.cor }}>
                        {item.tipo}
                      </span>
                      <span className="font-medium text-sm truncate">{item.label}</span>
                    </div>
                    {item.sub && (
                      <p className="text-xs text-[var(--color-fg-muted)] truncate">{item.sub}</p>
                    )}
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-[var(--color-fg-subtle)] opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">Nenhum resultado para &quot;{query}&quot;</p>
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">Tente buscar por número da OS, nome do cliente ou equipamento</p>
            </div>
          ) : (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
                Ações rápidas
              </p>
              {QUICK_LINKS.map((ql, i) => (
                <button
                  key={ql.href}
                  onClick={() => navigate(ql.href)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i === selected ? "bg-[var(--color-brand-50)]" : "hover:bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)]">
                    <ql.icon className="size-4 text-[var(--color-brand-600)]" />
                  </div>
                  <span className="text-sm font-medium">{ql.label}</span>
                  <ArrowRight className="ml-auto size-3.5 shrink-0 text-[var(--color-fg-subtle)]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-[var(--color-border)] px-4 py-2.5 text-[10px] text-[var(--color-fg-subtle)]">
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1 py-0.5 font-mono">↑↓</kbd> navegar</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1 py-0.5 font-mono">↵</kbd> abrir</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1 py-0.5 font-mono">Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
