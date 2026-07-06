import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { listarOSAction } from "@/lib/actions/os";
import { demoOS, statusOSConfig, prioridadeOSConfig } from "@/lib/demo-data";
import { OSListClient } from "./os-list-client";

export const metadata = { title: "Ordens de Serviço" };

const statusAberto = ["aberta", "em_diagnostico", "aguardando_aprovacao", "em_reparo", "aguardando_pecas"];

export default async function OSPage() {
  let osList: any[] = [];

  if (isSupabaseConfigured()) {
    const result = await listarOSAction();
    osList = (result.data ?? []).map((o: any) => ({
      id: o.id,
      numero: o.numero,
      status: o.status,
      prioridade: o.prioridade,
      valor_total: o.valor_total ?? 0,
      data_abertura: o.data_abertura,
      data_previsao: o.data_previsao,
      clientes: o.clientes,
      equipamentos: o.equipamentos,
      usuarios: o.usuarios,
    }));
  } else {
    osList = demoOS.map(o => ({
      id: o.id,
      numero: o.numero,
      status: o.status,
      prioridade: o.prioridade,
      valor_total: o.valorTotal,
      data_abertura: o.dataAbertura,
      data_previsao: o.dataPrevisao,
      clientes: { nome: o.clienteNome },
      equipamentos: o.equipamentoNome ? { nome: o.equipamentoNome } : null,
      usuarios: o.tecnicoNome ? { nome: o.tecnicoNome } : null,
    }));
  }

  const osAtrasadas = osList.filter(
    o => o.data_previsao && new Date(o.data_previsao) < new Date() && statusAberto.includes(o.status)
  );
  const abertas = osList.filter(o => statusAberto.includes(o.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {abertas} em aberto
            {osAtrasadas.length > 0 && ` · ${osAtrasadas.length} atrasada(s)`}
            {" · "}{osList.length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/os/nova">
            <Plus className="size-4" />
            Nova OS
          </Link>
        </Button>
      </div>

      {osAtrasadas.length > 0 && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3">
          <ClipboardList className="size-4 shrink-0 text-[var(--color-danger)]" />
          <p className="text-sm text-[var(--color-danger)]">
            <strong>{osAtrasadas.length}</strong> OS com prazo vencido:{" "}
            {osAtrasadas.slice(0, 3).map((o: any) => o.numero).join(", ")}
            {osAtrasadas.length > 3 && ` e mais ${osAtrasadas.length - 3}`}
          </p>
        </div>
      )}

      <OSListClient
        initialData={osList}
        statusOSConfig={statusOSConfig}
        prioridadeOSConfig={prioridadeOSConfig}
        statusAberto={statusAberto}
      />
    </div>
  );
}
