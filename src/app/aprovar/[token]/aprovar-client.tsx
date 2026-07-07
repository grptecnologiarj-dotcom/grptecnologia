"use client";

import { useState, useTransition } from "react";
import { Wrench, CheckCircle2, XCircle, AlertTriangle, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { aprovarOrcamentoPorTokenAction, recusarOrcamentoPorTokenAction } from "@/lib/actions/orcamentos";

export interface OrcamentoPortal {
  token: string;
  numero: string;
  empresa: string;
  logoUrl?: string;
  telefoneEmpresa: string;
  cliente: string;
  equipamento: string | null;
  problema: string;
  validoAte: string | null;
  observacoes: string;
  itens: { descricao: string; quantidade: number; valorUnit: number; valorTotal: number }[];
  valorTotal: number;
  garantiaDias: number;
  status: string;
}

type Etapa = "revisar" | "reprovando" | "aprovado" | "reprovado";

export function AprovarOrcamentoClient({ orcamento }: { orcamento: OrcamentoPortal }) {
  const orc = orcamento;
  const estadoInicial: Etapa =
    orc.status === "aprovado" ? "aprovado" : orc.status === "recusado" ? "reprovado" : "revisar";

  const [etapa, setEtapa] = useState<Etapa>(estadoInicial);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [showItens, setShowItens] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAprovar() {
    setErro(null);
    startTransition(async () => {
      const result = await aprovarOrcamentoPorTokenAction(orc.token);
      if (result?.error) {
        setErro(result.error);
      } else {
        setEtapa("aprovado");
      }
    });
  }

  function handleConfirmarRecusa() {
    setErro(null);
    startTransition(async () => {
      const result = await recusarOrcamentoPorTokenAction(orc.token, motivoRecusa);
      if (result?.error) {
        setErro(result.error);
      } else {
        setEtapa("reprovado");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-lg px-4 py-4 flex items-center gap-3">
          {orc.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={orc.logoUrl} alt={orc.empresa} className="size-9 rounded-[var(--radius-md)] object-cover" />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white">
              <Wrench className="size-5" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold">{orc.empresa}</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Aprovação de Orçamento</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-5 px-4 py-8">

        {/* Estado: Aprovado */}
        {etapa === "aprovado" && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 size-16 text-[var(--color-success)]" />
            <h1 className="text-2xl font-bold text-[var(--color-success)]">Orçamento aprovado!</h1>
            <p className="mt-2 text-[var(--color-fg-muted)]">
              Ótimo! Já recebemos sua aprovação. Vamos iniciar o serviço em breve.
            </p>
            {orc.telefoneEmpresa && (
              <a
                href={`https://wa.me/${orc.telefoneEmpresa}?text=Ol%C3%A1%2C%20acabei%20de%20aprovar%20o%20or%C3%A7amento%20${orc.numero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25d366] py-3 text-sm font-semibold text-white hover:bg-[#1fba57] transition-colors"
              >
                <MessageCircle className="size-4" />
                Confirmar pelo WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Estado: Reprovado */}
        {etapa === "reprovado" && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
            <XCircle className="mx-auto mb-4 size-16 text-[var(--color-fg-subtle)]" />
            <h1 className="text-2xl font-bold">Orçamento recusado</h1>
            <p className="mt-2 text-[var(--color-fg-muted)]">
              Entendido. Entraremos em contato para combinar a devolução do equipamento.
            </p>
            {orc.telefoneEmpresa && (
              <a
                href={`https://wa.me/${orc.telefoneEmpresa}?text=Ol%C3%A1%2C%20recusei%20o%20or%C3%A7amento%20${orc.numero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] py-3 text-sm font-semibold hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <MessageCircle className="size-4" />
                Falar no WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Estado: Revisando / Reprovando */}
        {(etapa === "revisar" || etapa === "reprovando") && (
          <>
            {/* Cabeçalho do orçamento */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-600)]">Orçamento</p>
                  <h1 className="text-xl font-bold">{orc.numero}</h1>
                </div>
                <span className="rounded-full bg-[var(--color-warning-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-warning)]">
                  Aguardando aprovação
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--color-fg-muted)]">Cliente</span>
                  <span className="font-medium">{orc.cliente}</span>
                </div>
                {orc.equipamento && (
                  <div className="flex justify-between gap-2">
                    <span className="text-[var(--color-fg-muted)]">Equipamento</span>
                    <span className="font-medium">{orc.equipamento}</span>
                  </div>
                )}
                {orc.problema && (
                  <div className="flex justify-between gap-2">
                    <span className="text-[var(--color-fg-muted)]">Problema</span>
                    <span className="text-right max-w-[60%]">{orc.problema}</span>
                  </div>
                )}
                {orc.validoAte && (
                  <div className="flex justify-between gap-2 border-t border-[var(--color-border)] pt-2">
                    <span className="text-[var(--color-fg-muted)]">Válido até</span>
                    <span>{new Date(orc.validoAte).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Itens */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
              <button
                onClick={() => setShowItens((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <h2 className="font-semibold">Serviços e peças</h2>
                {showItens ? <ChevronUp className="size-4 text-[var(--color-fg-subtle)]" /> : <ChevronDown className="size-4 text-[var(--color-fg-subtle)]" />}
              </button>
              {showItens && (
                <div className="border-t border-[var(--color-border)]">
                  <div className="divide-y divide-[var(--color-border)]">
                    {orc.itens.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                        <div>
                          <p className="font-medium">{item.descricao}</p>
                          {item.quantidade > 1 && (
                            <p className="text-xs text-[var(--color-fg-subtle)]">{item.quantidade} × {formatCurrency(item.valorUnit)}</p>
                          )}
                        </div>
                        <span className="font-semibold shrink-0">{formatCurrency(item.valorTotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-[var(--color-brand-600)]">{formatCurrency(orc.valorTotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Observações */}
            {orc.observacoes && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-1">Observações</p>
                <p className="text-sm text-[var(--color-fg-muted)] whitespace-pre-line">{orc.observacoes}</p>
              </div>
            )}

            {/* Garantia */}
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] px-4 py-3">
              <CheckCircle2 className="size-5 shrink-0 text-[var(--color-success)]" />
              <p className="text-sm text-[var(--color-fg-muted)]">
                Garantia de <strong>{orc.garantiaDias} dias</strong> para peças e mão de obra após conclusão do serviço.
              </p>
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-bg)] px-4 py-3">
                <AlertTriangle className="size-4 shrink-0 text-[var(--color-danger)]" />
                <p className="text-sm text-[var(--color-danger)]">{erro}</p>
              </div>
            )}

            {/* Modal de recusa */}
            {etapa === "reprovando" && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-bg)] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-[var(--color-warning)]" />
                  <p className="font-semibold">Confirmar recusa do orçamento?</p>
                </div>
                <textarea
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                  placeholder="Motivo (opcional): valor acima do esperado, aguardo outra proposta..."
                  rows={2}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEtapa("revisar")}
                    disabled={isPending}
                    className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 text-sm font-medium hover:bg-[var(--color-surface-muted)] disabled:opacity-60 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarRecusa}
                    disabled={isPending}
                    className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-danger)] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                  >
                    {isPending ? "Enviando..." : "Confirmar recusa"}
                  </button>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            {etapa !== "reprovando" && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAprovar}
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success)] py-4 text-base font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {isPending ? (
                    <>
                      <span className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Aprovando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-5" />
                      Aprovar orçamento — {formatCurrency(orc.valorTotal)}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEtapa("reprovando")}
                  disabled={isPending}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] disabled:opacity-60 transition-colors"
                >
                  Recusar orçamento
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-fg-subtle)]">
        Desenvolvido por{" "}
        <span className="font-semibold text-[var(--color-brand-600)]">GRP Tecnologia</span>
        {" "}· Powered by DeskControl
      </footer>
    </div>
  );
}
