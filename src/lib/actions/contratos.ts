'use server'

import { revalidatePath } from 'next/cache'
import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function listarContratosAction(filtros?: { status?: string }) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  let query = supabase
    .from('contratos')
    .select(`
      id, numero, status, tipo, valor_mensal, data_inicio, data_fim, descricao,
      clientes(id, nome, telefone)
    `)
    .eq('empresa_id', user.empresaId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filtros?.status) query = query.eq('status', filtros.status)

  const { data, error } = await query.limit(200)
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

export async function buscarContratoAction(id: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('contratos')
    .select('*, clientes(id, nome, telefone, email, cpf_cnpj)')
    .eq('id', id)
    .eq('empresa_id', user.empresaId)
    .single()

  if (error) return { error: 'Contrato não encontrado.', data: null }
  return { data }
}

export async function criarContratoAction(formData: FormData) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('contratos')
    .insert({
      empresa_id: user.empresaId,
      numero: `CTR-${Date.now()}`,
      cliente_id: formData.get('cliente_id') as string,
      tipo: formData.get('tipo') as string,
      descricao: formData.get('descricao') as string,
      valor_mensal: parseFloat(formData.get('valor_mensal') as string) || 0,
      data_inicio: formData.get('data_inicio') as string,
      data_fim: formData.get('data_fim') as string || null,
      status: 'ativo',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Erro ao criar contrato.' }
  revalidatePath('/contratos')
  return { data, success: true }
}

export async function atualizarStatusContratoAction(id: string, status: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error } = await supabase
    .from('contratos')
    .update({ status })
    .eq('id', id)
    .eq('empresa_id', user.empresaId)

  if (error) return { error: 'Erro ao atualizar status.' }
  revalidatePath('/contratos')
  revalidatePath(`/contratos/${id}`)
  return { success: true }
}
