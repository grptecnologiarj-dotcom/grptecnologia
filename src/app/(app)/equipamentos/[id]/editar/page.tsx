"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoEquipamentos, demoClientes } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const tiposEquipamento = ["Smartphone", "Notebook", "Computador", "Tablet", "Impressora", "TV", "CFTV", "Eletrodoméstico", "Outro"];

export default function EditarEquipamentoPage() {
  const params = useParams();
  const router = useRouter();
  const equip = demoEquipamentos.find(e => e.id === params.id) ?? demoEquipamentos[0];
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    success("Equipamento salvo!", "Informações atualizadas.");
    router.push(`/equipamentos/${equip.id}`);
  }

  const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/equipamentos/${equip.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar equipamento</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{equip.nome}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identificação */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome / modelo" required className="sm:col-span-2">
              <Input name="nome" defaultValue={equip.nome} required />
            </FormField>
            <FormField label="Tipo">
              <select name="tipo" defaultValue={(equip as any).tipo ?? "Smartphone"} className={selectCls}>
                {tiposEquipamento.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Marca">
              <Input name="marca" defaultValue={equip.marca ?? ""} />
            </FormField>
            <FormField label="Modelo específico">
              <Input name="modelo" defaultValue={(equip as any).modelo ?? ""} />
            </FormField>
            <FormField label="Cor">
              <Input name="cor" defaultValue={(equip as any).cor ?? ""} />
            </FormField>
          </div>
        </div>

        {/* Identificadores */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Identificadores</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Número de série">
              <Input name="numero_serie" defaultValue={(equip as any).numero_serie ?? ""} placeholder="SN-XXXXX" />
            </FormField>
            <FormField label="IMEI">
              <Input name="imei" defaultValue={(equip as any).imei ?? ""} placeholder="000000000000000" />
            </FormField>
            <FormField label="MAC Address">
              <Input name="mac" defaultValue={(equip as any).mac ?? ""} placeholder="00:00:00:00:00:00" />
            </FormField>
            <FormField label="Senha / PIN">
              <Input name="senha" defaultValue={(equip as any).senha ?? ""} placeholder="Senha de desbloqueio" />
            </FormField>
          </div>
        </div>

        {/* Proprietário */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Proprietário</h2>
          <FormField label="Cliente">
            <select name="cliente_id" defaultValue={(equip as any).clienteId ?? ""} className={selectCls}>
              <option value="">Sem cliente vinculado</option>
              {demoClientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </FormField>
        </div>

        {/* Condição */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Condição e observações</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Condição visual">
              <select name="condicao" defaultValue={(equip as any).condicao ?? "bom"} className={selectCls}>
                {["otimo", "bom", "regular", "ruim"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Acessórios recebidos">
              <Input name="acessorios" defaultValue={(equip as any).acessorios?.join(", ") ?? ""} placeholder="Carregador, capa..." />
            </FormField>
          </div>
          <FormField label="Observações" className="mt-4">
            <textarea name="observacoes" rows={3} defaultValue={(equip as any).observacoes ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
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
