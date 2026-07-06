import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Voltar para home */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="size-4" />
          Voltar ao site
        </Link>

        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white">
            <Wrench className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Desk<span className="text-[var(--color-brand-600)]">Control</span>
          </span>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-md">
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="mt-1.5 text-sm text-[var(--color-fg-muted)]">
            Entre com suas credenciais para acessar o painel.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-fg-muted)]">
          Não tem conta?{" "}
          <Link
            href="/registro"
            className="font-semibold text-[var(--color-brand-600)] hover:underline"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}