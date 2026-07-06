import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarEstoqueAction } from "@/lib/actions/estoque";
import { demoProdutos } from "@/lib/demo-data";
import { EstoqueListClient } from "./estoque-list-client";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Estoque" };

export default async function EstoquePage() {
  let itens: any[] = [];

  if (isSupabaseConfigured()) {
    const result = await listarEstoqueAction();
    itens = result.data ?? [];
  } else {
    itens = demoProdutos.map(p => ({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      marca: null,
      quantidade: p.estoque,
      quantidade_minima: (p as any).estoqueMin ?? 2,
      preco_custo: (p as any).valorCusto ?? 0,
      preco_venda: (p as any).precoVenda ?? 0,
      localizacao: null,
    }));
  }

  const totalItens   = itens.length;
  const semEstoque   = itens.filter(i => Number(i.quantidade) <= 0).length;
  const criticos     = itens.filter(i => Number(i.quantidade) > 0 && Number(i.quantidade) <= Number(i.quantidade_minima)).length;
  const valorTotal   = itens.reduce((s, i) => s + Number(i.quantidade) * Number(i.preco_custo), 0);

  const kpis = [
    { label: "Total de Itens",   value: String(totalItens),         color: "brand"   },
    { label: "Sem Estoque",      value: String(semEstoque),         color: "danger"  },
    { label: "Estoque Crítico",  value: String(criticos),           color: "warning" },
    { label: "Valor em Estoque", value: formatCurrency(valorTotal), color: "success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {totalItens} itens · valor em estoque: {formatCurrency(valorTotal)}
          </p>
        </div>
        <Button asChild>
          <Link href="/estoque/novo">
            <Plus className="size-4" />
            Novo Item
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs text-[var(--color-fg-subtle)]">{k.label}</p>
            <p className={`mt-1 text-2xl font-bold text-[var(--color-${k.color}-600)]`}>{k.value}</p>
          </div>
        ))}
      </div>

      <EstoqueListClient initialData={itens} />
    </div>
  );
}
