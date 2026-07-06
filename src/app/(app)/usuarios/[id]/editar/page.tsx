"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, User, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoUsuarios, roleConfig } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "gerente", label: "Gerente" },
  { value: "tecnico", label: "Técnico" },
  { value: "atendente", label: "Atendente" },
];

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const usuario = demoUsuarios.find((u) => u.id === params.id) ?? demoUsuarios[0];

  const [saving, setSaving] = useState(false);
  const [ativo, setAtivo] = useState((usuario as any).ativo ?? usuario.status === "ativo");
  const { success } = useToast();

  const selectCls =
    "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    success("Usuário salvo", "As informações foram atualizadas.");
    router.push(`/usuarios/${usuario.id}`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/usuarios/${usuario.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-lg font-bold uppercase">
            {usuario.nome.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Editar usuário</h1>
            <p className="text-sm text-[var(--color-fg-muted)]">{usuario.nome}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Dados pessoais */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="size-4 text-[var(--color-fg-subtle)]" />
            <h2 className="font-semibold">Dados pessoais</h2>
          </div>
          <FormField label="Nome completo" required>
            <Input name="nome" defaultValue={usuario.nome} required />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="E-mail" required>
              <Input name="email" type="email" defaultValue={usuario.email} required />
            </FormField>
            <FormField label="Telefone">
              <Input name="telefone" defaultValue={(usuario as any).telefone ?? ""} placeholder="(11) 99999-0000" />
            </FormField>
          </div>
        </div>

        {/* Permissões */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="size-4 text-[var(--color-fg-subtle)]" />
            <h2 className="font-semibold">Permissões e acesso</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Perfil de acesso" required>
              <select name="role" defaultValue={usuario.role} className={selectCls}>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <button
                type="button"
                onClick={() => setAtivo((v: boolean) => !v)}
                className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] border-2 px-4 py-2.5 transition-colors text-sm font-semibold ${
                  ativo
                    ? "border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-fg-muted)]"
                }`}
              >
                <div
                  className={`size-2.5 rounded-full ${ativo ? "bg-[var(--color-success)]" : "bg-[var(--color-fg-subtle)]"}`}
                />
                {ativo ? "Ativo" : "Inativo"}
              </button>
              <input type="hidden" name="status" value={ativo ? "ativo" : "inativo"} />
            </FormField>
          </div>

          {/* Roles explanation */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-2">
            {roles.map((r) => {
              const cfg = (roleConfig as any)[r.value];
              return (
                <div key={r.value} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-2.5 text-center">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: cfg?.bg, color: cfg?.color }}
                  >
                    {r.label}
                  </span>
                  <p className="text-xs text-[var(--color-fg-subtle)] mt-1 leading-tight">
                    {r.value === "admin" && "Acesso total"}
                    {r.value === "gerente" && "Relatórios e gestão"}
                    {r.value === "tecnico" && "OS e estoque"}
                    {r.value === "atendente" && "Clientes e OS"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Redefinir senha */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <h2 className="font-semibold">Redefinir senha</h2>
          <p className="text-sm text-[var(--color-fg-muted)]">Deixe em branco para manter a senha atual.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nova senha">
              <Input name="nova_senha" type="password" placeholder="••••••••" autoComplete="new-password" />
            </FormField>
            <FormField label="Confirmar senha">
              <Input name="confirmar_senha" type="password" placeholder="••••••••" autoComplete="new-password" />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            type="button"
            className="text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
          >
            <Trash2 className="size-4" />
            Remover usuário
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="size-4" />
              Salvar alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
