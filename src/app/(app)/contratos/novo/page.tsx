import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { demoClientes } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarClientesAction } from "@/lib/actions/clientes";
import { ContratoForm } from "./contrato-form";

export const metadata = { title: "Novo Contrato" };

export default async function NovoContratoPage() {
  const isSupabase = isSupabaseConfigured();
  let clientes: { id: string; nome: string }[] = demoClientes.map((c) => ({ id: c.id, nome: c.nome }));

  if (isSupabase) {
    const result = await listarClientesAction();
    clientes = ((result.data ?? []) as any[]).map((c) => ({ id: c.id, nome: c.nome }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/contratos"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo contrato</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Crie um contrato de manutenção ou suporte recorrente</p>
        </div>
      </div>

      <ContratoForm clientes={clientes} isSupabase={isSupabase} />
    </div>
  );
}
