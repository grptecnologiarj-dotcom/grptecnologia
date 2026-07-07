'use server'

import { createServerClientInstance } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export interface ResultadoBusca {
  tipo: 'os' | 'cliente' | 'estoque' | 'financeiro' | 'equipamento'
  id: string
  titulo: string
  subtitulo: string
  href: string
  extra?: string
}

export async function buscarGlobalAction(q: string): Promise<{ data: ResultadoBusca[]; error?: string }> {
  const termo = q.trim()
  if (!termo) return { data: [] }

  const user = await getCurrentUser()
  const supabase = await createServerClientInstance()
  const like = `%${termo}%`

  const [osRes, clientesRes, estoqueRes, financeiroRes, equipamentosRes] = await Promise.all([
    supabase
      .from('ordens_servico')
      .select('id, numero, problema, status, clientes(nome)')
      .eq('empresa_id', user.empresaId)
      .or(`numero.ilike.${like},problema.ilike.${like}`)
      .limit(10),
    supabase
      .from('clientes')
      .select('id, nome, email, telefone')
      .eq('empresa_id', user.empresaId)
      .or(`nome.ilike.${like},email.ilike.${like},telefone.ilike.${like}`)
      .limit(10),
    supabase
      .from('estoque_itens')
      .select('id, nome, sku, preco_venda')
      .eq('empresa_id', user.empresaId)
      .or(`nome.ilike.${like},sku.ilike.${like}`)
      .limit(10),
    supabase
      .from('financeiro_transacoes')
      .select('id, descricao, valor, tipo')
      .eq('empresa_id', user.empresaId)
      .ilike('descricao', like)
      .limit(10),
    supabase
      .from('equipamentos')
      .select('id, nome, marca, modelo')
      .eq('empresa_id', user.empresaId)
      .or(`nome.ilike.${like},marca.ilike.${like},modelo.ilike.${like}`)
      .limit(10),
  ])

  const resultados: ResultadoBusca[] = []

  for (const os of osRes.data ?? []) {
    const cliente = os.clientes as unknown as { nome?: string } | null
    resultados.push({
      tipo: 'os',
      id: os.id,
      titulo: os.numero ?? '—',
      subtitulo: cliente?.nome ?? os.problema ?? '—',
      href: `/os/${os.id}`,
      extra: os.status ?? undefined,
    })
  }

  for (const cli of clientesRes.data ?? []) {
    resultados.push({
      tipo: 'cliente',
      id: cli.id,
      titulo: cli.nome ?? '—',
      subtitulo: cli.email ?? cli.telefone ?? '',
      href: `/clientes/${cli.id}`,
    })
  }

  for (const item of estoqueRes.data ?? []) {
    resultados.push({
      tipo: 'estoque',
      id: item.id,
      titulo: item.nome ?? '—',
      subtitulo: item.sku ?? '',
      href: `/estoque/${item.id}`,
    })
  }

  for (const tx of financeiroRes.data ?? []) {
    resultados.push({
      tipo: 'financeiro',
      id: tx.id,
      titulo: tx.descricao ?? '—',
      subtitulo: tx.tipo ?? '',
      href: `/financeiro`,
    })
  }

  for (const eq of equipamentosRes.data ?? []) {
    resultados.push({
      tipo: 'equipamento',
      id: eq.id,
      titulo: eq.nome ?? '—',
      subtitulo: [eq.marca, eq.modelo].filter(Boolean).join(' '),
      href: `/equipamentos/${eq.id}`,
    })
  }

  return { data: resultados }
}
