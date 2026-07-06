'use server'

import { revalidatePath } from 'next/cache'
import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function listarGarantiasAction(filtros?: { status?: string }) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  let query = supabase
    .from('garantias')
    .select(`
      id, status, data_inicio, data_expiracao, tipo, descricao,
      clientes(id, nome, telefone),
      equipamentos(id, nome, modelo),
      ordens_servico(id, numero)
    `)
    .eq('empresa_id', user.empresaId)
    .is('deleted_at', null)
    .order('data_expiracao', { ascending: true })

  if (filtros?.status) query = query.eq('status', filtros.status)

  const { data, error } = await query.limit(200)
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

export async function buscarGarantiaAction(id: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('garantias')
    .select(`
      *,
      clientes(id, nome, telefone, email),
      equipamentos(id, nome, marca, modelo, numero_serie),
      ordens_servico(id, numero, problema)
    `)
    .eq('id', id)
    .eq('empresa_id', user.empresaId)
    .single()

  if (error) return { error: 'Garantia não encontrada.', data: null }
  return { data }
}

export async function atualizarStatusGarantiaAction(id: string, status: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error } = await supabase
    .from('garantias')
    .update({ status })
    .eq('id', id)
    .eq('empresa_id', user.empresaId)

  if (error) return { error: 'Erro ao atualizar status.' }
  revalidatePath('/garantias')
  revalidatePath(`/garantias/${id}`)
  return { success: true }
}
