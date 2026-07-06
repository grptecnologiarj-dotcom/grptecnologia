"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoClientes } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const tipos = [
  { value: "manutencao_preventiva", label: "Manutenção preventiva" },
  { value: "suporte_tecnico",       label: "Suporte técnico" },
  { value: "garantia_extendida",    label: "Garantia estendida" },
  { value: "contrato_anual",        label: "Contrato anual" },
];

export default function NovoContratoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSel, setClienteSel] = useState<{ id: string; nome: string } | null>(null);
  const [showClientes, setShowClientes] = useState(false);
  const [equipamentos, setEquipamentos] = useState<string[]>([""]);

  const sugestoes = buscaCliente.trim() && !clienteSel
    ? demoClientes.filter((c) => c.nome.toLowerCase().includes(buscaCliente.toLowerCase())).slice(0, 5)
    : [];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    success("Contrato criado!", "O contrato foi cadastrado.");
    router.push("/contratos");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/contratos"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo contrato</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Crie um contrato de manutenção ou suporte recorrente</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Cliente */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Cliente</h2>
          <FormField label="Selecionar cliente" required>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
              <Input
                value={buscaCliente}
                onChange={(e) => { setBuscaCliente(e.target.value); if (clienteSel) setClienteSel(null); setShowClientes(true); }}
                onFocus={() => setShowClientes(true)}
                onBlur={() => setTimeout(() => setShowClientes(false), 150)}
                placeholder="Buscar cliente..."
                className="pl-9"
                autoComplete="off"
              />
              {clienteSel && (
                <button type="button" onClick={() => { setClienteSel(null); setBuscaCliente(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
                  <X className="size-4" />
                </button>
              )}
              {showClientes && sugestoes.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  {sugestoes.map((c) => (
                    <button key={c.id} type="button"
                      onMouseDown={() => { setClienteSel(c); setBuscaCliente(c.nome); setShowClientes(false); }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--color-surface-muted)] first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)]">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-bold text-[var(--color-brand-700)] uppercase">
                        {c.nome.charAt(0)}
                      </div>
                      <p className="text-sm font-medium">{c.nome}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {clienteSel && (
              <div className="mt-2 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-50)] px-3 py-1.5">
                <span className="text-xs font-medium text-[var(--color-brand-700)]">✓ {clienteSel.nome}</span>
              </div>
            )}
          </FormField>
        </div>

        {/* Tipo e valores */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Detalhes do contrato</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tipo de contrato" required className="sm:col-span-2">
              <select name="tipo" required
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option value="">Selecionar...</option>
                {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>

            <FormField label="Valor mensal (R$)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-fg-subtle)]">R$</span>
                <Input name="valor_mensal" type="number" min={0} step={0.01} placeholder="0,00" className="pl-9" required />
              </div>
            </FormField>

            <FormField label="Dia de vencimento">
              <Input name="dia_vencimento" type="number" min={1} max={28} defaultValue={10} />
            </FormField>

            <FormField label="Data de início" required>
              <Input name="data_inicio" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </FormField>

            <FormField label="Data de término">
              <Input name="data_fim" type="date" />
            </FormField>

            <FormField label="Periodicidade">
              <select name="periodicidade"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </FormField>

            <FormField label="Forma de pagamento">
              <select name="forma_pagamento"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option>Boleto</option>
                <option>Pix</option>
                <option>Transferência</option>
                <option>Cartão de crédito</option>
              </select>
            </FormField>

            <FormField label="Descrição / escopo" className="sm:col-span-2">
              <textarea name="descricao" rows={3}
                placeholder="Descreva o escopo do contrato — o que está incluído, frequência de visitas, SLA..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
            </FormField>
          </div>
        </div>

        {/* Equipamentos cobertos */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Equipamentos cobertos</h2>
            <Button type="button" size="sm" variant="outline"
              onClick={() => setEquipamentos((prev) => [...prev, ""])}>
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {equipamentos.map((eq, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={eq}
                  onChange={(e) => setEquipamentos((prev) => prev.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={`Ex.: Computador reception, DVR câmera 01...`}
                  name="equipamento[]"
                />
                {equipamentos.length > 1 && (
                  <button type="button"
                    onClick={() => setEquipamentos((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)]">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>Criar contrato</Button>
        </div>
      </form>
    </div>
  );
}
