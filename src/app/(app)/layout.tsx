import { redirect } from "next/navigation";
import { getCurrentUser, isSupabaseConfigured } from "@/lib/auth";
import { createServerClientInstance } from "@/lib/supabase";
import { demoEmpresa } from "@/lib/demo-data";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Empresa } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  let empresa: Pick<Empresa, "nome"> | undefined = demoEmpresa;

  if (isSupabaseConfigured()) {
    const supabase = await createServerClientInstance();
    const { data } = await supabase
      .from("empresas")
      .select("nome")
      .eq("id", user.empresaId)
      .single();
    if (data) empresa = data;
    if (!data) redirect("/login");
  }

  return (
    <DashboardShell
      userName={user.nome}
      userEmail={user.email}
      empresaNome={empresa?.nome}
    >
      {children}
    </DashboardShell>
  );
}
