"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoClientes, demoOS } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

export default function NovaGarantiaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [buscaOS, setBuscaOS] = useState("");
  const [osSel, setOsSel] = useState<{ id: string; numero: string; clienteNome: string } | null>(null);
  const [showOS, setShowOS] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSel, setClienteSel] = useState<{ id: string; nome: string } | null>(null);
  const [showClientes, setShowClientes] = useState(false);
  const [tipo, setTipo] = useState("reparo");

  const sugestoesOS = buscaOS.trim() && !osSel
    ? demoOS.filter((o) =>
        o.numero.toLowerCase().includes(buscaOS.toLowerCase()) ||
        o.clienteNome.toLowerCase().includes(buscaOS.toLowerCase())
      ).slice(0, 5)
    : [];

  const sugestoesCliente = buscaCliente.trim() && !clienteSel
    ? demoClientes.filter((c) => c.nome.toLowerCase().includes(buscaCliente.toLowerCase())).slice(0, 5)
    : [];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    success("Garantia registrada!", "A garantia foi criada.");
    router.push("/garantias");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/garantias"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova garantia</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Emita uma garantia de serviço ou de peça</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Vinculo com OS */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Ordem de Serviço</h2>
          <FormField label="Vincular à OS (opcional)">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
              <Input
                value={buscaOS}
                onChange={(e) => { setBuscaOS(e.target.value); if (osSel) setOsSel(null); setShowOS(true); }}
                onFocus={() => setShowOS(true)}
                onBlur={() => setTimeout(() => setShowOS(false), 150)}
                placeholder="Buscar por número ou cliente..."
                className="pl-9"
                autoComplete="off"
              />
              {showOS && sugestoesOS.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  {sugestoesOS.map((o) => (
                    <button key={o.id} type="button"
                      onMouseDown={() => { setOsSel(o); setBuscaOS(o.numero); setShowOS(false); if (!clienteSel) setBuscaCliente(o.clienteNome); }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--color-surface-muted)] first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)]">
                      <span className="text-xs font-mono font-semibold text-[var(--color-brand-600)]">{o.numero}</span>
                      <span className="text-sm text-[var(--color-fg-muted)]">{o.clienteNome}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {osSel && (
              <p className="mt-1 text-xs text-[var(--color-success)]">✓ Vinculada à {osSel.numero}</p>
            )}
          </FormField>
        </div>

        {/* Cliente e equipamento */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Cliente e equipamento</h2>
          <div className="space-y-4">
            <FormField label="Cliente" required>
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
                {showClientes && sugestoesCliente.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                    {sugestoesCliente.map((c) => (
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
            </FormField>

            <FormField label="Equipamento" required>
              <Input name="equipamento" placeholder="Ex.: iPhone 13 Pro, Notebook Dell Inspiron..." required />
            </FormField>

            <FormField label="Número de série (opcional)">
              <Input name="numero_serie" placeholder="Ex.: C02XK0LVJHD5..." />
            </FormField>
          </div>
        </div>

        {/* Detalhes da garantia */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Detalhes da garantia</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tipo de garantia" required className="sm:col-span-2">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "reparo", label: "Serviço/reparo" },
                  { value: "peca", label: "Peça/produto" },
                  { value: "contrato", label: "Contrato" },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-medium transition-colors ${
                      tipo === t.value
                        ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                        : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="tipo" value={tipo} />
            </FormField>

            <FormField label="Data de emissão" required>
              <Input name="data_emissao" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </FormField>

            <FormField label="Prazo (dias)" required>
              <select name="dias_garantia" required
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90" selected>90 dias</option>
                <option value="180">180 dias</option>
                <option value="365">1 ano</option>
              </select>
            </FormField>

            <FormField label="Descrição do serviço coberto" required className="sm:col-span-2">
              <textarea name="descricao" rows={3} required
                placeholder="Descreva o que está coberto pela garantia — peças trocadas, serviço realizado..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
            </FormField>

            <FormField label="O que NÃO está coberto" className="sm:col-span-2">
              <textarea name="exclusoes" rows={2}
                placeholder="Ex.: danos causados por queda, líquidos, mau uso, vírus..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
            </FormField>
          </div>
        </div>

        {/* Preview da validade */}
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] p-4">
          <ShieldCheck className="size-5 shrink-0 text-[var(--color-success)] mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-success)]">Garantia de 90 dias</p>
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
              Vencimento estimado:{" "}
              {new Date(Date.now() + 90 * 86400000).toLocaleDateString("pt-BR")}. O cliente receberá um comprovante digital.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            <ShieldCheck className="size-4" />
            Emitir garantia
          </Button>
        </div>
      </form>
    </div>
  );
}
