import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EquipamentoForm } from "@/components/equipamentos/equipamento-form";

export const metadata = { title: "Novo Equipamento — DeskControl" };

export default function NovoEquipamentoPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/equipamentos"
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo equipamento</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Cadastre um equipamento vinculado a um cliente</p>
        </div>
      </div>
      <EquipamentoForm />
    </div>
  );
}
