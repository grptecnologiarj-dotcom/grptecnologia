import Link from "next/link";
import { Wrench, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Ilustração */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-[var(--color-brand-50)] animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full">
            <Wrench className="size-16 text-[var(--color-brand-400)] rotate-45" />
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-2">
          <p className="text-7xl font-black text-[var(--color-brand-600)] tracking-tight">404</p>
          <h1 className="text-2xl font-bold">Página não encontrada</h1>
          <p className="text-[var(--color-fg-muted)]">
            Parece que esta página foi desmontada para manutenção — ou nunca existiu.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-700)] transition-colors"
          >
            <Home className="size-4" />
            Ir para o Dashboard
          </Link>
          <Link
            href="/os"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Ver OS
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-[var(--color-fg-subtle)]">
          Desenvolvido por{" "}
          <span className="font-semibold text-[var(--color-brand-600)]">GRP Tecnologia</span>
          {" "}· DeskControl
        </p>
      </div>
    </div>
  );
}
