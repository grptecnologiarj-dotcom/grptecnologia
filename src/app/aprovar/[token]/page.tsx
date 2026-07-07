import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { AprovarOrcamentoClient, type OrcamentoPortal } from "./aprovar-client";

export const metadata = { title: "Aprovação de Orçamento — DeskControl" };

const orcamentoDemo: OrcamentoPortal = {
  token: "demo-token",
  numero: "ORC-2026-0018",
  empresa: "TechRepair Assistência",
  telefoneEmpresa: "5511999990000",
  cliente: "João Pedro Almeida",
  equipamento: "iPhone 13 Pro",
  problema: "Tela trincada e bateria com mau contato",
  validoAte: "2026-07-02",
  observacoes:
    "Prazo estimado de 2 dias úteis após aprovação. Garantia de 90 dias para peças e mão de obra.",
  itens: [
    { descricao: "Troca de tela — iPhone 13 Pro (OEM)", quantidade: 1, valorUnit: 320, valorTotal: 320 },
    { descricao: "Troca de bateria — iPhone 13 Pro", quantidade: 1, valorUnit: 130, valorTotal: 130 },
    { descricao: "Mão de obra", quantidade: 1, valorUnit: 30, valorTotal: 30 },
  ],
  valorTotal: 480,
  garantiaDias: 90,
  status: "enviado",
};

export default async function AprovarOrcamentoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Modo demo: sem Supabase configurado ou token demo
  if (!isSupabaseConfigured() || token === "demo-token") {
    return <AprovarOrcamentoClient orcamento={orcamentoDemo} />;
  }

  const supabase = createAdminClient();
  const { data: orc, error } = await supabase
    .from("orcamentos")
    .select("*, clientes(nome), empresas(nome, logo_url, telefone, whatsapp)")
    .eq("token_aprovacao", token)
    .single();

  if (error || !orc) {
    notFound();
  }

  const empresa = orc.empresas as { nome?: string; logo_url?: string; telefone?: string; whatsapp?: string } | null;
  const cliente = orc.clientes as { nome?: string } | null;

  const orcamento: OrcamentoPortal = {
    token,
    numero: orc.numero ?? "—",
    empresa: empresa?.nome ?? "Assistência Técnica",
    logoUrl: empresa?.logo_url ?? undefined,
    telefoneEmpresa: (empresa?.whatsapp ?? empresa?.telefone ?? "").replace(/\D/g, ""),
    cliente: cliente?.nome ?? "—",
    equipamento: null,
    problema: orc.descricao ?? "",
    validoAte: orc.validade ?? null,
    observacoes: orc.observacoes ?? "",
    itens: [
      {
        descricao: orc.descricao || "Serviço orçado",
        quantidade: 1,
        valorUnit: orc.valor_total ?? 0,
        valorTotal: orc.valor_total ?? 0,
      },
    ],
    valorTotal: orc.valor_total ?? 0,
    garantiaDias: 90,
    status: orc.status ?? "enviado",
  };

  return <AprovarOrcamentoClient orcamento={orcamento} />;
}
