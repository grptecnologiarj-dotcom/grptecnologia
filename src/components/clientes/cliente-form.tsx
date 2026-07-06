'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { criarClienteAction } from '@/lib/actions/clientes'

type State = { error?: string } | undefined

export function ClienteForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_prev, formData) => criarClienteAction(formData),
    undefined
  )

  async function buscarCEP(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) return
      const form = document.querySelector('form') as HTMLFormElement
      if (!form) return
      const set = (name: string, value: string) => {
        const el = form.elements.namedItem(name) as HTMLInputElement | null
        if (el) { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })) }
      }
      set('endereco', data.logradouro ?? '')
      set('bairro', data.bairro ?? '')
      set('cidade', data.localidade ?? '')
      set('estado', data.uf ?? '')
    } catch {}
  }

  return (
    <form action={action} className="space-y-6">
      {/* Identificação */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold">Identificação</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de pessoa" htmlFor="tipo" required className="sm:col-span-2">
            <div className="flex gap-3">
              {[{ value: 'fisica', label: 'Pessoa Física' }, { value: 'juridica', label: 'Pessoa Jurídica' }].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value={opt.value}
                    defaultChecked={opt.value === 'fisica'}
                    className="accent-[var(--color-brand-600)]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Nome completo / Razão social" htmlFor="nome" required className="sm:col-span-2">
            <Input id="nome" name="nome" placeholder="Ex.: João Silva" required />
          </FormField>

          <FormField label="CPF / CNPJ" htmlFor="cpf_cnpj">
            <Input id="cpf_cnpj" name="cpf_cnpj" placeholder="000.000.000-00" />
          </FormField>
        </div>
      </div>

      {/* Contato */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold">Contato</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Telefone" htmlFor="telefone">
            <Input id="telefone" name="telefone" placeholder="(11) 98765-4321" type="tel" />
          </FormField>
          <FormField label="WhatsApp" htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" placeholder="(11) 98765-4321" type="tel" />
          </FormField>
          <FormField label="E-mail" htmlFor="email" className="sm:col-span-2">
            <Input id="email" name="email" placeholder="cliente@email.com" type="email" />
          </FormField>
        </div>
      </div>

      {/* Endereço */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold">Endereço <span className="text-xs font-normal text-[var(--color-fg-muted)]">(opcional)</span></h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FormField label="CEP" htmlFor="cep">
            <Input
              id="cep"
              name="cep"
              placeholder="00000-000"
              maxLength={9}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '')
                e.target.value = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v
                if (v.length === 8) buscarCEP(v)
              }}
            />
          </FormField>

          <FormField label="Endereço" htmlFor="endereco" className="sm:col-span-2">
            <Input id="endereco" name="endereco" placeholder="Rua, Avenida..." />
          </FormField>

          <FormField label="Número" htmlFor="numero">
            <Input id="numero" name="numero" placeholder="123" />
          </FormField>

          <FormField label="Complemento" htmlFor="complemento">
            <Input id="complemento" name="complemento" placeholder="Apto, Sala..." />
          </FormField>

          <FormField label="Bairro" htmlFor="bairro">
            <Input id="bairro" name="bairro" />
          </FormField>

          <FormField label="Cidade" htmlFor="cidade" className="sm:col-span-2">
            <Input id="cidade" name="cidade" />
          </FormField>

          <FormField label="Estado" htmlFor="estado">
            <Input id="estado" name="estado" maxLength={2} placeholder="SP" className="uppercase" />
          </FormField>
        </div>
      </div>

      {/* Observações */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold">Observações <span className="text-xs font-normal text-[var(--color-fg-muted)]">(opcional)</span></h2>
        <div className="mt-4 space-y-4">
          <FormField label="Observações (visível ao cliente)">
            <Textarea name="observacoes" rows={2} placeholder="Informações gerais sobre o cliente..." />
          </FormField>
          <FormField label="Obs. internas (não visível ao cliente)">
            <Textarea name="obs_internas" rows={2} placeholder="Notas internas da equipe..." />
          </FormField>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">Cancelar</Button>
        <Button type="submit" loading={pending}>Salvar cliente</Button>
      </div>
    </form>
  )
}
