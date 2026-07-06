import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarClientesAction } from "@/lib/actions/clientes";
import { demoClientes } from "@/lib/demo-data";
import { ClientesListClient } from "./clientes-list-client";

export const metadata = { title: "Clientes" };

export default async function ClientesPage() {
  let clientes: any[] = [];

  if (isSupabaseConfigured()) {
    const result = await listarClientesAction();
    clientes = result.data ?? [];
  } else {
    clientes = demoClientes.map(c => ({
      id: c.id,
      nome: c.nome,
      tipo: "fisica",
      telefone: c.telefone,
      whatsapp: (c as any).whatsapp,
      email: (c as any).email,
      cpf_cnpj: (c as any).cpf_cnpj,
      cidade: (c as any).cidade,
      estado: (c as any).estado,
      created_at: (c as any).criadoEm,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} cadastrado{clientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/clientes/novo">
            <Plus className="size-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <ClientesListClient initialData={clientes} />
    </div>
  );
}
