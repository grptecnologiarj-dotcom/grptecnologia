import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Package, Tag, BarChart2, Edit,
  TrendingDown, TrendingUp, AlertTriangle, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { demoProdutos } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

const movimentacoesFake = [
  { tipo: "entrada", quantidade: 5, motivo: "Compra de fornecedor", data: "2026-06-20", usuario: "Admin" },
  { tipo: "saida",  quantidade: 1, motivo: "OS #0039 — troca", data: "2026-06-22", usuario: "Carlos Mendes" },
  { tipo: "saida",  quantidade: 1, motivo: "OS #0041 — reparo", data: "2026-06-25", usuario: "Ana Ribeiro" },
  { tipo: "entrada", quantidade: 3, motivo: "Ajuste de inventário", data: "2026-06-26", usuario: "Admin" },
];

export default async function ProdutoDetalhePage({ params }: Props) {
  const { id } = await params;
  let produto: (typeof demoProdutos)[0] | undefined;

  if (isSupabaseConfigured()) {
    produto = demoProdutos.find((p) => p.id === id) ?? demoProdutos[0];
  } else {
    produto = demoProdutos.find((p) => p.id === id) ?? demoProdutos[0];
  }

  if (!produto) notFound();

  const abaixoMin = produto.estoque <= produto.estoqueMin;
  const semEstoque = produto.estoque === 0;
  const margemPct = produto.valorCusto > 0
    ? Math.round(((produto.valorVenda - produto.valorCusto) / produto.valorVenda) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/estoque"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
              <Package className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{produto.nome}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[var(--color-fg-muted)]">{produto.categoria}</span>
                {produto.marca && <span className="text-xs text-[var(--color-fg-subtle)]">· {produto.marca}</span>}
                {semEstoque && (
                  <span className="rounded-full bg-[var(--color-danger-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-danger)]">
                    Sem estoque
                  </span>
                )}
                {!semEstoque && abaixoMin && (
                  <span className="rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-warning)]">
                    Estoque baixo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/estoque/${produto.id}/movimentar`}>
              <TrendingUp className="size-4" />
              Movimentar
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/estoque/${produto.id}/editar`}>
              <Edit className="size-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Informações */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Informações do produto</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Hash,     label: "Código",       value: produto.codigo },
                { icon: Tag,      label: "Categoria",    value: produto.categoria },
                { icon: Package,  label: "Marca",        value: produto.marca },
                { icon: Hash,     label: "Unidade",      value: produto.unidade },
              ].filter(i => i.value).map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
                    <item.icon className="size-4 text-[var(--color-fg-subtle)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-fg-subtle)]">{item.label}</p>
                    <p className="text-sm font-semibold font-mono">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Movimentações */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-semibold">Movimentações</h2>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/estoque/${produto.id}/movimentar`}>+ Movimentar</Link>
              </Button>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {movimentacoesFake.map((m, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${m.tipo === "entrada" ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"}`}>
                    {m.tipo === "entrada" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.motivo}</p>
                    <p className="text-xs text-[var(--color-fg-muted)]">{m.usuario} · {m.data}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${m.tipo === "entrada" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                    {m.tipo === "entrada" ? "+" : "−"}{m.quantidade} {produto.unidade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Estoque atual */}
          <div className={`rounded-[var(--radius-lg)] border p-5 shadow-sm ${semEstoque ? "border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]" : abaixoMin ? "border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="size-4 text-[var(--color-fg-subtle)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Estoque atual</h3>
            </div>
            <div className="flex items-end gap-2">
              <p className={`text-4xl font-black ${semEstoque ? "text-[var(--color-danger)]" : abaixoMin ? "text-[var(--color-warning)]" : "text-[var(--color-fg)]"}`}>
                {produto.estoque}
              </p>
              <p className="mb-1 text-sm text-[var(--color-fg-muted)]">{produto.unidade}</p>
            </div>
            <p className="mt-1 text-xs text-[var(--color-fg-muted)]">Mínimo: {produto.estoqueMin} {produto.unidade}</p>
            {abaixoMin && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: semEstoque ? "var(--color-danger)" : "var(--color-warning)" }}>
                <AlertTriangle className="size-3.5" />
                {semEstoque ? "Produto sem estoque!" : "Estoque abaixo do mínimo"}
              </div>
            )}
          </div>

          {/* Preços */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Preços</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Custo</span>
                <span className="font-semibold">{formatCurrency(produto.valorCusto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Venda</span>
                <span className="font-bold text-[var(--color-success)]">{formatCurrency(produto.valorVenda)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-sm">
                <span className="text-[var(--color-fg-muted)]">Margem</span>
                <span className="font-bold">{margemPct}%</span>
              </div>
            </div>
            {/* Margem visual */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--color-surface-muted)]">
              <div className="h-1.5 rounded-full bg-[var(--color-success)]" style={{ width: `${margemPct}%` }} />
            </div>
          </div>

          {/* Valor em estoque */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Valor em estoque</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">A custo</span>
                <span className="font-semibold">{formatCurrency(produto.estoque * produto.valorCusto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">A venda</span>
                <span className="font-bold text-[var(--color-success)]">{formatCurrency(produto.estoque * produto.valorVenda)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
