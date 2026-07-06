"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Wrench, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoOrcamentos, demoClientes, demoEquipamentos } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

type Item = { descricao: string; tipo: "peca" | "servico"; quantidade: number; valorUnitario: number };

export default function EditarOrcamentoPage() {
  const params = useParams();
  const router = useRouter();
  const orc = demoOrcamentos.find(o => o.id === params.id) ?? demoOrcamentos[0];

  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [itens, setItens] = useState<Item[]>(orc.itens as Item[]);
  const [desconto, setDesconto] = useState(orc.valorDesconto ?? 0);

  const subtotal = itens.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0);
  const total = Math.max(0, subtotal - desconto);

  function addItem(tipo: "peca" | "servico") {
    setItens(prev => [...prev, { descricao: tipo === "servico" ? "Serviço" : "Peça", tipo, quantidade: 1, valorUnitario: 0 }]);
  }

  function updateItem(idx: number, field: keyof Item, val: string | number) {
    setItens(prev => prev.map((item, i) => i === idx ? { ...item, [field]: field === "descricao" ? val : Number(val) } : item));
  }

  function removeItem(idx: number) {
    setItens(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    success("Orçamento salvo!", "Alterações registradas.");
    router.push(`/orcamentos/${orc.id}`);
  }

  const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/orcamentos/${orc.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar orçamento</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{orc.numero}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Dados gerais */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Dados gerais</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Título" required className="sm:col-span-2">
              <Input name="titulo" defaultValue={orc.titulo} required />
            </FormField>
            <FormField label="Cliente" required>
              <select name="cliente_id" defaultValue={orc.clienteId} className={selectCls}>
                {demoClientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
            <FormField label="Equipamento">
              <Input name="equipamento" defaultValue={orc.equipamentoNome} placeholder="Nome do equipamento" />
            </FormField>
            <FormField label="Validade">
              <Input name="data_validade" type="date" defaultValue={orc.dataValidade ? orc.dataValidade.slice(0, 10) : ""} />
            </FormField>
            <FormField label="Status">
              <select name="status" defaultValue={orc.status} className={selectCls}>
                {["rascunho", "enviado", "aprovado", "reprovado", "expirado"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Itens */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold">Itens do orçamento</h2>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("servico")}>
                <Wrench className="size-3.5" /> + Serviço
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("peca")}>
                <Package className="size-3.5" /> + Peça
              </Button>
            </div>
          </div>

          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-[auto_1fr_80px_110px_110px_36px] gap-3 items-center px-5 py-2 bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
            <div />
            <p className="text-xs font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wide">Descrição</p>
            <p className="text-xs font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wide text-center">Qtd</p>
            <p className="text-xs font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wide">Valor unit.</p>
            <p className="text-xs font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wide text-right">Subtotal</p>
            <div />
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {itens.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[auto_1fr_80px_110px_110px_36px] gap-3 items-center px-5 py-3">
                <div className={`flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${item.tipo === "servico" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                  {item.tipo === "servico" ? <Wrench className="size-3.5" /> : <Package className="size-3.5" />}
                </div>
                <Input value={item.descricao} onChange={e => updateItem(idx, "descricao", e.target.value)} placeholder="Descrição do item" />
                <Input type="number" min={1} value={item.quantidade} onChange={e => updateItem(idx, "quantidade", e.target.value)} className="text-center" />
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-subtle)]">R$</span>
                  <Input type="number" min={0} step={0.01} value={item.valorUnitario} onChange={e => updateItem(idx, "valorUnitario", e.target.value)} className="pl-8" />
                </div>
                <p className="text-right text-sm font-semibold tabular-nums">
                  R$ {(item.quantidade * item.valorUnitario).toFixed(2).replace(".", ",")}
                </p>
                <button type="button" onClick={() => removeItem(idx)}
                  className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-fg-subtle)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {itens.length === 0 && (
              <p className="px-5 py-8 text-sm text-center text-[var(--color-fg-muted)]">Nenhum item. Use os botões acima para adicionar.</p>
            )}
          </div>

          {/* Totais */}
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-fg-muted)]">Subtotal</span>
              <span className="font-medium tabular-nums">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex items-center justify-between text-sm gap-4">
              <span className="text-[var(--color-fg-muted)]">Desconto (R$)</span>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-subtle)]">R$</span>
                <Input type="number" min={0} step={0.01} value={desconto} onChange={e => setDesconto(Number(e.target.value))} className="pl-8 h-8 text-sm" />
              </div>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Condições e observações</h2>
          <FormField label="Observações para o cliente">
            <textarea name="observacoes" rows={3} defaultValue={orc.observacoes ?? ""}
              placeholder="Prazo, condições de pagamento, validade da proposta..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            <Save className="size-4" />
            Salvar orçamento
          </Button>
        </div>
      </form>
    </div>
  );
}
