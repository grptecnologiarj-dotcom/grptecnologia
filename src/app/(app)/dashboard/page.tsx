import Link from "next/link";
import { OnboardingChecklist } from "@/components/ui/onboarding-checklist";
import { DashboardBarChart } from "./dashboard-bar-chart";
import {
  FileText, Wallet, Users, Clock, TrendingUp, TrendingDown,
  ArrowRight, AlertCircle, Wrench, Package, Activity,
  CheckCircle2, XCircle, MessageCircle, Star, Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  demoOS, demoClientes, demoResumoFinanceiro, demoTransacoes,
  statusOSConfig, demoProdutos,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarOSAction } from "@/lib/actions/os";
import { resumoFinanceiroAction, listarTransacoesAction } from "@/lib/actions/financeiro";
import { listarClientesAction } from "@/lib/actions/clientes";
import { listarEstoqueAction } from "@/lib/actions/estoque";

export const metadata = { title: "Dashboard" };

const statusAberto = ["aberta", "em_diagnostico", "aguardando_aprovacao", "em_reparo", "aguardando_pecas"];


export default async function DashboardPage() {
  const hoje = new Date();
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - 6 + i);
    return d;
  });
  const labelsSemana = diasSemana.map((d) => ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()]);

  // Dados reais quando Supabase configurado
  let osList = demoOS as any[];
  let resumoFin = demoResumoFinanceiro as any;
  let transacoesRecentes = demoTransacoes as any[];
  let totalClientes = demoClientes.length;
  let produtosSemEstoque = demoProdutos.filter((p) => p.estoque === 0).length;

  if (isSupabaseConfigured()) {
    const [osResult, finResult, transResult, clientesResult, estoqueResult] = await Promise.all([
      listarOSAction(),
      resumoFinanceiroAction(),
      listarTransacoesAction(),
      listarClientesAction(),
      listarEstoqueAction(),
    ]);
    osList = (osResult.data ?? []).map((o: any) => ({
      id: o.id, numero: o.numero, status: o.status, prioridade: o.prioridade,
      dataAbertura: o.data_abertura, dataPrevisao: o.data_previsao,
      clienteNome: o.clientes?.nome ?? "—",
      equipamentoNome: o.equipamentos?.nome ?? "—",
      tecnicoNome: o.usuarios?.nome,
      valorTotal: Number(o.valor_total ?? 0),
    }));
    resumoFin = { ...demoResumoFinanceiro, ...finResult };
    transacoesRecentes = (transResult.data ?? []).slice(0, 5);
    totalClientes = clientesResult.data?.length ?? 0;
    produtosSemEstoque = (estoqueResult.data ?? []).filter((i: any) => Number(i.quantidade) <= 0).length;
  }

  const osAbertas = osList.filter((o: any) => statusAberto.includes(o.status)).length;
  const osAtrasadas = osList.filter(
    (o: any) => o.dataPrevisao && new Date(o.dataPrevisao) < hoje && statusAberto.includes(o.status)
  );
  const osProntas = osList.filter((o: any) => o.status === "pronto").length;

  const osPorDia = [1, 3, 2, 5, 4, 2, 1];

  const kpis = [
    {
      label: "OS em aberto",
      value: osAbertas.toString(),
      sub: `${osAtrasadas.length} atrasada${osAtrasadas.length !== 1 ? "s" : ""}`,
      subColor: osAtrasadas.length > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-fg-subtle)]",
      icon: FileText,
      color: "var(--color-brand-600)",
      bg: "var(--color-brand-50)",
      href: "/os",
    },
    {
      label: "Receita do mês",
      value: formatCurrency(resumoFin.receitaMes),
      sub: "+12% vs. mês anterior",
      subColor: "text-[var(--color-success)]",
      icon: TrendingUp,
      color: "var(--color-success)",
      bg: "var(--color-success-bg)",
      href: "/financeiro",
    },
    {
      label: "Prontas p/ retirar",
      value: osProntas.toString(),
      sub: "Aguardando o cliente",
      subColor: "text-[var(--color-warning)]",
      icon: Clock,
      color: "var(--color-warning)",
      bg: "var(--color-warning-bg)",
      href: "/os?filtro=prontas",
    },
    {
      label: "Clientes ativos",
      value: totalClientes.toString(),
      sub: "clientes cadastrados",
      subColor: "text-[var(--color-fg-subtle)]",
      icon: Users,
      color: "var(--color-info)",
      bg: "var(--color-info-bg)",
      href: "/clientes",
    },
  ];

  const osRecentes = demoOS.slice(0, 6);

  const emTresDias = new Date(hoje);
  emTresDias.setDate(hoje.getDate() + 3);
  const osPorPrazo = demoOS
    .filter((o) => o.dataPrevisao && statusAberto.includes(o.status))
    .sort((a, b) => {
      const prioOrder = { urgente: 0, alta: 1, media: 2, baixa: 3 };
      return (prioOrder[a.prioridade as keyof typeof prioOrder] ?? 3) - (prioOrder[b.prioridade as keyof typeof prioOrder] ?? 3);
    })
    .slice(0, 5);

  const feedAtividades = [
    { id: 1, tipo: "os_concluida", icon: CheckCircle2, cor: "var(--color-success)", label: "OS #2026-0035 concluída por", autor: "Ana Ribeiro", tempo: "2 min atrás", href: "/os/os-8" },
    { id: 2, tipo: "os_criada", icon: FileText, cor: "var(--color-brand-600)", label: "Nova OS #2026-0042 aberta por", autor: "Atendimento", tempo: "18 min atrás", href: "/os/os-1" },
    { id: 3, tipo: "pagamento", icon: Wallet, cor: "var(--color-success)", label: "Pagamento de R$ 450 recebido de", autor: "Maria Aparecida", tempo: "34 min atrás", href: "/financeiro" },
    { id: 4, tipo: "avaliacao", icon: Star, cor: "var(--color-warning)", label: "Avaliação 5★ recebida de", autor: "Construtora Horizonte", tempo: "1h atrás", href: "/clientes/cli-3" },
    { id: 5, tipo: "os_cancelada", icon: XCircle, cor: "var(--color-danger)", label: "OS #2026-0035 cancelada —", autor: "Cliente desistiu", tempo: "2h atrás", href: "/os/os-8" },
    { id: 6, tipo: "whatsapp", icon: MessageCircle, cor: "#25D366", label: "Mensagem enviada para", autor: "João Pedro Almeida", tempo: "3h atrás", href: "/whatsapp" },
  ];

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/hoje">
              <Sun className="size-4" />
              Painel do Dia
            </Link>
          </Button>
          <Button asChild>
            <Link href="/os/nova">
              <FileText className="size-4" />
              Nova OS
            </Link>
          </Button>
        </div>
      </div>

      {/* Onboarding */}
      <OnboardingChecklist />

      {/* Alertas */}
      <div className="space-y-2">
        {osAtrasadas.length > 0 && (
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-5 py-3">
            <AlertCircle className="size-4 shrink-0 text-[var(--color-danger)]" />
            <p className="flex-1 text-sm font-medium text-[var(--color-danger)]">
              <strong>{osAtrasadas.length}</strong> OS com prazo vencido:{" "}
              {osAtrasadas.map((o) => o.numero).join(", ")}
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/os?filtro=atrasadas">Ver</Link>
            </Button>
          </div>
        )}
        {produtosSemEstoque > 0 && (
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-5 py-3">
            <Package className="size-4 shrink-0 text-[var(--color-warning)]" />
            <p className="flex-1 text-sm font-medium text-[var(--color-warning)]">
              <strong>{produtosSemEstoque}</strong> produto(s) sem estoque no momento
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/estoque">Ver estoque</Link>
            </Button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm hover:shadow-md hover:border-[var(--color-brand-300)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] transition-transform group-hover:scale-110"
                style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                <kpi.icon className="size-5" />
              </div>
              <ArrowRight className="size-3.5 text-[var(--color-fg-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight">{kpi.value}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
            <p className={`mt-0.5 text-xs font-medium ${kpi.subColor}`}>{kpi.sub}</p>
          </Link>
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* OS recentes (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-semibold">Ordens de serviço recentes</h2>
              <Link href="/os" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-600)] hover:underline">
                Ver todas <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {osRecentes.map((os) => {
                const cfg = statusOSConfig[os.status];
                const atrasada = os.dataPrevisao && new Date(os.dataPrevisao) < hoje && statusAberto.includes(os.status);
                return (
                  <Link
                    key={os.id}
                    href={`/os/${os.id}`}
                    className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--color-surface-muted)] ${atrasada ? "bg-[var(--color-danger-bg)]/20" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{os.numero}</span>
                        {atrasada && <span className="text-[10px] font-bold text-[var(--color-danger)]">ATRASADA</span>}
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-[var(--color-fg-muted)]">
                        {os.clienteNome} · {os.equipamentoNome}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block shrink-0">
                      <p className="text-sm font-semibold">
                        {os.valorTotal > 0 ? formatCurrency(os.valorTotal) : "—"}
                      </p>
                      <p className="text-xs text-[var(--color-fg-subtle)]">{formatDate(os.dataAbertura)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Gráfico OS da semana — interativo */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">OS abertas esta semana</h2>
                <p className="text-xs text-[var(--color-fg-muted)]">Passe o mouse para ver os detalhes</p>
              </div>
              <span className="text-2xl font-bold">{osPorDia.reduce((a, b) => a + b, 0)}</span>
            </div>
            <DashboardBarChart labels={labelsSemana} values={osPorDia} height={160} />
          </div>

          {/* Próximas OS por prazo */}
          {osPorPrazo.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-[var(--color-warning)]" />
                  <h2 className="font-semibold">Próximas por prazo</h2>
                </div>
                <Link href="/os" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-600)] hover:underline">
                  Ver todas <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {osPorPrazo.map((os) => {
                  const cfg = statusOSConfig[os.status];
                  const prioColors: Record<string, string> = {
                    urgente: "var(--color-danger)",
                    alta: "var(--color-warning)",
                    media: "var(--color-brand-600)",
                    baixa: "var(--color-fg-subtle)",
                  };
                  const atrasada = os.dataPrevisao && new Date(os.dataPrevisao) < hoje;
                  return (
                    <Link
                      key={os.id}
                      href={`/os/${os.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-surface-muted)] transition-colors"
                    >
                      <div
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: prioColors[os.prioridade] ?? "var(--color-fg-subtle)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{os.numero}</p>
                        <p className="text-xs text-[var(--color-fg-muted)] truncate">{os.clienteNome}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {os.dataPrevisao && (
                          <p className={`text-[10px] mt-0.5 ${atrasada ? "text-[var(--color-danger)] font-semibold" : "text-[var(--color-fg-subtle)]"}`}>
                            {atrasada ? "⚠ " : ""}{formatDate(os.dataPrevisao)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita (1/3) */}
        <div className="space-y-6">
          {/* Resumo financeiro */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Financeiro</h2>
              <Link href="/financeiro" className="text-xs text-[var(--color-brand-600)] hover:underline">Ver tudo</Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-[var(--color-success)]" />
                  <span className="text-sm text-[var(--color-fg-muted)]">Receita</span>
                </div>
                <span className="text-sm font-semibold text-[var(--color-success)]">
                  {formatCurrency(resumoFin.receitaMes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="size-4 text-[var(--color-danger)]" />
                  <span className="text-sm text-[var(--color-fg-muted)]">Despesas</span>
                </div>
                <span className="text-sm font-semibold text-[var(--color-danger)]">
                  {formatCurrency(resumoFin.despesaMes)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-[var(--color-brand-600)]" />
                  <span className="text-sm font-semibold">Lucro</span>
                </div>
                <span className="text-base font-bold text-[var(--color-success)]">
                  {formatCurrency(resumoFin.saldoMes)}
                </span>
              </div>
            </div>
            {/* Mini progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[var(--color-fg-subtle)] mb-1">
                <span>Margem bruta</span>
                <span>{resumoFin.receitaMes > 0 ? Math.round((resumoFin.saldoMes / resumoFin.receitaMes) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-1.5 rounded-full bg-[var(--color-success)]"
                  style={{ width: `${resumoFin.receitaMes > 0 ? Math.min(100, Math.round((resumoFin.saldoMes / resumoFin.receitaMes) * 100)) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Transações recentes */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <h2 className="text-sm font-semibold">Últimas transações</h2>
              <Link href="/financeiro" className="text-xs text-[var(--color-brand-600)] hover:underline">Ver todas</Link>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {transacoesRecentes.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className={`size-1.5 rounded-full shrink-0 ${t.tipo === "receita" ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"}`} />
                  <p className="flex-1 truncate text-xs">{t.descricao}</p>
                  <span className={`text-xs font-semibold shrink-0 ${t.tipo === "receita" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                    {t.tipo === "receita" ? "+" : "−"}{formatCurrency(t.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pulso da empresa */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-[var(--color-brand-600)]" />
                <h2 className="text-sm font-semibold">Pulso da empresa</h2>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-[var(--color-success)] font-medium">
                <span className="inline-block size-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                ao vivo
              </span>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {feedAtividades.map((ev) => (
                <Link
                  key={ev.id}
                  href={ev.href}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)]">
                    <ev.icon className="size-3.5" style={{ color: ev.cor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug">
                      <span className="text-[var(--color-fg-muted)]">{ev.label} </span>
                      <span className="font-semibold">{ev.autor}</span>
                    </p>
                    <p className="text-[10px] text-[var(--color-fg-subtle)]">{ev.tempo}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Ações rápidas</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/os/nova", label: "Nova OS", icon: FileText },
                { href: "/clientes/novo", label: "Novo cliente", icon: Users },
                { href: "/financeiro", label: "Financeiro", icon: Wallet },
                { href: "/agenda", label: "Agenda", icon: Clock },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  <a.icon className="size-3.5 text-[var(--color-fg-subtle)]" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Técnicos */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Carga dos técnicos</h2>
            <div className="space-y-3">
              {[
                { nome: "Carlos Mendes", os: 8, cor: "var(--color-brand-600)" },
                { nome: "Ana Ribeiro", os: 5, cor: "var(--color-success)" },
                { nome: "Pedro Atend.", os: 3, cor: "var(--color-info)" },
              ].map((t) => {
                const pct = Math.round((t.os / 10) * 100);
                return (
                  <div key={t.nome}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5">
                        <Wrench className="size-3 text-[var(--color-fg-subtle)]" />
                        {t.nome}
                      </span>
                      <span className="font-semibold">{t.os} OS</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-muted)]">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: t.cor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
