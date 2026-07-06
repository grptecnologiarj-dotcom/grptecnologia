import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="flex items-center justify-center size-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)] mb-4">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-fg)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-fg-muted)] mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}