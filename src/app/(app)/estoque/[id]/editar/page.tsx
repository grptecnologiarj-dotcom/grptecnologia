"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoProdutos } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const categorias = ["Telas", "Baterias", "Conectores", "Cabos", "Ferramentas", "Acessórios", "Peças diversas", "Outro"];
const unidades = ["un", "pc", "kg", "m", "cx", "par"];

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const produto = demoProdutos.find(p => p.id === params.id) ?? demoProdutos[0];
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    success("Produto salvo!", "Informações atualizadas.");
    router.push(`/estoque/${produto.id}`);
  }

  const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/estoque/${produto.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar produto</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{produto.nome}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identificação */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome do produto" required className="sm:col-span-2">
              <Input name="nome" defaultValue={produto.nome} required />
            </FormField>
            <FormField label="Código / SKU">
              <Input name="codigo" defaultValue={produto.codigo ?? ""} placeholder="SKU-001" />
            </FormField>
            <FormField label="Marca">
              <Input name="marca" defaultValue={produto.marca ?? ""} />
            </FormField>
            <FormField label="Categoria" required>
              <select name="categoria" defaultValue={produto.categoria} className={selectCls}>
                {categorias.map(c => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Unidade">
              <select name="unidade" defaultValue={produto.unidade ?? "un"} className={selectCls}>
                {unidades.map(u => <option key={u}>{u}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Descrição" className="mt-4">
            <textarea name="descricao" rows={2} defaultValue={(produto as any).descricao ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>

        {/* Estoque */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Controle de estoque</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Qtd. atual" required>
              <Input name="estoque" type="number" min={0} defaultValue={produto.estoque} required />
            </FormField>
            <FormField label="Estoque mínimo">
              <Input name="estoque_min" type="number" min={0} defaultValue={produto.estoqueMin} />
            </FormField>
            <FormField label="Localização">
              <Input name="localizacao" defaultValue={(produto as any).localizacao ?? ""} placeholder="Prateleira A-3" />
            </FormField>
          </div>
        </div>

        {/* Preços */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Preços</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Custo unitário (R$)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="valor_custo" type="number" min={0} step={0.01} defaultValue={produto.valorCusto} className="pl-9" />
              </div>
            </FormField>
            <FormField label="Preço de venda (R$)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="valor_venda" type="number" min={0} step={0.01} defaultValue={produto.valorVenda} className="pl-9" />
              </div>
            </FormField>
          </div>
        </div>

        {/* Fornecedor */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Fornecedor</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome do fornecedor">
              <Input name="fornecedor" defaultValue={(produto as any).fornecedor ?? ""} />
            </FormField>
            <FormField label="Código do fornecedor">
              <Input name="cod_fornecedor" defaultValue={(produto as any).codFornecedor ?? ""} placeholder="REF-12345" />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            <Save className="size-4" />
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
