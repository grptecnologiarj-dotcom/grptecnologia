import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/auth";
import { buscarUsuarioAction } from "@/lib/actions/usuarios";
import { demoUsuarios } from "@/lib/demo-data";
import { EditarUsuarioForm, type UsuarioEditavel } from "./editar-usuario-form";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Editar usuário #${id.slice(0, 6)}` };
}

export default async function EditarUsuarioPage({ params }: Props) {
  const { id } = await params;
  const supabaseAtivo = isSupabaseConfigured();

  let usuario: UsuarioEditavel | undefined;

  if (supabaseAtivo) {
    const { data } = await buscarUsuarioAction(id);
    if (data) {
      usuario = {
        id: String(data.id),
        nome: data.nome ?? "",
        email: data.email ?? "",
        telefone: data.telefone ?? null,
        role: data.role ?? "atendente",
        status: data.status ?? "ativo",
      };
    }
  } else {
    const demo = demoUsuarios.find((u) => u.id === id) ?? demoUsuarios[0];
    if (demo) {
      usuario = {
        id: demo.id,
        nome: demo.nome,
        email: demo.email,
        telefone: (demo as { telefone?: string }).telefone ?? null,
        role: demo.role,
        status: demo.status,
      };
    }
  }

  if (!usuario) notFound();

  return <EditarUsuarioForm usuario={usuario} supabaseAtivo={supabaseAtivo} />;
}
