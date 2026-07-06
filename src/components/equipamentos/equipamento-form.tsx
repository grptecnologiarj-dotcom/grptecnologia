"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoClientes } from "@/lib/demo-data";
import { criarEquipamentoAction } from "@/lib/actions/equipamentos";
import { CATEGORIAS_EQUIPAMENTO } from "@/lib/constants";

type State = { error?: string } | undefined;

export function EquipamentoForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<State, FormData>(
    criarEquipamentoAction,
    undefined
  );

  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<{ id: string; nome: string; telefone?: string } | null>(null);
  const [showSugestoes, setShowSugestoes] = useState(false);

  const sugestoes = buscaCliente.trim() && !clienteSelecionado
    ? demoClientes.filter((c) => c.nome.toLowerCase().includes(buscaCliente.toLowerCase())).slice(0, 6)
    : [];

  return (
    <form action={action} className="space-y-6">
      {/* Cliente */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold">Cliente proprietário</h2>
        <div className="mt-4">
          <FormField label="Cliente" required>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
              <Input
                value={buscaCliente}
                onChange={(e) => {
                  setBuscaCliente(e.target.value);
                  if (clienteSelecionado) setClienteSelecionado(null);
                  setShowSugestoes(true);
                }}
                onFocus={() => sugestoes.length > 0 && setShowSugestoes(true)}
                onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
                placeholder="Buscar cliente por nome..."
                className="pl-9 pr-9"
                autoComplete="off"
              />
              {clienteSelecionado && (
                <button type="button"
                  onClick={() => { setClienteSelecionado(null); setBuscaCliente(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
                  <X className="size-4" />
                </button>
              )}
              {showSugestoes && sugestoes.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  {sugestoes.map((c) => (
                    <button key={c.id} type="button"
                      onMouseDown={() => {
                        setClienteSelecionado(c);
                        setBuscaCliente(c.nome);
                        setShowSugestoes(false);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--color-surface-muted)] first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)]">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-bold text-[var(--color-brand-700)] uppercase">
                        {c.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.nome}</p>
                        {c.telefone && <p className="text-xs text-[var(--color-fg-muted)]">{c.telefone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {clienteSelecionado && (
              <>
                <input type="hidden" name="cliente_id" value={clienteSelecionado.id} />
                <div className="mt-2 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-50)] px-3 py-1.5">
                  <span className="text-xs font-medium text-[var(--color-brand-700)]">✓ {clienteSelecionado.nome}</span>
                </div>
              </>
            )}
          </FormField>
        </div>
      </div>

      {/* Identificação */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Laptop className="size-4 text-[var(--color-fg-muted)]" />
          <h2 className="font-semibold">Identificação do equipamento</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo" htmlFor="tipo" required>
            <select id="tipo" name="tipo" required
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
              <option value="">Selecionar tipo...</option>
              {CATEGORIAS_EQUIPAMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>

          <FormField label="Nome / Descrição" htmlFor="nome" required className="sm:col-span-2">
            <Input id="nome" name="nome" placeholder="Ex.: Notebook Dell Inspiron 15" required />
          </FormField>

          <FormField label="Marca" htmlFor="marca">
            <Input id="marca" name="marca" placeholder="Ex.: Dell, Apple, Samsung..." />
          </FormField>

          <FormField label="Modelo" htmlFor="modelo">
            <Input id="modelo" name="modelo" placeholder="Ex.: Inspiron 15 3000" />
          </FormField>

          <FormField label="Número de série" htmlFor="numero_serie">
            <Input id="numero_serie" name="numero_serie" placeholder="Ex.: SN12345678" className="font-mono" />
          </FormField>

          <FormField label="IMEI (celulares)">
            <Input name="imei" placeholder="Ex.: 358123456789012" className="font-mono" />
          </FormField>

          <FormField label="Cor">
            <Input name="cor" placeholder="Ex.: Preto, Prata, Branco..." />
          </FormField>

          <FormField label="Ano de fabricação">
            <Input name="ano" type="number" placeholder="Ex.: 2022" min={2000} max={2030} />
          </FormField>
        </div>
      </div>

      {/* Condição */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Condição e observações</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Condição ao receber">
            <select name="condicao"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
              <option value="">Selecionar...</option>
              <option value="novo">Novo</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
              <option value="para_pecas">Para peças</option>
            </select>
          </FormField>

          <FormField label="Acessórios entregues">
            <Input name="acessorios" placeholder="Ex.: Carregador, capa, mouse..." />
          </FormField>

          <FormField label="Observações" className="sm:col-span-2">
            <textarea name="observacoes" rows={3} placeholder="Observações sobre o equipamento..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={pending}>Salvar equipamento</Button>
      </div>
    </form>
  );
}
