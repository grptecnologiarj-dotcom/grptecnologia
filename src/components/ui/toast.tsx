"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────── */
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

/* ─── Context ────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

const noopToast: ToastContextValue = {
  toast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
};

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? noopToast;
}

/* ─── Config ─────────────────────────────────────────────────── */
const config: Record<ToastType, { icon: React.ElementType; colors: string; iconColor: string }> = {
  success: {
    icon: CheckCircle2,
    colors: "border-[var(--color-success)]/30 bg-[var(--color-success-bg)]",
    iconColor: "text-[var(--color-success)]",
  },
  error: {
    icon: XCircle,
    colors: "border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]",
    iconColor: "text-[var(--color-danger)]",
  },
  warning: {
    icon: AlertTriangle,
    colors: "border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)]",
    iconColor: "text-[var(--color-warning)]",
  },
  info: {
    icon: Info,
    colors: "border-[var(--color-info)]/30 bg-[var(--color-info-bg)]",
    iconColor: "text-[var(--color-info)]",
  },
};

/* ─── Single Toast item ──────────────────────────────────────── */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { icon: Icon, colors, iconColor } = config[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 shadow-lg",
        "animate-in slide-in-from-right-8 fade-in duration-300",
        colors
      )}
      style={{ minWidth: 280, maxWidth: 380 }}
    >
      <Icon className={cn("size-5 shrink-0 mt-0.5", iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-[var(--color-fg-muted)] leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded p-0.5 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/* ─── Provider ───────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 4000;
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const value: ToastContextValue = {
    toast: add,
    success: (title, description) => add({ type: "success", title, description }),
    error: (title, description) => add({ type: "error", title, description }),
    warning: (title, description) => add({ type: "warning", title, description }),
    info: (title, description) => add({ type: "info", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
