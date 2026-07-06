import { isSupabaseConfigured } from "@/lib/auth";
import { buscarEmpresaAction } from "@/lib/actions/empresa";
import { ConfiguracoesClient } from "./configuracoes-client";

export const metadata = { title: "Configurações — DeskControl" };

const empresaDemo = {
  nome: "GRP Tecnologia",
  razao_social: "",
  cnpj: "",
  telefone: "",
  whatsapp: "",
  email: "contato@grptecnologia.com.br",
  site: "https://grptecnologia.com.br",
  endereco: "",
  cidade: "",
  estado: "SP",
  cep: "",
};

export default async function ConfiguracoesPage() {
  let empresa = empresaDemo;
  const supabase = isSupabaseConfigured();

  if (supabase) {
    const result = await buscarEmpresaAction();
    if (result.data) {
      empresa = result.data as typeof empresaDemo;
    }
  }

  return <ConfiguracoesClient empresa={empresa} isSupabase={supabase} />;
}
