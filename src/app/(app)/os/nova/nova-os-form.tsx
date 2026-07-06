"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, ChevronDown, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { criarOSAction } from "@/lib/actions/os";
import { demoClientes } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";
import { TIPOS_ATENDIMENTO, ORIGENS_OS } from "@/lib/constants";

type State = { error?: string } | undefined;

interface ClienteSugestao { id: string; nome: string; telefone?: string; cpf_cnpj?: string }
interface EquipamentoSugestao { id: string; nome: string; marca?: string; modelo?: string; numero_serie?: string }

export function NovaOSForm() {
  const [state, setError] = useState<State>();
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteSugestao | null>(null);
  const [sugestoesCliente, setSugestoesCliente] = useState<ClienteSugestao[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const [equipamentos, setEquipamentos] = useState<EquipamentoSugestao[]>([]);
  const [equipamentoId, setEquipamentoId] = useState("");
  const [novoEquip, setNovoEquip] = useState(false);

  // Busca clientes (demo mode)
  useEffect(() => {
    if (!buscaCliente.trim() || clienteSelecionado) {
      setSugestoesCliente([]);
      return;
    }
    const filtered = demoClientes
      .filter(c =>
        c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
        (c as any).cpf_cnpj?.includes(buscaCliente) ||
        c.telefone?.includes(buscaCliente)
      )
      .slice(0, 6);
    setSugestoesCliente(filtered as ClienteSugestao[]);
    setMostrarSugestoes(true);
  }, [buscaCliente, clienteSelecionado]);

  function selecionarCliente(c: ClienteSugestao) {
    setClienteSelecionado(c);
    setBuscaCliente(c.nome);
    setSugestoesCliente([]);
    setMostrarSugestoes(false);
    // Simula carregamento de equipamentos
    setEquipamentos([
      { id: "equip-1", nome: "Notebook Dell Inspiron 15", marca: "Dell", modelo: "Inspiron 15", numero_serie: "SN-12345" },
      { id: "equip-2", nome: "iPhone 13 Pro", marca: "Apple", modelo: "iPhone 13 Pro", numero_serie: "SN-67890" },
    ]);
  }

  function limparCliente() {
    setClienteSelecionado(null);
    setBuscaCliente("");
    setEquipamentos([]);
    setEquipamentoId("");
  }

  async function handleSubmit(formData: FormData) {
    if (clienteSelecionado) {
      formData.set("cliente_id", clienteSelecionado.id);
    }
    if (equipamentoId) {
      formData.set("equipamento_id", equipamentoId);
    }
    startTransition(async () => {
      const result = await criarOSAction(formData);
      if (result?.error) {
        setError({ error: result.error });
        toastError("Erro ao criar OS", result.error);
      } else {
        success("OS criada com sucesso!", "A ordem de serviço foi aberta.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Bloco cliente */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold">Cliente e equipamento</h2>
        <div className="mt-4 space-y-4">
          {/* Campo de busca de cliente */}
          <FormField label="Cliente" required>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
              <Input
                value={buscaCliente}
                onChange={e => {
                  setBuscaCliente(e.target.value);
                  if (clienteSelecionado && e.target.value !== clienteSelecionado.nome) {
                    setClienteSelecionado(null);
                  }
                }}
                onFocus={() => sugestoesCliente.length > 0 && setMostrarSugestoes(true)}
                placeholder="Buscar por nome, CPF ou telefone..."
                className="pl-9 pr-9"
                autoComplete="off"
              />
              {clienteSelecionado && (
                <button
                  type="button"
                  onClick={limparCliente}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
                >
                  <X className="size-4" />
                </button>
              )}

              {/* Sugestões */}
              {mostrarSugestoes && sugestoesCliente.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  {sugestoesCliente.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selecionarCliente(c)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--color-surface-muted)] first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)]"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-bold text-[var(--color-brand-700)] uppercase">
                        {c.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.nome}</p>
                        {c.telefone && <p className="text-xs text-[var(--color-fg-muted)]">{c.telefone}</p>}
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-brand-600)] hover:bg-[var(--color-surface-muted)] rounded-b-[var(--radius-md)]"
                    >
                      <Plus className="size-3.5" />
                      Criar novo cliente
                    </button>
                  </div>
                </div>
              )}
            </div>
            {clienteSelecionado && (
              <div className="mt-2 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-50)] px-3 py-1.5">
                <span className="text-xs font-medium text-[var(--color-brand-700)]">✓ {clienteSelecionado.nome}</span>
              </div>
            )}
          </FormField>

          {/* Equipamento */}
          {clienteSelecionado && equipamentos.length > 0 && (
            <FormField label="Equipamento">
              <Select
                value={equipamentoId}
                onChange={e => {
                  setEquipamentoId(e.target.value);
                  setNovoEquip(false);
                }}
              >
                <option value="">Selecione ou informe novo...</option>
                {equipamentos.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome} {eq.numero_serie ? `(${eq.numero_serie})` : ''}
                  </option>
                ))}
                <option value="__novo__">+ Novo equipamento</option>
              </Select>
            </FormField>
          )}

          {/* Campos de novo equipamento */}
          {(!clienteSelecionado || equipamentos.length === 0 || equipamentoId === '__novo__') && (
            <div className="grid gap-4 sm:grid-cols-2 border-t border-[var(--color-border)] pt-4">
              <p className="sm:col-span-2 text-xs text-[var(--color-fg-muted)] font-medium">Dados do equipamento</p>
              <FormField label="Nome do equipamento" required={!clienteSelecionado || equipamentoId === '__novo__'} className="sm:col-span-2">
                <Input name="equipamento_nome" placeholder="Ex.: Notebook Dell Inspiron 15" />
              </FormField>
              <FormField label="Marca">
                <Input name="equipamento_marca" placeholder="Ex.: Dell" />
              </FormField>
              <FormField label="Modelo">
                <Input name="equipamento_modelo" placeholder="Ex.: Inspiron 15 3000" />
              </FormField>
              <FormField label="Número de série">
                <Input name="equipamento_serie" placeholder="Ex.: SN12345678" />
              </FormField>
            </div>
          )}
        </div>
      </div>

      {/* Bloco serviço */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold">Detalhes do atendimento</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Prioridade" htmlFor="prioridade">
            <Select id="prioridade" name="prioridade" defaultValue="media">
              <option value="baixa">🔵 Baixa</option>
              <option value="media">🔵 Média</option>
              <option value="alta">🟠 Alta</option>
              <option value="urgente">🔴 Urgente</option>
            </Select>
          </FormField>

          <FormField label="Canal de origem" htmlFor="origem">
            <Select id="origem" name="origem" defaultValue="presencial">
              {ORIGENS_OS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Tipo de atendimento" htmlFor="tipo_atendimento">
            <Select id="tipo_atendimento" name="tipo_atendimento" defaultValue="presencial">
              {TIPOS_ATENDIMENTO.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Previsão de entrega" htmlFor="data_previsao">
            <Input id="data_previsao" name="data_previsao" type="datetime-local" />
          </FormField>

          <FormField label="Condição visual" htmlFor="condicao_visual">
            <Select id="condicao_visual" name="condicao_visual">
              <option value="">Selecionar...</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="com_danos">Com danos</option>
            </Select>
          </FormField>

          <FormField label="Problema relatado" htmlFor="problema" required className="sm:col-span-2">
            <Textarea
              id="problema"
              name="problema"
              rows={3}
              placeholder="Descreva o problema relatado pelo cliente..."
              required
            />
          </FormField>

          <FormField label="Acessórios entregues" htmlFor="acessorios">
            <Input id="acessorios" name="acessorios" placeholder="Ex.: Carregador, capa, mouse..." />
          </FormField>

          <FormField label="Senha do equipamento" htmlFor="senha_equip">
            <Input id="senha_equip" name="senha_equip" placeholder="PIN, senha de login..." />
          </FormField>

          <FormField label="Obs. internas (não visível ao cliente)" htmlFor="obs_internas" className="sm:col-span-2">
            <Textarea id="obs_internas" name="obs_internas" rows={2} placeholder="Notas internas da equipe..." />
          </FormField>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">Cancelar</Button>
        <Button type="submit" loading={isPending}>
          Criar OS
        </Button>
      </div>
    </form>
  );
}
