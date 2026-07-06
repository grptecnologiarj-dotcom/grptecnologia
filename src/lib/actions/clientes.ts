'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tipo: z.enum(['fisica', 'juridica']).default('fisica'),
  cpf_cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  observacoes: z.string().optional(),
  obs_internas: z.string().optional(),
})

export async function criarClienteAction(formData: FormData) {
  const user = await getCurrentUser()

  const raw = Object.fromEntries(
    ['nome', 'tipo', 'cpf_cnpj', 'email', 'telefone', 'whatsapp', 'cep',
      'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
      'observacoes', 'obs_internas']
      .map(k => [k, formData.get(k) as string])
  )

  const parsed = clienteSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const supabase = await createServerClientInstance()
  const { data, error } = await supabase
    .from('clientes')
    .insert({ ...parsed.data, empresa_id: user.empresaId, created_by: user.id })
    .select('id')
    .single()

  if (error || !data) {
    if (error?.code === '23505') return { error: 'CPF/CNPJ já cadastrado.' }
    return { error: 'Erro ao criar cliente.' }
  }

  revalidatePath('/clientes')
  redirect(`/clientes/${data.id}`)
}

export async function atualizarClienteAction(clienteId: string, formData: FormData) {
  const user = await getCurrentUser()

  const raw = Object.fromEntries(
    ['nome', 'tipo', 'cpf_cnpj', 'email', 'telefone', 'whatsapp', 'cep',
      'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
      'observacoes', 'obs_internas']
      .map(k => [k, formData.get(k) as string])
  )

  const parsed = clienteSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const supabase = await createServerClientInstance()
  const { error } = await supabase
    .from('clientes')
    .update(parsed.data)
    .eq('id', clienteId)
    .eq('empresa_id', user.empresaId)

  if (error) return { error: 'Erro ao atualizar cliente.' }

  revalidatePath(`/clientes/${clienteId}`)
  revalidatePath('/clientes')
  return { success: true }
}

export async function listarClientesAction(busca?: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  let query = supabase
    .from('clientes')
    .select('id, nome, tipo, cpf_cnpj, email, telefone, whatsapp, cidade, estado, created_at')
    .eq('empresa_id', user.empresaId)
    .is('deleted_at', null)
    .order('nome')
    .limit(500)

  if (busca && busca.trim()) {
    query = query.textSearch('fts', busca.trim(), { type: 'websearch' })
  }

  const { data, error } = await query
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

export async function buscarClienteAction(clienteId: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .eq('empresa_id', user.empresaId)
    .is('deleted_at', null)
    .single()

  if (error) return { error: 'Cliente não encontrado.', data: null }
  return { data }
}

export async function buscarEquipamentosClienteAction(clienteId: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data } = await supabase
    .from('equipamentos')
    .select('id, nome, marca, modelo, numero_serie')
    .eq('empresa_id', user.empresaId)
    .eq('cliente_id', clienteId)
    .is('deleted_at', null)
    .order('nome')

  return data ?? []
}

export async function buscarOSClienteAction(clienteId: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data } = await supabase
    .from('ordens_servico')
    .select('id, numero, status, prioridade, problema, valor_total, data_abertura, equipamentos(nome)')
    .eq('empresa_id', user.empresaId)
    .eq('cliente_id', clienteId)
    .is('deleted_at', null)
    .order('data_abertura', { ascending: false })
    .limit(20)

  return data ?? []
}
