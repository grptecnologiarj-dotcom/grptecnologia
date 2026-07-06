import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react'
import { buscarClienteAction, buscarOSClienteAction, buscarEquipamentosClienteAction } from '@/lib/actions/clientes'
import { isSupabaseConfigured } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { OSStatusBadge } from '@/components/os/os-badges'
import { formatCurrency, formatDate } from '@/lib/utils'
import { demoClientes } from '@/lib/demo-data'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClienteDetalhePage({ params }: Props) {
  const { id } = await params

  let cliente: any = null
  let osHistorico: any[] = []
  let equipamentos: any[] = []

  if (isSupabaseConfigured()) {
    const { data, error } = await buscarClienteAction(id)
    if (error || !data) notFound()
    cliente = data
    osHistorico = await buscarOSClienteAction(id)
    equipamentos = await buscarEquipamentosClienteAction(id)
  } else {
    cliente = demoClientes.find(c => c.id === id) ?? {
      id,
      nome: 'Maria Aparecida Souza',
      tipo: 'fisica',
      cpf_cnpj: '123.456.789-00',
      email: 'maria.souza@email.com',
      telefone: '(11) 98765-4321',
      whatsapp: '(11) 98765-4321',
      cidade: 'São Paulo',
      estado: 'SP',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      observacoes: 'Cliente fiel, atendeu várias vezes.',
    }
    osHistorico = [
      { id: 'os-1', numero: 'OS-2026-0042', status: 'em_reparo', prioridade: 'alta', problema: 'Notebook não liga', valor_total: 225, data_abertura: new Date().toISOString(), equipamentos: { nome: 'Notebook Dell Inspiron 15' } },
      { id: 'os-5', numero: 'OS-2026-0038', status: 'entregue', prioridade: 'media', problema: 'Tela quebrada', valor_total: 650, data_abertura: new Date(Date.now() - 10 * 86400000).toISOString(), equipamentos: { nome: 'Notebook Lenovo ThinkPad' } },
    ]
  }

  const totalGasto = osHistorico
    .filter((o: any) => o.status === 'entregue')
    .reduce((acc: number, o: any) => acc + (o.valor_total ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/clientes"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{cliente.nome}</h1>
            <p className="text-sm text-[var(--color-fg-muted)]">
              {cliente.tipo === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              {cliente.cpf_cnpj && ` · ${cliente.cpf_cnpj}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clientes/${id}/editar`}>Editar cliente</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/os/nova?cliente_id=${id}`}>
              <Plus className="size-3.5" />
              Nova OS
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda */}
        <div className="space-y-5 lg:col-span-2">
          {/* Histórico de OS */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-semibold">Histórico de OS</h2>
              <span className="text-xs text-[var(--color-fg-muted)]">{osHistorico.length} OS</span>
            </div>
            {osHistorico.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <FileText className="size-8 text-[var(--color-fg-subtle)]" />
                <p className="text-sm text-[var(--color-fg-muted)]">Nenhuma OS registrada para este cliente.</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/os/nova?cliente_id=${id}`}>Criar primeira OS</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {osHistorico.map((os: any) => (
                  <Link
                    key={os.id}
                    href={`/os/${os.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[var(--color-brand-600)]">{os.numero}</span>
                        <OSStatusBadge status={os.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--color-fg-muted)] truncate">
                        {os.equipamentos?.nome && `${os.equipamentos.nome} · `}{os.problema}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{os.valor_total ? formatCurrency(os.valor_total) : '—'}</p>
                      <p className="text-xs text-[var(--color-fg-subtle)]">{formatDate(os.data_abertura)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Equipamentos */}
          {equipamentos.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="border-b border-[var(--color-border)] px-5 py-4">
                <h2 className="font-semibold">Equipamentos</h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {equipamentos.map((eq: any) => (
                  <div key={eq.id} className="flex items-center gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">{eq.nome}</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">
                        {[eq.marca, eq.modelo].filter(Boolean).join(' · ')}
                        {eq.numero_serie && ` · S/N: ${eq.numero_serie}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">
          {/* Estatísticas */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Resumo</h3>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--color-fg-muted)]">Total de OS</span>
                <span className="text-sm font-semibold">{osHistorico.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--color-fg-muted)]">Total gasto</span>
                <span className="text-sm font-semibold text-[var(--color-success)]">{formatCurrency(totalGasto)}</span>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Contato</h3>
            <div className="mt-3 space-y-2.5">
              {cliente.telefone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-3.5 shrink-0 text-[var(--color-fg-subtle)]" />
                  <span>{cliente.telefone}</span>
                </div>
              )}
              {cliente.whatsapp && cliente.whatsapp !== cliente.telefone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="size-3.5 shrink-0 text-xs">💬</span>
                  <span>{cliente.whatsapp}</span>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-3.5 shrink-0 text-[var(--color-fg-subtle)]" />
                  <span className="break-all">{cliente.email}</span>
                </div>
              )}
              {(cliente.cidade || cliente.endereco) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="size-3.5 shrink-0 mt-0.5 text-[var(--color-fg-subtle)]" />
                  <span>{[cliente.endereco, cliente.numero, cliente.bairro, cliente.cidade, cliente.estado].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {cliente.observacoes && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Observações</h3>
              <p className="mt-2 text-sm leading-relaxed">{cliente.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
