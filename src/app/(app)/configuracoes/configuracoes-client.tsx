"use client";

import { useState, useTransition } from "react";
import { Save, Building2, Bell, Shield, CreditCard, Palette, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { atualizarEmpresaAction } from "@/lib/actions/empresa";

interface EmpresaData {
  nome?: string;
  razao_social?: string;
  cnpj?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  site?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface Props {
  empresa: EmpresaData;
  isSupabase: boolean;
}

const abas = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "garantias", label: "Garantias & OS", icon: Shield },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "plano", label: "Plano", icon: CreditCard },
  { id: "aparencia", label: "Aparência", icon: Palette },
];

export function ConfiguracoesClient({ empresa, isSupabase }: Props) {
  const [abaAtiva, setAbaAtiva] = useState("empresa");
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  function handleSaveEmpresa(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabase) {
      success("Configurações salvas!", "Em produção os dados serão persistidos no banco.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await atualizarEmpresaAction(fd);
      if (result?.error) {
        toastError("Erro ao salvar", result.error);
      } else {
        success("Configurações salvas!", "Dados da empresa atualizados.");
      }
    });
  }

  function handleSaveOther() {
    success("Configurações salvas!", "As preferências foram atualizadas.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">Personalize o DeskControl para a sua empresa</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Menu lateral */}
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-48 lg:flex-col">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                abaAtiva === aba.id
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                  : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              <aba.icon className="size-4 shrink-0" />
              {aba.label}
            </button>
          ))}
        </nav>

        {/* Conteúdo */}
        <div className="flex-1 space-y-6">
          {abaAtiva === "empresa" && (
            <form onSubmit={handleSaveEmpresa} className="space-y-5">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <h2 className="font-semibold">Dados da empresa</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FormField label="Nome da empresa" required className="sm:col-span-2">
                    <Input name="nome" defaultValue={empresa.nome ?? "GRP Tecnologia"} required />
                  </FormField>
                  <FormField label="Razão social" className="sm:col-span-2">
                    <Input name="razao_social" defaultValue={empresa.razao_social ?? ""} />
                  </FormField>
                  <FormField label="CNPJ">
                    <Input name="cnpj" defaultValue={empresa.cnpj ?? ""} placeholder="00.000.000/0001-00" />
                  </FormField>
                  <FormField label="Telefone">
                    <Input name="telefone" defaultValue={empresa.telefone ?? ""} placeholder="(00) 0000-0000" />
                  </FormField>
                  <FormField label="WhatsApp de contato">
                    <Input name="whatsapp" defaultValue={empresa.whatsapp ?? ""} placeholder="(00) 00000-0000" />
                  </FormField>
                  <FormField label="E-mail">
                    <Input name="email" defaultValue={empresa.email ?? ""} type="email" placeholder="contato@empresa.com" />
                  </FormField>
                  <FormField label="Site">
                    <Input name="site" defaultValue={empresa.site ?? ""} placeholder="https://empresa.com.br" />
                  </FormField>
                  <FormField label="CEP">
                    <Input name="cep" defaultValue={empresa.cep ?? ""} placeholder="00000-000" />
                  </FormField>
                  <FormField label="Endereço" className="sm:col-span-2">
                    <Input name="endereco" defaultValue={empresa.endereco ?? ""} placeholder="Rua, número, complemento" />
                  </FormField>
                  <FormField label="Cidade">
                    <Input name="cidade" defaultValue={empresa.cidade ?? ""} placeholder="São Paulo" />
                  </FormField>
                  <FormField label="Estado">
                    <select name="estado" defaultValue={empresa.estado ?? "SP"}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                      {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <h2 className="font-semibold">Logotipo</h2>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex size-20 items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-fg-subtle)] text-xs text-center">
                    <span>Sem logo</span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" type="button">Fazer upload</Button>
                    <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">PNG, JPG ou SVG. Máx. 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={isPending}>
                  <Save className="size-4" />
                  Salvar alterações
                </Button>
              </div>
            </form>
          )}

          {abaAtiva === "notificacoes" && (
            <>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <h2 className="font-semibold">Notificações</h2>
                <div className="mt-4 space-y-4">
                  {[
                    { label: "OS criada", desc: "Notificar técnicos quando uma OS for aberta" },
                    { label: "OS pronta", desc: "Notificar cliente via WhatsApp quando OS estiver pronta" },
                    { label: "OS atrasada", desc: "Alerta ao admin quando OS passar da data de previsão" },
                    { label: "Pagamento recebido", desc: "Notificar financeiro ao registrar recebimento" },
                    { label: "Estoque mínimo", desc: "Alertar quando produto atingir estoque mínimo" },
                    { label: "Garantia vencendo", desc: "Avisar 7 dias antes de garantias vencerem" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-[var(--color-fg-muted)]">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <div className="h-5 w-9 rounded-full bg-[var(--color-surface-muted)] peer-checked:bg-[var(--color-brand-600)] peer-focus:ring-2 peer-focus:ring-[var(--color-brand-500)] transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveOther}><Save className="size-4" />Salvar</Button>
              </div>
            </>
          )}

          {abaAtiva === "garantias" && (
            <>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <h2 className="font-semibold">Padrões de OS e Garantia</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FormField label="Prazo padrão de garantia (dias)">
                    <Input type="number" defaultValue="90" />
                  </FormField>
                  <FormField label="Próximo número de OS">
                    <Input type="number" defaultValue="43" />
                  </FormField>
                  <FormField label="Prefixo de numeração OS" className="sm:col-span-2">
                    <Input defaultValue="OS-2026-" />
                  </FormField>
                  <FormField label="Texto padrão da garantia" className="sm:col-span-2">
                    <textarea rows={4}
                      defaultValue="O serviço realizado possui garantia de {prazo_dias} dias contados a partir da data de entrega do equipamento. A garantia cobre exclusivamente o serviço prestado, não incluindo danos causados por mau uso, quedas ou terceiros."
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
                  </FormField>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveOther}><Save className="size-4" />Salvar</Button>
              </div>
            </>
          )}

          {abaAtiva === "agenda" && (
            <div className="space-y-5">
              {[
                {
                  titulo: "Visibilidade da agenda",
                  desc: "Defina quem pode ver o quê na agenda compartilhada",
                  items: [
                    { label: "Agenda geral visível para todos", desc: "Todos os usuários podem ver a agenda completa da empresa" },
                    { label: "Técnicos podem ver agenda dos colegas", desc: "Técnicos visualizam eventos atribuídos a outros técnicos" },
                    { label: "Eventos privados aparecem para gerentes", desc: "Gerentes podem ver eventos marcados como privados" },
                    { label: "Mostrar localização dos atendimentos", desc: "Técnicos podem ver o endereço dos eventos uns dos outros" },
                    { label: "Clientes podem ver eventos no portal", desc: "Eventos de atendimento aparecem no portal do cliente" },
                  ],
                },
                {
                  titulo: "Notificações da agenda",
                  desc: "Alertas automáticos para a equipe",
                  items: [
                    { label: "Alerta 1 dia antes do evento", desc: "Enviar notificação 24h antes para o responsável" },
                    { label: "Alerta no dia do evento", desc: "Lembrete pela manhã no dia do atendimento" },
                    { label: "Alerta para o cliente", desc: "Enviar confirmação de visita para o cliente via WhatsApp" },
                    { label: "Alerta quando técnico é atribuído", desc: "Notificar o técnico quando receber um novo evento" },
                  ],
                },
              ].map((grupo) => (
                <div key={grupo.titulo} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                  <h2 className="font-semibold mb-0.5">{grupo.titulo}</h2>
                  <p className="text-xs text-[var(--color-fg-muted)] mb-4">{grupo.desc}</p>
                  <div className="space-y-4">
                    {grupo.items.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-[var(--color-fg-muted)]">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center shrink-0">
                          <input type="checkbox" defaultChecked className="peer sr-only" />
                          <div className="h-5 w-9 rounded-full bg-[var(--color-surface-muted)] peer-checked:bg-[var(--color-brand-600)] transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={handleSaveOther}><Save className="size-4" />Salvar</Button>
              </div>
            </div>
          )}

          {abaAtiva === "plano" && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold">Seu plano atual</h2>
              <div className="mt-4">
                <div className="flex items-center justify-between rounded-[var(--radius-lg)] border-2 border-[var(--color-brand-600)] bg-[var(--color-brand-50)] p-4">
                  <div>
                    <p className="font-bold text-lg text-[var(--color-brand-700)]">Plano Pro</p>
                    <p className="text-sm text-[var(--color-fg-muted)]">Até 5 usuários · OS ilimitadas · WhatsApp incluso</p>
                    <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">Trial ativo — 14 dias restantes</p>
                  </div>
                  <p className="text-2xl font-bold text-[var(--color-brand-700)]">R$ 149<span className="text-sm font-normal">/mês</span></p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { plano: "Starter", preco: "R$ 79", features: "1 usuário · 50 OS/mês" },
                    { plano: "Pro", preco: "R$ 149", features: "5 usuários · OS ilimitadas · WhatsApp" },
                    { plano: "Business", preco: "R$ 299", features: "Usuários ilimitados · Multi-unidade · API" },
                    { plano: "Enterprise", preco: "Sob consulta", features: "White-label · SLA · Suporte dedicado" },
                  ].map((p) => (
                    <div key={p.plano} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                      <p className="font-semibold">{p.plano}</p>
                      <p className="text-lg font-bold">{p.preco}<span className="text-xs font-normal text-[var(--color-fg-muted)]">/mês</span></p>
                      <p className="text-xs text-[var(--color-fg-muted)]">{p.features}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {abaAtiva === "aparencia" && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <h2 className="font-semibold">Aparência</h2>
              <div className="mt-4 space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium">Tema</p>
                  <div className="flex gap-3">
                    {["Claro", "Escuro", "Sistema"].map((tema) => (
                      <label key={tema} className="flex cursor-pointer flex-col items-center gap-1.5">
                        <div className={`size-16 rounded-[var(--radius-md)] border-2 ${tema === "Claro" ? "border-[var(--color-brand-600)] bg-white" : tema === "Escuro" ? "border-[var(--color-border)] bg-gray-900" : "border-[var(--color-border)] bg-gradient-to-br from-white to-gray-900"}`} />
                        <span className="text-xs">{tema}</span>
                        <input type="radio" name="tema" defaultChecked={tema === "Claro"} className="sr-only" />
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium">Cor principal</p>
                  <div className="flex gap-3">
                    {["#2563eb","#7c3aed","#dc2626","#16a34a","#d97706","#0891b2"].map((cor) => (
                      <button key={cor} type="button"
                        className={`size-8 rounded-full ring-2 ring-offset-2 ${cor === "#2563eb" ? "ring-[var(--color-brand-600)]" : "ring-transparent"}`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveOther}><Save className="size-4" />Salvar</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
