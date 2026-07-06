"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] animate-slide-up max-h-[92vh] flex flex-col",
          sizes[size]
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--color-border)]">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-[var(--color-fg)]">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-[var(--color-fg-muted)] mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-[var(--radius-md)] text-[var(--color-fg-subtle)] hover:bg-[var(--color-surface-muted)]"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        <div className="p-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 p-5 border-t border-[var(--color-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}