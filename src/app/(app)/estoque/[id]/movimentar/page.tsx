"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowDown, ArrowUp, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoProdutos } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

export default function MovimentarEstoquePage() {
  const params = useParams();
  const router = useRouter();
  const produto = demoProdutos.find((p) => p.id === params.id) ?? demoProdutos[0];

  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState(1);
  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [saved, setSaved] = useState(false);

  const novoEstoque = tipo === "entrada"
    ? produto.estoque + quantidade
    : Math.max(0, produto.estoque - quantidade);

  const saldoInsuficiente = tipo === "saida" && quantidade > produto.estoque;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saldoInsuficiente) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    success("Movimentação registrada!", "O estoque foi atualizado com sucesso.");
    setSaved(true);
    setTimeout(() => router.push(`/estoque/${produto.id}`), 1200);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
          <Package className="size-8 text-[var(--color-success)]" />
        </div>
        <h2 className="text-xl font-bold">Movimentação registrada!</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          {tipo === "entrada" ? "+" : "-"}{quantidade} {produto.unidade} · Novo estoque: {novoEstoque} {produto.unidade}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href={`/estoque/${produto.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimentar estoque</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{produto.nome}</p>
        </div>
      </div>

      {/* Card do produto */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]">
          <Package className="size-6 text-[var(--color-fg-subtle)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{produto.nome}</p>
          <p className="text-xs text-[var(--color-fg-muted)]">{produto.codigo} · {produto.categoria}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold">{produto.estoque}</p>
          <p className="text-xs text-[var(--color-fg-muted)]">{produto.unidade} em estoque</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Tipo */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Tipo de movimentação</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipo("entrada")}
              className={`flex flex-col items-center gap-2 rounded-[var(--radius-md)] border-2 p-4 transition-colors ${
                tipo === "entrada"
                  ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              <ArrowDown className={`size-6 ${tipo === "entrada" ? "text-[var(--color-success)]" : "text-[var(--color-fg-subtle)]"}`} />
              <span className={`text-sm font-semibold ${tipo === "entrada" ? "text-[var(--color-success)]" : ""}`}>
                Entrada
              </span>
              <span className="text-xs text-[var(--color-fg-muted)]">Compra, recebimento</span>
            </button>
            <button
              type="button"
              onClick={() => setTipo("saida")}
              className={`flex flex-col items-center gap-2 rounded-[var(--radius-md)] border-2 p-4 transition-colors ${
                tipo === "saida"
                  ? "border-[var(--color-danger)] bg-[var(--color-danger-bg)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              <ArrowUp className={`size-6 ${tipo === "saida" ? "text-[var(--color-danger)]" : "text-[var(--color-fg-subtle)]"}`} />
              <span className={`text-sm font-semibold ${tipo === "saida" ? "text-[var(--color-danger)]" : ""}`}>
                Saída
              </span>
              <span className="text-xs text-[var(--color-fg-muted)]">Uso em OS, descarte</span>
            </button>
          </div>
        </div>

        {/* Detalhes */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <h2 className="font-semibold">Detalhes</h2>

          <FormField label={`Quantidade (${produto.unidade})`} required>
            <Input
              type="number"
              min={1}
              max={tipo === "saida" ? produto.estoque : undefined}
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
              required
            />
          </FormField>

          {saldoInsuficiente && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
              <AlertTriangle className="size-4 shrink-0" />
              Quantidade maior que o estoque disponível ({produto.estoque} {produto.unidade})
            </div>
          )}

          <FormField label="Motivo / origem">
            <select name="motivo"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
              {tipo === "entrada" ? (
                <>
                  <option>Compra de fornecedor</option>
                  <option>Devolução de OS</option>
                  <option>Ajuste de inventário</option>
                  <option>Outro</option>
                </>
              ) : (
                <>
                  <option>Uso em OS</option>
                  <option>Venda direta</option>
                  <option>Descarte / avaria</option>
                  <option>Ajuste de inventário</option>
                  <option>Outro</option>
                </>
              )}
            </select>
          </FormField>

          {tipo === "entrada" && (
            <FormField label="Custo unitário (R$)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="custo_unit" type="number" min={0} step={0.01}
                  defaultValue={produto.valorCusto} className="pl-9" />
              </div>
            </FormField>
          )}

          <FormField label="Nota fiscal / referência">
            <Input name="referencia" placeholder="NF-e 12345 ou OS-2026-0042..." />
          </FormField>

          <FormField label="Observações">
            <textarea name="observacoes" rows={2}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none"
              placeholder="Informações adicionais..." />
          </FormField>
        </div>

        {/* Preview do novo estoque */}
        <div className={`rounded-[var(--radius-lg)] border p-4 flex items-center justify-between ${
          saldoInsuficiente
            ? "border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]"
            : "border-[var(--color-border)] bg-[var(--color-surface-muted)]"
        }`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">Estoque após movimentação</p>
            <p className="text-2xl font-bold mt-0.5">{saldoInsuficiente ? "—" : `${novoEstoque} ${produto.unidade}`}</p>
          </div>
          <div className="text-right text-sm text-[var(--color-fg-muted)]">
            <p>{produto.estoque} atual</p>
            <p className={tipo === "entrada" ? "text-[var(--color-success)] font-semibold" : "text-[var(--color-danger)] font-semibold"}>
              {tipo === "entrada" ? "+" : "-"}{quantidade}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving} disabled={saldoInsuficiente}>
            Registrar {tipo === "entrada" ? "entrada" : "saída"}
          </Button>
        </div>
      </form>
    </div>
  );
}
