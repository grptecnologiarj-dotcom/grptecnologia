"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoClientes } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const cliente = demoClientes.find((c) => c.id === params.id) ?? demoClientes[0];

  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [tipo, setTipo] = useState((cliente as any).tipo ?? "fisica");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    success("Cliente salvo!", "Informações atualizadas.");
    router.push(`/clientes/${cliente.id}`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/clientes/${cliente.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar cliente</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{cliente.nome}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Tipo */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Tipo de cliente</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "fisica", label: "Pessoa Física", sub: "CPF" },
              { value: "juridica", label: "Pessoa Jurídica", sub: "CNPJ" },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                className={`rounded-[var(--radius-md)] border-2 px-4 py-3 text-left transition-colors ${
                  tipo === t.value
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                    : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                }`}
              >
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-xs text-[var(--color-fg-muted)]">{t.sub}</p>
              </button>
            ))}
          </div>
          <input type="hidden" name="tipo" value={tipo} />
        </div>

        {/* Dados pessoais */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Dados principais</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={tipo === "juridica" ? "Razão social" : "Nome completo"} required className="sm:col-span-2">
              <Input name="nome" defaultValue={cliente.nome} required />
            </FormField>
            <FormField label={tipo === "juridica" ? "CNPJ" : "CPF"}>
              <Input name="cpf_cnpj" defaultValue={(cliente as any).cpf_cnpj ?? ""} placeholder={tipo === "juridica" ? "00.000.000/0001-00" : "000.000.000-00"} />
            </FormField>
            {tipo === "juridica" && (
              <FormField label="Nome fantasia">
                <Input name="nome_fantasia" defaultValue={(cliente as any).nomeFantasia ?? ""} />
              </FormField>
            )}
            <FormField label="E-mail">
              <Input name="email" type="email" defaultValue={(cliente as any).email ?? ""} />
            </FormField>
            <FormField label="Telefone" required>
              <Input name="telefone" type="tel" defaultValue={cliente.telefone ?? ""} placeholder="(11) 99999-9999" required />
            </FormField>
            <FormField label="WhatsApp">
              <Input name="whatsapp" type="tel" defaultValue={cliente.whatsapp ?? ""} placeholder="(11) 99999-9999" />
            </FormField>
          </div>
        </div>

        {/* Endereço */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Endereço</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="CEP">
              <Input name="cep" defaultValue={(cliente as any).cep ?? ""} placeholder="00000-000" />
            </FormField>
            <FormField label="Logradouro" className="sm:col-span-2">
              <Input name="endereco" defaultValue={(cliente as any).endereco ?? ""} placeholder="Rua, Av., etc." />
            </FormField>
            <FormField label="Número">
              <Input name="numero" defaultValue={(cliente as any).numero ?? ""} />
            </FormField>
            <FormField label="Complemento">
              <Input name="complemento" defaultValue={(cliente as any).complemento ?? ""} placeholder="Apto, sala..." />
            </FormField>
            <FormField label="Bairro">
              <Input name="bairro" defaultValue={(cliente as any).bairro ?? ""} />
            </FormField>
            <FormField label="Cidade">
              <Input name="cidade" defaultValue={(cliente as any).cidade ?? ""} />
            </FormField>
            <FormField label="Estado">
              <select name="estado" defaultValue={(cliente as any).estado ?? "SP"}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Observações */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Observações internas</h2>
          <textarea name="observacoes" rows={3}
            defaultValue={(cliente as any).observacoes ?? ""}
            placeholder="Informações úteis sobre o cliente — preferências, histórico relevante..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
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
