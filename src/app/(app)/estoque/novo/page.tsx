"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

const categorias = ["Peças", "Serviços", "Acessórios", "Ferramentas", "Insumos", "Outros"];
const unidades = ["un", "cx", "par", "m", "kg", "l", "rolo"];

export default function NovoProdutoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    success("Produto cadastrado!", "O item foi adicionado ao estoque.");
    router.push("/estoque");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/estoque"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo produto</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Cadastre uma peça, insumo ou serviço no estoque</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identificação */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome do produto" required className="sm:col-span-2">
              <Input name="nome" placeholder="Ex.: Tela iPhone 14 Pro (OLED)" required />
            </FormField>
            <FormField label="Código / SKU">
              <Input name="codigo" placeholder="Ex.: TELA-IP14P-OLED" className="font-mono" />
            </FormField>
            <FormField label="Código de barras">
              <Input name="codigo_barras" placeholder="EAN-13 ou outro" className="font-mono" />
            </FormField>
            <FormField label="Categoria">
              <select name="categoria"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option value="">Selecionar...</option>
                {categorias.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Marca / Fabricante">
              <Input name="marca" placeholder="Ex.: Apple, Samsung, Dell..." />
            </FormField>
            <FormField label="Descrição" className="sm:col-span-2">
              <textarea name="descricao" rows={2}
                placeholder="Informações adicionais sobre o produto..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
            </FormField>
          </div>
        </div>

        {/* Preços */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Preços</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Custo (R$)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="valor_custo" type="number" min={0} step={0.01} placeholder="0,00" className="pl-9" />
              </div>
            </FormField>
            <FormField label="Preço de venda (R$)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="valor_venda" type="number" min={0} step={0.01} placeholder="0,00" className="pl-9" required />
              </div>
            </FormField>
          </div>
        </div>

        {/* Estoque */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Controle de estoque</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Unidade">
              <select name="unidade"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                {unidades.map((u) => <option key={u}>{u}</option>)}
              </select>
            </FormField>
            <FormField label="Qtd. inicial">
              <Input name="estoque" type="number" min={0} defaultValue={0} />
            </FormField>
            <FormField label="Estoque mínimo">
              <Input name="estoque_min" type="number" min={0} defaultValue={1} />
            </FormField>
            <FormField label="Localização" className="sm:col-span-3">
              <Input name="localizacao" placeholder="Ex.: Prateleira A3, Gaveta 2..." />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>Salvar produto</Button>
        </div>
      </form>
    </div>
  );
}
