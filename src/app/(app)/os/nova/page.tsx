import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NovaOSForm } from "./nova-os-form";

export const metadata = { title: "Nova Ordem de Serviço" };

export default function NovaOSPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/os" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
        <ArrowLeft className="size-4" />
        Voltar para OS
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova Ordem de Serviço</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">Preencha os dados para abrir uma nova OS.</p>
      </div>

      <NovaOSForm />
    </div>
  );
}