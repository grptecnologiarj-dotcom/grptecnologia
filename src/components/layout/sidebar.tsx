"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Users, Laptop, Calendar,
  FileText, Package, ShieldCheck, ScrollText,
  BarChart2, MessageCircle, Settings, Wrench, X,
  Wallet, UserCog, Globe, Bell, BookOpen, Sun, Trophy, Search, HardHat,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/hoje", label: "Painel do Dia", icon: Sun },
    ],
  },
  {
    label: "Operação",
    items: [
      { href: "/os", label: "Ordens de Serviço", icon: ClipboardList },
      { href: "/os/relatorios", label: "Relatório de OS", icon: BarChart2 },
      { href: "/agenda", label: "Agenda", icon: Calendar },
      { href: "/orcamentos", label: "Orçamentos", icon: FileText },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/equipamentos", label: "Equipamentos", icon: Laptop },
      { href: "/estoque", label: "Estoque", icon: Package },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/financeiro", label: "Caixa / Transações", icon: Wallet },
      { href: "/financeiro/relatorios", label: "Relatórios Financeiros", icon: BarChart2 },
      { href: "/relatorios", label: "Central de Relatórios", icon: BarChart2 },
    ],
  },
  {
    label: "Gestão",
    items: [
      { href: "/tecnicos", label: "Técnicos", icon: HardHat },
      { href: "/contratos", label: "Contratos", icon: ScrollText },
      { href: "/garantias", label: "Garantias", icon: ShieldCheck },
      { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { href: "/ranking", label: "Ranking", icon: Trophy },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/busca", label: "Busca Global", icon: Search },
      { href: "/notificacoes", label: "Notificações", icon: Bell },
      { href: "/conhecimento", label: "Conhecimento", icon: BookOpen },
      { href: "/usuarios", label: "Usuários", icon: UserCog },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
      { href: "/super-admin", label: "Super Admin", icon: Globe },
    ],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white">
              <Wrench className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              Desk<span className="text-[var(--color-brand-600)]">Control</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)]/20"
                          : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-fg)]"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-[var(--color-brand-600)]" : "text-[var(--color-fg-subtle)]"
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] p-3">
          <div className="rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--color-fg-subtle)] text-center">
            Desenvolvido por{" "}
            <span className="font-semibold text-[var(--color-brand-600)]">GRP Tecnologia</span>
          </div>
        </div>
      </aside>
    </>
  );
}
