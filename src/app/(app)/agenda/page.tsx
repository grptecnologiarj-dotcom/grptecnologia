"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, ChevronLeft, ChevronRight, Calendar, List, LayoutGrid,
  Clock, MapPin, Wrench, User, Filter, Search, AlertTriangle,
  CheckCircle2, RefreshCw, XCircle, Circle, Zap, Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoAgendaEventos, demoUsuarios } from "@/lib/demo-data";
import type { StatusEvento, TipoEvento, PrioridadeEvento, VisualizacaoAgenda } from "@/types/agenda";

/* ────────────── Helpers e configurações ────────────── */

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const mesesNome = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const tiposLabel: Record<TipoEvento | string, { label: string; cor: string }> = {
  visita_tecnica:       { label: "Visita técnica",          cor: "#3b82f6" },
  atendimento_remoto:   { label: "Atendimento remoto",      cor: "#8b5cf6" },
  instalacao:           { label: "Instalação",               cor: "#0ea5e9" },
  manutencao_preventiva:{ label: "Manutenção preventiva",   cor: "#f59e0b" },
  retirada_equipamento: { label: "Retirada",                 cor: "#0891b2" },
  entrega_equipamento:  { label: "Entrega",                  cor: "#22c55e" },
  diagnostico:          { label: "Diagnóstico",              cor: "#10b981" },
  retorno_garantia:     { label: "Retorno garantia",         cor: "#f97316" },
  cobranca:             { label: "Cobrança",                 cor: "#dc2626" },
  reuniao:              { label: "Reunião",                  cor: "#6b7280" },
  tarefa_interna:       { label: "Tarefa interna",           cor: "#6b7280" },
  prioridade_urgente:   { label: "🔴 URGENTE",              cor: "#ef4444" },
  evento_privado:       { label: "Privado",                  cor: "#374151" },
  lembrete:             { label: "Lembrete",                 cor: "#7c3aed" },
  // legado
  visita_tecnica_old:   { label: "Visita técnica",          cor: "#3b82f6" },
  atendimento:          { label: "Atendimento",              cor: "#8b5cf6" },
  entrega:              { label: "Entrega",                  cor: "#22c55e" },
  interno:              { label: "Interno",                  cor: "#6b7280" },
};

const statusCfg: Record<StatusEvento | string, { label: string; icon: typeof Circle; cor: string; bg: string }> = {
  agendado:         { label: "Agendado",         icon: Calendar,     cor: "#2563eb", bg: "#eff6ff" },
  confirmado:       { label: "Confirmado",        icon: CheckCircle2, cor: "#16a34a", bg: "#f0fdf4" },
  em_deslocamento:  { label: "Em deslocamento",   icon: RefreshCw,    cor: "#0891b2", bg: "#ecfeff" },
  em_atendimento:   { label: "Em atendimento",    icon: Wrench,       cor: "#7c3aed", bg: "#f5f3ff" },
  finalizado:       { label: "Finalizado",        icon: CheckCircle2, cor: "#15803d", bg: "#f0fdf4" },
  reagendado:       { label: "Reagendado",        icon: RefreshCw,    cor: "#d97706", bg: "#fffbeb" },
  cancelado:        { label: "Cancelado",         icon: XCircle,      cor: "#dc2626", bg: "#fef2f2" },
  nao_compareceu:   { label: "Não compareceu",    icon: XCircle,      cor: "#9ca3af", bg: "#f3f4f6" },
  aguardando_cliente:{ label: "Aguard. cliente",  icon: Clock,        cor: "#d97706", bg: "#fffbeb" },
  urgente:          { label: "URGENTE",           icon: AlertTriangle,cor: "#dc2626", bg: "#fef2f2" },
  concluido:        { label: "Concluído",         icon: CheckCircle2, cor: "#15803d", bg: "#f0fdf4" },
};

const prioridadeCfg: Record<PrioridadeEvento | string, { label: string; cor: string }> = {
  baixa:   { label: "Baixa",   cor: "#9ca3af" },
  normal:  { label: "Normal",  cor: "#2563eb" },
  alta:    { label: "Alta",    cor: "#d97706" },
  urgente: { label: "Urgente", cor: "#ef4444" },
  critica: { label: "Crítica", cor: "#991b1b" },
};

function getToStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function getWeekDays(baseDate: Date) {
  const day = baseDate.getDay();
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function getMonthCalendar(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const days: Date[] = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }
  for (let i = 1; i <= last.getDate(); i++) days.push(new Date(year, month, i));
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push(new Date(year, month + 1, i));
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

const SEL_CLS =
  "h-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]";

/* ────────────── Componentes de evento ────────────── */

function EventoPill({ ev, compact = false }: { ev: typeof demoAgendaEventos[0]; compact?: boolean }) {
  const isCritica = (ev as any).prioridade === "critica" || (ev as any).status === "urgente";
  return (
    <Link
      href={`/agenda/${ev.id}`}
      className={`block rounded px-1.5 py-0.5 text-white truncate hover:opacity-90 transition-opacity cursor-pointer ${
        isCritica ? "animate-pulse" : ""
      } ${compact ? "text-[10px]" : "text-xs"}`}
      style={{ backgroundColor: (ev as any).cor ?? "#3b82f6" }}
      title={ev.titulo}
    >
      {!compact && <span className="font-medium">{(ev as any).horaInicio} </span>}
      {ev.titulo}
    </Link>
  );
}

function EventoCard({ ev }: { ev: typeof demoAgendaEventos[0] }) {
  const sCfg = statusCfg[(ev as any).status ?? "agendado"] ?? statusCfg.agendado;
  const StatusIcon = sCfg.icon;
  const pCfg = prioridadeCfg[(ev as any).prioridade ?? "normal"] ?? prioridadeCfg.normal;
  const isCritica = (ev as any).prioridade === "critica" || (ev as any).status === "urgente";
  const checkDone = ((ev as any).checklist ?? []).filter((c: any) => c.concluido).length;
  const checkTotal = ((ev as any).checklist ?? []).length;

  return (
    <Link href={`/agenda/${ev.id}`} className="block group">
      <div
        className={`flex gap-4 rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-4 shadow-sm hover:shadow-md transition-all ${
          isCritica
            ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/30"
            : "border-[var(--color-border)]"
        }`}
      >
        {/* Cor lateral */}
        <div
          className="w-1 rounded-full shrink-0"
          style={{ backgroundColor: (ev as any).cor ?? "#3b82f6" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isCritica && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--color-danger)] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                    <Zap className="size-2.5" /> URGENTE
                  </span>
                )}
                <span
                  className="inline-block size-2 rounded-full shrink-0"
                  style={{ backgroundColor: pCfg.cor }}
                  title={`Prioridade: ${pCfg.label}`}
                />
                <p className="font-semibold truncate group-hover:text-[var(--color-brand-600)] transition-colors">
                  {ev.titulo}
                </p>
              </div>
              <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
                {tiposLabel[(ev as any).tipo ?? "visita_tecnica"]?.label ?? (ev as any).tipo}
              </p>
            </div>
            <span
              className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
              style={{ backgroundColor: sCfg.bg, color: sCfg.cor }}
            >
              <StatusIcon className="size-3" />
              {sCfg.label}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-fg-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="size-3 shrink-0" />
              {(ev as any).horaInicio}–{(ev as any).horaFim}
            </span>
            {(ev as any).tecnicoNome && (
              <span className="flex items-center gap-1">
                <Wrench className="size-3 shrink-0" />
                {(ev as any).tecnicoNome}
              </span>
            )}
            {(ev as any).clienteNome && (
              <span className="flex items-center gap-1">
                <User className="size-3 shrink-0" />
                {(ev as any).clienteNome}
              </span>
            )}
            {(ev as any).endereco && (
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="size-3 shrink-0" />
                {(ev as any).endereco}
              </span>
            )}
            {(ev as any).osNumero && (
              <span className="font-mono text-[var(--color-brand-600)]">{(ev as any).osNumero}</span>
            )}
          </div>

          {checkTotal > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: `${(checkDone / checkTotal) * 100}%`,
                    backgroundColor: checkDone === checkTotal ? "var(--color-success)" : "var(--color-brand-500)",
                  }}
                />
              </div>
              <span className="text-[10px] text-[var(--color-fg-subtle)]">
                {checkDone}/{checkTotal}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ────────────── Página principal ────────────── */

export default function AgendaPage() {
  const hoje = new Date();
  const [visao, setVisao] = useState<VisualizacaoAgenda>("semana");
  const [offset, setOffset] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<string>(getToStr(hoje));

  const tecnicos = demoUsuarios.filter((u) => u.role === "tecnico" || u.role === "admin");

  // Filtragem
  const eventosFiltrados = useMemo(() => {
    return demoAgendaEventos.filter((ev) => {
      if (busca && !ev.titulo.toLowerCase().includes(busca.toLowerCase()) &&
          !(ev as any).clienteNome?.toLowerCase().includes(busca.toLowerCase())) return false;
      if (filtroTecnico && (ev as any).tecnicoId !== filtroTecnico) return false;
      if (filtroTipo && (ev as any).tipo !== filtroTipo) return false;
      if (filtroPrioridade && (ev as any).prioridade !== filtroPrioridade) return false;
      if (filtroStatus && (ev as any).status !== filtroStatus) return false;
      return true;
    });
  }, [busca, filtroTecnico, filtroTipo, filtroPrioridade, filtroStatus]);

  const eventosCriticos = eventosFiltrados.filter(
    (e) => (e as any).prioridade === "critica" || (e as any).status === "urgente"
  );

  // Referência de data base
  const baseDate = useMemo(() => {
    const d = new Date(hoje);
    if (visao === "semana") d.setDate(hoje.getDate() + offset * 7);
    else if (visao === "mes") d.setMonth(hoje.getMonth() + offset);
    else if (visao === "dia") d.setDate(hoje.getDate() + offset);
    return d;
  }, [offset, visao]);

  // Semana atual
  const semana = useMemo(() => getWeekDays(baseDate), [baseDate]);

  // Mês
  const semanasMes = useMemo(
    () => getMonthCalendar(baseDate.getFullYear(), baseDate.getMonth()),
    [baseDate]
  );

  const eventosNaDia = (data: Date) => {
    const str = getToStr(data);
    return eventosFiltrados
      .filter((e) => {
        const d = new Date((e as any).data);
        return getToStr(d) === str;
      })
      .sort((a, b) => ((a as any).horaInicio ?? "").localeCompare((b as any).horaInicio ?? ""));
  };

  const labelPeriodo = useMemo(() => {
    if (visao === "dia") {
      return baseDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    }
    if (visao === "semana") {
      const ini = semana[0];
      const fim = semana[6];
      if (ini.getMonth() === fim.getMonth())
        return `${ini.getDate()}–${fim.getDate()} de ${mesesNome[ini.getMonth()]} ${ini.getFullYear()}`;
      return `${ini.getDate()}/${ini.getMonth() + 1} – ${fim.getDate()}/${fim.getMonth() + 1}/${fim.getFullYear()}`;
    }
    if (visao === "mes") return `${mesesNome[baseDate.getMonth()]} ${baseDate.getFullYear()}`;
    return "Todos os eventos";
  }, [visao, baseDate, semana]);

  const filtrosAtivos = [filtroTecnico, filtroTipo, filtroPrioridade, filtroStatus].filter(Boolean).length;

  /* ── visão dia ── */
  const horasGrade = Array.from({ length: 14 }, (_, i) => i + 7); // 07–20h

  /* ── visão técnico ── */
  const eventosPorTecnico = useMemo(() => {
    const map: Record<string, { nome: string; eventos: typeof demoAgendaEventos }> = {
      sem_tecnico: { nome: "Sem técnico", eventos: [] },
    };
    tecnicos.forEach((t) => {
      map[t.id] = { nome: t.nome, eventos: [] };
    });
    eventosFiltrados.forEach((ev) => {
      const tid = (ev as any).tecnicoId ?? "sem_tecnico";
      if (!map[tid]) map[tid] = { nome: (ev as any).tecnicoNome ?? "Sem técnico", eventos: [] };
      map[tid].eventos.push(ev);
    });
    return Object.entries(map).filter(([, v]) => v.eventos.length > 0);
  }, [eventosFiltrados]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Alertas urgentes ── */}
      {eventosCriticos.length > 0 && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-bg)] px-4 py-3">
          <AlertTriangle className="size-5 shrink-0 text-[var(--color-danger)]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-danger)]">
              {eventosCriticos.length} evento{eventosCriticos.length > 1 ? "s" : ""} urgente{eventosCriticos.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-[var(--color-danger)]/80 truncate">
              {eventosCriticos.map((e) => e.titulo).join(" · ")}
            </p>
          </div>
          <Link href={`/agenda/${eventosCriticos[0].id}`} className="shrink-0 text-xs font-semibold text-[var(--color-danger)] hover:underline">
            Ver →
          </Link>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? "s" : ""}
            {filtrosAtivos > 0 && ` · ${filtrosAtivos} filtro${filtrosAtivos > 1 ? "s" : ""} ativo${filtrosAtivos > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-fg-subtle)]" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar evento ou cliente..."
              className="h-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] w-48"
            />
          </div>
          {/* Filtros */}
          <button
            onClick={() => setFiltrosAbertos((v) => !v)}
            className={`flex items-center gap-1.5 h-8 rounded-[var(--radius-md)] border px-3 text-xs font-medium transition-colors ${
              filtrosAtivos > 0
                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            <Filter className="size-3.5" />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-[10px] font-bold text-white">
                {filtrosAtivos}
              </span>
            )}
          </button>
          <Button asChild>
            <Link href="/agenda/novo">
              <Plus className="size-4" />
              Novo evento
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Filtros expandidos ── */}
      {filtrosAbertos && (
        <div className="flex flex-wrap gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">Técnico</label>
            <select value={filtroTecnico} onChange={(e) => setFiltroTecnico(e.target.value)} className={SEL_CLS}>
              <option value="">Todos</option>
              {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">Tipo</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={SEL_CLS}>
              <option value="">Todos</option>
              {Object.entries(tiposLabel).slice(0, 14).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">Prioridade</label>
            <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} className={SEL_CLS}>
              <option value="">Todas</option>
              {Object.entries(prioridadeCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">Status</label>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className={SEL_CLS}>
              <option value="">Todos</option>
              {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          {filtrosAtivos > 0 && (
            <div className="flex items-end">
              <button
                onClick={() => { setFiltroTecnico(""); setFiltroTipo(""); setFiltroPrioridade(""); setFiltroStatus(""); }}
                className="h-8 rounded-[var(--radius-md)] px-3 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Controles de visão + navegação ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Visões */}
        <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
          {([
            { id: "dia",     label: "Dia",      icon: Calendar },
            { id: "semana",  label: "Semana",   icon: LayoutGrid },
            { id: "mes",     label: "Mês",      icon: Calendar },
            { id: "lista",   label: "Lista",    icon: List },
            { id: "tecnico", label: "Técnico",  icon: Users },
          ] as const).map((v) => (
            <button
              key={v.id}
              onClick={() => { setVisao(v.id); setOffset(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r border-[var(--color-border)] last:border-r-0 ${
                visao === v.id
                  ? "bg-[var(--color-brand-600)] text-white"
                  : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              <v.icon className="size-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Navegação de período */}
        {visao !== "lista" && visao !== "tecnico" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset((v) => v - 1)}
              className="flex size-7 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium min-w-[200px] text-center">{labelPeriodo}</span>
            <button
              onClick={() => setOffset((v) => v + 1)}
              className="flex size-7 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
            {offset !== 0 && (
              <button
                onClick={() => setOffset(0)}
                className="rounded-full bg-[var(--color-brand-50)] px-3 py-0.5 text-xs font-semibold text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] transition-colors"
              >
                Hoje
              </button>
            )}
          </div>
        )}
      </div>

      {/* ════════════ VISÃO: SEMANA ════════════ */}
      {visao === "semana" && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          {/* Header dias */}
          <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
            {semana.map((d, i) => {
              const isHoje = getToStr(d) === getToStr(hoje);
              const numEvts = eventosNaDia(d).length;
              return (
                <div key={i} className="flex flex-col items-center py-2.5 gap-0.5 border-r border-[var(--color-border)] last:border-r-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                    {diasSemana[d.getDay()]}
                  </span>
                  <button
                    onClick={() => { setDiaSelecionado(getToStr(d)); setVisao("dia"); setOffset(Math.round((d.getTime() - hoje.getTime()) / 86400000)); }}
                    className={`flex size-7 items-center justify-center rounded-full text-sm font-semibold transition-colors hover:bg-[var(--color-brand-100)] ${
                      isHoje
                        ? "bg-[var(--color-brand-600)] text-white"
                        : "text-[var(--color-fg)]"
                    }`}
                  >
                    {d.getDate()}
                  </button>
                  {numEvts > 0 && (
                    <span className="text-[9px] font-semibold text-[var(--color-fg-subtle)]">
                      {numEvts} ev.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Células */}
          <div className="grid grid-cols-7 min-h-[180px]">
            {semana.map((d, i) => {
              const isHoje = getToStr(d) === getToStr(hoje);
              const evts = eventosNaDia(d);
              return (
                <div
                  key={i}
                  className={`border-r border-[var(--color-border)] last:border-r-0 p-1.5 space-y-1 ${
                    isHoje ? "bg-[var(--color-brand-50)]/20" : ""
                  }`}
                >
                  {evts.slice(0, 4).map((ev) => (
                    <EventoPill key={ev.id} ev={ev} compact />
                  ))}
                  {evts.length > 4 && (
                    <button
                      onClick={() => { setVisao("dia"); setOffset(Math.round((d.getTime() - hoje.getTime()) / 86400000)); }}
                      className="w-full text-[10px] text-[var(--color-fg-muted)] hover:text-[var(--color-brand-600)] text-left"
                    >
                      +{evts.length - 4} mais
                    </button>
                  )}
                  {evts.length === 0 && (
                    <Link
                      href={`/agenda/novo?data=${getToStr(d)}`}
                      className="flex w-full h-full min-h-[60px] items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[var(--color-fg-subtle)]"
                    >
                      <Plus className="size-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════ VISÃO: DIA ════════════ */}
      {visao === "dia" && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 flex items-center justify-between">
            <p className="font-semibold capitalize">{labelPeriodo}</p>
            <span className="text-xs text-[var(--color-fg-muted)]">
              {eventosNaDia(baseDate).length} evento{eventosNaDia(baseDate).length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {horasGrade.map((hora) => {
              const horaStr = `${hora.toString().padStart(2, "0")}:00`;
              const evtsNaHora = eventosNaDia(baseDate).filter((e) => {
                const ini = parseInt((e as any).horaInicio?.split(":")[0] ?? "0");
                const fim = parseInt((e as any).horaFim?.split(":")[0] ?? "0");
                return hora >= ini && hora < fim;
              });
              const isAgora = new Date().getHours() === hora && getToStr(baseDate) === getToStr(hoje);
              return (
                <div key={hora} className={`flex gap-3 px-4 py-2 min-h-[56px] ${isAgora ? "bg-[var(--color-brand-50)]/30" : ""}`}>
                  <span className={`w-12 shrink-0 text-xs font-medium mt-1 ${isAgora ? "text-[var(--color-brand-600)] font-bold" : "text-[var(--color-fg-subtle)]"}`}>
                    {horaStr}
                    {isAgora && <span className="ml-0.5">◀</span>}
                  </span>
                  <div className="flex-1 flex flex-col gap-1">
                    {evtsNaHora.map((ev) => {
                      const sCfg = statusCfg[(ev as any).status ?? "agendado"] ?? statusCfg.agendado;
                      const StatusIcon = sCfg.icon;
                      return (
                        <Link key={ev.id} href={`/agenda/${ev.id}`}
                          className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-white text-xs hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: (ev as any).cor ?? "#3b82f6" }}
                        >
                          <StatusIcon className="size-3 shrink-0" />
                          <span className="font-medium truncate">{ev.titulo}</span>
                          <span className="ml-auto shrink-0 opacity-80">{(ev as any).horaInicio}–{(ev as any).horaFim}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {eventosNaDia(baseDate).length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Calendar className="size-10 text-[var(--color-fg-subtle)]" />
              <p className="text-sm text-[var(--color-fg-muted)]">Nenhum evento neste dia</p>
              <Button asChild size="sm" variant="outline">
                <Link href={`/agenda/novo?data=${getToStr(baseDate)}`}>
                  <Plus className="size-3.5" />
                  Criar evento
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ════════════ VISÃO: MÊS ════════════ */}
      {visao === "mes" && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          {/* Cabeçalho */}
          <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
            {diasSemana.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
                {d}
              </div>
            ))}
          </div>
          {/* Grade */}
          {semanasMes.map((semana, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-[var(--color-border)] last:border-b-0">
              {semana.map((d, di) => {
                const isHoje = getToStr(d) === getToStr(hoje);
                const isMesAtual = d.getMonth() === baseDate.getMonth();
                const evts = eventosNaDia(d);
                return (
                  <div
                    key={di}
                    className={`border-r border-[var(--color-border)] last:border-r-0 p-1.5 min-h-[80px] ${
                      !isMesAtual ? "bg-[var(--color-surface-muted)]/50" : ""
                    } ${isHoje ? "bg-[var(--color-brand-50)]/30" : ""}`}
                  >
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={() => { setVisao("dia"); setOffset(Math.round((d.getTime() - hoje.getTime()) / 86400000)); }}
                        className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors hover:bg-[var(--color-brand-100)] ${
                          isHoje ? "bg-[var(--color-brand-600)] text-white" : isMesAtual ? "" : "text-[var(--color-fg-subtle)]"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {evts.slice(0, 2).map((ev) => (
                        <EventoPill key={ev.id} ev={ev} compact />
                      ))}
                      {evts.length > 2 && (
                        <button
                          onClick={() => { setVisao("dia"); setOffset(Math.round((d.getTime() - hoje.getTime()) / 86400000)); }}
                          className="text-[9px] text-[var(--color-fg-muted)] hover:text-[var(--color-brand-600)] w-full text-left"
                        >
                          +{evts.length - 2}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ════════════ VISÃO: LISTA ════════════ */}
      {visao === "lista" && (
        <div className="space-y-6">
          {(() => {
            const grupos: Record<string, typeof demoAgendaEventos> = {};
            eventosFiltrados
              .slice()
              .sort((a, b) => {
                const da = new Date((a as any).data).getTime();
                const db = new Date((b as any).data).getTime();
                if (da !== db) return da - db;
                return ((a as any).horaInicio ?? "").localeCompare((b as any).horaInicio ?? "");
              })
              .forEach((ev) => {
                const str = getToStr(new Date((ev as any).data));
                if (!grupos[str]) grupos[str] = [];
                grupos[str].push(ev);
              });
            return Object.entries(grupos).map(([dateStr, evts]) => {
              const d = new Date(dateStr + "T12:00:00");
              const isHoje = dateStr === getToStr(hoje);
              const isFuturo = d > hoje;
              return (
                <div key={dateStr}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex size-10 shrink-0 flex-col items-center justify-center rounded-[var(--radius-md)] text-white ${
                      isHoje ? "bg-[var(--color-brand-600)]" : isFuturo ? "bg-[var(--color-fg-subtle)]" : "bg-[var(--color-surface-muted)]"
                    }`}>
                      <span className="text-[10px] font-semibold uppercase">
                        {diasSemana[d.getDay()]}
                      </span>
                      <span className={`text-base font-bold leading-tight ${!isFuturo && !isHoje ? "text-[var(--color-fg)]" : ""}`}>
                        {d.getDate()}
                      </span>
                    </div>
                    <div>
                      <p className={`font-semibold ${isHoje ? "text-[var(--color-brand-600)]" : ""}`}>
                        {isHoje ? "Hoje" : d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                      </p>
                      <p className="text-xs text-[var(--color-fg-muted)]">{evts.length} evento{evts.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pl-[52px]">
                    {evts.map((ev) => <EventoCard key={ev.id} ev={ev} />)}
                  </div>
                </div>
              );
            });
          })()}
          {eventosFiltrados.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Calendar className="size-12 text-[var(--color-fg-subtle)]" />
              <p className="text-sm text-[var(--color-fg-muted)]">Nenhum evento encontrado</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/agenda/novo"><Plus className="size-3.5" /> Criar evento</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ════════════ VISÃO: POR TÉCNICO ════════════ */}
      {visao === "tecnico" && (
        <div className="space-y-4">
          {eventosPorTecnico.map(([tid, { nome, eventos }]) => (
            <div key={tid} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-sm font-bold uppercase">
                  {nome.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{nome}</p>
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    {eventos.length} evento{eventos.length !== 1 ? "s" : ""}
                    {" · "}
                    {eventos.filter((e) => (e as any).status === "finalizado" || (e as any).status === "concluido").length} concluído{eventos.filter((e) => (e as any).status === "finalizado").length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {eventos
                  .slice()
                  .sort((a, b) => new Date((a as any).data).getTime() - new Date((b as any).data).getTime())
                  .map((ev) => {
                    const sCfg = statusCfg[(ev as any).status ?? "agendado"] ?? statusCfg.agendado;
                    const StatusIcon = sCfg.icon;
                    return (
                      <Link key={ev.id} href={`/agenda/${ev.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-surface-muted)] transition-colors"
                      >
                        <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: (ev as any).cor }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ev.titulo}</p>
                          <p className="text-xs text-[var(--color-fg-muted)]">
                            {new Date((ev as any).data).toLocaleDateString("pt-BR")} · {(ev as any).horaInicio}
                            {(ev as any).clienteNome && ` · ${(ev as any).clienteNome}`}
                          </p>
                        </div>
                        <span
                          className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: sCfg.bg, color: sCfg.cor }}
                        >
                          <StatusIcon className="size-2.5" />
                          {sCfg.label}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
          {eventosPorTecnico.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="size-12 text-[var(--color-fg-subtle)]" />
              <p className="text-sm text-[var(--color-fg-muted)]">Nenhum evento com técnico atribuído</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
