"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { roleConfig } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";
import { criarUsuarioAction } from "@/lib/actions/usuarios";

const roles = [
  { value: "admin",        label: "Administrador", desc: "Acesso total ao sistema, exceto super admin" },
  { value: "tecnico",      label: "Técnico",       desc: "Execução de OS atribuídas, diagnóstico e reparo" },
  { value: "atendente",    label: "Atendente",     desc: "Abertura de OS, atendimento e orçamentos" },
  { value: "financeiro",   label: "Financeiro",    desc: "Caixa, transações, relatórios financeiros" },
  { value: "visualizador", label: "Visualizador",  desc: "Apenas leitura: consulta OS, clientes e relatórios" },
];

export function NovoUsuarioForm({ supabaseAtivo }: { supabaseAtivo: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();
  const [roleSel, setRoleSel] = useState("atendente");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!supabaseAtivo) {
      success("Modo demonstração", "Em produção, o usuário seria criado agora.");
      router.push("/usuarios");
      return;
    }

    const senha = formData.get("senha") as string;
    const confirma = formData.get("confirmar_senha") as string;
    if (senha !== confirma) {
      toastError("Senhas diferentes", "A confirmação não confere com a senha.");
      return;
    }

    startTransition(async () => {
      const result = await criarUsuarioAction(formData);
      if (result?.error) {
        toastError("Erro ao criar usuário", result.error);
        return;
      }
      success("Usuário criado!", "Repasse a senha temporária ao novo membro da equipe.");
      router.push("/usuarios");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/usuarios"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Adicionar usuário</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Você define a senha inicial e repassa ao membro da equipe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            <FormField label="Telefone / WhatsApp" className="sm:col-span-2">
              <Input name="telefone" type="tel" placeholder="(11) 99999-9999" />
            </FormField>
          </div>
        </div>

        {/* Senha temporária */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="size-4 text-[var(--color-fg-subtle)]" />
            <h2 className="font-semibold">Senha temporária</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Senha inicial" required>
              <Input name="senha" type="password" minLength={8} placeholder="Mínimo 8 caracteres" autoComplete="new-password" required />
            </FormField>
            <FormField label="Confirmar senha" required>
              <Input name="confirmar_senha" type="password" minLength={8} placeholder="Repita a senha" autoComplete="new-password" required />
            </FormField>
          </div>
          <p className="mt-3 text-xs text-[var(--color-fg-muted)]">
            Repasse esta senha ao novo membro. Ele poderá alterá-la depois em Perfil → Segurança.
          </p>
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
                        {roleConfig[r.value]?.label ?? r.label}
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

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={pending}>
            <UserPlus className="size-4" />
            Criar usuário
          </Button>
        </div>
      </form>
    </div>
  );
}
