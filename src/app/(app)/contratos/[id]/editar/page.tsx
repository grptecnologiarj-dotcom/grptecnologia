"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoContratos, demoClientes } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const tiposContrato = [
  { value: "manutencao_preventiva", label: "Manutenção preventiva" },
  { value: "suporte_tecnico", label: "Suporte técnico" },
  { value: "garantia_extendida", label: "Garantia estendida" },
  { value: "monitoramento", label: "Monitoramento" },
  { value: "outro", label: "Outro" },
];

export default function EditarContratoPage() {
  const params = useParams();
  const router = useRouter();
  const contrato = demoContratos.find(c => c.id === params.id) ?? demoContratos[0];

  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [equipamentos, setEquipamentos] = useState<string[]>(
    (contrato as any).equipamentos ?? ["Servidor HP ProLiant", "Switch Cisco 24p", "DVR CFTV 16 canais"]
  );

  function addEquipamento() {
    setEquipamentos(prev => [...prev, ""]);
  }

  function updateEquipamento(idx: number, val: string) {
    setEquipamentos(prev => prev.map((e, i) => i === idx ? val : e));
  }

  function removeEquipamento(idx: number) {
    setEquipamentos(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    success("Contrato salvo!", "Alterações registradas.");
    router.push(`/contratos/${contrato.id}`);
  }

  const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/contratos/${contrato.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar contrato</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{contrato.numero}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identificação */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Cliente" required>
              <select name="cliente_id" defaultValue={(contrato as any).clienteId ?? ""} className={selectCls}>
                {demoClientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
            <FormField label="Tipo de contrato" required>
              <select name="tipo" defaultValue={contrato.tipo} className={selectCls}>
                {tiposContrato.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select name="status" defaultValue={contrato.status} className={selectCls}>
                {["ativo", "pausado", "expirado", "cancelado"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Dia de vencimento (mensal)">
              <Input name="dia_vencimento" type="number" min={1} max={31} defaultValue={contrato.diaVencimento} />
            </FormField>
            <FormField label="Descrição" required className="sm:col-span-2">
              <textarea name="descricao" rows={3} defaultValue={contrato.descricao}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
            </FormField>
          </div>
        </div>

        {/* Vigência e valor */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Vigência e valor</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Início da vigência">
              <Input name="inicio_vigencia" type="date" defaultValue={contrato.inicioVigencia?.slice(0, 10) ?? ""} />
            </FormField>
            <FormField label="Fim da vigência">
              <Input name="fim_vigencia" type="date" defaultValue={contrato.fimVigencia?.slice(0, 10) ?? ""} />
            </FormField>
            <FormField label="Valor mensal (R$)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="valor_mensal" type="number" min={0} step={0.01} defaultValue={contrato.valorMensal} className="pl-9" />
              </div>
            </FormField>
            <FormField label="Próxima visita">
              <Input name="proxima_visita" type="date" defaultValue={contrato.proximaVisita?.slice(0, 10) ?? ""} />
            </FormField>
            <FormField label="Periodicidade das visitas">
              <select name="periodicidade" defaultValue={(contrato as any).periodicidade ?? "mensal"} className={selectCls}>
                {["semanal", "quinzenal", "mensal", "bimestral", "trimestral", "semestral", "anual"].map(p => (
                  <option key={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="SLA (horas)">
              <Input name="sla_horas" type="number" min={1} defaultValue={(contrato as any).slaHoras ?? 4} />
            </FormField>
          </div>
        </div>

        {/* Equipamentos cobertos */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold">Equipamentos cobertos</h2>
            <Button type="button" size="sm" variant="outline" onClick={addEquipamento}>
              <Plus className="size-3.5" /> Adicionar
            </Button>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {equipamentos.map((eq, idx) => (
              <div key={idx} className="flex items-center gap-3 px-5 py-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
                  <Monitor className="size-3.5 text-[var(--color-fg-subtle)]" />
                </div>
                <Input value={eq} onChange={e => updateEquipamento(idx, e.target.value)} placeholder="Nome do equipamento" className="flex-1" />
                <button type="button" onClick={() => removeEquipamento(idx)}
                  className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-fg-subtle)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {equipamentos.length === 0 && (
              <p className="px-5 py-6 text-sm text-center text-[var(--color-fg-muted)]">Nenhum equipamento cadastrado.</p>
            )}
          </div>
        </div>

        {/* Condições */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Condições e observações</h2>
          <FormField label="Escopo de cobertura">
            <textarea name="escopo" rows={3} defaultValue={(contrato as any).escopo ?? ""}
              placeholder="O que está incluído no contrato..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
          <FormField label="Observações internas" className="mt-4">
            <textarea name="observacoes" rows={2} defaultValue={(contrato as any).observacoes ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            <Save className="size-4" />
            Salvar contrato
          </Button>
        </div>
      </form>
    </div>
  );
}
