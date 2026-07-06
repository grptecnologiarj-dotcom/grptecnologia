"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline:
    "inline-flex items-center justify-center gap-2 bg-transparent border border-[var(--color-border)] text-[var(--color-fg)] font-semibold rounded-[var(--radius-md)] px-4 py-2.5 hover:bg-[var(--color-surface-muted)]",
  ghost:
    "inline-flex items-center justify-center gap-2 bg-transparent text-[var(--color-fg-muted)] font-medium rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-surface-muted)]",
  danger:
    "inline-flex items-center justify-center gap-2 bg-[var(--color-danger)] text-white font-semibold rounded-[var(--radius-md)] px-4 py-2.5 hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3",
  icon: "p-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(variants[variant], sizes[size], "disabled:opacity-50 disabled:pointer-events-none", className)}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  }
);

Button.displayName = "Button";