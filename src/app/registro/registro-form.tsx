"use client";

import { useActionState } from "react";
import { Building2, User, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { registroAction } from "@/app/actions";

type RegistroState = { error?: string } | undefined;

export function RegistroForm() {
  const [state, action, pending] = useActionState<RegistroState, FormData>(
    async (_prev, formData) => registroAction(formData),
    undefined
  );

  return (
    <form action={action} className="mt-6 space-y-4">
      <FormField label="Nome da empresa" htmlFor="empresaNome" required>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <Input
            id="empresaNome"
            name="empresaNome"
            type="text"
            placeholder="Ex.: TechRepair Assistência"
            className="pl-9"
            required
          />
        </div>
      </FormField>

      <FormField label="Seu nome" htmlFor="nome" required>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <Input
            id="nome"
            name="nome"
            type="text"
            placeholder="João Silva"
            className="pl-9"
            required
          />
        </div>
      </FormField>

      <FormField label="E-mail" htmlFor="email" required>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@empresa.com"
            className="pl-9"
            autoComplete="email"
            required
          />
        </div>
      </FormField>

      <FormField label="Senha" htmlFor="password" hint="Mínimo de 6 caracteres" required>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            autoComplete="new-password"
            required
          />
        </div>
      </FormField>

      <FormField label="Confirmar senha" htmlFor="confirmPassword" required>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            autoComplete="new-password"
            required
          />
        </div>
      </FormField>

      {state?.error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.error}
        </div>
      )}

      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Criando conta..." : "Criar conta grátis"}
      </Button>

      <p className="text-center text-xs text-[var(--color-fg-subtle)]">
        Ao criar uma conta, você concorda com os{" "}
        <span className="underline">Termos de Uso</span> e a{" "}
        <span className="underline">Política de Privacidade</span>.
      </p>
    </form>
  );
}