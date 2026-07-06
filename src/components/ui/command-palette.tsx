"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ClipboardList, Users, Laptop, Calendar, FileText,
  Wallet, Package, ShieldCheck, ScrollText, MessageCircle,
  Settings, UserCog, LayoutDashboard, BarChart2, X, Bell, BookOpen, User,
} from "lucide-react";

const routes = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Páginas" },
  { href: "/os", label: "Ordens de Serviço", icon: ClipboardList, group: "Páginas" },
  { href: "/os/nova", label: "Nova OS", icon: ClipboardList, group: "Ações rápidas" },
  { href: "/clientes", label: "Clientes", icon: Users, group: "Páginas" },
  { href: "/clientes/novo", label: "Novo cliente", icon: Users, group: "Ações rápidas" },
  { href: "/equipamentos", label: "Equipamentos", icon: Laptop, group: "Páginas" },
  { href: "/equipamentos/novo", label: "Novo equipamento", icon: Laptop, group: "Ações rápidas" },
  { href: "/agenda", label: "Agenda", icon: Calendar, group: "Páginas" },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText, group: "Páginas" },
  { href: "/orcamentos/novo", label: "Novo orçamento", icon: FileText, group: "Ações rápidas" },
  { href: "/financeiro", label: "Financeiro", icon: Wallet, group: "Páginas" },
  { href: "/financeiro/novo", label: "Nova transação", icon: Wallet, group: "Ações rápidas" },
  { href: "/financeiro/relatorios", label: "Relatórios financeiros", icon: BarChart2, group: "Páginas" },
  { href: "/estoque", label: "Estoque", icon: Package, group: "Páginas" },
  { href: "/estoque/novo", label: "Novo produto no estoque", icon: Package, group: "Ações rápidas" },
  { href: "/contratos", label: "Contratos", icon: ScrollText, group: "Páginas" },
  { href: "/garantias", label: "Garantias", icon: ShieldCheck, group: "Páginas" },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle, group: "Páginas" },
  { href: "/notificacoes", label: "Notificações", icon: Bell, group: "Páginas" },
  { href: "/conhecimento", label: "Centro de Conhecimento", icon: BookOpen, group: "Páginas" },
  { href: "/usuarios", label: "Usuários", icon: UserCog, group: "Páginas" },
  { href: "/perfil", label: "Meu perfil", icon: User, group: "Conta" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, group: "Conta" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleOpen]);

  const filtered = query.trim()
    ? routes.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))
    : routes;

  const grouped = filtered.reduce<Record<string, typeof routes>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Painel */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search className="size-4 shrink-0 text-[var(--color-fg-subtle)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página ou ação..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-fg-subtle)]"
          />
          <button onClick={() => setOpen(false)} className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
            <X className="size-4" />
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-2">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
                {group}
              </p>
              {items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  <item.icon className="size-4 text-[var(--color-fg-subtle)]" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-fg-subtle)]">
              Nenhum resultado para &ldquo;{query}&rdquo;
            </p>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] px-4 py-2 flex gap-4 text-[10px] text-[var(--color-fg-subtle)]">
          <span><kbd className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono">↵</kbd> selecionar</span>
          <span><kbd className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono">Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
