import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Send, Printer, CheckCircle2, XCircle,
  Clock, FileText, User, Calendar, Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { demoOrcamentos } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  rascunho: { label: "Rascunho", color: "#6b7280", bg: "#f3f4f6", icon: FileText },
  enviado: { label: "Enviado", color: "#2563eb", bg: "#eff6ff", icon: Send },
  aprovado: { label: "Aprovado", color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
  reprovado: { label: "Reprovado", color: "#dc2626", bg: "#fef2f2", icon: XCircle },
  expirado: { label: "Expirado", color: "#d97706", bg: "#fffbeb", icon: Clock },
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Orçamento #${id.slice(0, 6)}` };
}

export default async function OrcamentoDetalhePage({ params }: Props) {
  const { id } = await params;

  let orc: (typeof demoOrcamentos)[0] | undefined;

  if (isSupabaseConfigured()) {
    orc = demoOrcamentos.find((o) => o.id === id) ?? demoOrcamentos[0];
  } else {
    orc = demoOrcamentos.find((o) => o.id === id) ?? demoOrcamentos[0];
  }

  if (!orc) notFound();

  const cfg = statusConfig[orc.status] ?? statusConfig.rascunho;
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/orcamentos"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{orc.numero}</h1>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
              >
                <StatusIcon className="size-3" />
                {cfg.label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-fg-muted)]">
              {orc.titulo} · Criado em {formatDate(orc.dataCriacao)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant="outline" size="sm">
            <Printer className="size-4" />
            Imprimir
          </Button>
          {(orc.status === "rascunho" || orc.status === "enviado") && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orcamentos/${orc.id}/editar`}>
                <Edit className="size-4" />
                Editar
              </Link>
            </Button>
          )}
          {orc.status === "rascunho" && (
            <Button size="sm">
              <Send className="size-4" />
              Enviar ao cliente
            </Button>
          )}
          {orc.status === "enviado" && (
            <>
              <Button variant="outline" size="sm" className="text-[var(--color-danger)] hover:border-[var(--color-danger)]">
                <XCircle className="size-4" />
                Reprovar
              </Button>
              <Button size="sm">
                <CheckCircle2 className="size-4" />
                Aprovar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Preview do orçamento */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
            {/* Cabeçalho do documento */}
            <div className="bg-[var(--color-brand-600)] px-6 py-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Orçamento</p>
                  <p className="text-2xl font-bold">{orc.numero}</p>
                </div>
                <div className="text-right text-sm opacity-90">
                  <p className="font-semibold">Sua Empresa Ltda.</p>
                  <p className="text-xs">CNPJ: 00.000.000/0001-00</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[var(--color-fg-subtle)]">Cliente</p>
                  <p className="font-semibold text-sm mt-0.5">{orc.clienteNome}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-fg-subtle)]">Data de emissão</p>
                  <p className="font-semibold text-sm mt-0.5">{formatDate(orc.dataCriacao)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-fg-subtle)]">Válido até</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {orc.dataValidade ? formatDate(orc.dataValidade) : "—"}
                  </p>
                </div>
              </div>

              {/* Itens */}
              <div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">Descrição</th>
                      <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] w-16">Qtd.</th>
                      <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] w-28">Unit.</th>
                      <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {(orc.itens ?? []).map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5">
                          <p className="font-medium">{item.descricao}</p>
                          {item.tipo && (
                            <span className="text-xs text-[var(--color-fg-muted)] capitalize">{item.tipo}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center text-[var(--color-fg-muted)]">{item.quantidade}</td>
                        <td className="py-2.5 text-right text-[var(--color-fg-muted)]">{formatCurrency(item.valorUnitario)}</td>
                        <td className="py-2.5 text-right font-semibold">{formatCurrency(item.quantidade * item.valorUnitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totais */}
              <div className="flex justify-end">
                <div className="space-y-1.5 w-56">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-fg-muted)]">Subtotal</span>
                    <span>{formatCurrency(orc.valorTotal)}</span>
                  </div>
                  {(orc.valorDesconto ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-fg-muted)]">Desconto</span>
                      <span className="text-[var(--color-danger)]">−{formatCurrency(orc.valorDesconto!)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold">
                    <span>Total</span>
                    <span className="text-[var(--color-success)]">
                      {formatCurrency(orc.valorTotal - (orc.valorDesconto ?? 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Obs */}
              {orc.observacoes && (
                <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-xs font-semibold mb-1 text-[var(--color-fg-subtle)]">Observações</p>
                  <p className="text-sm leading-relaxed">{orc.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4">
          {/* Dados */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Detalhes</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <User className="size-4 text-[var(--color-fg-subtle)] shrink-0" />
                <span className="text-[var(--color-fg-muted)]">Cliente:</span>
                <Link href={`/clientes/${orc.clienteId}`} className="font-medium text-[var(--color-brand-600)] hover:underline">
                  {orc.clienteNome}
                </Link>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="size-4 text-[var(--color-fg-subtle)] shrink-0" />
                <span className="text-[var(--color-fg-muted)]">Criado:</span>
                <span className="font-medium">{formatDate(orc.dataCriacao)}</span>
              </div>
              {orc.dataValidade && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="size-4 text-[var(--color-fg-subtle)] shrink-0" />
                  <span className="text-[var(--color-fg-muted)]">Validade:</span>
                  <span className="font-medium">{formatDate(orc.dataValidade)}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <FileText className="size-4 text-[var(--color-fg-subtle)] shrink-0" />
                <span className="text-[var(--color-fg-muted)]">Valor:</span>
                <span className="font-bold text-[var(--color-success)]">{formatCurrency(orc.valorTotal)}</span>
              </div>
            </div>
          </div>

          {/* Timeline status */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Histórico</h3>
            <div className="space-y-3">
              {[
                { label: "Orçamento criado", date: orc.dataCriacao, done: true },
                { label: "Enviado ao cliente", date: orc.dataEnvio, done: !!orc.dataEnvio },
                { label: "Aprovado", date: orc.dataAprovacao, done: !!orc.dataAprovacao },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`size-2 rounded-full shrink-0 ${e.done ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"}`} />
                  <div className="flex-1 flex justify-between">
                    <span className={`text-xs ${e.done ? "" : "text-[var(--color-fg-subtle)]"}`}>{e.label}</span>
                    {e.date && <span className="text-xs text-[var(--color-fg-subtle)]">{formatDate(e.date)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Link de aprovação */}
          {orc.linkAprovacao && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-2">Link do cliente</h3>
              <p className="text-xs text-[var(--color-fg-muted)] mb-2">Compartilhe com o cliente para aprovação online:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-[var(--color-surface-muted)] px-2 py-1 text-xs font-mono">
                  {orc.linkAprovacao}
                </code>
                <Button size="sm" variant="outline" type="button">Copiar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
