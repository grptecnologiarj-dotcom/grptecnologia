"use client";

import Link from "next/link";
import {
  Sun, AlertTriangle, Phone, MapPin, CheckCircle2,
  Clock, Wrench, Package, Wallet, ArrowRight,
  Zap, MessageCircle, Calendar, ChevronRight,
  CircleDot, PlayCircle, CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  demoOS, demoTransacoes, demoProdutos, demoAgendaEventos,
} from "@/lib/demo-data";

/* ──────────────────────────────────────────────────────────── */

const statusAberto = ["aberta", "em_diagnostico", "aguardando_aprovacao", "em_reparo", "aguardando_pecas"];

const TECNICOS = [
  {
    id: "tech-1",
    nome: "Carlos Mendes",
    avatar: "CM",
    status: "em_campo" as const,
    local: "Rua das Flores, 123",
    osAtual: "OS-2026-0042",
    proximaOs: "OS-2026-0040",
  },
  {
    id: "tech-2",
    nome: "Ana Ribeiro",
    avatar: "AR",
    status: "atendendo" as const,
    local: "Online / Remoto",
    osAtual: "OS-2026-0041",
    proximaOs: undefined,
  },
  {
    id: "tech-3",
    nome: "Pedro Sousa",
    avatar: "PS",
    status: "disponivel" as const,
    local: "Na loja",
    osAtual: undefined,
    proximaOs: "OS-2026-0039",
  },
];

const tecnicoStatusConfig = {
  em_campo: { label: "Em campo", color: "var(--color-brand-600)", bg: "var(--color-brand-50)", dot: "bg-[var(--color-brand-500)]" },
  atendendo: { label: "Atendendo", color: "var(--color-success)", bg: "var(--color-success-bg)", dot: "bg-[var(--color-success)]" },
  disponivel: { label: "Disponível", color: "var(--color-info)", bg: "var(--color-info-bg)", dot: "bg-[var(--color-info)]" },
  ausente: { label: "Ausente", color: "var(--color-fg-subtle)", bg: "var(--color-surface-muted)", dot: "bg-[var(--color-fg-subtle)]" },
};

/* ──────────────────────────────────────────────────────────── */

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function isoHoje(iso: string) {
  const hoje = new Date().toDateString();
  return new Date(iso).toDateString() === hoje;
}

/* ──────────────────────────────────────────────────────────── */

export default function HojePage() {
  const agora = new Date();
  const horaStr = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dataStr = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  /* Agenda de hoje */
  const eventosHoje = (demoAgendaEventos as any[]).filter((ev) => {
    const inicio = ev.inicio ?? ev.dataInicio;
    return inicio && isoHoje(inicio);
  });
  const urgentes = (demoAgendaEventos as any[]).filter(
    (ev) => ev.prioridade === "critica" || ev.status === "urgente"
  );

  /* OS críticas hoje */
  const osAtrasadas = demoOS.filter(
    (o) => o.dataPrevisao && new Date(o.dataPrevisao) < agora && statusAberto.includes(o.status)
  );
  const osProntas = demoOS.filter((o) => o.status === "pronto");

  /* Financeiro hoje */
  const receitasHoje = (demoTransacoes as any[]).filter(
    (t) => t.tipo === "receita" && t.data && isoHoje(t.data)
  );
  const totalReceitaHoje = receitasHoje.reduce((s, t) => s + t.valor, 0);
  const aPagar = (demoTransacoes as any[]).filter(
    (t) => t.tipo === "despesa" && t.status === "pendente"
  );

  /* Estoque crítico */
  const semEstoque = demoProdutos.filter((p) => p.estoque === 0);
  const estoqueMinimo = demoProdutos.filter((p) => p.estoque > 0 && p.estoque <= 3);

  const osAbertas = demoOS.filter((o) => statusAberto.includes(o.status));

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-700)] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/20">
              <Sun className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{saudacao()}, Carlos!</p>
              <p className="text-xl font-bold capitalize">{dataStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums">{horaStr}</p>
              <p className="text-xs text-white/70">horário local</p>
            </div>
          </div>
        </div>

        {/* KPIs rápidos */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "OS em aberto", value: osAbertas.length, icon: Wrench, href: "/os" },
            { label: "Eventos hoje", value: eventosHoje.length, icon: Calendar, href: "/agenda" },
            { label: "Prontas p/ retirar", value: osProntas.length, icon: CheckCircle2, href: "/os?filtro=prontas" },
            { label: "Técnicos ativos", value: TECNICOS.filter(t => (t.status as string) !== "ausente").length, icon: CircleDot, href: "/usuarios" },
          ].map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] bg-white/10 px-3 py-3 text-center transition-colors hover:bg-white/20"
            >
              <k.icon className="size-4 text-white/80" />
              <span className="text-xl font-bold">{k.value}</span>
              <span className="text-[10px] text-white/70 leading-tight">{k.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Urgentes ───────────────────────────────────────── */}
      {(urgentes.length > 0 || osAtrasadas.length > 0) && (
        <div className="space-y-2">
          {urgentes.map((ev) => (
            <Link
              key={ev.id}
              href={`/agenda/${ev.id}`}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-bg)] px-4 py-3 transition-colors hover:bg-[var(--color-danger-bg)]/70"
            >
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-danger)] opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[var(--color-danger)]" />
              </span>
              <Zap className="size-4 shrink-0 text-[var(--color-danger)]" />
              <p className="flex-1 text-sm font-semibold text-[var(--color-danger)]">
                URGENTE — {ev.titulo ?? ev.title}
              </p>
              <ChevronRight className="size-4 text-[var(--color-danger)]/60" />
            </Link>
          ))}
          {osAtrasadas.map((os) => (
            <Link
              key={os.id}
              href={`/os/${os.id}`}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-bg)] px-4 py-3 transition-colors hover:bg-[var(--color-warning-bg)]/70"
            >
              <AlertTriangle className="size-4 shrink-0 text-[var(--color-warning)]" />
              <p className="flex-1 text-sm font-semibold text-[var(--color-warning)]">
                OS ATRASADA — {os.numero} · {os.clienteNome}
              </p>
              <ChevronRight className="size-4 text-[var(--color-warning)]/60" />
            </Link>
          ))}
        </div>
      )}

      {/* ── Grid principal ──────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">

        {/* Agenda do dia (col-span-2 em xl) */}
        <div className="space-y-3 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Agenda de hoje</h2>
            <Link href="/agenda" className="flex items-center gap-1 text-xs text-[var(--color-brand-600)] hover:underline">
              Ver agenda <ArrowRight className="size-3" />
            </Link>
          </div>

          {eventosHoje.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-8 text-center">
              <Calendar className="mx-auto size-8 text-[var(--color-fg-subtle)] mb-2" />
              <p className="text-sm text-[var(--color-fg-muted)]">Nenhum evento agendado para hoje</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link href="/agenda/novo">Agendar</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {eventosHoje.map((ev) => {
                const inicio = ev.inicio ?? ev.dataInicio ?? "";
                const hora = inicio ? new Date(inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";
                const telefone = ev.clienteTelefone ?? ev.phone;
                const maps = ev.linkMaps ?? ev.maps;
                const isUrgente = ev.prioridade === "critica" || ev.status === "urgente";
                return (
                  <div
                    key={ev.id}
                    className={`flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 shadow-sm ${isUrgente ? "border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]/40" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}
                  >
                    {/* Hora */}
                    <div className="shrink-0 w-12 text-center">
                      <p className="text-xs font-bold">{hora}</p>
                      {ev.cor && (
                        <div className="mx-auto mt-1 h-0.5 w-8 rounded-full" style={{ backgroundColor: ev.cor }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold leading-tight">{ev.titulo ?? ev.title}</p>
                        {isUrgente && (
                          <span className="text-[10px] font-bold bg-[var(--color-danger)] text-white px-1.5 py-0.5 rounded-full">URGENTE</span>
                        )}
                      </div>
                      {ev.clienteNome && (
                        <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">{ev.clienteNome}</p>
                      )}
                      {ev.endereco && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-fg-subtle)]">
                          <MapPin className="size-3" />{ev.endereco}
                        </p>
                      )}
                      {/* Checklist progress */}
                      {Array.isArray(ev.checklist) && ev.checklist.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1 flex-1 rounded-full bg-[var(--color-surface-muted)]">
                            <div
                              className="h-1 rounded-full bg-[var(--color-success)]"
                              style={{
                                width: `${Math.round((ev.checklist.filter((c: any) => c.concluido).length / ev.checklist.length) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--color-fg-subtle)]">
                            {ev.checklist.filter((c: any) => c.concluido).length}/{ev.checklist.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex shrink-0 gap-1.5">
                      {telefone && (
                        <a
                          href={`https://wa.me/55${telefone.replace(/\D/g, "")}?text=Olá! Confirmo nosso atendimento de hoje.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-8 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                      )}
                      {maps && (
                        <a
                          href={maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)] transition-colors"
                          title="Ver no Maps"
                        >
                          <MapPin className="size-4" />
                        </a>
                      )}
                      <Link
                        href={`/agenda/${ev.id}`}
                        className="flex size-8 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]/70 transition-colors"
                        title="Detalhes"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">

          {/* Técnicos em campo */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <h2 className="text-sm font-semibold">Técnicos agora</h2>
              <Link href="/usuarios" className="text-xs text-[var(--color-brand-600)] hover:underline">Ver todos</Link>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {TECNICOS.map((t) => {
                const cfg = tecnicoStatusConfig[t.status];
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="relative shrink-0">
                      <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-xs font-bold">
                        {t.avatar}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[var(--color-surface)] ${cfg.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.nome}</p>
                      <p className="text-xs text-[var(--color-fg-muted)] truncate">{t.local}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OS para hoje */}
          {osProntas.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="size-4 text-[var(--color-success)]" />
                <h2 className="text-sm font-semibold text-[var(--color-success)]">
                  {osProntas.length} OS prontas para retirada
                </h2>
              </div>
              <div className="space-y-2">
                {osProntas.slice(0, 3).map((os) => (
                  <Link
                    key={os.id}
                    href={`/os/${os.id}`}
                    className="flex items-center justify-between rounded-[var(--radius-md)] bg-white/50 px-3 py-2 text-xs hover:bg-white/70 transition-colors"
                  >
                    <span className="font-semibold">{os.numero}</span>
                    <span className="text-[var(--color-fg-muted)] truncate mx-2">{os.clienteNome}</span>
                    <ChevronRight className="size-3.5 shrink-0 text-[var(--color-fg-subtle)]" />
                  </Link>
                ))}
              </div>
              {osProntas.length > 3 && (
                <Link href="/os?filtro=prontas" className="mt-2 block text-center text-xs text-[var(--color-success)] hover:underline">
                  +{osProntas.length - 3} mais
                </Link>
              )}
            </div>
          )}

          {/* Financeiro do dia */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="size-4 text-[var(--color-brand-600)]" />
              <h2 className="text-sm font-semibold">Financeiro de hoje</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-fg-muted)]">Receitas recebidas</span>
                <span className="text-sm font-bold text-[var(--color-success)]">
                  {totalReceitaHoje > 0 ? formatCurrency(totalReceitaHoje) : "R$ 0,00"}
                </span>
              </div>
              {aPagar.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-fg-muted)]">Contas a pagar</span>
                  <span className="text-sm font-bold text-[var(--color-warning)]">
                    {aPagar.length} pendente{aPagar.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            <Button size="sm" variant="outline" className="mt-3 w-full text-xs" asChild>
              <Link href="/financeiro">
                <ArrowRight className="size-3" /> Ver financeiro
              </Link>
            </Button>
          </div>

          {/* Estoque crítico */}
          {(semEstoque.length > 0 || estoqueMinimo.length > 0) && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Package className="size-4 text-[var(--color-warning)]" />
                <h2 className="text-sm font-semibold text-[var(--color-warning)]">Estoque crítico</h2>
              </div>
              {semEstoque.slice(0, 2).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1">
                  <span className="truncate text-[var(--color-fg-muted)]">{p.nome}</span>
                  <span className="shrink-0 font-bold text-[var(--color-danger)]">Zerado</span>
                </div>
              ))}
              {estoqueMinimo.slice(0, 2).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1">
                  <span className="truncate text-[var(--color-fg-muted)]">{p.nome}</span>
                  <span className="shrink-0 font-bold text-[var(--color-warning)]">{p.estoque} un.</span>
                </div>
              ))}
              <Link href="/estoque" className="mt-2 block text-center text-xs text-[var(--color-warning)] hover:underline">
                Ver estoque →
              </Link>
            </div>
          )}

          {/* Atalhos rápidos */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wide mb-3">Ações rápidas</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/os/nova", label: "Nova OS", icon: PlayCircle, color: "var(--color-brand-600)" },
                { href: "/agenda/novo", label: "Novo evento", icon: Calendar, color: "var(--color-info)" },
                { href: "/clientes/novo", label: "Novo cliente", icon: Phone, color: "var(--color-success)" },
                { href: "/financeiro", label: "Lançar", icon: Wallet, color: "var(--color-warning)" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-xs font-medium hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  <a.icon className="size-3.5 shrink-0" style={{ color: a.color }} />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
