"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { desativarUsuarioAction } from "@/lib/actions/usuarios";

interface Props {
  id: string;
  isAtivo: boolean;
  supabaseAtivo: boolean;
}

export function UsuarioAcoes({ id, isAtivo, supabaseAtivo }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { success, error: toastError, info } = useToast();

  function handleDesativar() {
    if (!confirm("Tem certeza que deseja desativar este usuário? Ele perderá o acesso ao sistema.")) {
      return;
    }

    if (!supabaseAtivo) {
      info("Modo demonstração", "Em produção, o usuário seria desativado agora.");
      return;
    }

    startTransition(async () => {
      const result = await desativarUsuarioAction(id);
      if (result?.error) {
        toastError("Erro ao desativar", result.error);
        return;
      }
      success("Usuário desativado", "O acesso foi revogado.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Ações</h3>
      {isAtivo ? (
        <Button
          variant="outline"
          size="sm"
          loading={pending}
          onClick={handleDesativar}
          className="w-full justify-start text-[var(--color-danger)] hover:border-[var(--color-danger)]"
        >
          Desativar usuário
        </Button>
      ) : (
        <p className="text-sm text-[var(--color-fg-muted)]">
          Usuário inativo. Para reativar, use a tela de edição.
        </p>
      )}
    </div>
  );
}
