"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { atualizarEquipamentoAction } from "@/lib/actions/equipamentos";

const tiposEquipamento = ["Smartphone", "Notebook", "Computador", "Tablet", "Impressora", "TV", "CFTV", "Eletrodoméstico", "Outro"];

interface EquipamentoData {
  id: string;
  nome: string;
  categoria: string;
  marca: string;
  modelo: string;
  cor: string;
  numero_serie: string;
  imei: string;
  senha: string;
  observacoes: string;
  isSupabase: boolean;
}

const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

export function EquipamentoEditarForm({ equip }: { equip: EquipamentoData }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!equip.isSupabase) {
      success("Equipamento salvo! (demo)", "Em produção os dados serão persistidos no banco.");
      router.push(`/equipamentos/${equip.id}`);
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await atualizarEquipamentoAction(equip.id, fd);
      if (result?.error) {
        toastError("Erro ao salvar", result.error);
      } else {
        success("Equipamento salvo!", "Informações atualizadas.");
        router.push(`/equipamentos/${equip.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Identificação */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Identificação</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nome / modelo" required className="sm:col-span-2">
            <Input name="nome" defaultValue={equip.nome} required />
          </FormField>
          <FormField label="Tipo">
            <select name="categoria" defaultValue={equip.categoria || "Smartphone"} className={selectCls}>
              {tiposEquipamento.map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Marca">
            <Input name="marca" defaultValue={equip.marca} />
          </FormField>
          <FormField label="Modelo específico">
            <Input name="modelo" defaultValue={equip.modelo} />
          </FormField>
          <FormField label="Cor">
            <Input name="cor" defaultValue={equip.cor} />
          </FormField>
        </div>
      </div>

      {/* Identificadores */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Identificadores</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Número de série">
            <Input name="numero_serie" defaultValue={equip.numero_serie} placeholder="SN-XXXXX" />
          </FormField>
          <FormField label="IMEI">
            <Input name="imei" defaultValue={equip.imei} placeholder="000000000000000" />
          </FormField>
          <FormField label="Senha / PIN">
            <Input name="senha" defaultValue={equip.senha} placeholder="Senha de desbloqueio" />
          </FormField>
        </div>
      </div>

      {/* Observações */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Observações</h2>
        <FormField label="Observações">
          <textarea name="observacoes" rows={3} defaultValue={equip.observacoes}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
        </FormField>
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
