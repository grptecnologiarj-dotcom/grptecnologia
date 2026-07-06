"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { roleConfig } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const roles = [
  { value: "admin",      desc: "Acesso total ao sistema, exceto super admin" },
  { value: "gerente",    desc: "Gestão de OS, clientes, relatórios e equipe" },
  { value: "tecnico",    desc: "Execução de OS atribuídas, diagnóstico e reparo" },
  { value: "atendente",  desc: "Abertura de OS, atendimento e orçamentos" },
  { value: "financeiro", desc: "Caixa, transações, relatórios financeiros" },
];

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [sent, setSent] = useState(false);
  const [roleSel, setRoleSel] = useState("atendente");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    success("Convite enviado!", "O usuário receberá o convite por e-mail.");
    setSent(true);
    setTimeout(() => router.push("/usuarios"), 1500);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
          <Mail className="size-8 text-[var(--color-success)]" />
        </div>
        <h2 className="text-xl font-bold">Convite enviado!</h2>
        <p className="text-sm text-[var(--color-fg-muted)] text-center max-w-sm">
          Um e-mail de convite foi enviado. O usuário precisará definir uma senha para acessar o sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/usuarios"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Convidar usuário</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">O usuário receberá um e-mail para criar a senha de acesso</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Dados pessoais */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Dados do usuário</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nome completo" required className="sm:col-span-2">
              <Input name="nome" placeholder="Ex.: Carlos Mendes" required />
            </FormField>
            <FormField label="E-mail" required className="sm:col-span-2">
              <Input name="email" type="email" placeholder="carlos@techrepair.com.br" required />
            </FormField>
            <FormField label="Telefone / WhatsApp">
              <Input name="telefone" type="tel" placeholder="(11) 99999-9999" />
            </FormField>
            <FormField label="Cargo (exibição)">
              <Input name="cargo" placeholder="Ex.: Técnico Sênior" />
            </FormField>
          </div>
        </div>

        {/* Papel/permissão */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="size-4 text-[var(--color-fg-subtle)]" />
            <h2 className="font-semibold">Nível de acesso</h2>
          </div>
          <div className="space-y-2">
            {roles.map((r) => {
              const cfg = roleConfig[r.value] ?? roleConfig.atendente;
              const ativo = roleSel === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRoleSel(r.value)}
                  className={`w-full flex items-center gap-4 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
                    ativo
                      ? "border-[var(--color-brand-400)] bg-[var(--color-brand-50)]"
                      : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    ativo ? "border-[var(--color-brand-600)]" : "border-[var(--color-border)]"
                  }`}>
                    {ativo && <div className="size-2.5 rounded-full bg-[var(--color-brand-600)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="role" value={roleSel} />
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-fg-muted)]">
          <Mail className="size-4 shrink-0 mt-0.5 text-[var(--color-fg-subtle)]" />
          <p>
            Um e-mail será enviado com o link de ativação. O convite expira em <strong>48 horas</strong>.
            O usuário define a própria senha ao aceitar o convite.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            <UserPlus className="size-4" />
            Enviar convite
          </Button>
        </div>
      </form>
    </div>
  );
}
