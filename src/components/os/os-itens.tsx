'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, Wrench, Package } from 'lucide-react'
import { adicionarItemOSAction, removerItemOSAction } from '@/lib/actions/os'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { formatCurrency } from '@/lib/utils'

interface Item {
  id: string
  tipo: 'servico' | 'peca'
  descricao: string
  quantidade: number
  valor_unit: number
  valor_total: number
}

interface Props {
  osId: string
  itens: Item[]
  valorTotal: number
  valorMaoObra: number
  valorPecas: number
  valorDesconto: number
}

export function OSItens({ osId, itens, valorTotal, valorMaoObra, valorPecas, valorDesconto }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [tipo, setTipo] = useState<'servico' | 'peca'>('servico')
  const [descricao, setDescricao] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [valorUnit, setValorUnit] = useState('')
  const [isPending, startTransition] = useTransition()
  const [removendoId, setRemovendoId] = useState<string | null>(null)

  function handleAdicionar() {
    if (!descricao.trim() || !valorUnit) return
    startTransition(async () => {
      await adicionarItemOSAction(osId, {
        tipo,
        descricao: descricao.trim(),
        quantidade: parseFloat(quantidade) || 1,
        valor_unit: parseFloat(valorUnit.replace(',', '.')) || 0,
      })
      setDescricao('')
      setValorUnit('')
      setQuantidade('1')
      setMostrarForm(false)
    })
  }

  function handleRemover(itemId: string) {
    setRemovendoId(itemId)
    startTransition(async () => {
      await removerItemOSAction(osId, itemId)
      setRemovendoId(null)
    })
  }

  const servicos = itens.filter(i => i.tipo === 'servico')
  const pecas = itens.filter(i => i.tipo === 'peca')

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <h2 className="font-semibold">Orçamento</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMostrarForm(v => !v)}
        >
          <Plus className="size-3.5" />
          Adicionar item
        </Button>
      </div>

      <div className="p-5 space-y-5">
        {/* Form de novo item */}
        {mostrarForm && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('servico')}
                className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors ${
                  tipo === 'servico'
                    ? 'bg-[var(--color-brand-600)] text-white'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg-muted)]'
                }`}
              >
                <Wrench className="size-3" />
                Serviço
              </button>
              <button
                type="button"
                onClick={() => setTipo('peca')}
                className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors ${
                  tipo === 'peca'
                    ? 'bg-[var(--color-brand-600)] text-white'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg-muted)]'
                }`}
              >
                <Package className="size-3" />
                Peça
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              <FormField label="Descrição" className="sm:col-span-3">
                <Input
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder={tipo === 'servico' ? 'Ex: Troca de tela' : 'Ex: Tela AMOLED Samsung A52'}
                />
              </FormField>
              <FormField label="Qtd.">
                <Input
                  type="number"
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                  min="0.001"
                  step="0.001"
                />
              </FormField>
              <FormField label="Valor unit. (R$)">
                <Input
                  value={valorUnit}
                  onChange={e => setValorUnit(e.target.value)}
                  placeholder="0,00"
                />
              </FormField>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdicionar} loading={isPending} disabled={!descricao.trim() || !valorUnit}>
                Adicionar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Lista de serviços */}
        {servicos.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Serviços</p>
            <div className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
              {servicos.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Wrench className="size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                  <span className="flex-1 text-sm">{item.descricao}</span>
                  <span className="text-xs text-[var(--color-fg-muted)]">{item.quantidade}x</span>
                  <span className="text-xs text-[var(--color-fg-muted)]">{formatCurrency(item.valor_unit)}</span>
                  <span className="w-20 text-right text-sm font-semibold">{formatCurrency(item.valor_total)}</span>
                  <button
                    onClick={() => handleRemover(item.id)}
                    className="p-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    {removendoId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de peças */}
        {pecas.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Peças</p>
            <div className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
              {pecas.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Package className="size-4 shrink-0 text-[var(--color-fg-subtle)]" />
                  <span className="flex-1 text-sm">{item.descricao}</span>
                  <span className="text-xs text-[var(--color-fg-muted)]">{item.quantidade}x</span>
                  <span className="text-xs text-[var(--color-fg-muted)]">{formatCurrency(item.valor_unit)}</span>
                  <span className="w-20 text-right text-sm font-semibold">{formatCurrency(item.valor_total)}</span>
                  <button
                    onClick={() => handleRemover(item.id)}
                    className="p-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    {removendoId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {itens.length === 0 && !mostrarForm && (
          <p className="text-center text-sm text-[var(--color-fg-muted)] py-2">Nenhum item adicionado.</p>
        )}

        {/* Totais */}
        {itens.length > 0 && (
          <div className="border-t border-[var(--color-border)] pt-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-fg-muted)]">Mão de obra</span>
              <span>{formatCurrency(valorMaoObra)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-fg-muted)]">Peças</span>
              <span>{formatCurrency(valorPecas)}</span>
            </div>
            {valorDesconto > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Desconto</span>
                <span className="text-[var(--color-danger)]">- {formatCurrency(valorDesconto)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-[var(--color-border)] pt-2">
              <span>Total</span>
              <span className="text-[var(--color-success)] text-lg">{formatCurrency(valorTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
