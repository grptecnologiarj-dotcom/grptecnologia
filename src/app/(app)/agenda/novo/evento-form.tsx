"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Plus, Trash2, Calendar, Clock, MapPin,
  User, Bell, Lock, CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { criarEventoAgendaAction } from "@/lib/actions/agenda";

const tipos = [
  { value: "visita_tecnica",         label: "Visita técnica" },
  { value: "atendimento_remoto",     label: "Atendimento remoto" },
  { value: "instalacao",             label: "Instalação" },
  { value: "manutencao_preventiva",  label: "Manutenção preventiva" },
  { value: "retirada_equipamento",   label: "Retirada de equipamento" },
  { value: "entrega_equipamento",    label: "Entrega de equipamento" },
  { value: "diagnostico",            label: "Diagnóstico" },
  { value: "retorno_garantia",       label: "Retorno garantia" },
  { value: "cobranca",               label: "Cobrança" },
  { value: "reuniao",                label: "Reunião" },
  { value: "tarefa_interna",         label: "Tarefa interna" },
  { value: "prioridade_urgente",     label: "🔴 Prioridade urgente" },
  { value: "evento_privado",         label: "🔒 Evento privado" },
  { value: "lembrete",               label: "Lembrete" },
];

const coresEvento = [
  "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ef4444", "#0ea5e9", "#10b981", "#f97316",
  "#dc2626", "#6b7280", "#0891b2", "#7c3aed",
];

const SEL =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

interface Pessoa {
  id: string;
  nome: string;
}

export function EventoForm({
  clientes,
  tecnicos,
  isSupabase,
  dataInicial,
}: {
  clientes: Pessoa[];
  tecnicos: Pessoa[];
  isSupabase: boolean;
  dataInicial?: string;
}) {
  const router = useRouter();
  const hoje = new Date().toISOString().split("T")[0];

  const [saving, startTransition] = useTransition();
  const { success, error: toastError } = useToast();
  const [cor, setCor] = useState("#3b82f6");
  const [prioridade, setPrioridade] = useState("normal");
  const [visibilidade, setVisibilidade] = useState("todos");
  const [checklist, setChecklist] = useState<{ id: string; texto: string }[]>([]);
  const [novoItem, setNovoItem] = useState("");
  const [notificacoes, setNotificacoes] = useState<number[]>([1440, 30]);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabase) {
      success("Evento criado! (demo)", "Em produção os dados serão persistidos no banco.");
      router.push("/agenda");
      return;
    }
    const form = new FormData(e.currentTarget);
    const data = (form.get("data") as string) ?? "";
    const horaInicio = (form.get("hora_inicio") as string) || "09:00";
    const horaFim = (form.get("hora_fim") as string) || "";

    const fd = new FormData();
    fd.set("titulo", (form.get("titulo") as string) ?? "");
    fd.set("tipo", (form.get("tipo") as string) ?? "");
    fd.set("tecnico_id", (form.get("tecnico_id") as string) ?? "");
    fd.set("cliente_id", (form.get("cliente_id") as string) ?? "");
    fd.set("os_id", "");
    fd.set("data_inicio", `${data}T${horaInicio}:00`);
    fd.set("data_fim", horaFim ? `${data}T${horaFim}:00` : "");
    fd.set("local", (form.get("endereco") as string) ?? "");
    fd.set("descricao", (form.get("descricao") as string) ?? "");
    fd.set("prioridade", prioridade);
    startTransition(async () => {
      const result = await criarEventoAgendaAction(fd);
      if (result?.error) {
        toastError("Erro ao criar evento", result.error);
      } else {
        success("Evento criado!", "O agendamento foi salvo.");
      }
    });
  }

  function addChecklistItem() {
    if (!novoItem.trim()) return;
    setChecklist((prev) => [...prev, { id: Date.now().toString(), texto: novoItem.trim() }]);
    setNovoItem("");
  }

  function removeChecklistItem(id: string) {
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleNotificacao(min: number) {
    setNotificacoes((prev) =>
      prev.includes(min) ? prev.filter((n) => n !== min) : [...prev, min].sort((a, b) => b - a)
    );
  }

  const prioridades = [
    { value: "baixa",   label: "Baixa",   cor: "#9ca3af" },
    { value: "normal",  label: "Normal",  cor: "#2563eb" },
    { value: "alta",    label: "Alta",    cor: "#d97706" },
    { value: "urgente", label: "Urgente", cor: "#ef4444" },
    { value: "critica", label: "Crítica", cor: "#991b1b" },
  ];

  const alertas = [
    { label: "1 dia antes", min: 1440 },
    { label: "2 horas antes", min: 120 },
    { label: "30 min antes", min: 30 },
    { label: "No horário", min: 0 },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Informações básicas */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="size-4 text-[var(--color-fg-subtle)]" />
          <h2 className="font-semibold">Informações básicas</h2>
        </div>

        <FormField label="Título do evento" required>
          <Input name="titulo" placeholder="Ex.: Visita técnica — João Pedro" required />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de evento" required>
            <select name="tipo" required className={SEL}>
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Prioridade">
            <div className="flex gap-1.5 flex-wrap">
              {prioridades.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPrioridade(p.value)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
                    prioridade === p.value ? "text-white" : "hover:opacity-80"
                  }`}
                  style={
                    prioridade === p.value
                      ? { backgroundColor: p.cor, borderColor: p.cor, color: "#fff" }
                      : { borderColor: p.cor, color: p.cor }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="prioridade" value={prioridade} />
          </FormField>
        </div>

        {/* Cor */}
        <FormField label="Cor do evento">
          <div className="flex gap-2 flex-wrap">
            {coresEvento.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  cor === c ? "border-[var(--color-fg)] scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input type="hidden" name="cor" value={cor} />
        </FormField>
      </div>

      {/* Data e horário */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="size-4 text-[var(--color-fg-subtle)]" />
          <h2 className="font-semibold">Data e horário</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Data" required>
            <Input name="data" type="date" defaultValue={dataInicial ?? hoje} required />
          </FormField>
          <FormField label="Hora início" required>
            <Input name="hora_inicio" type="time" defaultValue="09:00" required />
          </FormField>
          <FormField label="Hora fim" required>
            <Input name="hora_fim" type="time" defaultValue="10:00" required />
          </FormField>
        </div>
        <FormField label="Recorrência">
          <select name="recorrencia" className={SEL}>
            <option value="">Não se repete</option>
            <option value="diaria">Diária</option>
            <option value="semanal">Semanal</option>
            <option value="quinzenal">Quinzenal</option>
            <option value="mensal">Mensal</option>
          </select>
        </FormField>
      </div>

      {/* Pessoas */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User className="size-4 text-[var(--color-fg-subtle)]" />
          <h2 className="font-semibold">Pessoas</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Cliente">
            <select name="cliente_id" className={SEL}>
              <option value="">Sem cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Técnico responsável">
            <select name="tecnico_id" className={SEL}>
              <option value="">Não atribuído</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="OS vinculada">
          <Input name="os_numero" placeholder="Ex.: OS-2026-0042" />
        </FormField>
      </div>

      {/* Local */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="size-4 text-[var(--color-fg-subtle)]" />
          <h2 className="font-semibold">Local</h2>
        </div>
        <FormField label="Endereço / local">
          <Input name="endereco" placeholder="Rua, número, bairro ou 'Loja'" />
        </FormField>
        <FormField label="Link Google Maps">
          <Input name="link_maps" placeholder="https://maps.google.com/..." type="url" />
        </FormField>
      </div>

      {/* Descrição */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
        <h2 className="font-semibold">Descrição e observações</h2>
        <FormField label="Descrição (visível para todos)">
          <textarea name="descricao" rows={3} placeholder="Descreva o objetivo do evento..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
        </FormField>
        <FormField label="Observações internas (só para a equipe)">
          <textarea name="observacoes_internas" rows={2} placeholder="Informações que só a equipe deve ver..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
        </FormField>
      </div>

      {/* Checklist */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <CheckSquare className="size-4 text-[var(--color-fg-subtle)]" />
          <h2 className="font-semibold">Checklist</h2>
        </div>
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="size-4 rounded border border-[var(--color-border)] shrink-0" />
            <span className="flex-1 text-sm">{item.texto}</span>
            <button type="button" onClick={() => removeChecklistItem(item.id)}
              className="text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            placeholder="Adicionar item ao checklist..."
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem(); } }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addChecklistItem}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Notificações */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="size-4 text-[var(--color-fg-subtle)]" />
          <h2 className="font-semibold">Notificações</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {alertas.map((a) => (
            <button
              key={a.min}
              type="button"
              onClick={() => toggleNotificacao(a.min)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                notificacoes.includes(a.min)
                  ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                  : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="notificacoes" value={JSON.stringify(notificacoes)} />
      </div>

      {/* Visibilidade */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="size-4 text-[var(--color-fg-subtle)]" />
          <h2 className="font-semibold">Visibilidade</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { value: "todos",   label: "Todos", desc: "Toda a equipe" },
            { value: "gerente", label: "Gerentes", desc: "Gerentes e acima" },
            { value: "tecnico", label: "Técnico", desc: "Só o responsável" },
            { value: "admin",   label: "Admin",  desc: "Apenas admins" },
          ].map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVisibilidade(v.value)}
              className={`rounded-[var(--radius-md)] border-2 p-3 text-left transition-colors ${
                visibilidade === v.value
                  ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              <p className={`text-sm font-semibold ${visibilidade === v.value ? "text-[var(--color-brand-700)]" : ""}`}>
                {v.label}
              </p>
              <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{v.desc}</p>
            </button>
          ))}
        </div>
        <input type="hidden" name="visibilidade" value={visibilidade} />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={saving}>
          <Save className="size-4" />
          Criar evento
        </Button>
      </div>
    </form>
  );
}
