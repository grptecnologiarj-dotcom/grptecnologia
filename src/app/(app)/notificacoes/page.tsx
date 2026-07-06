"use client";

import { useState } from "react";
import { Bell, AlertCircle, CheckCircle2, Clock, Info, Wrench, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tipoConfig: Record<string, { icon: React.ElementType; color: string; bg: string; grupo: string }> = {
  alerta: { icon: AlertCircle, color: "var(--color-danger)", bg: "var(--color-danger-bg)", grupo: "sistema" },
  sucesso: { icon: CheckCircle2, color: "var(--color-success)", bg: "var(--color-success-bg)", grupo: "financeiro" },
  info: { icon: Info, color: "var(--color-info)", bg: "var(--color-info-bg)", grupo: "sistema" },
  prazo: { icon: Clock, color: "var(--color-warning)", bg: "var(--color-warning-bg)", grupo: "os" },
  os: { icon: Wrench, color: "var(--color-brand-600)", bg: "var(--color-brand-50)", grupo: "os" },
  orcamento: { icon: FileText, color: "#7c3aed", bg: "#f5f3ff", grupo: "financeiro" },
};

const notificacoesBase = [
  { id: "1", tipo: "alerta", titulo: "OS #0038 com prazo vencido", mensagem: "O reparo do notebook de João Carlos está atrasado há 2 dias. Entre em contato com o cliente.", tempo: "há 5 min", lida: false },
  { id: "2", tipo: "orcamento", titulo: "Orçamento aprovado pelo cliente", mensagem: "Maria Silva aprovou o orçamento #ORC-2024-005 no valor de R$ 480,00. Inicie o atendimento.", tempo: "há 23 min", lida: false },
  { id: "3", tipo: "prazo", titulo: "2 OS com entrega para hoje", mensagem: "OS #0040 (Dell Inspiron) e #0042 (iPhone 14) têm previsão de entrega para hoje.", tempo: "há 1h", lida: false },
  { id: "4", tipo: "os", titulo: "Nova OS recebida", mensagem: "OS #0044 criada para Pedro Almeida — TV Samsung com problema de imagem.", tempo: "há 2h", lida: true },
  { id: "5", tipo: "sucesso", titulo: "Pagamento confirmado", mensagem: "Recebido R$ 320,00 via Pix referente à OS #0041 de Ana Rodrigues.", tempo: "há 3h", lida: true },
  { id: "6", tipo: "alerta", titulo: "Estoque crítico: Tela iPhone 14", mensagem: "Produto 'Tela iPhone 14 Pro (OLED)' está com estoque zerado. 3 OS aguardando esta peça.", tempo: "há 5h", lida: true },
  { id: "7", tipo: "info", titulo: "Relatório mensal disponível", mensagem: "O relatório financeiro de maio de 2024 foi gerado. Receita total: R$ 12.480,00.", tempo: "ontem", lida: true },
  { id: "8", tipo: "os", titulo: "OS concluída por Carlos Mendes", mensagem: "OS #0039 (Impressora HP LaserJet) marcada como concluída. Aguardando retirada do cliente.", tempo: "ontem", lida: true },
];

const filtros = [
  { key: "todos", label: "Todas" },
  { key: "os", label: "OS & Agenda" },
  { key: "financeiro", label: "Financeiro" },
  { key: "sistema", label: "Sistema" },
];

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState(notificacoesBase);
  const [filtro, setFiltro] = useState("todos");

  const filtradas = notificacoes.filter((n) => {
    if (filtro === "todos") return true;
    return tipoConfig[n.tipo]?.grupo === filtro;
  });

  const naoLidas = filtradas.filter((n) => !n.lida);
  const lidas = filtradas.filter((n) => n.lida);
  const totalNaoLidas = notificacoes.filter((n) => !n.lida).length;

  function marcarTodasLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  function marcarLida(id: string) {
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
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
          <Button variant="outline" size="sm" onClick={marcarTodasLidas}>
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
                const cfg = tipoConfig[n.tipo];
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
                const cfg = tipoConfig[n.tipo];
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
