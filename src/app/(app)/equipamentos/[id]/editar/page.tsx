import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { demoEquipamentos } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { buscarEquipamentoAction } from "@/lib/actions/equipamentos";
import { EquipamentoEditarForm } from "./equipamento-editar-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Editar equipamento #${id.slice(0, 6)} — DeskControl` };
}

export default async function EditarEquipamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const demo = demoEquipamentos.find((e) => e.id === id) ?? demoEquipamentos[0];
  let equip = {
    id: demo.id,
    nome: demo.nome,
    categoria: ((demo as any).tipo ?? "") as string,
    marca: (demo.marca ?? "") as string,
    modelo: ((demo as any).modelo ?? "") as string,
    cor: ((demo as any).cor ?? "") as string,
    numero_serie: ((demo as any).numero_serie ?? "") as string,
    imei: ((demo as any).imei ?? "") as string,
    senha: ((demo as any).senha ?? "") as string,
    observacoes: ((demo as any).observacoes ?? "") as string,
    isSupabase: false,
  };

  if (isSupabaseConfigured()) {
    const result = await buscarEquipamentoAction(id);
    if (!result.data) return notFound();
    const d = result.data as any;
    equip = {
      id: d.id,
      nome: d.nome ?? "",
      categoria: d.categoria ?? "",
      marca: d.marca ?? "",
      modelo: d.modelo ?? "",
      cor: d.cor ?? "",
      numero_serie: d.numero_serie ?? "",
      imei: d.imei ?? "",
      senha: d.senha ?? "",
      observacoes: d.observacoes ?? "",
      isSupabase: true,
    };
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/equipamentos/${equip.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar equipamento</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{equip.nome}</p>
        </div>
      </div>

      <EquipamentoEditarForm equip={equip} />
    </div>
  );
}
