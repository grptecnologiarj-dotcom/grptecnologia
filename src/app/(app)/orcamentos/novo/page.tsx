import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrcamentoForm } from "@/components/orcamentos/orcamento-form";
import { demoClientes } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarClientesAction } from "@/lib/actions/clientes";

export const metadata = { title: "Novo Orçamento" };

export default async function NovoOrcamentoPage() {
  const isSupabase = isSupabaseConfigured();
  let clientes: { id: string; nome: string; email?: string; telefone?: string }[] =
    demoClientes.map((c) => ({ id: c.id, nome: c.nome, email: (c as any).email, telefone: (c as any).telefone }));

  if (isSupabase) {
    const result = await listarClientesAction();
    clientes = ((result.data ?? []) as any[]).map((c) => ({
      id: c.id, nome: c.nome, email: c.email ?? undefined, telefone: c.telefone ?? undefined,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/orcamentos"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo orçamento</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Crie um orçamento para enviar ao cliente</p>
        </div>
      </div>
      <OrcamentoForm clientes={clientes} isSupabase={isSupabase} />
    </div>
  );
}
