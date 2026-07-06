"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Edit, Trash2, MapPin, Clock, Wrench, User,
  CheckCircle2, Circle, Calendar, Phone, ExternalLink,
  AlertTriangle, Zap, CheckSquare, Share2, RefreshCw,
  XCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoAgendaEventos } from "@/lib/demo-data";

const statusCfg: Record<string, { label: string; cor: string; bg: string }> = {
  agendado:          { label: "Agendado",          cor: "#2563eb", bg: "#eff6ff" },
  confirmado:        { label: "Confirmado",         cor: "#16a34a", bg: "#f0fdf4" },
  em_deslocamento:   { label: "Em deslocamento",    cor: "#0891b2", bg: "#ecfeff" },
  em_atendimento:    { label: "Em atendimento",     cor: "#7c3aed", bg: "#f5f3ff" },
  finalizado:        { label: "Finalizado",         cor: "#15803d", bg: "#f0fdf4" },
  reagendado:        { label: "Reagendado",         cor: "#d97706", bg: "#fffbeb" },
  cancelado:         { label: "Cancelado",          cor: "#dc2626", bg: "#fef2f2" },
  nao_compareceu:    { label: "Não compareceu",     cor: "#9ca3af", bg: "#f3f4f6" },
  aguardando_cliente:{ label: "Aguard. cliente",    cor: "#d97706", bg: "#fffbeb" },
  urgente:           { label: "URGENTE",            cor: "#dc2626", bg: "#fef2f2" },
  concluido:         { label: "Concluído",          cor: "#15803d", bg: "#f0fdf4" },
};

const tiposLabel: Record<string, string> = {
  visita_tecnica: "Visita técnica", atendimento_remoto: "Atendimento remoto",
  instalacao: "Instalação", manutencao_preventiva: "Manutenção preventiva",
  retirada_equipamento: "Retirada de equipamento", entrega_equipamento: "Entrega de equipamento",
  diagnostico: "Diagnóstico", retorno_garantia: "Retorno garantia",
  cobranca: "Cobrança", reuniao: "Reunião", tarefa_interna: "Tarefa interna",
  prioridade_urgente: "Prioridade urgente", evento_privado: "Evento privado",
  lembrete: "Lembrete", atendimento: "Atendimento", entrega: "Entrega", interno: "Interno",
};

const prioridadeLabel: Record<string, { label: string; cor: string }> = {
  baixa:   { label: "Baixa",   cor: "#9ca3af" },
  normal:  { label: "Normal",  cor: "#2563eb" },
  alta:    { label: "Alta",    cor: "#d97706" },
  urgente: { label: "Urgente", cor: "#ef4444" },
  critica: { label: "Crítica", cor: "#991b1b" },
};

const proximosStatus: Record<string, { label: string; value: string }[]> = {
  agendado:         [{ label: "Confirmar", value: "confirmado" }, { label: "Cancelar", value: "cancelado" }, { label: "Reagendar", value: "reagendado" }],
  confirmado:       [{ label: "Iniciar deslocamento", value: "em_deslocamento" }, { label: "Cancelar", value: "cancelado" }],
  em_deslocamento:  [{ label: "Iniciar atendimento", value: "em_atendimento" }, { label: "Não compareceu", value: "nao_compareceu" }],
  em_atendimento:   [{ label: "Finalizar", value: "finalizado" }],
  urgente:          [{ label: "Iniciar atendimento", value: "em_atendimento" }, { label: "Finalizar", value: "finalizado" }],
  aguardando_cliente:[{ label: "Confirmado", value: "confirmado" }, { label: "Cancelar", value: "cancelado" }],
  finalizado:       [],
  cancelado:        [],
};

export default function EventoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const ev = demoAgendaEventos.find((e) => e.id === params.id) ?? demoAgendaEventos[0];

  const [status, setStatus] = useState((ev as any).status ?? "agendado");
  const [checklist, setChecklist] = useState<{ id: string; texto: string; concluido: boolean }[]>(
    (ev as any).checklist ?? []
  );
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const sCfg = statusCfg[status] ?? statusCfg.agendado;
  const pCfg = prioridadeLabel[(ev as any).prioridade ?? "normal"] ?? prioridadeLabel.normal;
  const isCritica = (ev as any).prioridade === "critica" || status === "urgente";
  const isFinalizado = status === "finalizado" || status === "cancelado";
  const checkDone = checklist.filter((c) => c.concluido).length;
  const proximasAcoes = proximosStatus[status] ?? [];

  const dataFmt = new Date((ev as any).data).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  function toggleCheck(id: string) {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, concluido: !c.concluido } : c))
    );
  }

  function avancarStatus(novoStatus: string) {
    setStatus(novoStatus);
    setStatusMenuOpen(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/agenda"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isCritica && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-danger)] px-2 py-0.5 text-xs font-bold text-white">
                  <Zap className="size-3" /> URGENTE
                </span>
              )}
              <h1 className="text-xl font-bold tracking-tight">{ev.titulo}</h1>
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-fg-muted)] capitalize">{dataFmt}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/agenda/${ev.id}/editar`}>
              <Edit className="size-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Card de status e ações rápidas */}
      <div
        className={`rounded-[var(--radius-lg)] border p-5 shadow-sm ${
          isCritica ? "border-[var(--color-danger)]/40 bg-[var(--color-danger-bg)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"
        }`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: (ev as any).cor ?? "#3b82f6" }}
            >
              <Calendar className="size-6" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-subtle)] uppercase tracking-wide font-semibold">
                {tiposLabel[(ev as any).tipo ?? "visita_tecnica"] ?? (ev as any).tipo}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: sCfg.bg, color: sCfg.cor }}
                >
                  {sCfg.label}
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold"
                  style={{ borderColor: pCfg.cor, color: pCfg.cor }}
                >
                  ● {pCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Ações de status */}
          {!isFinalizado && proximasAcoes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {proximasAcoes.map((acao) => (
                <button
                  key={acao.value}
                  onClick={() => avancarStatus(acao.value)}
                  className={`rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold transition-colors ${
                    acao.value === "finalizado"
                      ? "bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90"
                      : acao.value === "cancelado"
                      ? "border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                      : "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)]"
                  }`}
                >
                  {acao.label}
                </button>
              ))}
            </div>
          )}
          {isFinalizado && (
            <span className="text-sm font-semibold" style={{ color: sCfg.cor }}>
              {status === "finalizado" ? "✓ Evento finalizado" : "✗ Evento cancelado"}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-5 lg:col-span-2">
          {/* Informações */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Detalhes do evento</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                <div>
                  <p className="text-xs text-[var(--color-fg-subtle)]">Data</p>
                  <p className="text-sm font-semibold capitalize">{dataFmt}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                <div>
                  <p className="text-xs text-[var(--color-fg-subtle)]">Horário</p>
                  <p className="text-sm font-semibold">
                    {(ev as any).horaInicio} – {(ev as any).horaFim}
                  </p>
                </div>
              </div>
              {(ev as any).tecnicoNome && (
                <div className="flex items-start gap-3">
                  <Wrench className="mt-0.5 size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                  <div>
                    <p className="text-xs text-[var(--color-fg-subtle)]">Técnico</p>
                    <p className="text-sm font-semibold">{(ev as any).tecnicoNome}</p>
                  </div>
                </div>
              )}
              {(ev as any).clienteNome && (
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                  <div>
                    <p className="text-xs text-[var(--color-fg-subtle)]">Cliente</p>
                    <p className="text-sm font-semibold">{(ev as any).clienteNome}</p>
                    {(ev as any).clienteTelefone && (
                      <a
                        href={`https://wa.me/55${((ev as any).clienteTelefone ?? "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-success)] hover:underline"
                      >
                        <Phone className="size-3" />
                        {(ev as any).clienteTelefone}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {(ev as any).osNumero && (
                <div className="flex items-start gap-3">
                  <CheckSquare className="mt-0.5 size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                  <div>
                    <p className="text-xs text-[var(--color-fg-subtle)]">OS vinculada</p>
                    <Link href={`/os/${(ev as any).osId ?? "demo"}`}
                      className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline flex items-center gap-1">
                      {(ev as any).osNumero}
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {(ev as any).endereco && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-fg-subtle)]">Local</p>
                    <p className="text-sm font-semibold">{(ev as any).endereco}</p>
                    {(ev as any).linkMaps && (
                      <a
                        href={(ev as any).linkMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-brand-700)] transition-colors"
                      >
                        <MapPin className="size-3" />
                        Abrir rota no Maps
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          {((ev as any).descricao || (ev as any).observacoesInternas) && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
              {(ev as any).descricao && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-2">Descrição</h3>
                  <p className="text-sm leading-relaxed">{(ev as any).descricao}</p>
                </div>
              )}
              {(ev as any).observacoesInternas && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-2">
                    🔒 Observações internas
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{(ev as any).observacoesInternas}</p>
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Checklist</h2>
                <span className="text-xs text-[var(--color-fg-muted)]">
                  {checkDone}/{checklist.length} concluído{checklist.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mb-3 h-1.5 rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${(checkDone / checklist.length) * 100}%`,
                    backgroundColor:
                      checkDone === checklist.length
                        ? "var(--color-success)"
                        : "var(--color-brand-500)",
                  }}
                />
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    {item.concluido ? (
                      <CheckCircle2 className="size-5 shrink-0 text-[var(--color-success)]" />
                    ) : (
                      <Circle className="size-5 shrink-0 text-[var(--color-fg-subtle)]" />
                    )}
                    <span className={`text-sm ${item.concluido ? "line-through text-[var(--color-fg-subtle)]" : ""}`}>
                      {item.texto}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ações mobile-friendly */}
          {(ev as any).clienteTelefone && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Ações rápidas</h3>
              <a
                href={`https://wa.me/55${((ev as any).clienteTelefone ?? "").replace(/\D/g, "")}?text=Olá%20${encodeURIComponent((ev as any).clienteNome ?? "")}%2C%20é%20da%20DeskControl!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22be5c] transition-colors"
              >
                <Phone className="size-4" />
                WhatsApp cliente
              </a>
              {(ev as any).linkMaps && (
                <a
                  href={(ev as any).linkMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-700)] transition-colors"
                >
                  <MapPin className="size-4" />
                  Abrir rota
                </a>
              )}
            </div>
          )}

          {/* Histórico */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Histórico</h3>
            <div className="space-y-3">
              {[
                { label: "Criado por", valor: (ev as any).criadoPor ?? "—", data: (ev as any).criadoEm ? new Date((ev as any).criadoEm).toLocaleDateString("pt-BR") : null },
                { label: "Confirmado", valor: status === "confirmado" || status === "finalizado" ? "Sim" : "Não", data: null },
                { label: "Finalizado", valor: status === "finalizado" ? "Sim" : "Não", data: (ev as any).finalizadoEm ? new Date((ev as any).finalizadoEm).toLocaleDateString("pt-BR") : null },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-[var(--color-fg-muted)]">{item.label}</span>
                  <span className="font-medium">
                    {item.valor}
                    {item.data && <span className="text-[var(--color-fg-subtle)] ml-1">({item.data})</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notificações */}
          {(ev as any).notificacoes?.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Notificações</h3>
              <div className="space-y-1.5">
                {((ev as any).notificacoes as number[]).map((min) => (
                  <div key={min} className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                    <div className="size-1.5 rounded-full bg-[var(--color-brand-500)]" />
                    {min === 0 ? "No horário do evento" :
                     min < 60 ? `${min} minutos antes` :
                     min < 1440 ? `${min / 60} hora${min / 60 > 1 ? "s" : ""} antes` :
                     `${min / 1440} dia${min / 1440 > 1 ? "s" : ""} antes`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Excluir */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
              onClick={() => router.push("/agenda")}
            >
              <Trash2 className="size-4" />
              Excluir evento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
