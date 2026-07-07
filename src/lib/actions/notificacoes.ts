'use server'

import { revalidatePath } from 'next/cache'
import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export interface Notificacao {
  id: string
  empresa_id: string
  usuario_id: string | null
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  referencia_id: string | null
  referencia_tipo: string | null
  created_at: string
}

export async function listarNotificacoesAction(): Promise<{ data: Notificacao[]; error?: string }> {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('empresa_id', user.empresaId)
    .or(`usuario_id.is.null,usuario_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { error: error.message, data: [] }
  return { data: (data ?? []) as Notificacao[] }
}

export async function marcarLidaAction(id: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', id)
    .eq('empresa_id', user.empresaId)

  if (error) return { error: 'Erro ao marcar notificação como lida.' }
  revalidatePath('/notificacoes')
  return { success: true }
}

export async function marcarTodasLidasAction() {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('empresa_id', user.empresaId)
    .eq('lida', false)
    .or(`usuario_id.is.null,usuario_id.eq.${user.id}`)

  if (error) return { error: 'Erro ao marcar notificações como lidas.' }
  revalidatePath('/notificacoes')
  return { success: true }
}
