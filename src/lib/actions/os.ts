'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const criarOSSchema = z.object({
  cliente_id: z.string().uuid('Selecione um cliente válido'),
  equipamento_id: z.string().uuid().optional().or(z.literal('')),
  equipamento_nome: z.string().optional(),
  equipamento_marca: z.string().optional(),
  equipamento_modelo: z.string().optional(),
  equipamento_serie: z.string().optional(),
  tecnico_id: z.string().uuid().optional().or(z.literal('')),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  origem: z.enum(['presencial', 'whatsapp', 'email', 'telefone', 'portal', 'contrato']).default('presencial'),
  tipo_atendimento: z.enum(['presencial', 'coleta_entrega', 'visita_tecnica', 'suporte_remoto', 'contrato_manutencao']).default('presencial'),
  problema: z.string().min(5, 'Descreva o problema com pelo menos 5 caracteres'),
  acessorios: z.string().optional(),
  senha_equip: z.string().optional(),
  condicao_visual: z.string().optional(),
  data_previsao: z.string().optional(),
  observacoes: z.string().optional(),
  obs_internas: z.string().optional(),
})

export async function criarOSAction(formData: FormData) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const raw = {
    cliente_id: formData.get('cliente_id') as string,
    equipamento_id: formData.get('equipamento_id') as string,
    equipamento_nome: formData.get('equipamento_nome') as string,
    equipamento_marca: formData.get('equipamento_marca') as string,
    equipamento_modelo: formData.get('equipamento_modelo') as string,
    equipamento_serie: formData.get('equipamento_serie') as string,
    tipo_atendimento: formData.get('tipo_atendimento') as string,
    tecnico_id: formData.get('tecnico_id') as string,
    prioridade: formData.get('prioridade') as string,
    origem: formData.get('origem') as string,
    problema: formData.get('problema') as string,
    acessorios: formData.get('acessorios') as string,
    senha_equip: formData.get('senha_equip') as string,
    condicao_visual: formData.get('condicao_visual') as string,
    data_previsao: formData.get('data_previsao') as string,
    observacoes: formData.get('observacoes') as string,
    obs_internas: formData.get('obs_internas') as string,
  }

  const parsed = criarOSSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const data = parsed.data
  const empresaId = user.empresaId

  // Se informou novo equipamento (não selecionou existente), cria
  let equipamentoId = data.equipamento_id || null
  if (!equipamentoId && data.equipamento_nome) {
    const { data: equip } = await supabase
      .from('equipamentos')
      .insert({
        empresa_id: empresaId,
        cliente_id: data.cliente_id,
        nome: data.equipamento_nome,
        marca: data.equipamento_marca || null,
        modelo: data.equipamento_modelo || null,
        numero_serie: data.equipamento_serie || null,
        created_by: user.id,
      })
      .select('id')
      .single()
    equipamentoId = equip?.id ?? null
  }

  // Gera número da OS via função do banco
  const { data: numeroData } = await supabase
    .rpc('gerar_numero_os', { p_empresa_id: empresaId })
  const numero = numeroData as string

  const { data: os, error } = await supabase
    .from('ordens_servico')
    .insert({
      empresa_id: empresaId,
      numero: numero ?? `OS-${Date.now()}`,
      cliente_id: data.cliente_id,
      equipamento_id: equipamentoId,
      tecnico_id: data.tecnico_id || null,
      atendente_id: user.id,
      prioridade: data.prioridade,
      origem: data.origem,
      tipo_atendimento: data.tipo_atendimento,
      problema: data.problema,
      acessorios: data.acessorios ? [data.acessorios] : null,
      senha_equip: data.senha_equip || null,
      condicao_visual: data.condicao_visual || null,
      data_previsao: data.data_previsao || null,
      observacoes: data.observacoes || null,
      obs_internas: data.obs_internas || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !os) {
    return { error: 'Erro ao criar OS. Tente novamente.' }
  }

  revalidatePath('/os')
  redirect(`/os/${os.id}`)
}

export async function atualizarStatusOSAction(osId: string, novoStatus: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const extraFields: Record<string, string | null> = {}
  if (novoStatus === 'entregue') {
    extraFields.data_entrega = new Date().toISOString()
    // Calcular data de expiração da garantia
    const { data: os } = await supabase
      .from('ordens_servico')
      .select('garantia_dias')
      .eq('id', osId)
      .single()
    if (os?.garantia_dias) {
      const expira = new Date()
      expira.setDate(expira.getDate() + os.garantia_dias)
      extraFields.garantia_expira = expira.toISOString()
    }
  }
  if (novoStatus === 'aprovada') {
    extraFields.data_aprovacao = new Date().toISOString()
  }

  const { error } = await supabase
    .from('ordens_servico')
    .update({ status: novoStatus, ...extraFields })
    .eq('id', osId)
    .eq('empresa_id', user.empresaId)

  if (error) return { error: 'Erro ao atualizar status.' }

  // Adiciona evento de comentário do usuário na timeline
  await supabase.from('os_eventos').insert({
    os_id: osId,
    empresa_id: user.empresaId,
    tipo: 'status_alterado',
    descricao: `Status alterado para "${novoStatus}" por ${user.nome}`,
    usuario_id: user.id,
    metadata: { status_novo: novoStatus, usuario_nome: user.nome },
  })

  revalidatePath(`/os/${osId}`)
  return { success: true }
}

export async function adicionarComentarioOSAction(osId: string, comentario: string) {
  const user = await getCurrentUser()
  if (!comentario.trim()) return { error: 'Comentário vazio.' }

  const supabase = await createServerClientInstance()
  const { error } = await supabase.from('os_eventos').insert({
    os_id: osId,
    empresa_id: user.empresaId,
    tipo: 'comentario',
    descricao: comentario.trim(),
    usuario_id: user.id,
    metadata: { usuario_nome: user.nome },
  })

  if (error) return { error: 'Erro ao salvar comentário.' }

  revalidatePath(`/os/${osId}`)
  return { success: true }
}

export async function adicionarItemOSAction(
  osId: string,
  item: { tipo: 'servico' | 'peca'; descricao: string; quantidade: number; valor_unit: number }
) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error: itemError } = await supabase.from('os_itens').insert({
    os_id: osId,
    tipo: item.tipo,
    descricao: item.descricao,
    quantidade: item.quantidade,
    valor_unit: item.valor_unit,
    created_by: user.id,
  })

  if (itemError) return { error: 'Erro ao adicionar item.' }

  // Recalcula os totais na OS
  const { data: itens } = await supabase
    .from('os_itens')
    .select('tipo, quantidade, valor_unit')
    .eq('os_id', osId)

  const valorMaoObra = itens
    ?.filter(i => i.tipo === 'servico')
    .reduce((acc, i) => acc + i.quantidade * i.valor_unit, 0) ?? 0

  const valorPecas = itens
    ?.filter(i => i.tipo === 'peca')
    .reduce((acc, i) => acc + i.quantidade * i.valor_unit, 0) ?? 0

  await supabase
    .from('ordens_servico')
    .update({ valor_mao_obra: valorMaoObra, valor_pecas: valorPecas })
    .eq('id', osId)

  revalidatePath(`/os/${osId}`)
  return { success: true }
}

export async function removerItemOSAction(osId: string, itemId: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  await supabase.from('os_itens').delete().eq('id', itemId)

  // Recalcula totais
  const { data: itens } = await supabase
    .from('os_itens')
    .select('tipo, quantidade, valor_unit')
    .eq('os_id', osId)

  const valorMaoObra = itens
    ?.filter(i => i.tipo === 'servico')
    .reduce((acc, i) => acc + i.quantidade * i.valor_unit, 0) ?? 0
  const valorPecas = itens
    ?.filter(i => i.tipo === 'peca')
    .reduce((acc, i) => acc + i.quantidade * i.valor_unit, 0) ?? 0

  await supabase
    .from('ordens_servico')
    .update({ valor_mao_obra: valorMaoObra, valor_pecas: valorPecas })
    .eq('id', osId)
    .eq('empresa_id', user.empresaId)

  revalidatePath(`/os/${osId}`)
  return { success: true }
}

export async function atualizarDiagnosticoAction(osId: string, diagnostico: string, solucao: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { error } = await supabase
    .from('ordens_servico')
    .update({ diagnostico, solucao })
    .eq('id', osId)
    .eq('empresa_id', user.empresaId)

  if (error) return { error: 'Erro ao salvar diagnóstico.' }

  if (diagnostico) {
    await supabase.from('os_eventos').insert({
      os_id: osId,
      empresa_id: user.empresaId,
      tipo: 'diagnostico_atualizado',
      descricao: 'Diagnóstico atualizado',
      usuario_id: user.id,
      metadata: { usuario_nome: user.nome },
    })
  }

  revalidatePath(`/os/${osId}`)
  return { success: true }
}

export async function listarOSAction(filtros?: {
  status?: string
  tecnico_id?: string
  prioridade?: string
  busca?: string
}) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  let query = supabase
    .from('ordens_servico')
    .select(`
      id, numero, status, prioridade, problema, valor_total,
      data_abertura, data_previsao,
      clientes(id, nome, telefone, whatsapp),
      equipamentos(id, nome, marca, modelo),
      usuarios!tecnico_id(id, nome)
    `)
    .eq('empresa_id', user.empresaId)
    .is('deleted_at', null)
    .order('data_abertura', { ascending: false })

  if (filtros?.status) query = query.eq('status', filtros.status)
  if (filtros?.tecnico_id) query = query.eq('tecnico_id', filtros.tecnico_id)
  if (filtros?.prioridade) query = query.eq('prioridade', filtros.prioridade)

  const { data, error } = await query.limit(200)
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

export async function buscarOSAction(osId: string) {
  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()

  const { data, error } = await supabase
    .from('ordens_servico')
    .select(`
      *,
      clientes(id, nome, telefone, whatsapp, email, cpf_cnpj, endereco, cidade, estado),
      equipamentos(id, nome, marca, modelo, numero_serie, imei, cor),
      usuarios!tecnico_id(id, nome, email, avatar_url),
      usuarios!atendente_id(id, nome),
      os_itens(id, tipo, descricao, quantidade, valor_unit, valor_total),
      os_eventos(id, tipo, descricao, metadata, created_at, usuarios(id, nome, avatar_url)),
      os_fotos(id, fase, url_publica, legenda, created_at)
    `)
    .eq('id', osId)
    .eq('empresa_id', user.empresaId)
    .is('deleted_at', null)
    .single()

  if (error) return { error: 'OS não encontrada.', data: null }
  return { data }
}
