"use client";

import { useState, useTransition } from "react";
import { Bell, AlertCircle, CheckCircle2, Clock, Info, Wrench, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarLidaAction, marcarTodasLidasAction } from "@/lib/actions/notificacoes";

export interface NotificacaoView {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  tempo: string;
  lida: boolean;
}

const tipoConfig: Record<string, { icon: React.ElementType; color: string; bg: string; grupo: string }> = {
  alerta: { icon: AlertCircle, color: "var(--color-danger)", bg: "var(--color-danger-bg)", grupo: "sistema" },
  sucesso: { icon: CheckCircle2, color: "var(--color-success)", bg: "var(--color-success-bg)", grupo: "financeiro" },
  info: { icon: Info, color: "var(--color-info)", bg: "var(--color-info-bg)", grupo: "sistema" },
  prazo: { icon: Clock, color: "var(--color-warning)", bg: "var(--color-warning-bg)", grupo: "os" },
  os: { icon: Wrench, color: "var(--color-brand-600)", bg: "var(--color-brand-50)", grupo: "os" },
  orcamento: { icon: FileText, color: "#7c3aed", bg: "#f5f3ff", grupo: "financeiro" },
};

const fallbackCfg = { icon: Info, color: "var(--color-info)", bg: "var(--color-info-bg)", grupo: "sistema" };

const filtros = [
  { key: "todos", label: "Todas" },
  { key: "os", label: "OS & Agenda" },
  { key: "financeiro", label: "Financeiro" },
  { key: "sistema", label: "Sistema" },
];

export function NotificacoesClient({
  notificacoes: iniciais,
  demo,
}: {
  notificacoes: NotificacaoView[];
  demo: boolean;
}) {
  const [notificacoes, setNotificacoes] = useState(iniciais);
  const [filtro, setFiltro] = useState("todos");
  const [isPending, startTransition] = useTransition();

  const filtradas = notificacoes.filter((n) => {
    if (filtro === "todos") return true;
    return (tipoConfig[n.tipo] ?? fallbackCfg).grupo === filtro;
  });

  const naoLidas = filtradas.filter((n) => !n.lida);
  const lidas = filtradas.filter((n) => n.lida);
  const totalNaoLidas = notificacoes.filter((n) => !n.lida).length;

  function marcarTodasLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    if (!demo) {
      startTransition(async () => {
        await marcarTodasLidasAction();
      });
    }
  }

  function marcarLida(id: string) {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    if (!demo) {
      startTransition(async () => {
        await marcarLidaAction(id);
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
            <Bell className="size-5" />
            {totalNaoLidas > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-bold text-white">
                {totalNaoLidas}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            <p className="text-sm text-[var(--color-fg-muted)]">
              {totalNaoLidas} não lida{totalNaoLidas !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {totalNaoLidas > 0 && (
          <Button variant="outline" size="sm" onClick={marcarTodasLidas} disabled={isPending}>
            <Check className="size-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filtros por tipo */}
      <div className="flex gap-2 flex-wrap">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtro === f.key
                ? "bg-[var(--color-brand-600)] text-white"
                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        {filtradas.length === 0 && (
          <div className="p-10 text-center">
            <Bell className="mx-auto mb-3 size-10 text-[var(--color-fg-subtle)]" />
            <p className="font-semibold">Nenhuma notificação aqui</p>
          </div>
        )}

        {naoLidas.length > 0 && (
          <>
            <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
                Novas ({naoLidas.length})
              </p>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {naoLidas.map((n) => {
                const cfg = tipoConfig[n.tipo] ?? fallbackCfg;
                return (
                  <div
                    key={n.id}
                    onClick={() => marcarLida(n.id)}
                    className="flex gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-surface-muted)] bg-[var(--color-brand-50)]/30 cursor-pointer"
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      <cfg.icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{n.titulo}</p>
                        <span className="shrink-0 text-xs text-[var(--color-fg-subtle)]">{n.tempo}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--color-fg-muted)] leading-relaxed">{n.mensagem}</p>
                    </div>
                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-brand-600)]" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {lidas.length > 0 && (
          <>
            <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
                Anteriores ({lidas.length})
              </p>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {lidas.map((n) => {
                const cfg = tipoConfig[n.tipo] ?? fallbackCfg;
                return (
                  <div key={n.id} className="flex gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-surface-muted)]">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      <cfg.icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--color-fg-muted)]">{n.titulo}</p>
                        <span className="shrink-0 text-xs text-[var(--color-fg-subtle)]">{n.tempo}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--color-fg-muted)] leading-relaxed">{n.mensagem}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
