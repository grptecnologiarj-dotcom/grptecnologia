import Link from "next/link";
import { Plus, Search, ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { demoGarantias } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarGarantiasAction } from "@/lib/actions/garantias";

export const metadata = { title: "Garantias — DeskControl" };

function diasRestantes(data: string) {
  const diff = new Date(data).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default async function GarantiasPage() {
  let garantias = demoGarantias.map((g) => ({
    id: g.id,
    status: g.status,
    data_inicio: g.dataEmissao,
    data_expiracao: g.dataExpiracao,
    tipo: (g as any).tipo ?? "servico",
    descricao: g.descricao,
    observacoes: g.observacoes ?? null,
    osNumero: g.osNumero,
    clienteNome: g.clienteNome,
    equipamentoNome: g.equipamentoNome,
    prazoMeses: g.prazoMeses,
    clientes: { nome: g.clienteNome },
    equipamentos: { nome: g.equipamentoNome, modelo: null },
    ordens_servico: { numero: g.osNumero },
  }));

  if (isSupabaseConfigured()) {
    const result = await listarGarantiasAction();
    if (result.data && result.data.length > 0) {
      garantias = (result.data as any[]).map((g) => ({
        id: g.id,
        status: g.status,
        data_inicio: g.data_inicio,
        data_expiracao: g.data_expiracao,
        tipo: g.tipo ?? "servico",
        descricao: g.descricao ?? "",
        observacoes: null,
        osNumero: g.ordens_servico?.numero ?? "—",
        clienteNome: g.clientes?.nome ?? "—",
        equipamentoNome: g.equipamentos?.nome ?? "—",
        prazoMeses: Math.round(
          (new Date(g.data_expiracao).getTime() - new Date(g.data_inicio).getTime()) / (30 * 86400000)
        ),
        clientes: g.clientes ?? { nome: "—" },
        equipamentos: g.equipamentos ?? { nome: "—", modelo: null },
        ordens_servico: g.ordens_servico ?? { numero: "—" },
      }));
    }
  }

  const ativas = garantias.filter((g) => g.status === "ativa").length;
  const aVencer = garantias.filter((g) => {
    if (g.status !== "ativa") return false;
    const dias = diasRestantes(g.data_expiracao);
    return dias > 0 && dias <= 30;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Garantias</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {ativas} garantias ativas · {aVencer} vencendo em 30 dias
          </p>
        </div>
        <Button asChild>
          <Link href="/garantias/nova">
            <Plus className="size-4" />
            Nova garantia
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm flex items-center gap-3">
          <ShieldCheck className="size-8 text-[var(--color-success)]" />
          <div>
            <p className="text-2xl font-bold">{ativas}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">Ativas</p>
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] p-4 shadow-sm flex items-center gap-3">
          <ShieldAlert className="size-8 text-[var(--color-warning)]" />
          <div>
            <p className="text-2xl font-bold text-[var(--color-warning)]">{aVencer}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">Vencendo em 30 dias</p>
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm flex items-center gap-3">
          <ShieldOff className="size-8 text-[var(--color-fg-subtle)]" />
          <div>
            <p className="text-2xl font-bold">{garantias.filter((g) => g.status === "expirada").length}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">Expiradas</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input
          placeholder="Buscar por OS, cliente ou equipamento..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        />
      </div>

      <div className="space-y-3">
        {garantias.map((gar) => {
          const ativa = gar.status === "ativa";
          const dias = diasRestantes(gar.data_expiracao);
          const urgente = ativa && dias <= 30 && dias > 0;

          return (
            <Link
              key={gar.id}
              href={`/garantias/${gar.id}`}
              className={`block rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-5 shadow-sm hover:shadow-md transition-shadow ${
                urgente ? "border-[var(--color-warning)]/40" : "border-[var(--color-border)]"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ativa ? (
                      <ShieldCheck className="size-4 text-[var(--color-success)]" />
                    ) : (
                      <ShieldOff className="size-4 text-[var(--color-fg-subtle)]" />
                    )}
                    <span className="font-semibold">{gar.osNumero}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ativa
                          ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)]"
                      }`}
                    >
                      {ativa ? "Ativa" : "Expirada"}
                    </span>
                    {urgente && (
                      <span className="rounded-full bg-[var(--color-warning-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-warning)]">
                        Vence em {dias} dias
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-medium">{gar.clienteNome}</p>
                  <p className="text-sm text-[var(--color-fg-muted)]">{gar.equipamentoNome}</p>
                  <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{gar.descricao}</p>
                  {gar.observacoes && (
                    <p className="mt-1 text-xs text-[var(--color-fg-subtle)] italic">{gar.observacoes}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{gar.prazoMeses} meses</p>
                  <p className="text-xs text-[var(--color-fg-subtle)]">
                    {formatDate(gar.data_inicio)} → {formatDate(gar.data_expiracao)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
