'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { atualizarStatusOSAction } from '@/lib/actions/os'
import { Button } from '@/components/ui/button'
import { OSStatusBadge } from './os-badges'
import { useToast } from '@/components/ui/toast'

const fluxo: Record<string, { label: string; status: string }[]> = {
  aberta:               [{ label: 'Iniciar diagnóstico', status: 'em_diagnostico' }, { label: 'Cancelar OS', status: 'cancelada' }],
  em_diagnostico:       [{ label: 'Enviar orçamento', status: 'aguardando_aprovacao' }, { label: 'Iniciar reparo direto', status: 'em_reparo' }],
  aguardando_aprovacao: [{ label: 'Marcar como aprovado', status: 'aprovada' }, { label: 'Cancelar OS', status: 'cancelada' }],
  aprovada:             [{ label: 'Iniciar reparo', status: 'em_reparo' }],
  em_reparo:            [{ label: 'Aguardando peças', status: 'aguardando_pecas' }, { label: 'Marcar como pronto', status: 'pronto' }],
  aguardando_pecas:     [{ label: 'Retomar reparo', status: 'em_reparo' }],
  aguardando_cliente:   [{ label: 'Marcar como pronto', status: 'pronto' }],
  em_transito:          [{ label: 'Marcar como entregue', status: 'entregue' }],
  pronto:               [{ label: 'Registrar entrega', status: 'entregue' }, { label: 'Aguardando cliente', status: 'aguardando_cliente' }],
  entregue:             [{ label: 'Acionamento de garantia', status: 'em_garantia' }],
  em_garantia:          [{ label: 'Retornar para reparo', status: 'em_reparo' }],
  cancelada:            [],
}

interface Props {
  osId: string
  statusAtual: string
}

export function OSStatusActions({ osId, statusAtual }: Props) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState('')
  const acoes = fluxo[statusAtual] ?? []
  const { success, error: toastError } = useToast()

  function mudarStatus(novoStatus: string, label: string) {
    setErro('')
    startTransition(async () => {
      const result = await atualizarStatusOSAction(osId, novoStatus)
      if (result?.error) {
        setErro(result.error)
        toastError('Erro ao atualizar', result.error)
      } else {
        success('Status atualizado!', label)
      }
    })
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Status atual</h3>
      <div className="mt-3 mb-4">
        <OSStatusBadge status={statusAtual} />
      </div>

      {erro && (
        <p className="mb-3 text-xs text-[var(--color-danger)]">{erro}</p>
      )}

      {acoes.length > 0 ? (
        <div className="space-y-2">
          {acoes.map((acao, i) => (
            <Button
              key={acao.status}
              variant={i === 0 ? 'primary' : 'outline'}
              size="sm"
              className="w-full justify-center"
              onClick={() => mudarStatus(acao.status, acao.label)}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {acao.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-fg-muted)]">Nenhuma ação disponível para este status.</p>
      )}
    </div>
  )
}
