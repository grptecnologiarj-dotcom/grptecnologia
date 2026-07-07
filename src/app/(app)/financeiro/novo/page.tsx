"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { criarTransacaoAction } from "@/lib/actions/financeiro";
const isSupabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

const categorias = {
  receita: ["Serviço de reparo", "Venda de peças", "Contrato mensal", "Orçamento aprovado", "Outros"],
  despesa: ["Peças / insumos", "Salários", "Aluguel", "Energia elétrica", "Ferramentas", "Marketing", "Impostos", "Outros"],
};

export default function NovaTransacaoPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita");
  const [saving, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      success(
        tipo === "receita" ? "Receita registrada! (demo)" : "Despesa registrada! (demo)",
        "Em produção os dados serão persistidos no banco."
      );
      router.push("/financeiro");
      return;
    }
    const form = new FormData(e.currentTarget);
    const fd = new FormData();
    fd.set("tipo", tipo);
    fd.set("categoria", (form.get("categoria") as string) ?? "");
    fd.set("descricao", (form.get("descricao") as string) ?? "");
    fd.set("valor", (form.get("valor") as string) ?? "");
    fd.set("data", (form.get("data") as string) ?? "");
    fd.set("status", "confirmado");
    fd.set("metodo_pagamento", (form.get("forma_pagamento") as string) ?? "");
    fd.set("os_id", "");
    fd.set("observacoes", (form.get("observacoes") as string) ?? "");
    startTransition(async () => {
      const result = await criarTransacaoAction(fd);
      if (result?.error) {
        toastError("Erro ao registrar", result.error);
      } else {
        success(
          tipo === "receita" ? "Receita registrada!" : "Despesa registrada!",
          "A transação foi lançada no caixa."
        );
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/financeiro"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova transação</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Registre uma receita ou despesa</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Tipo */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Tipo de transação</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipo("receita")}
              className={`flex items-center gap-3 rounded-[var(--radius-lg)] border-2 p-4 transition-all ${
                tipo === "receita"
                  ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-success)]/50"
              }`}
            >
              <div className={`flex size-10 items-center justify-center rounded-full ${
                tipo === "receita" ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)]"
              }`}>
                <TrendingUp className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Receita</p>
                <p className="text-xs text-[var(--color-fg-muted)]">Entrada de dinheiro</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTipo("despesa")}
              className={`flex items-center gap-3 rounded-[var(--radius-lg)] border-2 p-4 transition-all ${
                tipo === "despesa"
                  ? "border-[var(--color-danger)] bg-[var(--color-danger-bg)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-danger)]/50"
              }`}
            >
              <div className={`flex size-10 items-center justify-center rounded-full ${
                tipo === "despesa" ? "bg-[var(--color-danger)] text-white" : "bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)]"
              }`}>
                <TrendingDown className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Despesa</p>
                <p className="text-xs text-[var(--color-fg-muted)]">Saída de dinheiro</p>
              </div>
            </button>
          </div>
        </div>

        {/* Dados */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Informações</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Descrição" required className="sm:col-span-2">
              <Input
                name="descricao"
                placeholder={tipo === "receita" ? "Ex.: Reparo notebook Dell – OS #0042" : "Ex.: Compra de pasta térmica"}
                required
              />
            </FormField>

            <FormField label="Valor (R$)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input
                  name="valor"
                  type="number"
                  min={0.01}
                  step={0.01}
                  placeholder="0,00"
                  className="pl-9"
                  required
                />
              </div>
            </FormField>

            <FormField label="Data" required>
              <Input
                name="data"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </FormField>

            <FormField label="Categoria">
              <select name="categoria"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option value="">Selecionar...</option>
                {categorias[tipo].map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField label="Forma de pagamento">
              <select name="forma_pagamento"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option value="">Selecionar...</option>
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartão de crédito</option>
                <option>Cartão de débito</option>
                <option>Transferência</option>
                <option>Boleto</option>
              </select>
            </FormField>

            <FormField label="OS vinculada">
              <Input name="os_numero" placeholder="Número da OS (opcional)" />
            </FormField>

            <FormField label="Conta / caixa">
              <select name="conta"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option>Caixa principal</option>
                <option>Conta bancária</option>
                <option>Conta PJ</option>
              </select>
            </FormField>

            <FormField label="Observações" className="sm:col-span-2">
              <textarea name="observacoes" rows={3} placeholder="Notas internas (não aparece para o cliente)..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            Salvar transação
          </Button>
        </div>
      </form>
    </div>
  );
}
