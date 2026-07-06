"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Plus, Calendar, Clock, MapPin, User, Bell, Lock, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { demoAgendaEventos, demoClientes, demoUsuarios } from "@/lib/demo-data";
import { useToast } from "@/components/ui/toast";

const tipos = [
  { value: "visita_tecnica", label: "Visita técnica" },
  { value: "atendimento_remoto", label: "Atendimento remoto" },
  { value: "instalacao", label: "Instalação" },
  { value: "manutencao_preventiva", label: "Manutenção preventiva" },
  { value: "retirada_equipamento", label: "Retirada de equipamento" },
  { value: "entrega_equipamento", label: "Entrega de equipamento" },
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "retorno_garantia", label: "Retorno garantia" },
  { value: "cobranca", label: "Cobrança" },
  { value: "reuniao", label: "Reunião" },
  { value: "tarefa_interna", label: "Tarefa interna" },
  { value: "prioridade_urgente", label: "🔴 Prioridade urgente" },
  { value: "evento_privado", label: "🔒 Evento privado" },
  { value: "lembrete", label: "Lembrete" },
];

const coresEvento = [
  "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ef4444", "#0ea5e9", "#10b981", "#f97316",
  "#dc2626", "#6b7280", "#0891b2", "#7c3aed",
];

const SEL =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

export default function EditarEventoPage() {
  const params = useParams();
  const router = useRouter();
  const ev = demoAgendaEventos.find((e) => e.id === params.id) ?? demoAgendaEventos[0];

  const [saving, setSaving] = useState(false);
  const { success } = useToast();
  const [cor, setCor] = useState((ev as any).cor ?? "#3b82f6");
  const [prioridade, setPrioridade] = useState((ev as any).prioridade ?? "normal");
  const [visibilidade, setVisibilidade] = useState((ev as any).visibilidade ?? "todos");
  const [checklist, setChecklist] = useState<{ id: string; texto: string; concluido: boolean }[]>(
    (ev as any).checklist ?? []
  );
  const [novoItem, setNovoItem] = useState("");
  const [notificacoes, setNotificacoes] = useState<number[]>((ev as any).notificacoes ?? [1440, 30]);

  const tecnicos = demoUsuarios.filter((u) => u.role === "tecnico" || u.role === "admin");

  const prioridades = [
    { value: "baixa", label: "Baixa", cor: "#9ca3af" },
    { value: "normal", label: "Normal", cor: "#2563eb" },
    { value: "alta", label: "Alta", cor: "#d97706" },
    { value: "urgente", label: "Urgente", cor: "#ef4444" },
    { value: "critica", label: "Crítica", cor: "#991b1b" },
  ];

  const alertas = [
    { label: "1 dia antes", min: 1440 },
    { label: "2 horas antes", min: 120 },
    { label: "30 min antes", min: 30 },
    { label: "No horário", min: 0 },
  ];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    success("Evento atualizado!", "As alterações foram salvas.");
    router.push(`/agenda/${ev.id}`);
  }

  function addChecklistItem() {
    if (!novoItem.trim()) return;
    setChecklist((prev) => [...prev, { id: Date.now().toString(), texto: novoItem.trim(), concluido: false }]);
    setNovoItem("");
  }

  function toggleNotificacao(min: number) {
    setNotificacoes((prev) =>
      prev.includes(min) ? prev.filter((n) => n !== min) : [...prev, min].sort((a, b) => b - a)
    );
  }

  const dataStr = (() => {
    try { return new Date((ev as any).data).toISOString().split("T")[0]; }
    catch { return new Date().toISOString().split("T")[0]; }
  })();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/agenda/${ev.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Editar evento</h1>
          <p className="text-sm text-[var(--color-fg-muted)] truncate max-w-sm">{ev.titulo}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Informações básicas */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="size-4 text-[var(--color-fg-subtle)]" />
            <h2 className="font-semibold">Informações básicas</h2>
          </div>
          <FormField label="Título" required>
            <Input name="titulo" defaultValue={ev.titulo} required />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tipo" required>
              <select name="tipo" defaultValue={(ev as any).tipo ?? "visita_tecnica"} required className={SEL}>
                {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Prioridade">
              <div className="flex gap-1.5 flex-wrap">
                {prioridades.map((p) => (
                  <button key={p.value} type="button" onClick={() => setPrioridade(p.value)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${prioridade === p.value ? "text-white" : "hover:opacity-80"}`}
                    style={prioridade === p.value ? { backgroundColor: p.cor, borderColor: p.cor } : { borderColor: p.cor, color: p.cor }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="prioridade" value={prioridade} />
            </FormField>
          </div>
          <FormField label="Cor do evento">
            <div className="flex gap-2 flex-wrap">
              {coresEvento.map((c) => (
                <button key={c} type="button" onClick={() => setCor(c)}
                  className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${cor === c ? "border-[var(--color-fg)] scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
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
              <Input name="data" type="date" defaultValue={dataStr} required />
            </FormField>
            <FormField label="Hora início" required>
              <Input name="hora_inicio" type="time" defaultValue={(ev as any).horaInicio ?? "09:00"} required />
            </FormField>
            <FormField label="Hora fim" required>
              <Input name="hora_fim" type="time" defaultValue={(ev as any).horaFim ?? "10:00"} required />
            </FormField>
          </div>
          <FormField label="Recorrência">
            <select name="recorrencia" defaultValue={(ev as any).recorrencia ?? ""} className={SEL}>
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
              <select name="cliente_id" defaultValue={(ev as any).clienteId ?? ""} className={SEL}>
                <option value="">Sem cliente</option>
                {demoClientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
            <FormField label="Técnico responsável">
              <select name="tecnico_id" defaultValue={(ev as any).tecnicoId ?? ""} className={SEL}>
                <option value="">Não atribuído</option>
                {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="OS vinculada">
            <Input name="os_numero" defaultValue={(ev as any).osNumero ?? ""} placeholder="OS-2026-0042" />
          </FormField>
        </div>

        {/* Local */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="size-4 text-[var(--color-fg-subtle)]" />
            <h2 className="font-semibold">Local</h2>
          </div>
          <FormField label="Endereço / local">
            <Input name="endereco" defaultValue={(ev as any).endereco ?? ""} placeholder="Rua, número, bairro" />
          </FormField>
          <FormField label="Link Google Maps">
            <Input name="link_maps" defaultValue={(ev as any).linkMaps ?? ""} placeholder="https://maps.google.com/..." type="url" />
          </FormField>
        </div>

        {/* Descrição */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
          <h2 className="font-semibold">Descrição e observações</h2>
          <FormField label="Descrição">
            <textarea name="descricao" rows={3} defaultValue={(ev as any).descricao ?? ""}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
          <FormField label="Observações internas">
            <textarea name="observacoes_internas" rows={2} defaultValue={(ev as any).observacoesInternas ?? ""}
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
              <div className={`size-4 rounded border shrink-0 ${item.concluido ? "bg-[var(--color-success)] border-[var(--color-success)]" : "border-[var(--color-border)]"}`} />
              <span className={`flex-1 text-sm ${item.concluido ? "line-through text-[var(--color-fg-subtle)]" : ""}`}>{item.texto}</span>
              <button type="button" onClick={() => setChecklist((p) => p.filter((c) => c.id !== item.id))}
                className="text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)]">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={novoItem} onChange={(e) => setNovoItem(e.target.value)}
              placeholder="Adicionar item..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem(); } }} />
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
              <button key={a.min} type="button" onClick={() => toggleNotificacao(a.min)}
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
              { value: "todos", label: "Todos", desc: "Toda a equipe" },
              { value: "gerente", label: "Gerentes", desc: "Gerentes e acima" },
              { value: "tecnico", label: "Técnico", desc: "Só o responsável" },
              { value: "admin", label: "Admin", desc: "Apenas admins" },
            ].map((v) => (
              <button key={v.value} type="button" onClick={() => setVisibilidade(v.value)}
                className={`rounded-[var(--radius-md)] border-2 p-3 text-left transition-colors ${
                  visibilidade === v.value ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                }`}>
                <p className={`text-sm font-semibold ${visibilidade === v.value ? "text-[var(--color-brand-700)]" : ""}`}>{v.label}</p>
                <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{v.desc}</p>
              </button>
            ))}
          </div>
          <input type="hidden" name="visibilidade" value={visibilidade} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" type="button"
            className="text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
            onClick={() => router.push("/agenda")}
          >
            <Trash2 className="size-4" />
            Excluir evento
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" loading={saving}>
              <Save className="size-4" />
              Salvar alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
