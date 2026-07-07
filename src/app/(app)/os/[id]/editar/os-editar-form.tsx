"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Wrench, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { atualizarOSAction } from "@/lib/actions/os";

const statusOptions = [
  { value: "aberta", label: "Aberta" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aprovada", label: "Aprovada" },
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

export interface OSEditarData {
  id: string;
  numero: string;
  status: string;
  prioridade: string;
  problema: string;
  diagnostico: string;
  solucao: string;
  observacoes: string;
  obs_internas: string;
  tecnico_id: string;
  data_previsao: string;
  valor_mao_obra: number;
  garantia_dias: number;
  clienteNome: string;
  equipamentoNome: string;
  itens: { id: string; tipo: string; descricao: string; quantidade: number; valor_total: number }[];
  isSupabase: boolean;
}

const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";
const textareaCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none";

export function OSEditarForm({ os, tecnicos }: { os: OSEditarData; tecnicos: { id: string; nome: string }[] }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  const somaItens = os.itens.reduce((acc, i) => acc + i.valor_total, 0);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!os.isSupabase) {
      success("OS atualizada! (demo)", "Em produção os dados serão persistidos no banco.");
      router.push(`/os/${os.id}`);
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await atualizarOSAction(os.id, fd);
      if (result?.error) {
        toastError("Erro ao salvar", result.error);
      } else {
        success("OS atualizada!", "As alterações foram salvas.");
        router.push(`/os/${os.id}`);
      }
    });
  }

  return (
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
            <select name="tecnico_id" defaultValue={os.tecnico_id} className={selectCls}>
              <option value="">Sem técnico</option>
              {tecnicos.map(u => (
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
          <div>
            <p className="text-xs text-[var(--color-fg-subtle)] mb-1">Cliente</p>
            <p className="text-sm font-medium">{os.clienteNome}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-fg-subtle)] mb-1">Equipamento</p>
            <p className="text-sm font-medium">{os.equipamentoNome}</p>
          </div>
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
          <textarea name="problema" rows={3} defaultValue={os.problema} className={textareaCls} />
        </FormField>
        <FormField label="Diagnóstico">
          <textarea name="diagnostico" rows={3} defaultValue={os.diagnostico} className={textareaCls} />
        </FormField>
        <FormField label="Solução aplicada">
          <textarea name="solucao" rows={2} defaultValue={os.solucao} className={textareaCls} />
        </FormField>
        <FormField label="Observações internas">
          <textarea name="obs_internas" rows={2} defaultValue={os.obs_internas} className={textareaCls} />
        </FormField>
      </div>

      {/* Valores */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Valores</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Mão de obra (R$)">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-subtle)]">R$</span>
              <Input name="valor_mao_obra" type="number" min={0} step={0.01} defaultValue={os.valor_mao_obra} className="pl-8" />
            </div>
          </FormField>
        </div>
      </div>

      {/* Itens (somente leitura — gerenciados na tela da OS) */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold">Itens da OS</h2>
          <p className="text-xs text-[var(--color-fg-muted)]">Adicione ou remova itens na tela de detalhe da OS</p>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {os.itens.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <div className={`flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold ${item.tipo === "servico" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                {item.tipo === "servico" ? <Wrench className="size-3.5" /> : <Package className="size-3.5" />}
              </div>
              <p className="flex-1 text-sm">{item.descricao}</p>
              <p className="text-sm text-[var(--color-fg-muted)]">x{item.quantidade}</p>
              <p className="text-right text-sm font-semibold w-24">R$ {item.valor_total.toFixed(2).replace(".", ",")}</p>
            </div>
          ))}
          {os.itens.length === 0 && (
            <p className="px-5 py-6 text-sm text-center text-[var(--color-fg-muted)]">Nenhum item nesta OS.</p>
          )}
        </div>
        <div className="flex justify-end gap-8 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 text-sm">
          <span className="text-[var(--color-fg-muted)]">Total</span>
          <span className="font-bold text-base">R$ {somaItens.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={isPending}>
          <Save className="size-4" />
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
