import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, ExternalLink, Edit } from 'lucide-react'
import { buscarOSAction } from '@/lib/actions/os'
import { getCurrentUser, isSupabaseConfigured } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { OSStatusBadge, OSPrioridadeBadge } from '@/components/os/os-badges'
import { OSTimeline } from '@/components/os/os-timeline'
import { OSItens } from '@/components/os/os-itens'
import { OSStatusActions } from '@/components/os/os-status-actions'
import { OSDiagnostico } from '@/components/os/os-diagnostico'
import { demoOSDetalhe } from '@/lib/demo-data'
import { formatCurrency, formatDatetime } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OSDetalhePage({ params }: Props) {
  const { id } = await params

  let os: any = null

  if (isSupabaseConfigured()) {
    const { data, error } = await buscarOSAction(id)
    if (error || !data) notFound()
    os = data
  } else {
    os = demoOSDetalhe
  }

  const tecnico = os.usuarios ?? os.tecnico
  const cliente = os.clientes ?? os.cliente
  const equipamento = os.equipamentos ?? os.equipamento
  const itens = os.os_itens ?? os.itens ?? []
  const eventos = os.os_eventos ?? os.eventos ?? []
  const fotos = os.os_fotos ?? os.fotos ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/os"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{os.numero}</h1>
              <OSStatusBadge status={os.status} />
              <OSPrioridadeBadge prioridade={os.prioridade} />
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-fg-muted)]">
              Aberta em {formatDatetime(os.data_abertura)}
              {os.data_previsao && (
                <> · Previsão: <span className={
                  new Date(os.data_previsao) < new Date() && !['entregue', 'cancelada'].includes(os.status)
                    ? 'text-[var(--color-danger)] font-semibold'
                    : ''
                }>{formatDatetime(os.data_previsao)}</span></>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/os/${os.id}/imprimir`} target="_blank">
              <Printer className="size-4" />
              Imprimir
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/os/${os.id}/editar`}>
              <Edit className="size-4" />
              Editar
            </Link>
          </Button>
          {os.portal_token && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/acompanhar/${os.portal_token}`} target="_blank">
                <ExternalLink className="size-4" />
                Portal do cliente
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Problema relatado */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide">Problema relatado</h2>
            <p className="mt-2 text-sm leading-relaxed">{os.problema}</p>
            {os.acessorios && os.acessorios.length > 0 && (
              <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                <span className="text-xs font-medium text-[var(--color-fg-muted)]">Acessórios entregues: </span>
                <span className="text-xs">{Array.isArray(os.acessorios) ? os.acessorios.join(', ') : os.acessorios}</span>
              </div>
            )}
            {os.condicao_visual && (
              <div className="mt-1">
                <span className="text-xs font-medium text-[var(--color-fg-muted)]">Condição visual: </span>
                <span className="text-xs capitalize">{os.condicao_visual}</span>
              </div>
            )}
            {os.observacoes && (
              <div className="mt-1">
                <span className="text-xs font-medium text-[var(--color-fg-muted)]">Observações: </span>
                <span className="text-xs">{os.observacoes}</span>
              </div>
            )}
          </div>

          {/* Diagnóstico */}
          <OSDiagnostico
            osId={os.id}
            diagnostico={os.diagnostico}
            solucao={os.solucao}
          />

          {/* Itens (peças e serviços) */}
          <OSItens
            osId={os.id}
            itens={itens}
            valorTotal={os.valor_total ?? 0}
            valorMaoObra={os.valor_mao_obra ?? 0}
            valorPecas={os.valor_pecas ?? 0}
            valorDesconto={os.valor_desconto ?? 0}
          />

          {/* Fotos */}
          {fotos.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold">Fotos</h2>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {fotos.map((foto: any) => (
                  <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]">
                    <img
                      src={foto.url_publica}
                      alt={foto.legenda ?? 'Foto da OS'}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                    {foto.fase && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white capitalize">
                        {foto.fase}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <OSTimeline eventos={eventos} osId={os.id} empresaId={os.empresa_id} />
        </div>

        {/* Coluna direita (1/3) */}
        <div className="space-y-4">
          {/* Ações de status */}
          <OSStatusActions osId={os.id} statusAtual={os.status} />

          {/* Cliente */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Cliente</h3>
            <div className="mt-3 space-y-1.5">
              <Link
                href={`/clientes/${cliente?.id}`}
                className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline"
              >
                {cliente?.nome}
              </Link>
              {cliente?.telefone && (
                <p className="text-xs text-[var(--color-fg-muted)]">📞 {cliente.telefone}</p>
              )}
              {cliente?.whatsapp && (
                <p className="text-xs text-[var(--color-fg-muted)]">💬 {cliente.whatsapp}</p>
              )}
              {cliente?.email && (
                <p className="text-xs text-[var(--color-fg-muted)]">✉ {cliente.email}</p>
              )}
              {cliente?.cidade && (
                <p className="text-xs text-[var(--color-fg-muted)]">📍 {cliente.cidade}{cliente.estado && `, ${cliente.estado}`}</p>
              )}
            </div>
          </div>

          {/* Equipamento */}
          {equipamento && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Equipamento</h3>
              <div className="mt-3 space-y-1.5">
                <p className="text-sm font-semibold">{equipamento.nome}</p>
                {equipamento.marca && <p className="text-xs text-[var(--color-fg-muted)]">Marca: {equipamento.marca}</p>}
                {equipamento.modelo && <p className="text-xs text-[var(--color-fg-muted)]">Modelo: {equipamento.modelo}</p>}
                {equipamento.numero_serie && (
                  <p className="text-xs text-[var(--color-fg-muted)]">Série: <span className="font-mono">{equipamento.numero_serie}</span></p>
                )}
                {equipamento.imei && (
                  <p className="text-xs text-[var(--color-fg-muted)]">IMEI: <span className="font-mono">{equipamento.imei}</span></p>
                )}
                {equipamento.cor && <p className="text-xs text-[var(--color-fg-muted)]">Cor: {equipamento.cor}</p>}
              </div>
            </div>
          )}

          {/* Técnico */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Técnico responsável</h3>
            <div className="mt-3">
              {tecnico ? (
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-xs font-bold uppercase">
                    {tecnico.nome?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tecnico.nome}</p>
                    {tecnico.email && <p className="text-xs text-[var(--color-fg-muted)]">{tecnico.email}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-fg-muted)]">Não atribuído</p>
              )}
            </div>
          </div>

          {/* Resumo financeiro */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Resumo financeiro</h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Mão de obra</span>
                <span>{formatCurrency(os.valor_mao_obra ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Peças</span>
                <span>{formatCurrency(os.valor_pecas ?? 0)}</span>
              </div>
              {(os.valor_desconto ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-fg-muted)]">Desconto</span>
                  <span className="text-[var(--color-danger)]">- {formatCurrency(os.valor_desconto)}</span>
                </div>
              )}
              <div className="border-t border-[var(--color-border)] pt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-[var(--color-success)]">
                  {formatCurrency(os.valor_total ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Obs internas */}
          {os.obs_internas && (
            <div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Obs. internas</h3>
              <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-300">{os.obs_internas}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
