"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Wrench, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoOSDetalhe, demoClientes, demoEquipamentos, demoUsuarios } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const statusOptions = [
  { value: "aberta", label: "Aberta" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "em_reparo", label: "Em reparo" },
  { value: "pronta", label: "Pronta para retirada" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelada", label: "Cancelada" },
];
const prioridadeOptions = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

type Item = { id: string; tipo: "servico" | "peca"; descricao: string; quantidade: number; valor_unit: number; valor_total: number };

export default function EditarOSPage() {
  const params = useParams();
  const router = useRouter();
  const os = demoOSDetalhe;

  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [itens, setItens] = useState<Item[]>(os.os_itens as Item[]);

  const somaItens = itens.reduce((acc, i) => acc + i.valor_total, 0);

  function addItem(tipo: "servico" | "peca") {
    setItens(prev => [...prev, {
      id: `item-${Date.now()}`,
      tipo,
      descricao: tipo === "servico" ? "Mão de obra" : "Peça de reposição",
      quantidade: 1,
      valor_unit: 0,
      valor_total: 0,
    }]);
  }

  function updateItem(id: string, field: keyof Item, raw: string | number) {
    setItens(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: field === "descricao" ? raw : Number(raw) };
      if (field === "quantidade" || field === "valor_unit") {
        updated.valor_total = updated.quantidade * updated.valor_unit;
      }
      return updated;
    }));
  }

  function removeItem(id: string) {
    setItens(prev => prev.filter(i => i.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    success("OS atualizada!", "As alterações foram salvas.");
    router.push(`/os/${os.id}`);
  }

  const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/os/${os.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar OS</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{os.numero}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Status e prioridade */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Status da OS</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Status" required>
              <select name="status" defaultValue={os.status} className={selectCls}>
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>
            <FormField label="Prioridade" required>
              <select name="prioridade" defaultValue={os.prioridade} className={selectCls}>
                {prioridadeOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </FormField>
            <FormField label="Técnico responsável">
              <select name="tecnico_id" defaultValue={(os as any).usuarios?.id ?? ""} className={selectCls}>
                <option value="">Sem técnico</option>
                {demoUsuarios.filter(u => u.role === "tecnico" || u.role === "admin").map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Cliente e equipamento */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Cliente e equipamento</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Cliente" required>
              <select name="cliente_id" defaultValue={(os as any).clientes?.id ?? ""} className={selectCls}>
                {demoClientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
            <FormField label="Equipamento" required>
              <select name="equipamento_id" defaultValue={(os as any).equipamentos?.id ?? ""} className={selectCls}>
                {demoEquipamentos.map(e => <option key={e.id} value={e.id}>{e.nome} — {e.marca}</option>)}
              </select>
            </FormField>
            <FormField label="Previsão de entrega">
              <Input name="data_previsao" type="date" defaultValue={os.data_previsao ? os.data_previsao.slice(0, 10) : ""} />
            </FormField>
            <FormField label="Garantia (dias)">
              <Input name="garantia_dias" type="number" min={0} defaultValue={os.garantia_dias} />
            </FormField>
          </div>
        </div>

        {/* Problema e diagnóstico */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <h2 className="font-semibold">Descrição técnica</h2>
          <FormField label="Problema relatado" required>
            <textarea name="problema" rows={3} defaultValue={os.problema ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
          <FormField label="Diagnóstico">
            <textarea name="diagnostico" rows={3} defaultValue={os.diagnostico ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
          <FormField label="Solução aplicada">
            <textarea name="solucao" rows={2} defaultValue={os.solucao ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
          <FormField label="Observações internas">
            <textarea name="obs_internas" rows={2} defaultValue={os.obs_internas ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>

        {/* Itens */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold">Itens da OS</h2>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("servico")}>
                <Wrench className="size-3.5" /> + Serviço
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("peca")}>
                <Package className="size-3.5" /> + Peça
              </Button>
            </div>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {itens.map(item => (
              <div key={item.id} className="grid grid-cols-[auto_1fr_80px_100px_100px_36px] gap-3 items-center px-5 py-3">
                <div className={`flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold ${item.tipo === "servico" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                  {item.tipo === "servico" ? <Wrench className="size-3.5" /> : <Package className="size-3.5" />}
                </div>
                <Input value={item.descricao} onChange={e => updateItem(item.id, "descricao", e.target.value)} placeholder="Descrição" />
                <Input type="number" min={1} value={item.quantidade} onChange={e => updateItem(item.id, "quantidade", e.target.value)} className="text-center" />
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-subtle)]">R$</span>
                  <Input type="number" min={0} step={0.01} value={item.valor_unit} onChange={e => updateItem(item.id, "valor_unit", e.target.value)} className="pl-8" />
                </div>
                <p className="text-right text-sm font-semibold">R$ {item.valor_total.toFixed(2).replace(".", ",")}</p>
                <button type="button" onClick={() => removeItem(item.id)} className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-fg-subtle)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {itens.length === 0 && (
              <p className="px-5 py-6 text-sm text-center text-[var(--color-fg-muted)]">Nenhum item. Adicione serviços ou peças acima.</p>
            )}
          </div>
          <div className="flex justify-end gap-8 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 text-sm">
            <span className="text-[var(--color-fg-muted)]">Total</span>
            <span className="font-bold text-base">R$ {somaItens.toFixed(2).replace(".", ",")}</span>
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
