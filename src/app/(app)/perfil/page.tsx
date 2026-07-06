import { isSupabaseConfigured } from "@/lib/auth";
import { buscarPerfilAction } from "@/lib/actions/empresa";
import { demoUser } from "@/lib/demo-data";
import { PerfilClient } from "./perfil-client";

export const metadata = { title: "Meu Perfil — DeskControl" };

export default async function PerfilPage() {
  const supabase = isSupabaseConfigured();

  let perfil = {
    nome: demoUser.nome,
    email: demoUser.email,
    telefone: (demoUser as any).telefone ?? null,
    bio: null as string | null,
    role: demoUser.role,
    isSupabase: false,
  };

  if (supabase) {
    const result = await buscarPerfilAction();
    if (result.data) {
      const d = result.data as any;
      perfil = {
        nome: d.nome ?? demoUser.nome,
        email: d.email ?? demoUser.email,
        telefone: d.telefone ?? null,
        bio: d.bio ?? null,
        role: d.role ?? "admin",
        isSupabase: true,
      };
    }
  }

  return <PerfilClient perfil={perfil} />;
}
