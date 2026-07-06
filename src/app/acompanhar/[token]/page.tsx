import { notFound } from "next/navigation";
import { Wrench, CheckCircle2, Clock, Package, AlertCircle, PhoneCall, Star, CalendarClock } from "lucide-react";
import { demoOSDetalhe, statusOSConfig } from "@/lib/demo-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ShareButton } from "./share-button";
import { RatingWidget } from "./rating-widget";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token === "demo-token-abc123") {
    return { title: `OS-2026-0042 — Acompanhe seu serviço` };
  }
  return { title: "Acompanhar serviço" };
}

function formatWhatsApp(numero: string) {
  return numero.replace(/\D/g, "");
}

export default async function PortalClientePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Em produção: buscar OS pelo portal_token no Supabase
  const os = token === "demo-token-abc123" ? demoOSDetalhe : null;

  if (!os) return notFound();

  const cfg = statusOSConfig[os.status as keyof typeof statusOSConfig];
  const whatsappNumero = formatWhatsApp((os.clientes as any).whatsapp || "5511999990000");

  const etapas = [
    {
      key: "aberta",
      label: "OS aberta",
      icon: Clock,
      descricao: "Equipamento recebido e OS gerada.",
      feita: true,
      data: os.data_abertura,
    },
    {
      key: "em_diagnostico",
      label: "Diagnóstico",
      icon: Wrench,
      descricao: "Técnico avaliando o problema relatado.",
      feita: ["em_diagnostico","aguardando_aprovacao","em_reparo","aguardando_pecas","pronto","entregue"].includes(os.status),
      data: null,
    },
    {
      key: "aprovado",
      label: "Orçamento aprovado",
      icon: CheckCircle2,
      descricao: "Serviço aprovado e autorizado.",
      feita: ["em_reparo","aguardando_pecas","pronto","entregue"].includes(os.status),
      data: os.data_aprovacao,
    },
    {
      key: "em_reparo",
      label: "Em reparo",
      icon: Wrench,
      descricao: "Técnico executando o serviço.",
      feita: ["pronto","entregue"].includes(os.status),
      ativo: os.status === "em_reparo",
      data: null,
    },
    {
      key: "pronto",
      label: "Pronto para retirada",
      icon: Package,
      descricao: "Serviço concluído. Venha buscar!",
      feita: ["entregue"].includes(os.status),
      ativo: os.status === "pronto",
      data: null,
    },
    {
      key: "entregue",
      label: "Entregue",
      icon: CheckCircle2,
      descricao: "Equipamento entregue ao cliente.",
      feita: os.status === "entregue",
      data: os.data_entrega,
    },
  ];

  const etapaAtual = etapas.findIndex((e) => (e as any).ativo) >= 0
    ? etapas.findIndex((e) => (e as any).ativo)
    : etapas.filter((e) => e.feita).length;

  const progresso = Math.round((etapaAtual / (etapas.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white shrink-0">
              <Wrench className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">DeskControl</p>
              <p className="text-xs text-[var(--color-fg-muted)]">Portal do Cliente</p>
            </div>
          </div>
          <ShareButton />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        {/* Status principal + barra de progresso */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
          <h1 className="mt-3 text-2xl font-bold">{os.numero}</h1>
          <p className="text-[var(--color-fg-muted)]">
            {os.equipamentos.nome} · {os.clientes.nome}
          </p>

          {/* Barra de progresso */}
          <div className="mt-4 mb-3">
            <div className="h-2 w-full rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
              <div
                className="h-2 rounded-full bg-[var(--color-brand-600)] transition-all duration-700"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1">{progresso}% concluído</p>
          </div>

          {os.data_previsao && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm">
              <CalendarClock className="size-4 text-[var(--color-brand-600)]" />
              <span>Previsão: <strong>{formatDate(os.data_previsao)}</strong></span>
            </div>
          )}
        </div>

        {/* Alerta de aguardo aprovação */}
        {os.status === "aguardando_aprovacao" && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-bg)] p-5">
            <div className="flex gap-3 mb-4">
              <AlertCircle className="size-5 shrink-0 text-[var(--color-warning)] mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--color-warning)]">Orçamento aguardando sua aprovação</p>
                <p className="text-sm text-[var(--color-fg-muted)] mt-1">
                  Revise o valor abaixo e entre em contato para aprovar o serviço.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${whatsappNumero}?text=Oi%2C+quero+aprovar+o+or%C3%A7amento+da+${encodeURIComponent(os.numero)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25d366] py-3 text-sm font-bold text-white hover:bg-[#1fba57] transition-colors"
            >
              <PhoneCall className="size-4" />
              Aprovar orçamento pelo WhatsApp
            </a>
          </div>
        )}

        {/* Timeline de etapas */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="font-semibold mb-6">Acompanhamento do serviço</h2>
          <div className="relative space-y-6">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[var(--color-border)]" />
            {etapas.map((etapa, i) => {
              const ativo = i === etapaAtual;
              const feita = etapa.feita;
              return (
                <div key={etapa.key} className="relative flex gap-4 pl-10">
                  <div
                    className={`absolute left-0 flex size-9 items-center justify-center rounded-full border-2 transition-colors ${
                      feita
                        ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
                        : ativo
                        ? "border-[var(--color-brand-600)] bg-[var(--color-brand-50)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    <etapa.icon
                      className={`size-4 ${
                        feita
                          ? "text-[var(--color-success)]"
                          : ativo
                          ? "text-[var(--color-brand-600)]"
                          : "text-[var(--color-fg-subtle)]"
                      }`}
                    />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`font-semibold ${
                          feita
                            ? "text-[var(--color-success)]"
                            : ativo
                            ? "text-[var(--color-brand-700)]"
                            : "text-[var(--color-fg-muted)]"
                        }`}
                      >
                        {etapa.label}
                      </p>
                      {ativo && (
                        <span className="rounded-full bg-[var(--color-brand-50)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-brand-700)] uppercase tracking-wide animate-pulse">
                          Em andamento
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-fg-muted)]">{etapa.descricao}</p>
                    {etapa.data && (
                      <p className="mt-0.5 text-xs text-[var(--color-fg-subtle)]">{formatDate(etapa.data)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informações do serviço */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Informações do serviço</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-[var(--color-fg-muted)]">Problema relatado</span>
              <span className="text-right font-medium max-w-[60%]">{os.problema}</span>
            </div>
            {os.diagnostico && (
              <div className="flex justify-between gap-2 border-t border-[var(--color-border)] pt-3">
                <span className="text-[var(--color-fg-muted)]">Diagnóstico</span>
                <span className="text-right max-w-[60%]">{os.diagnostico}</span>
              </div>
            )}
            <div className="flex justify-between gap-2 border-t border-[var(--color-border)] pt-3">
              <span className="text-[var(--color-fg-muted)]">Equipamento</span>
              <span className="font-medium">{os.equipamentos.nome}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[var(--color-fg-muted)]">Abertura</span>
              <span>{formatDate(os.data_abertura)}</span>
            </div>
            {os.garantia_dias && (
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-fg-muted)]">Garantia do serviço</span>
                <span className="text-[var(--color-success)] font-medium">{os.garantia_dias} dias</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumo financeiro */}
        {os.valor_total > 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h2 className="font-semibold mb-4">Orçamento</h2>
            <div className="space-y-2 text-sm">
              {os.os_itens.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-[var(--color-fg-muted)]">
                    {item.descricao}
                    {item.quantidade > 1 && ` ×${item.quantidade}`}
                  </span>
                  <span>{formatCurrency(item.valor_total)}</span>
                </div>
              ))}
              <div className="flex justify-between gap-2 border-t border-[var(--color-border)] pt-2 font-bold text-base">
                <span>Total</span>
                <span className="text-[var(--color-success)]">{formatCurrency(os.valor_total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Contato WhatsApp */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Precisa falar conosco?</h2>
          <a
            href={`https://wa.me/${whatsappNumero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25d366] py-3 text-sm font-semibold text-white hover:bg-[#1fba57] transition-colors"
          >
            <PhoneCall className="size-4" />
            Falar no WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-[var(--color-fg-subtle)]">
            Atendimento de segunda a sexta, das 8h às 18h
          </p>
        </div>

        {/* Avaliação (só se entregue) */}
        {os.status === "entregue" && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm text-center">
            <Star className="mx-auto mb-2 size-8 text-[var(--color-warning)]" />
            <h2 className="font-semibold">Como foi seu atendimento?</h2>
            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">Sua avaliação nos ajuda a melhorar cada vez mais.</p>
            <RatingWidget />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-fg-subtle)]">
        Desenvolvido por{" "}
        <span className="font-semibold text-[var(--color-brand-600)]">GRP Tecnologia</span>
        {" "}· Powered by DeskControl
      </footer>
    </div>
  );
}
