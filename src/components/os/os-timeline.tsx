'use client'

import { useState, useTransition } from 'react'
import { MessageSquare, Send, Loader2, Clock, CheckCircle2, Camera, FileText, User, AlertCircle, Wrench, Package } from 'lucide-react'
import { adicionarComentarioOSAction } from '@/lib/actions/os'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDatetime } from '@/lib/utils'

const tipoConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; cor: string; label: string }> = {
  criacao:              { icon: CheckCircle2, cor: 'bg-green-500',  label: 'OS criada' },
  status_alterado:      { icon: Clock,        cor: 'bg-blue-500',   label: 'Status alterado' },
  diagnostico_atualizado: { icon: Wrench,     cor: 'bg-purple-500', label: 'Diagnóstico' },
  orcamento_criado:     { icon: FileText,     cor: 'bg-orange-500', label: 'Orçamento' },
  orcamento_aprovado:   { icon: CheckCircle2, cor: 'bg-emerald-500',label: 'Orçamento aprovado' },
  foto_adicionada:      { icon: Camera,       cor: 'bg-cyan-500',   label: 'Foto adicionada' },
  mensagem_whatsapp:    { icon: MessageSquare,cor: 'bg-green-600',  label: 'WhatsApp' },
  comentario:           { icon: MessageSquare,cor: 'bg-slate-500',  label: 'Comentário' },
  peca_adicionada:      { icon: Package,      cor: 'bg-amber-500',  label: 'Peça adicionada' },
  tecnico_atribuido:    { icon: User,         cor: 'bg-indigo-500', label: 'Técnico' },
  default:              { icon: AlertCircle,  cor: 'bg-gray-400',   label: 'Evento' },
}

interface Evento {
  id: string
  tipo: string
  descricao: string
  metadata?: Record<string, string>
  created_at: string
  usuarios?: { nome: string; avatar_url?: string } | null
}

interface Props {
  eventos: Evento[]
  osId: string
  empresaId: string
}

export function OSTimeline({ eventos, osId, empresaId }: Props) {
  const [comentario, setComentario] = useState('')
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState('')

  function handleEnviar() {
    if (!comentario.trim()) return
    setErro('')
    startTransition(async () => {
      const result = await adicionarComentarioOSAction(osId, comentario)
      if (result?.error) {
        setErro(result.error)
      } else {
        setComentario('')
      }
    })
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h2 className="font-semibold">Timeline</h2>
        <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">Histórico completo e imutável da OS</p>
      </div>

      <div className="p-5">
        {/* Campo de comentário */}
        <div className="mb-6">
          <Textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            placeholder="Adicionar comentário ou anotação..."
            rows={2}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleEnviar()
            }}
          />
          {erro && <p className="mt-1 text-xs text-[var(--color-danger)]">{erro}</p>}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-[var(--color-fg-subtle)]">Ctrl+Enter para enviar</p>
            <Button size="sm" onClick={handleEnviar} disabled={!comentario.trim() || isPending}>
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              Comentar
            </Button>
          </div>
        </div>

        {/* Eventos */}
        {eventos.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-fg-muted)] py-4">Nenhum evento registrado.</p>
        ) : (
          <div className="relative space-y-0">
            {/* Linha vertical */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--color-border)]" />

            {[...eventos].reverse().map((evento, idx) => {
              const cfg = tipoConfig[evento.tipo] ?? tipoConfig.default
              const Icon = cfg.icon
              const isComentario = evento.tipo === 'comentario'

              return (
                <div key={evento.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Ícone */}
                  <div className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${cfg.cor} shadow-sm`}>
                    <Icon className="size-3.5 text-white" />
                  </div>

                  {/* Conteúdo */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {isComentario ? (
                          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
                            <p className="text-xs font-semibold text-[var(--color-fg-muted)] mb-1">
                              {evento.usuarios?.nome ?? 'Sistema'}
                            </p>
                            <p className="text-sm leading-relaxed">{evento.descricao}</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium">{evento.descricao}</p>
                            {evento.usuarios?.nome && (
                              <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">por {evento.usuarios.nome}</p>
                            )}
                          </>
                        )}
                      </div>
                      <time className="shrink-0 text-xs text-[var(--color-fg-subtle)] mt-0.5 whitespace-nowrap">
                        {formatDatetime(evento.created_at)}
                      </time>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
