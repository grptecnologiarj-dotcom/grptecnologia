"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoGarantias, demoClientes } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

export default function EditarGarantiaPage() {
  const params = useParams();
  const router = useRouter();
  const garantia = demoGarantias.find(g => g.id === params.id) ?? demoGarantias[0];
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    success("Garantia salva!", "Alterações registradas.");
    router.push(`/garantias/${garantia.id}`);
  }

  const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/garantias/${garantia.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar garantia</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{garantia.osNumero} · {garantia.clienteNome}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Dados principais */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Dados da garantia</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="OS de origem">
              <Input name="os_numero" defaultValue={garantia.osNumero} placeholder="OS-2026-XXXX" />
            </FormField>
            <FormField label="Equipamento">
              <Input name="equipamento" defaultValue={garantia.equipamentoNome} />
            </FormField>
            <FormField label="Cliente" required>
              <select name="cliente_id" defaultValue={(garantia as any).clienteId ?? ""} className={selectCls}>
                <option value="">Selecionar cliente</option>
                {demoClientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select name="status" defaultValue={garantia.status} className={selectCls}>
                {["ativa", "expirada", "acionada", "cancelada"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Vigência */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Vigência</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Data de emissão" required>
              <Input name="data_emissao" type="date" defaultValue={garantia.dataEmissao?.slice(0, 10) ?? ""} required />
            </FormField>
            <FormField label="Prazo (meses)" required>
              <Input name="prazo_meses" type="number" min={1} max={60} defaultValue={garantia.prazoMeses} required />
            </FormField>
            <FormField label="Data de expiração">
              <Input name="data_expiracao" type="date" defaultValue={garantia.dataExpiracao?.slice(0, 10) ?? ""} />
            </FormField>
          </div>
        </div>

        {/* Cobertura */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <h2 className="font-semibold">Cobertura</h2>
          <FormField label="Descrição do serviço coberto" required>
            <textarea name="descricao" rows={3} defaultValue={garantia.descricao}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
          <FormField label="Tipo de cobertura">
            <select name="tipo_cobertura" defaultValue={(garantia as any).tipo ?? "reparo"} className={selectCls}>
              {["reparo", "peca", "contrato", "fabricante"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="O que NÃO é coberto">
            <textarea name="exclusoes" rows={2} defaultValue={(garantia as any).exclusoes ?? "Danos físicos por impacto, líquidos ou mau uso. Desgaste natural."}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
          <FormField label="Observações">
            <textarea name="observacoes" rows={2} defaultValue={garantia.observacoes ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            <Save className="size-4" />
            Salvar garantia
          </Button>
        </div>
      </form>
    </div>
  );
}
