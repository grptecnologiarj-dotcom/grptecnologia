"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Wrench, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4 text-center">
      {/* Logo */}
      <div className="mb-8 flex size-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-danger)] text-white shadow-lg">
        <Wrench className="size-8" />
      </div>

      <p className="text-5xl font-black text-[var(--color-danger)]/20 select-none">Erro</p>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">Algo deu errado</h1>
      <p className="mt-2 max-w-sm text-[var(--color-fg-muted)]">
        Ocorreu um erro inesperado. Nossa equipe foi notificada. Tente novamente ou volte ao início.
      </p>

      {error.digest && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-3 py-1.5 font-mono text-xs text-[var(--color-fg-subtle)]">
          ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button onClick={reset}>
          <RefreshCw className="size-4" />
          Tentar novamente
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <Home className="size-4" />
            Ir para o Dashboard
          </Link>
        </Button>
      </div>

      <p className="mt-12 text-xs text-[var(--color-fg-subtle)]">
        Desenvolvido por{" "}
        <span className="font-semibold text-[var(--color-brand-600)]">GRP Tecnologia</span>
      </p>
    </div>
  );
}
