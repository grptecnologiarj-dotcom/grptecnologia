'use server'

import { revalidatePath } from 'next/cache'
import { createServerClientInstance } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth'

const ROLES_VALIDOS = ['admin', 'tecnico', 'atendente', 'financeiro', 'visualizador']

export async function listarUsuariosAction() {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('empresa_id', user.empresaId)
    .order('nome', { ascending: true })

  if (error) return { error: 'Erro ao listar usuários.', data: null }
  return { data }
}

export async function buscarUsuarioAction(id: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .eq('empresa_id', user.empresaId)
    .single()

  if (error || !data) return { error: 'Usuário não encontrado.', data: null }
  return { data }
}

export async function criarUsuarioAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (user.role !== 'admin') return { error: 'Sem permissão.' }

    const nome = (formData.get('nome') as string)?.trim()
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const telefone = ((formData.get('telefone') as string) || '').trim() || null
    const role = formData.get('role') as string
    const senha = formData.get('senha') as string

    if (!nome || nome.length < 2) return { error: 'Informe o nome completo.' }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { error: 'E-mail inválido.' }
    if (!ROLES_VALIDOS.includes(role)) return { error: 'Papel inválido.' }
    if (!senha || senha.length < 8)
      return { error: 'A senha deve ter pelo menos 8 caracteres.' }

    const admin = createAdminClient()

    // 1. Cria o usuário no Auth (já confirmado — o admin repassa a senha)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome },
    })

    if (authError || !authData.user) {
      if (authError?.message?.toLowerCase().includes('already')) {
        return { error: 'Já existe uma conta com este e-mail.' }
      }
      return { error: `Erro ao criar acesso: ${authError?.message ?? 'desconhecido'}` }
    }

    // 2. Cria o perfil vinculado à empresa do admin logado
    const { error: perfilError } = await admin.from('usuarios').insert({
      auth_user_id: authData.user.id,
      empresa_id: user.empresaId,
      nome,
      email,
      telefone,
      role,
      status: 'ativo',
    })

    if (perfilError) {
      // rollback do auth user
      await admin.auth.admin.deleteUser(authData.user.id)
      return { error: `Erro ao criar perfil: ${perfilError.message}` }
    }

    revalidatePath('/usuarios')
    return { success: true }
  } catch (err) {
    return { error: `Falha inesperada: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function atualizarUsuarioAction(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (user.role !== 'admin') return { error: 'Sem permissão.' }

    const nome = (formData.get('nome') as string)?.trim()
    const telefone = ((formData.get('telefone') as string) || '').trim() || null
    const role = formData.get('role') as string
    const status = formData.get('status') as string

    if (!nome || nome.length < 2) return { error: 'Informe o nome completo.' }
    if (!ROLES_VALIDOS.includes(role)) return { error: 'Papel inválido.' }
    if (!['ativo', 'inativo'].includes(status)) return { error: 'Status inválido.' }

    const supabase = await createServerClientInstance()
    const { data, error } = await supabase
      .from('usuarios')
      .update({ nome, telefone, role, status })
      .eq('id', id)
      .eq('empresa_id', user.empresaId)
      .select('id')

    if (error) return { error: `Erro ao salvar: ${error.message}` }
    if (!data || data.length === 0) return { error: 'Usuário não encontrado.' }

    revalidatePath('/usuarios')
    revalidatePath(`/usuarios/${id}`)
    return { success: true }
  } catch (err) {
    return { error: `Falha inesperada: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function desativarUsuarioAction(id: string) {
  try {
    const user = await getCurrentUser()
    if (user.role !== 'admin') return { error: 'Sem permissão.' }
    if (id === user.id) return { error: 'Você não pode desativar a si mesmo.' }

    const supabase = await createServerClientInstance()
    const { data, error } = await supabase
      .from('usuarios')
      .update({ status: 'inativo' })
      .eq('id', id)
      .eq('empresa_id', user.empresaId)
      .select('id')

    if (error) return { error: `Erro ao desativar: ${error.message}` }
    if (!data || data.length === 0) return { error: 'Usuário não encontrado.' }

    revalidatePath('/usuarios')
    revalidatePath(`/usuarios/${id}`)
    return { success: true }
  } catch (err) {
    return { error: `Falha inesperada: ${err instanceof Error ? err.message : String(err)}` }
  }
}
