import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ScrollText, Building2, Calendar, Wallet,
  CheckCircle2, Pause, XCircle, RefreshCw, Wrench, Edit, Phone, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { demoContratos, demoOS, statusOSConfig } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Contrato #${id.slice(0, 6)}` };
}

const statusContConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ativo:     { label: "Ativo",     color: "var(--color-success)",      bg: "var(--color-success-bg)",      icon: CheckCircle2 },
  pausado:   { label: "Pausado",   color: "var(--color-warning)",      bg: "var(--color-warning-bg)",      icon: Pause },
  expirado:  { label: "Expirado",  color: "var(--color-fg-subtle)",    bg: "var(--color-surface-muted)",   icon: Calendar },
  cancelado: { label: "Cancelado", color: "var(--color-danger)",       bg: "var(--color-danger-bg)",       icon: XCircle },
};

const tipoLabels: Record<string, string> = {
  manutencao_preventiva: "Manutenção preventiva",
  suporte_tecnico: "Suporte técnico",
  garantia_extendida: "Garantia estendida",
  contrato_anual: "Contrato anual",
};

export default async function ContratoDetalhePage({ params }: Props) {
  const { id } = await params;
  let contrato: (typeof demoContratos)[0] | undefined;

  if (isSupabaseConfigured()) {
    contrato = demoContratos.find((c) => c.id === id) ?? demoContratos[0];
  } else {
    contrato = demoContratos.find((c) => c.id === id) ?? demoContratos[0];
  }

  if (!contrato) notFound();

  const cfg = statusContConfig[contrato.status] ?? statusContConfig.ativo;
  const StatusIcon = cfg.icon;

  const osDoContrato = demoOS.filter((o) =>
    o.clienteNome === contrato!.clienteNome
  ).slice(0, 4);

  const dataInicioStr = (contrato as any).dataInicio ?? (contrato as any).inicioVigencia ?? "";
  const dataFimStr = (contrato as any).dataFim ?? (contrato as any).fimVigencia ?? "";
  const mesesDecorridos = Math.max(1, Math.ceil(
    (Date.now() - new Date(dataInicioStr).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/contratos"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{contrato.numero}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                <StatusIcon className="size-3" />
                {cfg.label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-fg-muted)]">
              {tipoLabels[contrato.tipo] ?? contrato.tipo} · {contrato.clienteNome}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/contratos/${contrato.id}/editar`}>
              <Edit className="size-4" />
              Editar
            </Link>
          </Button>
          {contrato.status === "ativo" && (
            <Button variant="outline" size="sm" className="text-[var(--color-danger)] hover:border-[var(--color-danger)]">
              <XCircle className="size-4" />
              Cancelar contrato
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Dados do contrato */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="font-semibold mb-5">Detalhes do contrato</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { icon: Building2, label: "Cliente", value: contrato.clienteNome },
                { icon: ScrollText, label: "Tipo", value: tipoLabels[contrato.tipo] ?? contrato.tipo },
                { icon: Calendar, label: "Início", value: formatDate(dataInicioStr) },
                { icon: Calendar, label: "Término previsto", value: dataFimStr ? formatDate(dataFimStr) : "Indeterminado" },
                { icon: RefreshCw, label: "Periodicidade", value: (() => { const p = (contrato as any).periodicidade ?? "mensal"; return p === "mensal" ? "Mensal" : p === "anual" ? "Anual" : p; })() },
                { icon: Wallet, label: "Valor mensal", value: formatCurrency(contrato.valorMensal) },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
                    <item.icon className="size-4 text-[var(--color-fg-subtle)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-fg-subtle)]">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {(contrato as any).descricao && (
              <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                <p className="text-xs text-[var(--color-fg-subtle)] mb-2">Descrição / escopo</p>
                <p className="text-sm leading-relaxed">{(contrato as any).descricao}</p>
              </div>
            )}

            {(contrato as any).equipamentosIncluidos && (contrato as any).equipamentosIncluidos.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-[var(--color-fg-subtle)] mb-2">Equipamentos cobertos</p>
                <div className="flex flex-wrap gap-2">
                  {(contrato as any).equipamentosIncluidos.map((e: string, i: number) => (
                    <span key={i} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OS do contrato */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-semibold">Atendimentos vinculados</h2>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/os/nova?contrato_id=${contrato.id}`}>
                  <Wrench className="size-4" />
                  Novo atendimento
                </Link>
              </Button>
            </div>
            {osDoContrato.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <Wrench className="size-8 text-[var(--color-fg-subtle)]" />
                <p className="text-sm text-[var(--color-fg-muted)]">Nenhum atendimento registrado neste contrato.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {osDoContrato.map((os) => {
                  const osCfg = statusOSConfig[os.status];
                  return (
                    <Link key={os.id} href={`/os/${os.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-surface-muted)] transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{os.numero}</span>
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: osCfg.bg, color: osCfg.color }}>
                            {osCfg.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--color-fg-muted)] truncate">{os.equipamentoNome}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatCurrency(os.valorTotal)}</p>
                        <p className="text-xs text-[var(--color-fg-subtle)]">{formatDate(os.dataAbertura)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Financeiro */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Financeiro</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Mensalidade</span>
                <span className="font-bold">{formatCurrency(contrato.valorMensal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Meses ativos</span>
                <span className="font-bold">{mesesDecorridos}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-sm">
                <span className="font-semibold">Total faturado</span>
                <span className="font-bold text-[var(--color-success)]">
                  {formatCurrency(contrato.valorMensal * mesesDecorridos)}
                </span>
              </div>
            </div>
          </div>

          {/* Próxima cobrança */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Próxima cobrança</h3>
            <div className="space-y-1.5">
              <p className="text-xl font-bold text-[var(--color-brand-600)]">{formatCurrency(contrato.valorMensal)}</p>
              <p className="text-xs text-[var(--color-fg-muted)]">Vencimento em {contrato.diaVencimento ?? 10}º de cada mês</p>
            </div>
          </div>

          {/* Contato cliente */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Cliente</h3>
            <div className="space-y-2">
              <p className="text-sm font-semibold">{contrato.clienteNome}</p>
              {(contrato as any).clienteTelefone && (
                <div className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                  <Phone className="size-3" />
                  {(contrato as any).clienteTelefone}
                </div>
              )}
              {(contrato as any).clienteEmail && (
                <div className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                  <Mail className="size-3" />
                  {(contrato as any).clienteEmail}
                </div>
              )}
              <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                <Link href={`/clientes/${(contrato as any).clienteId ?? "demo"}`}>Ver perfil do cliente</Link>
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Histórico</h3>
            <div className="space-y-3">
              {[
                { label: "Contrato criado", date: dataInicioStr, done: true },
                { label: "Ativado", date: dataInicioStr, done: contrato.status !== "cancelado" },
                { label: "Renovação prevista", date: dataFimStr ?? "", done: false },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`size-2 rounded-full shrink-0 ${e.done ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"}`} />
                  <div className="flex-1 flex justify-between">
                    <span className={`text-xs ${!e.done ? "text-[var(--color-fg-subtle)]" : ""}`}>{e.label}</span>
                    {e.date && <span className="text-xs text-[var(--color-fg-subtle)]">{formatDate(e.date)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
