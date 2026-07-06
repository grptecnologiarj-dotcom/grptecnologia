import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { demoOrcamentos } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarOrcamentosAction } from "@/lib/actions/orcamentos";

export const metadata = { title: "Orçamentos — DeskControl" };

const statusOrcConfig: Record<string, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "var(--color-fg-muted)", bg: "var(--color-surface-muted)" },
  enviado: { label: "Enviado", color: "#2563eb", bg: "#eff6ff" },
  aguardando_aprovacao: { label: "Aguardando aprovação", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  aprovado: { label: "Aprovado", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  reprovado: { label: "Reprovado", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  recusado: { label: "Recusado", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  expirado: { label: "Expirado", color: "var(--color-fg-subtle)", bg: "var(--color-surface-muted)" },
};

export default async function OrcamentosPage() {
  let orcamentos = demoOrcamentos.map((o) => ({
    id: o.id,
    numero: o.numero,
    status: o.status,
    valor_total: o.valorTotal,
    validade: (o as any).dataValidade ?? (o as any).validoAte ?? null,
    descricao: (o as any).titulo ?? (o as any).descricao ?? "",
    clientes: { nome: o.clienteNome },
    equipamentos: { nome: o.equipamentoNome, modelo: null },
  }));

  if (isSupabaseConfigured()) {
    const result = await listarOrcamentosAction();
    if (result.data && result.data.length > 0) {
      orcamentos = (result.data as any[]).map((o) => ({
        id: o.id,
        numero: o.numero,
        status: o.status,
        valor_total: o.valor_total ?? 0,
        validade: o.validade ?? null,
        descricao: o.descricao ?? "",
        clientes: o.clientes ?? { nome: "—" },
        equipamentos: o.equipamentos ?? { nome: "—", modelo: null },
      }));
    }
  }

  const pendentes = orcamentos.filter((o) => o.status === "enviado" || o.status === "aguardando_aprovacao").length;
  const totalMes = orcamentos.filter((o) => o.status === "aprovado").reduce((sum, o) => sum + o.valor_total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {pendentes} aguardando aprovação · {formatCurrency(totalMes)} aprovados
          </p>
        </div>
        <Button asChild>
          <Link href="/orcamentos/novo">
            <Plus className="size-4" />
            Novo orçamento
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Rascunho", status: "rascunho" },
          { label: "Aguardando", status: "aguardando_aprovacao" },
          { label: "Aprovados", status: "aprovado" },
          { label: "Recusados", status: "recusado" },
        ].map(({ label, status }) => {
          const cfg = statusOrcConfig[status];
          const count = orcamentos.filter((o) => o.status === status).length;
          return (
            <div key={status} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm">
              <p className="text-2xl font-bold">{count}</p>
              <span className="text-xs font-medium" style={{ color: cfg.color }}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input
          placeholder="Buscar por número ou cliente..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Número</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Cliente / Equipamento</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Descrição</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] sm:table-cell">Validade</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {orcamentos.map((orc) => {
                const cfg = statusOrcConfig[orc.status] ?? statusOrcConfig.rascunho;
                return (
                  <tr key={orc.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3">
                      <Link href={`/orcamentos/${orc.id}`} className="flex items-center gap-2">
                        <FileText className="size-4 text-[var(--color-fg-subtle)]" />
                        <span className="font-semibold text-[var(--color-brand-600)] hover:underline">{orc.numero}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{orc.clientes?.nome ?? "—"}</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">{orc.equipamentos?.nome ?? ""}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-muted)] md:table-cell">
                      {orc.descricao || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] sm:table-cell">
                      {orc.validade ? formatDate(orc.validade) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {orc.valor_total > 0 ? formatCurrency(orc.valor_total) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
