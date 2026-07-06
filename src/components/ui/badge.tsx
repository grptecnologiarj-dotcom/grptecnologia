import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info" | "brand";

const tones: Record<Tone, string> = {
  default:
    "bg-[var(--color-surface-muted)] text-[var(--color-fg-muted)] border-[var(--color-border)]",
  success:
    "bg-[var(--color-success-bg)] text-[var(--color-success)] border-transparent",
  warning:
    "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-transparent",
  danger:
    "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-transparent",
  info: "bg-[var(--color-info-bg)] text-[var(--color-info)] border-transparent",
  brand:
    "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border-transparent",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}