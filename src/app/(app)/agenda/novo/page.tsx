import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { demoClientes, demoUsuarios } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarClientesAction } from "@/lib/actions/clientes";
import { listarTecnicosAction } from "@/lib/actions/agenda";
import { EventoForm } from "./evento-form";

export const metadata = { title: "Novo Evento" };

export default async function NovoEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const isSupabase = isSupabaseConfigured();

  let clientes: { id: string; nome: string }[] = demoClientes.map((c) => ({ id: c.id, nome: c.nome }));
  let tecnicos: { id: string; nome: string }[] = demoUsuarios
    .filter((u) => u.role === "tecnico" || u.role === "admin")
    .map((u) => ({ id: u.id, nome: u.nome }));

  if (isSupabase) {
    const [clientesRes, tecnicosRes] = await Promise.all([
      listarClientesAction(),
      listarTecnicosAction(),
    ]);
    clientes = ((clientesRes.data ?? []) as any[]).map((c) => ({ id: c.id, nome: c.nome }));
    tecnicos = ((tecnicosRes.data ?? []) as any[]).map((t) => ({ id: t.id, nome: t.nome }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/agenda"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo evento</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Agende um evento na agenda corporativa</p>
        </div>
      </div>

      <EventoForm clientes={clientes} tecnicos={tecnicos} isSupabase={isSupabase} dataInicial={data} />
    </div>
  );
}
