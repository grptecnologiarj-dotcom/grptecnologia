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

export async function uploadLogoAction(formData: FormData) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const file = formData.get('logo') as File
  if (!file || file.size === 0) return { error: 'Nenhum arquivo selecionado.' }
  if (file.size > 2 * 1024 * 1024) return { error: 'Arquivo maior que 2MB.' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `${user.empresaId}/logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: `Erro no upload: ${uploadError.message}` }

  const { data: pub } = supabase.storage.from('logos').getPublicUrl(path)
  const logoUrl = pub.publicUrl

  const { error: dbError } = await supabase
    .from('empresas')
    .update({ logo_url: logoUrl })
    .eq('id', user.empresaId)

  if (dbError) return { error: 'Erro ao salvar a logo.' }

  revalidatePath('/configuracoes')
  return { success: true, url: logoUrl }
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
