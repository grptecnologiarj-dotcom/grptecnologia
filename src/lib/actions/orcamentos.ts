'use server'

import { revalidatePath } from 'next/cache'
import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function listarOrcamentosAction(filtros?: { status?: string }) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  let query = supabase
    .from('orcamentos')
    .select(`
      id, numero, status, valor_total, validade,
      descricao, created_at,
      clientes(id, nome),
      equipamentos(id, nome, modelo)
    `)
    .eq('empresa_id', user.empresaId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filtros?.status) query = query.eq('status', filtros.status)

  const { data, error } = await query.limit(200)
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

export async function buscarOrcamentoAction(id: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('orcamentos')
    .select(`
      *,
      clientes(id, nome, telefone, email),
      equipamentos(id, nome, marca, modelo),
      ordens_servico(id, numero)
    `)
    .eq('id', id)
    .eq('empresa_id', user.empresaId)
    .single()

  if (error) return { error: 'Orçamento não encontrado.', data: null }
  return { data }
}

export async function criarOrcamentoAction(formData: FormData) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data: numero } = await supabase.rpc('gerar_numero_os', { p_empresa_id: user.empresaId })

  const { data, error } = await supabase
    .from('orcamentos')
    .insert({
      empresa_id: user.empresaId,
      numero: `ORC-${(numero as string)?.split('-')[1] ?? Date.now()}`,
      cliente_id: formData.get('cliente_id') as string,
      equipamento_id: formData.get('equipamento_id') as string || null,
      os_id: formData.get('os_id') as string || null,
      descricao: formData.get('descricao') as string,
      valor_total: parseFloat(formData.get('valor_total') as string) || 0,
      validade: formData.get('validade') as string || null,
      status: 'rascunho',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Erro ao criar orçamento.' }
  revalidatePath('/orcamentos')
  return { data, success: true }
}

export async function atualizarStatusOrcamentoAction(id: string, status: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error } = await supabase
    .from('orcamentos')
    .update({ status })
    .eq('id', id)
    .eq('empresa_id', user.empresaId)

  if (error) return { error: 'Erro ao atualizar status.' }
  revalidatePath('/orcamentos')
  revalidatePath(`/orcamentos/${id}`)
  return { success: true }
}

// ============================================================
// Ações públicas por token (portal /aprovar/[token]) — sem login
// ============================================================

export async function aprovarOrcamentoPorTokenAction(token: string) {
  if (!token || token === 'demo-token') return { success: true }

  const { createAdminClient } = await import('@/lib/supabase-admin')
  const supabase = createAdminClient()

  const { data: orc, error: findError } = await supabase
    .from('orcamentos')
    .select('id, status')
    .eq('token_aprovacao', token)
    .single()

  if (findError || !orc) return { error: 'Orçamento não encontrado.' }
  if (!['enviado', 'rascunho'].includes(orc.status)) {
    return { error: 'Este orçamento já foi respondido.' }
  }

  const { error } = await supabase
    .from('orcamentos')
    .update({ status: 'aprovado', aprovado_em: new Date().toISOString() })
    .eq('id', orc.id)

  if (error) return { error: 'Erro ao aprovar orçamento. Tente novamente.' }
  revalidatePath('/orcamentos')
  revalidatePath(`/orcamentos/${orc.id}`)
  return { success: true }
}

export async function recusarOrcamentoPorTokenAction(token: string, motivo?: string) {
  if (!token || token === 'demo-token') return { success: true }

  const { createAdminClient } = await import('@/lib/supabase-admin')
  const supabase = createAdminClient()

  const { data: orc, error: findError } = await supabase
    .from('orcamentos')
    .select('id, status, observacoes')
    .eq('token_aprovacao', token)
    .single()

  if (findError || !orc) return { error: 'Orçamento não encontrado.' }
  if (!['enviado', 'rascunho'].includes(orc.status)) {
    return { error: 'Este orçamento já foi respondido.' }
  }

  const observacoes = motivo?.trim()
    ? `${orc.observacoes ? `${orc.observacoes}\n` : ''}[Recusa do cliente] ${motivo.trim()}`
    : orc.observacoes

  const { error } = await supabase
    .from('orcamentos')
    .update({ status: 'recusado', recusado_em: new Date().toISOString(), observacoes })
    .eq('id', orc.id)

  if (error) return { error: 'Erro ao recusar orçamento. Tente novamente.' }
  revalidatePath('/orcamentos')
  revalidatePath(`/orcamentos/${orc.id}`)
  return { success: true }
}
