"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, TrendingUp, TrendingDown, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { atualizarTransacaoAction, excluirTransacaoAction } from "@/lib/actions/financeiro";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIAS_FINANCEIRO_RECEITA, CATEGORIAS_FINANCEIRO_DESPESA, METODOS_PAGAMENTO } from "@/lib/constants";

interface TransacaoData {
  id: string;
  tipo: "receita" | "despesa";
  descricao: string;
  valor: number;
  data: string;
  status: string;
  categoria: string;
  metodo_pagamento?: string | null;
  observacoes?: string | null;
  os_id?: string | null;
  isSupabase: boolean;
}

const selectCls = "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

export function TransacaoForm({ transacao }: { transacao: TransacaoData }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [tipo, setTipo] = useState<"receita" | "despesa">(transacao.tipo);
  const [status, setStatus] = useState(transacao.status);

  const isReceita = tipo === "receita";
  const categorias = isReceita ? CATEGORIAS_FINANCEIRO_RECEITA : CATEGORIAS_FINANCEIRO_DESPESA;

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!transacao.isSupabase) {
      success("Salvo (demo)", "Em produção os dados serão persistidos no banco.");
      router.push("/financeiro");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("tipo", tipo);
    fd.set("status", status);
    startTransition(async () => {
      const result = await atualizarTransacaoAction(transacao.id, fd);
      if (result?.error) {
        toastError("Erro ao salvar", result.error);
      } else {
        success("Transação salva", "Alterações registradas com sucesso.");
        router.push("/financeiro");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir esta transação? Esta ação não pode ser desfeita.")) return;
    if (!transacao.isSupabase) {
      router.push("/financeiro");
      return;
    }
    startDelete(async () => {
      const result = await excluirTransacaoAction(transacao.id);
      if (result?.error) {
        toastError("Erro", result.error);
      } else {
        success("Excluída", "Transação removida.");
        router.push("/financeiro");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Card resumo */}
      <div className={`rounded-[var(--radius-lg)] border p-5 shadow-sm flex items-center gap-4 ${
        isReceita ? "border-[var(--color-success)]/30 bg-[var(--color-success-bg)]" : "border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]"
      }`}>
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-full ${
          isReceita ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-danger)] text-white"
        }`}>
          {isReceita ? <TrendingUp className="size-7" /> : <TrendingDown className="size-7" />}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
            {isReceita ? "Receita" : "Despesa"}
          </p>
          <p className={`text-3xl font-black mt-0.5 ${isReceita ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
            {isReceita ? "+" : "−"}{formatCurrency(transacao.valor)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatus(s => s === "confirmado" ? "pendente" : "confirmado")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            status === "confirmado"
              ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
              : "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
          }`}
        >
          {status === "confirmado" ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
          {status === "confirmado" ? "Confirmado" : "Pendente"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Tipo */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Tipo de transação</h2>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setTipo("receita")}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] border-2 px-4 py-3 transition-colors text-left ${
                tipo === "receita" ? "border-[var(--color-success)] bg-[var(--color-success-bg)]" : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
              }`}>
              <TrendingUp className={`size-5 ${tipo === "receita" ? "text-[var(--color-success)]" : "text-[var(--color-fg-subtle)]"}`} />
              <div>
                <p className={`font-semibold text-sm ${tipo === "receita" ? "text-[var(--color-success)]" : ""}`}>Receita</p>
                <p className="text-xs text-[var(--color-fg-muted)]">Entrada de dinheiro</p>
              </div>
            </button>
            <button type="button" onClick={() => setTipo("despesa")}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] border-2 px-4 py-3 transition-colors text-left ${
                tipo === "despesa" ? "border-[var(--color-danger)] bg-[var(--color-danger-bg)]" : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
              }`}>
              <TrendingDown className={`size-5 ${tipo === "despesa" ? "text-[var(--color-danger)]" : "text-[var(--color-fg-subtle)]"}`} />
              <div>
                <p className={`font-semibold text-sm ${tipo === "despesa" ? "text-[var(--color-danger)]" : ""}`}>Despesa</p>
                <p className="text-xs text-[var(--color-fg-muted)]">Saída de dinheiro</p>
              </div>
            </button>
          </div>
        </div>

        {/* Dados */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <h2 className="font-semibold">Dados da transação</h2>
          <FormField label="Descrição" required>
            <Input name="descricao" defaultValue={transacao.descricao} required />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Valor (R$)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="valor" type="number" min={0} step={0.01} defaultValue={transacao.valor} className="pl-9" required />
              </div>
            </FormField>
            <FormField label="Data" required>
              <Input name="data" type="date" defaultValue={transacao.data?.slice(0, 10) ?? ""} required />
            </FormField>
            <FormField label="Categoria" required>
              <select name="categoria" defaultValue={transacao.categoria} className={selectCls}>
                {(categorias as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Forma de pagamento">
              <select name="metodo_pagamento" defaultValue={transacao.metodo_pagamento ?? "PIX"} className={selectCls}>
                {METODOS_PAGAMENTO.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Observações">
            <textarea name="observacoes" rows={2} defaultValue={transacao.observacoes ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" type="button" loading={isDeleting}
            onClick={handleDelete}
            className="text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]">
            <Trash2 className="size-4" />
            Excluir
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" loading={isPending}>
              <Save className="size-4" />
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
