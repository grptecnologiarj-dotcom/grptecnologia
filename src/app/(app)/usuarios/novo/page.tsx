import { isSupabaseConfigured } from "@/lib/auth";
import { NovoUsuarioForm } from "./novo-usuario-form";

export const metadata = { title: "Novo usuário — DeskControl" };

export default function NovoUsuarioPage() {
  return <NovoUsuarioForm supabaseAtivo={isSupabaseConfigured()} />;
}
