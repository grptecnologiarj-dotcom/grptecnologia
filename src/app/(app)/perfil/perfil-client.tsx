"use client";

import { useState, useTransition } from "react";
import { Save, User, Lock, Bell, LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { logoutAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { atualizarPerfilAction, alterarSenhaAction } from "@/lib/actions/empresa";

interface PerfilData {
  nome: string;
  email: string;
  telefone?: string | null;
  bio?: string | null;
  role: string;
  isSupabase: boolean;
}

const abas = [
  { id: "dados", label: "Dados pessoais", icon: User },
  { id: "senha", label: "Senha", icon: Lock },
  { id: "notificacoes", label: "Notificações", icon: Bell },
];

const selectCls =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]";

export function PerfilClient({ perfil }: { perfil: PerfilData }) {
  const [abaAtiva, setAbaAtiva] = useState("dados");
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSenha, startSenha] = useTransition();

  function handleSaveDados(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!perfil.isSupabase) {
      success("Salvo (demo)", "Em produção os dados serão persistidos no banco.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await atualizarPerfilAction(fd);
      if (result?.error) toastError("Erro", result.error);
      else success("Perfil atualizado", "Suas informações foram salvas com sucesso.");
    });
  }

  function handleSaveSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!perfil.isSupabase) {
      success("Salvo (demo)", "Em produção a senha seria alterada.");
      return;
    }
    const form = e.currentTarget;
    const nova = (form.elements.namedItem("nova_senha") as HTMLInputElement).value;
    const confirma = (form.elements.namedItem("confirmar_senha") as HTMLInputElement).value;
    if (nova !== confirma) {
      toastError("Erro", "As senhas não coincidem.");
      return;
    }
    const fd = new FormData();
    fd.set("senha", nova);
    fd.set("confirma", confirma);
    startSenha(async () => {
      const result = await alterarSenhaAction(fd);
      if (result?.error) toastError("Erro", result.error);
      else success("Senha alterada", "Sua senha foi atualizada com sucesso.");
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">Gerencie suas informações e preferências de conta</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-3xl font-bold uppercase select-none">
            {perfil.nome.charAt(0)}
          </div>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] transition-colors"
          >
            <Camera className="size-3.5" />
          </button>
        </div>
        <div>
          <p className="text-lg font-bold">{perfil.nome}</p>
          <p className="text-sm text-[var(--color-fg-muted)]">{perfil.email}</p>
          <span className="mt-1 inline-block rounded-full bg-[var(--color-brand-50)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-brand-700)] capitalize">
            {perfil.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              abaAtiva === aba.id
                ? "border-[var(--color-brand-600)] text-[var(--color-brand-600)]"
                : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            }`}
          >
            <aba.icon className="size-4" />
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === "dados" && (
        <form onSubmit={handleSaveDados} className="space-y-5">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
            <FormField label="Nome completo" required>
              <Input name="nome" defaultValue={perfil.nome} required />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="E-mail" required>
                <Input name="email" type="email" defaultValue={perfil.email} required disabled />
              </FormField>
              <FormField label="Telefone">
                <Input name="telefone" defaultValue={perfil.telefone ?? ""} placeholder="(11) 99999-0000" />
              </FormField>
            </div>
            <FormField label="Bio">
              <textarea
                name="bio"
                rows={2}
                defaultValue={perfil.bio ?? ""}
                placeholder="Breve descrição sobre você..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none"
              />
            </FormField>
            <FormField label="Fuso horário">
              <select name="timezone" defaultValue="America/Sao_Paulo" className={selectCls}>
                <option value="America/Sao_Paulo">América/São Paulo (UTC−3)</option>
                <option value="America/Manaus">América/Manaus (UTC−4)</option>
                <option value="America/Belem">América/Belém (UTC−3)</option>
                <option value="America/Fortaleza">América/Fortaleza (UTC−3)</option>
              </select>
            </FormField>
          </div>
          <div className="flex items-center justify-between gap-3">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] border border-[var(--color-border)] hover:border-[var(--color-danger)] transition-colors"
              >
                <LogOut className="size-4" />
                Sair da conta
              </button>
            </form>
            <Button type="submit" loading={isPending}>
              <Save className="size-4" />
              Salvar alterações
            </Button>
          </div>
        </form>
      )}

      {abaAtiva === "senha" && (
        <form onSubmit={handleSaveSenha} className="space-y-5">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-4">
            <FormField label="Nova senha" required>
              <Input name="nova_senha" type="password" placeholder="••••••••" autoComplete="new-password" required />
            </FormField>
            <FormField label="Confirmar nova senha" required>
              <Input name="confirmar_senha" type="password" placeholder="••••••••" autoComplete="new-password" required />
            </FormField>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3 text-xs text-[var(--color-fg-muted)] space-y-1">
              <p className="font-semibold text-[var(--color-fg)]">Requisitos da senha:</p>
              <p>• Mínimo de 8 caracteres</p>
              <p>• Pelo menos uma letra maiúscula e um número</p>
              <p>• Pelo menos um caractere especial (!@#$%...)</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSenha}>
              <Lock className="size-4" />
              Alterar senha
            </Button>
          </div>
        </form>
      )}

      {abaAtiva === "notificacoes" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            success("Preferências salvas", "Configurações de notificação atualizadas.");
          }}
          className="space-y-5"
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-1">
            {[
              { id: "os_abertura", label: "Nova OS criada", desc: "Quando uma OS é aberta no sistema" },
              { id: "os_pronta", label: "OS pronta para retirada", desc: "Quando o técnico marca como pronta" },
              { id: "os_atraso", label: "OS com atraso", desc: "Quando uma OS ultrapassa a data prevista" },
              { id: "orcamento_aprovado", label: "Orçamento aprovado", desc: "Quando o cliente aprova um orçamento" },
              { id: "pagamento_recebido", label: "Pagamento confirmado", desc: "Quando uma transação é marcada como paga" },
              { id: "estoque_baixo", label: "Estoque crítico", desc: "Quando um produto fica abaixo do mínimo" },
              { id: "mensagem_whatsapp", label: "Nova mensagem WhatsApp", desc: "Quando um cliente envia mensagem" },
            ].map((item, i) => (
              <div key={item.id}>
                {i > 0 && <div className="my-3 h-px bg-[var(--color-border)]" />}
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-[var(--color-fg-muted)]">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" id={item.id} />
                    <label
                      htmlFor={item.id}
                      className="flex h-5 w-9 cursor-pointer rounded-full bg-[var(--color-border)] transition-colors peer-checked:bg-[var(--color-brand-600)] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              <Save className="size-4" />
              Salvar preferências
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
