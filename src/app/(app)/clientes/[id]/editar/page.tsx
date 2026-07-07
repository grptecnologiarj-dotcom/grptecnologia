import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { demoClientes } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { buscarClienteAction } from "@/lib/actions/clientes";
import { ClienteEditarForm } from "./cliente-editar-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Editar cliente ${id.slice(0, 8)} — DeskControl` };
}

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const demo = demoClientes.find((c) => c.id === id) ?? demoClientes[0];
  let cliente = {
    id: demo.id,
    nome: demo.nome,
    tipo: ((demo as any).tipo ?? "fisica") as string,
    cpf_cnpj: ((demo as any).cpf_cnpj ?? "") as string,
    email: ((demo as any).email ?? "") as string,
    telefone: (demo.telefone ?? "") as string,
    whatsapp: (demo.whatsapp ?? "") as string,
    cep: ((demo as any).cep ?? "") as string,
    endereco: ((demo as any).endereco ?? "") as string,
    numero: ((demo as any).numero ?? "") as string,
    complemento: ((demo as any).complemento ?? "") as string,
    bairro: ((demo as any).bairro ?? "") as string,
    cidade: ((demo as any).cidade ?? "") as string,
    estado: ((demo as any).estado ?? "SP") as string,
    observacoes: ((demo as any).observacoes ?? "") as string,
    obs_internas: ((demo as any).obs_internas ?? "") as string,
    isSupabase: false,
  };

  if (isSupabaseConfigured()) {
    const result = await buscarClienteAction(id);
    if (!result.data) return notFound();
    const d = result.data as any;
    cliente = {
      id: d.id,
      nome: d.nome ?? "",
      tipo: d.tipo ?? "fisica",
      cpf_cnpj: d.cpf_cnpj ?? "",
      email: d.email ?? "",
      telefone: d.telefone ?? "",
      whatsapp: d.whatsapp ?? "",
      cep: d.cep ?? "",
      endereco: d.endereco ?? "",
      numero: d.numero ?? "",
      complemento: d.complemento ?? "",
      bairro: d.bairro ?? "",
      cidade: d.cidade ?? "",
      estado: d.estado ?? "SP",
      observacoes: d.observacoes ?? "",
      obs_internas: d.obs_internas ?? "",
      isSupabase: true,
    };
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/clientes/${cliente.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar cliente</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{cliente.nome}</p>
        </div>
      </div>

      <ClienteEditarForm cliente={cliente} />
    </div>
  );
}
