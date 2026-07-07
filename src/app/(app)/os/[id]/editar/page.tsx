import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { demoOSDetalhe, demoUsuarios } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { buscarOSAction } from "@/lib/actions/os";
import { listarUsuariosAction } from "@/lib/actions/usuarios";
import { OSEditarForm, type OSEditarData } from "./os-editar-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Editar OS #${id.slice(0, 6)} — DeskControl` };
}

export default async function EditarOSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const demo = demoOSDetalhe;
  let os: OSEditarData = {
    id: demo.id,
    numero: demo.numero,
    status: demo.status,
    prioridade: demo.prioridade,
    problema: demo.problema ?? "",
    diagnostico: demo.diagnostico ?? "",
    solucao: demo.solucao ?? "",
    observacoes: demo.observacoes ?? "",
    obs_internas: demo.obs_internas ?? "",
    tecnico_id: (demo as any).usuarios?.id ?? "",
    data_previsao: demo.data_previsao ?? "",
    valor_mao_obra: Number(demo.valor_mao_obra ?? 0),
    garantia_dias: Number(demo.garantia_dias ?? 0),
    clienteNome: (demo as any).clientes?.nome ?? "—",
    equipamentoNome: (demo as any).equipamentos?.nome ?? "—",
    itens: ((demo as any).os_itens ?? []).map((i: any) => ({
      id: i.id, tipo: i.tipo, descricao: i.descricao,
      quantidade: Number(i.quantidade), valor_total: Number(i.valor_total ?? 0),
    })),
    isSupabase: false,
  };
  let tecnicos: { id: string; nome: string }[] = demoUsuarios
    .filter(u => u.role === "tecnico" || u.role === "admin")
    .map(u => ({ id: u.id, nome: u.nome }));

  if (isSupabaseConfigured()) {
    const result = await buscarOSAction(id);
    if (!result.data) return notFound();
    const d = result.data as any;
    os = {
      id: d.id,
      numero: d.numero,
      status: d.status,
      prioridade: d.prioridade ?? "media",
      problema: d.problema ?? "",
      diagnostico: d.diagnostico ?? "",
      solucao: d.solucao ?? "",
      observacoes: d.observacoes ?? "",
      obs_internas: d.obs_internas ?? "",
      tecnico_id: d.tecnico_id ?? "",
      data_previsao: d.data_previsao ?? "",
      valor_mao_obra: Number(d.valor_mao_obra ?? 0),
      garantia_dias: Number(d.garantia_dias ?? 0),
      clienteNome: d.clientes?.nome ?? "—",
      equipamentoNome: d.equipamentos?.nome ?? "—",
      itens: ((d.os_itens ?? []) as any[]).map((i) => ({
        id: i.id, tipo: i.tipo, descricao: i.descricao,
        quantidade: Number(i.quantidade), valor_total: Number(i.valor_total ?? 0),
      })),
      isSupabase: true,
    };
    const usuarios = await listarUsuariosAction();
    tecnicos = ((usuarios.data ?? []) as any[])
      .filter(u => u.role === "tecnico" || u.role === "admin")
      .map(u => ({ id: u.id, nome: u.nome }));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/os/${os.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar OS</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{os.numero}</p>
        </div>
      </div>

      <OSEditarForm os={os} tecnicos={tecnicos} />
    </div>
  );
}
