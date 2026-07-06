import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, ShieldAlert, ShieldOff, Calendar,
  Wrench, ExternalLink, Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { demoGarantias } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

function diasRestantes(data: string) {
  return Math.ceil((new Date(data).getTime() - Date.now()) / 86400000);
}

const statusCfg: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ativa:    { label: "Ativa",    color: "var(--color-success)",   bg: "var(--color-success-bg)",    icon: ShieldCheck },
  expirada: { label: "Expirada", color: "var(--color-fg-subtle)", bg: "var(--color-surface-muted)", icon: ShieldOff },
  cancelada:{ label: "Cancelada",color: "var(--color-danger)",    bg: "var(--color-danger-bg)",     icon: ShieldAlert },
};

export default async function GarantiaDetalhePage({ params }: Props) {
  const { id } = await params;
  let garantia: (typeof demoGarantias)[0] | undefined;

  if (isSupabaseConfigured()) {
    garantia = demoGarantias.find((g) => g.id === id) ?? demoGarantias[0];
  } else {
    garantia = demoGarantias.find((g) => g.id === id) ?? demoGarantias[0];
  }

  if (!garantia) notFound();

  const cfg = statusCfg[garantia.status] ?? statusCfg.ativa;
  const StatusIcon = cfg.icon;
  const dias = diasRestantes(garantia.dataExpiracao);
  const dataInicioGar = (garantia as any).dataInicio ?? (garantia as any).dataEmissao;
  const pctDecorrido = Math.min(
    100,
    Math.round(
      ((Date.now() - new Date(dataInicioGar).getTime()) /
        (new Date(garantia.dataExpiracao).getTime() - new Date(dataInicioGar).getTime())) *
        100
    )
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/garantias"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">{(garantia as any).numero ?? garantia.osNumero}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              <StatusIcon className="size-3" />
              {cfg.label}
            </span>
            {garantia.status === "ativa" && dias <= 30 && dias > 0 && (
              <span className="rounded-full bg-[var(--color-warning-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-warning)]">
                Vence em {dias} dia{dias !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-[var(--color-fg-muted)]">
            {garantia.clienteNome} · {garantia.equipamentoNome}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/garantias/${garantia.id}/editar`}>
            <Edit className="size-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Card principal */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
              <ShieldCheck className="size-4 text-[var(--color-fg-subtle)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-subtle)]">Tipo de garantia</p>
              <p className="text-sm font-semibold capitalize">{((garantia as any).tipo ?? "reparo").replace(/_/g, " ")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
              <Calendar className="size-4 text-[var(--color-fg-subtle)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-subtle)]">Início</p>
              <p className="text-sm font-semibold">{formatDate((garantia as any).dataInicio ?? (garantia as any).dataEmissao)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
              <Calendar className="size-4 text-[var(--color-fg-subtle)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-subtle)]">Expiração</p>
              <p className={`text-sm font-semibold ${dias <= 7 && garantia.status === "ativa" ? "text-[var(--color-danger)]" : ""}`}>
                {formatDate(garantia.dataExpiracao)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
              <Wrench className="size-4 text-[var(--color-fg-subtle)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-fg-subtle)]">OS de origem</p>
              {garantia.osNumero ? (
                <Link href={`/os/${(garantia as any).osId ?? "demo"}`} className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline inline-flex items-center gap-1">
                  {garantia.osNumero} <ExternalLink className="size-3" />
                </Link>
              ) : (
                <p className="text-sm text-[var(--color-fg-muted)]">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
          <div className="flex justify-between text-xs text-[var(--color-fg-subtle)] mb-1.5">
            <span>{formatDate((garantia as any).dataInicio ?? (garantia as any).dataEmissao)}</span>
            <span className="font-semibold">
              {garantia.status === "ativa"
                ? dias > 0
                  ? `${dias} dias restantes`
                  : "Vencida"
                : garantia.status}
            </span>
            <span>{formatDate(garantia.dataExpiracao)}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[var(--color-surface-muted)]">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{
                width: `${pctDecorrido}%`,
                backgroundColor: pctDecorrido > 80 ? "var(--color-warning)" : "var(--color-success)",
              }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-[var(--color-fg-subtle)]">{pctDecorrido}% do prazo utilizado</p>
        </div>
      </div>

      {/* Cobertura */}
      {((garantia as any).cobertura ?? (garantia as any).observacoes) && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-3">O que está coberto</h2>
          <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{(garantia as any).cobertura ?? (garantia as any).observacoes}</p>
        </div>
      )}

      {/* Equipamento */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Equipamento</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{garantia.equipamentoNome}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">Cliente: {garantia.clienteNome}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clientes/${(garantia as any).clienteId ?? "demo"}`}>Ver cliente</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
