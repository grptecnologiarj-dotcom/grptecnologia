import { cn } from '@/lib/utils'

export type OSStatus =
  | 'aberta' | 'em_diagnostico' | 'aguardando_aprovacao' | 'aprovada'
  | 'em_reparo' | 'aguardando_pecas' | 'aguardando_cliente' | 'em_transito'
  | 'pronto' | 'entregue' | 'em_garantia' | 'cancelada'

export type OSPrioridade = 'baixa' | 'media' | 'alta' | 'urgente'

const statusConfig: Record<OSStatus, { label: string; className: string }> = {
  aberta:                { label: 'Aberta',                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  em_diagnostico:        { label: 'Em diagnóstico',        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  aguardando_aprovacao:  { label: 'Aguard. aprovação',     className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  aprovada:              { label: 'Aprovada',              className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  em_reparo:             { label: 'Em reparo',             className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  aguardando_pecas:      { label: 'Aguard. peças',         className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  aguardando_cliente:    { label: 'Aguard. cliente',       className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  em_transito:           { label: 'Em trânsito',           className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  pronto:                { label: 'Pronto',                className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  entregue:              { label: 'Entregue',              className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  em_garantia:           { label: 'Em garantia',           className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  cancelada:             { label: 'Cancelada',             className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 line-through' },
}

const prioridadeConfig: Record<OSPrioridade, { label: string; className: string; dot: string }> = {
  baixa:   { label: 'Baixa',   className: 'text-slate-500',                       dot: 'bg-slate-400' },
  media:   { label: 'Média',   className: 'text-blue-600',                        dot: 'bg-blue-500' },
  alta:    { label: 'Alta',    className: 'text-orange-600 font-semibold',        dot: 'bg-orange-500' },
  urgente: { label: 'Urgente', className: 'text-red-600 font-semibold',           dot: 'bg-red-500 animate-pulse' },
}

export function OSStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as OSStatus] ?? statusConfig.aberta
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}

export function OSPrioridadeBadge({ prioridade }: { prioridade: string }) {
  const config = prioridadeConfig[prioridade as OSPrioridade] ?? prioridadeConfig.media
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs', config.className)}>
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

export { statusConfig, prioridadeConfig }
