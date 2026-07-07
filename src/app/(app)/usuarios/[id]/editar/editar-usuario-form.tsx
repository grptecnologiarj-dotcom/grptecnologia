"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Lock, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { roleConfig } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";
import { atualizarUsuarioAction, desativarUsuarioAction } from "@/lib/actions/usuarios";

export interface UsuarioEditavel {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role: string;
  status: string;
}

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "tecnico", label: "Técnico" },
  { value: "atendente", label: "Atendente" },
  { value: "financeiro", label: "Financeiro" },
  { value: "visualizador", label: "Visualizador" },
];

export function EditarUsuarioForm({
  usuario,
  supabaseAtivo,
}: {
  usuario: UsuarioEditavel;
  supabaseAtivo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [desativando, startDesativar] = useTransition();
  const [ativo, setAtivo] = useState(usuario.status === "ativo");
  const { success, error: toastError, info } = useToast();

  const selectCls =
    "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!supabaseAtivo) {
      success("Modo demonstração", "Em produção, as alterações seriam salvas agora.");
      router.push(`/usuarios/${usuario.id}`);
      return;
    }

    startTransition(async () => {
      const result = await atualizarUsuarioAction(usuario.id, formData);
      if (result?.error) {
        toastError("Erro ao salvar", result.error);
        return;
      }
      success("Usuário salvo", "As informações foram atualizadas.");
      router.push(`/usuarios/${usuario.id}`);
      router.refresh();
    });
  }

  function handleDesativar() {
    if (!confirm("Tem certeza que deseja desativar este usuário? Ele perderá o acesso ao sistema.")) {
      return;
    }

    if (!supabaseAtivo) {
      info("Modo demonstração", "Em produção, o usuário seria desativado agora.");
      return;
    }

    startDesativar(async () => {
      const result = await desativarUsuarioAction(usuario.id);
      if (result?.error) {
        toastError("Erro ao desativar", result.error);
        return;
      }
      success("Usuário desativado", "O acesso foi revogado.");
      router.push("/usuarios");
      router.refresh();
    });
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
            <FormField label="E-mail">
              <Input name="email" type="email" defaultValue={usuario.email} disabled />
            </FormField>
            <FormField label="Telefone">
              <Input name="telefone" defaultValue={usuario.telefone ?? ""} placeholder="(11) 99999-0000" />
            </FormField>
          </div>
          <p className="text-xs text-[var(--color-fg-subtle)]">
            O e-mail de acesso não pode ser alterado por aqui.
          </p>
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 mt-2">
            {roles.map((r) => {
              const cfg = roleConfig[r.value];
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
                    {r.value === "tecnico" && "OS e estoque"}
                    {r.value === "atendente" && "Clientes e OS"}
                    {r.value === "financeiro" && "Caixa e finanças"}
                    {r.value === "visualizador" && "Apenas leitura"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            type="button"
            loading={desativando}
            onClick={handleDesativar}
            className="text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
          >
            <UserX className="size-4" />
            Desativar usuário
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              <Save className="size-4" />
              Salvar alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
