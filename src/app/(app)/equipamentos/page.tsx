import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarEquipamentosAction } from "@/lib/actions/equipamentos";
import { demoEquipamentos } from "@/lib/demo-data";
import { EquipamentosListClient } from "./equipamentos-list-client";

export const metadata = { title: "Equipamentos" };

export default async function EquipamentosPage() {
  let equipamentos: any[] = [];

  if (isSupabaseConfigured()) {
    const result = await listarEquipamentosAction();
    equipamentos = result.data ?? [];
  } else {
    equipamentos = demoEquipamentos.map(e => ({
      id: e.id,
      nome: e.nome,
      categoria: (e as any).categoria,
      marca: (e as any).marca,
      modelo: (e as any).modelo,
      numero_serie: (e as any).numeroSerie,
      created_at: (e as any).criadoEm,
      clientes: e.clienteNome ? { id: e.clienteId ?? e.id, nome: e.clienteNome } : null,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {equipamentos.length} equipamento{equipamentos.length !== 1 ? "s" : ""} cadastrado{equipamentos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/equipamentos/novo">
            <Plus className="size-4" />
            Novo Equipamento
          </Link>
        </Button>
      </div>

      <EquipamentosListClient initialData={equipamentos} />
    </div>
  );
}
