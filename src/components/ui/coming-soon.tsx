import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function ComingSoon({ title, description, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)]">
        <Icon className="size-8 text-[var(--color-fg-subtle)]" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-[var(--color-fg-muted)]">
          {description ?? "Este módulo está sendo desenvolvido e estará disponível em breve."}
        </p>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
        <span className="size-1.5 rounded-full bg-[var(--color-brand-500)]" />
        Em desenvolvimento
      </div>
    </div>
  );
}
