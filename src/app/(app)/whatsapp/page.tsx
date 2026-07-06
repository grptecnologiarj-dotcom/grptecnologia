"use client";

import { useState } from "react";
import {
  MessageCircle, Send, Search, Phone, MoreVertical,
  CheckCheck, Clock, Paperclip, Smile
} from "lucide-react";

const contatos = [
  {
    id: "c1",
    nome: "Maria Aparecida Souza",
    telefone: "(11) 98765-4321",
    ultimaMensagem: "Boa tarde! Quando fica pronto o notebook?",
    horario: "14:32",
    naoLidas: 2,
    online: true,
    osNumero: "OS-2026-0042",
  },
  {
    id: "c2",
    nome: "João Pedro Almeida",
    telefone: "(11) 91234-5678",
    ultimaMensagem: "Entendido, aguardo o orçamento. Obrigado!",
    horario: "11:15",
    naoLidas: 0,
    online: false,
    osNumero: "OS-2026-0041",
  },
  {
    id: "c3",
    nome: "Construtora Horizonte Ltda",
    telefone: "(11) 99000-1000",
    ultimaMensagem: "✓ OS-2026-0040 está pronta para retirada",
    horario: "09:00",
    naoLidas: 0,
    online: true,
    osNumero: "OS-2026-0040",
  },
  {
    id: "c4",
    nome: "Padaria Pão Quente",
    telefone: "(11) 2222-3333",
    ultimaMensagem: "Pode confirmar o agendamento da visita?",
    horario: "Ontem",
    naoLidas: 1,
    online: false,
    osNumero: "OS-2026-0037",
  },
];

const mensagensDemoMaria = [
  { id: "m1", de: "cliente", texto: "Olá! Deixei meu notebook ontem pra consertar.", horario: "10:20", lida: true },
  { id: "m2", de: "empresa", texto: "Olá Maria! Recebemos seu notebook. Já estamos fazendo o diagnóstico. Em breve te informamos! 😊", horario: "10:45", lida: true },
  { id: "m3", de: "empresa", texto: "✅ *OS-2026-0042* iniciada! Identificamos um problema no conector de carga (DC Jack). Vamos elaborar o orçamento e enviar em instantes.", horario: "13:00", lida: true },
  { id: "m4", de: "cliente", texto: "Que bom! Fico no aguardo. Tem previsão de quando fica pronto?", horario: "13:10", lida: true },
  { id: "m5", de: "empresa", texto: "A previsão é para amanhã à tarde! O serviço inclui troca do DC Jack e limpeza interna. Valor total: R$ 225,00 (90 dias de garantia). Posso confirmar?", horario: "13:15", lida: true },
  { id: "m6", de: "cliente", texto: "Boa tarde! Quando fica pronto o notebook?", horario: "14:32", lida: false },
];

const templates = [
  "✅ Sua OS foi criada! Número: {numero}. Acompanhe em: {link}",
  "🔧 Diagnóstico concluído. Orçamento: R$ {valor}. Aprovado?",
  "📦 Sua OS está *pronta para retirada*! Atendemos das 8h às 18h.",
  "🚗 Nosso técnico está a caminho. Previsão: {horario}.",
  "⭐ Serviço concluído! Avalie nosso atendimento: {link}",
];

export default function WhatsAppPage() {
  const [contatoAtivo, setContatoAtivo] = useState(contatos[0]);
  const [mensagem, setMensagem] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {/* Coluna esquerda — lista de contatos */}
      <div className="flex w-72 shrink-0 flex-col border-r border-[var(--color-border)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold">WhatsApp</h1>
            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
              <MessageCircle className="size-4" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
            <input
              placeholder="Buscar conversa..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 pl-8 pr-3 text-xs placeholder:text-[var(--color-fg-subtle)] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contatos.map((c) => (
            <button
              key={c.id}
              onClick={() => setContatoAtivo(c)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-muted)] ${
                contatoAtivo.id === c.id ? "bg-[var(--color-brand-50)]" : ""
              }`}
            >
              <div className="relative shrink-0">
                <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-sm font-bold uppercase text-[var(--color-brand-700)]">
                  {c.nome.charAt(0)}
                </div>
                {c.online && (
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-surface)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold">{c.nome}</p>
                  <span className="shrink-0 text-xs text-[var(--color-fg-subtle)]">{c.horario}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="truncate text-xs text-[var(--color-fg-muted)]">{c.ultimaMensagem}</p>
                  {c.naoLidas > 0 && (
                    <span className="ml-2 flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-[10px] font-bold text-white">
                      {c.naoLidas}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coluna direita — chat */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Cabeçalho do chat */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-sm font-bold uppercase text-[var(--color-brand-700)]">
            {contatoAtivo.nome.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{contatoAtivo.nome}</p>
            <p className="text-xs text-[var(--color-fg-muted)]">{contatoAtivo.telefone} · {contatoAtivo.osNumero}</p>
          </div>
          <div className="flex gap-1">
            <button className="rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-surface-muted)] transition-colors">
              <Phone className="size-4 text-[var(--color-fg-muted)]" />
            </button>
            <button className="rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-surface-muted)] transition-colors">
              <MoreVertical className="size-4 text-[var(--color-fg-muted)]" />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[var(--color-surface-muted)]/30">
          {mensagensDemoMaria.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.de === "empresa" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  msg.de === "empresa"
                    ? "rounded-br-sm bg-[var(--color-brand-600)] text-white"
                    : "rounded-bl-sm bg-[var(--color-surface)] border border-[var(--color-border)]"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
                <div className={`mt-1 flex items-center justify-end gap-1 ${msg.de === "empresa" ? "text-white/70" : "text-[var(--color-fg-subtle)]"}`}>
                  <span className="text-[10px]">{msg.horario}</span>
                  {msg.de === "empresa" && (
                    msg.lida
                      ? <CheckCheck className="size-3 text-white/90" />
                      : <Clock className="size-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-[var(--color-fg-muted)]">Mensagens rápidas</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setMensagem(t); setShowTemplates(false); }}
                  className="rounded-[var(--radius-md)] border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-3 py-1.5 text-xs text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] transition-colors text-left"
                >
                  {t.slice(0, 50)}…
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 flex items-end gap-2">
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="rounded-[var(--radius-md)] p-2 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors shrink-0"
            title="Mensagens rápidas"
          >
            <Smile className="size-5" />
          </button>
          <button className="rounded-[var(--radius-md)] p-2 text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] transition-colors shrink-0">
            <Paperclip className="size-5" />
          </button>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite uma mensagem..."
            rows={1}
            className="flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] max-h-24"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setMensagem("");
              }
            }}
          />
          <button
            disabled={!mensagem.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
