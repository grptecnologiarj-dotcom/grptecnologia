'use server'

import { revalidatePath } from 'next/cache'
import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function buscarEmpresaAction() {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', user.empresaId)
    .single()

  if (error) return { error: 'Empresa não encontrada.', data: null }
  return { data }
}

export async function atualizarEmpresaAction(formData: FormData) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const updates: Record<string, string | null> = {
    nome: formData.get('nome') as string,
    razao_social: formData.get('razao_social') as string || null,
    cnpj: formData.get('cnpj') as string || null,
    telefone: formData.get('telefone') as string || null,
    whatsapp: formData.get('whatsapp') as string || null,
    email: formData.get('email') as string || null,
    site: formData.get('site') as string || null,
    endereco: formData.get('endereco') as string || null,
    cidade: formData.get('cidade') as string || null,
    estado: formData.get('estado') as string || null,
    cep: formData.get('cep') as string || null,
  }

  const { error } = await supabase
    .from('empresas')
    .update(updates)
    .eq('id', user.empresaId)

  if (error) return { error: 'Erro ao salvar configurações.' }
  revalidatePath('/configuracoes')
  return { success: true }
}

export async function buscarPerfilAction() {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { error: 'Perfil não encontrado.', data: null }
  return { data }
}

export async function atualizarPerfilAction(formData: FormData) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error } = await supabase
    .from('usuarios')
    .update({
      nome: formData.get('nome') as string,
      telefone: formData.get('telefone') as string || null,
      bio: formData.get('bio') as string || null,
    })
    .eq('id', user.id)

  if (error) return { error: 'Erro ao salvar perfil.' }
  revalidatePath('/perfil')
  return { success: true }
}

export async function alterarSenhaAction(formData: FormData) {
  const senha = formData.get('senha') as string
  const confirma = formData.get('confirma') as string

  if (senha !== confirma) return { error: 'As senhas não coincidem.' }
  if (senha.length < 8) return { error: 'A senha deve ter pelo menos 8 caracteres.' }

  const supabase = await createServerClientInstance()
  const { error } = await supabase.auth.updateUser({ password: senha })

  if (error) return { error: 'Erro ao alterar senha.' }
  return { success: true }
}
