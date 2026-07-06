"use client";

import { useActionState } from "react";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { loginAction } from "@/app/actions";

type LoginState = { error?: string } | undefined;

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    async (_prev, formData) => loginAction(formData),
    undefined
  );

  return (
    <form action={action} className="mt-6 space-y-4">
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

      <FormField label="Senha" htmlFor="password" required>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            autoComplete="current-password"
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
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}