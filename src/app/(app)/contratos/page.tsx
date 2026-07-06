import Link from "next/link";
import { Plus, Search, ScrollText, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { demoContratos } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarContratosAction } from "@/lib/actions/contratos";

export const metadata = { title: "Contratos — DeskControl" };

const statusContConfig: Record<string, { label: string; color: string; bg: string }> = {
  ativo: { label: "Ativo", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  pausado: { label: "Pausado", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  expirado: { label: "Expirado", color: "var(--color-fg-subtle)", bg: "var(--color-surface-muted)" },
  cancelado: { label: "Cancelado", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
};

const tipoConfig: Record<string, string> = {
  manutencao_preventiva: "Manutenção preventiva",
  suporte_tecnico: "Suporte técnico",
  garantia_extendida: "Garantia estendida",
  contrato_anual: "Contrato anual",
};

export default async function ContratosPage() {
  let contratos = demoContratos.map((c) => ({
    id: c.id,
    numero: c.numero,
    status: c.status,
    tipo: c.tipo,
    valor_mensal: c.valorMensal,
    data_inicio: c.inicioVigencia,
    data_fim: c.fimVigencia,
    descricao: c.descricao,
    clienteNome: c.clienteNome,
    proximaVisita: (c as any).proximaVisita ?? null,
    osGeradas: (c as any).osGeradas ?? 0,
    diaVencimento: (c as any).diaVencimento ?? 1,
    clientes: { nome: c.clienteNome },
  }));

  if (isSupabaseConfigured()) {
    const result = await listarContratosAction();
    if (result.data && result.data.length > 0) {
      contratos = (result.data as any[]).map((c) => ({
        id: c.id,
        numero: c.numero,
        status: c.status,
        tipo: c.tipo ?? "suporte_tecnico",
        valor_mensal: c.valor_mensal ?? 0,
        data_inicio: c.data_inicio,
        data_fim: c.data_fim ?? null,
        descricao: c.descricao ?? "",
        clienteNome: c.clientes?.nome ?? "—",
        proximaVisita: null,
        osGeradas: 0,
        diaVencimento: 1,
        clientes: c.clientes ?? { nome: "—" },
      }));
    }
  }

  const ativos = contratos.filter((c) => c.status === "ativo");
  const receitaMensal = ativos.reduce((sum, c) => sum + c.valor_mensal, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {ativos.length} ativos · receita recorrente: {formatCurrency(receitaMensal)}/mês
          </p>
        </div>
        <Button asChild>
          <Link href="/contratos/novo">
            <Plus className="size-4" />
            Novo contrato
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className="size-4 text-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-fg-muted)]">Receita recorrente</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--color-success)]">{formatCurrency(receitaMensal)}<span className="text-sm font-normal text-[var(--color-fg-muted)]">/mês</span></p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ScrollText className="size-4 text-[var(--color-brand-600)]" />
            <span className="text-sm text-[var(--color-fg-muted)]">Contratos ativos</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{ativos.length}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-[var(--color-warning)]" />
            <span className="text-sm text-[var(--color-fg-muted)]">Expirados</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{contratos.filter((c) => c.status === "expirado").length}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input
          placeholder="Buscar por número ou cliente..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        />
      </div>

      <div className="space-y-4">
        {contratos.map((cont) => {
          const cfg = statusContConfig[cont.status] ?? statusContConfig.ativo;
          return (
            <div key={cont.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-[var(--color-fg-muted)]">{cont.numero}</span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs text-[var(--color-fg-subtle)]">{tipoConfig[cont.tipo] ?? cont.tipo}</span>
                  </div>
                  <h3 className="mt-2 font-semibold">{cont.clienteNome}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)]">{cont.descricao}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--color-fg-subtle)]">
                    {cont.data_inicio && <span>Início: {formatDate(cont.data_inicio)}</span>}
                    {cont.data_fim && <span>Término: {formatDate(cont.data_fim)}</span>}
                    {cont.proximaVisita && <span>Próxima visita: {formatDate(cont.proximaVisita)}</span>}
                    {cont.osGeradas > 0 && <span>OS geradas: {cont.osGeradas}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold">{formatCurrency(cont.valor_mensal)}</p>
                  <p className="text-xs text-[var(--color-fg-muted)]">por mês · dia {cont.diaVencimento}</p>
                  <Link href={`/contratos/${cont.id}`} className="mt-3 inline-block rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-surface-muted)] transition-colors">
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
