import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { RegistroForm } from "./registro-form";

export const metadata = {
  title: "Criar conta",
};

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="size-4" />
          Voltar ao site
        </Link>

        <div className="mb-8 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white">
            <Wrench className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Desk<span className="text-[var(--color-brand-600)]">Control</span>
          </span>
        </div>

        <div className="card p-8 shadow-md">
          <h1 className="text-2xl font-bold tracking-tight">Crie sua conta</h1>
          <p className="mt-1.5 text-sm text-[var(--color-fg-muted)]">
            14 dias grátis. Sem cartão de crédito.
          </p>
          <RegistroForm />
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-fg-muted)]">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-brand-600)] hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}