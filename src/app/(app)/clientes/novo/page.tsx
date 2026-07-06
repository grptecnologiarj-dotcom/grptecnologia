import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ClienteForm } from '@/components/clientes/cliente-form'

export const metadata = { title: 'Novo cliente' }

export default function NovoClientePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
      >
        <ArrowLeft className="size-4" />
        Voltar para clientes
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Novo cliente</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">Preencha os dados do cliente.</p>
      </div>

      <ClienteForm />
    </div>
  )
}
