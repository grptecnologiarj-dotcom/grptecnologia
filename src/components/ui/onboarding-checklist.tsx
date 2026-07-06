"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Rocket } from "lucide-react";

const STEPS = [
  { id: "empresa", label: "Configure os dados da empresa", href: "/configuracoes", desc: "Nome, CNPJ, endereço e contatos" },
  { id: "usuario", label: "Convide sua equipe", href: "/usuarios/novo", desc: "Adicione técnicos e atendentes" },
  { id: "cliente", label: "Cadastre seu primeiro cliente", href: "/clientes/novo", desc: "Comece o cadastro de clientes" },
  { id: "os", label: "Abra sua primeira OS", href: "/os/nova", desc: "Crie uma ordem de serviço" },
  { id: "financeiro", label: "Registre uma transação", href: "/financeiro/novo", desc: "Receita ou despesa no caixa" },
];

const STORAGE_KEY = "deskcontrol_onboarding";

function load(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function OnboardingChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = load();
    setDone(saved);
    setDismissed(!!saved.__dismissed);
    setMounted(true);
  }, []);

  if (!mounted || dismissed) return null;

  const completedCount = STEPS.filter((s) => done[s.id]).length;
  const allDone = completedCount === STEPS.length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  function toggle(id: string) {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function dismiss() {
    const next = { ...done, __dismissed: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDismissed(true);
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-200)] bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-surface)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)]">
          <Rocket className="size-4 text-[var(--color-brand-600)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">
              {allDone ? "Sistema configurado!" : "Configure seu sistema"}
            </p>
            <span className="text-xs font-medium text-[var(--color-brand-600)]">
              {completedCount}/{STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-[var(--color-surface-muted)]">
            <div
              className="h-1.5 rounded-full bg-[var(--color-brand-500)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded p-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
          >
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
          <button
            onClick={dismiss}
            className="rounded p-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
            title="Dispensar"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
          {STEPS.map((step) => {
            const isDone = !!done[step.id];
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${isDone ? "opacity-60" : "hover:bg-[var(--color-surface-muted)]"}`}
              >
                <button
                  onClick={() => toggle(step.id)}
                  className="shrink-0 transition-transform hover:scale-110"
                >
                  {isDone
                    ? <CheckCircle2 className="size-5 text-[var(--color-success)]" />
                    : <Circle className="size-5 text-[var(--color-fg-subtle)]" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${isDone ? "line-through text-[var(--color-fg-muted)]" : ""}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-[var(--color-fg-subtle)]">{step.desc}</p>
                </div>
                {!isDone && (
                  <Link
                    href={step.href}
                    className="shrink-0 text-xs font-medium text-[var(--color-brand-600)] hover:underline"
                  >
                    Ir →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {allDone && !collapsed && (
        <div className="px-5 py-3 text-center text-xs text-[var(--color-success)] font-semibold border-t border-[var(--color-border)]">
          Parabéns! Seu sistema está 100% configurado.
        </div>
      )}
    </div>
  );
}
