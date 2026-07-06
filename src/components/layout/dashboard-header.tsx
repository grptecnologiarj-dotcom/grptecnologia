"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Menu, ChevronDown, LogOut, User, Bell, Search,
  Moon, Sun, Settings, CheckCheck, ClipboardList, Users, DollarSign,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { logoutAction } from "@/app/actions";
import { GlobalSearch } from "./global-search";

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  empresaNome?: string;
  onMenuClick: () => void;
}

const notificacoes = [
  { id: "n1", tipo: "os", icone: ClipboardList, cor: "var(--color-brand-600)", bg: "var(--color-brand-50)", titulo: "OS-2026-0040 está pronta", subtitulo: "Construtora Horizonte — aguardando retirada", tempo: "há 2 min", lida: false },
  { id: "n2", tipo: "cliente", icone: Users, cor: "var(--color-success)", bg: "var(--color-success-bg)", titulo: "Novo cliente cadastrado", subtitulo: "Fernanda Costa Lima", tempo: "há 1 hora", lida: false },
  { id: "n3", tipo: "financeiro", icone: DollarSign, cor: "var(--color-warning)", bg: "var(--color-warning-bg)", titulo: "OS-2026-0038 paga", subtitulo: "Ricardo Hoffmann · R$ 650,00", tempo: "há 3 horas", lida: true },
  { id: "n4", tipo: "os", icone: ClipboardList, cor: "var(--color-danger)", bg: "var(--color-danger-bg)", titulo: "OS-2026-0037 atrasada", subtitulo: "Padaria Pão Quente · 5 dias de atraso", tempo: "há 1 dia", lida: true },
];

export function DashboardHeader({
  userName,
  userEmail,
  empresaNome,
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("deskcontrol_dark") === "true" ||
        (!localStorage.getItem("deskcontrol_dark") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("deskcontrol_dark", String(dark));
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 backdrop-blur-xl sm:px-6 gap-3">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="rounded-[var(--radius-md)] p-2 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] lg:hidden shrink-0"
        >
          <Menu className="size-5" />
        </button>
        {empresaNome && (
          <p className="hidden sm:block text-sm font-semibold truncate">{empresaNome}</p>
        )}
      </div>

      {/* Center — busca global */}
      <button
        onClick={openSearch}
        className="hidden md:flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-sm text-[var(--color-fg-subtle)] hover:border-[var(--color-brand-400)] hover:bg-[var(--color-surface)] transition-colors w-64"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Buscar OS, clientes, estoque...</span>
        <kbd className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
      </button>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Right */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Dark mode */}
        <button
          onClick={() => setDark((v) => !v)}
          className="rounded-[var(--radius-md)] p-2 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
          title={dark ? "Modo claro" : "Modo escuro"}
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
            className="relative rounded-[var(--radius-md)] p-2 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <Bell className="size-4" />
            {naoLidas > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[8px] font-bold text-white">
                {naoLidas}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                <span className="text-sm font-semibold">Notificações</span>
                <button className="flex items-center gap-1 text-xs text-[var(--color-brand-600)] hover:underline">
                  <CheckCheck className="size-3" />
                  Marcar todas como lidas
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)]">
                {notificacoes.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-surface-muted)] cursor-pointer transition-colors ${!n.lida ? "bg-[var(--color-brand-50)]/40" : ""}`}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: n.bg }}>
                      <n.icone className="size-4" style={{ color: n.cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.lida ? "font-semibold" : "font-medium"}`}>{n.titulo}</p>
                      <p className="text-xs text-[var(--color-fg-muted)] truncate">{n.subtitulo}</p>
                      <p className="text-[10px] text-[var(--color-fg-subtle)] mt-0.5">{n.tempo}</p>
                    </div>
                    {!n.lida && (
                      <div className="mt-1.5 size-2 rounded-full bg-[var(--color-brand-600)] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--color-border)] px-4 py-2.5">
                <button className="w-full text-center text-xs font-medium text-[var(--color-brand-600)] hover:underline">
                  Ver todas as notificações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-sm font-semibold text-white">
              {getInitials(userName)}
            </div>
            <span className="hidden text-sm font-medium sm:block max-w-[120px] truncate">{userName}</span>
            <ChevronDown className={`hidden size-3.5 text-[var(--color-fg-subtle)] sm:block transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl">
              <div className="border-b border-[var(--color-border)] px-3 py-2.5 mb-1">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="truncate text-xs text-[var(--color-fg-subtle)]">{userEmail}</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); router.push("/perfil"); }}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <User className="size-4" />
                Meu perfil
              </button>
              <button
                onClick={() => { setUserMenuOpen(false); router.push("/configuracoes"); }}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <Settings className="size-4" />
                Configurações
              </button>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                >
                  <LogOut className="size-4" />
                  Sair da conta
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
