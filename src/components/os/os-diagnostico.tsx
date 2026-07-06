'use client'

import { useState, useTransition } from 'react'
import { Edit3, Check, X, Loader2 } from 'lucide-react'
import { atualizarDiagnosticoAction } from '@/lib/actions/os'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'

interface Props {
  osId: string
  diagnostico?: string | null
  solucao?: string | null
}

export function OSDiagnostico({ osId, diagnostico, solucao }: Props) {
  const [editando, setEditando] = useState(false)
  const [diagVal, setDiagVal] = useState(diagnostico ?? '')
  const [solucaoVal, setSolucaoVal] = useState(solucao ?? '')
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState('')

  function handleSalvar() {
    setErro('')
    startTransition(async () => {
      const result = await atualizarDiagnosticoAction(osId, diagVal, solucaoVal)
      if (result?.error) {
        setErro(result.error)
      } else {
        setEditando(false)
      }
    })
  }

  const temConteudo = diagnostico || solucao

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Diagnóstico e solução</h2>
        {!editando && (
          <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
            <Edit3 className="size-3.5" />
            {temConteudo ? 'Editar' : 'Preencher'}
          </Button>
        )}
      </div>

      {editando ? (
        <div className="mt-4 space-y-4">
          <FormField label="Diagnóstico técnico">
            <Textarea
              value={diagVal}
              onChange={e => setDiagVal(e.target.value)}
              placeholder="Descreva o diagnóstico técnico encontrado..."
              rows={3}
            />
          </FormField>
          <FormField label="Solução aplicada">
            <Textarea
              value={solucaoVal}
              onChange={e => setSolucaoVal(e.target.value)}
              placeholder="Descreva o que foi feito para resolver o problema..."
              rows={3}
            />
          </FormField>
          {erro && <p className="text-xs text-[var(--color-danger)]">{erro}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSalvar} loading={isPending}>
              <Check className="size-3.5" />
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditando(false); setDiagVal(diagnostico ?? ''); setSolucaoVal(solucao ?? '') }}>
              <X className="size-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {diagnostico ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-1.5">Diagnóstico</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{diagnostico}</p>
            </div>
          ) : null}
          {solucao ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-1.5">Solução aplicada</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{solucao}</p>
            </div>
          ) : null}
          {!temConteudo && (
            <p className="text-sm text-[var(--color-fg-muted)]">Diagnóstico ainda não preenchido.</p>
          )}
        </div>
      )}
    </div>
  )
}
