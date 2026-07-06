import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Shield, Calendar, Wrench, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { demoUsuarios, demoOS, roleConfig, statusOSConfig } from "@/lib/demo-data";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Usuário #${id.slice(0, 6)}` };
}

export default async function UsuarioDetalhePage({ params }: Props) {
  const { id } = await params;

  let usuario: (typeof demoUsuarios)[0] | undefined;

  if (isSupabaseConfigured()) {
    usuario = demoUsuarios.find((u) => u.id === id) ?? demoUsuarios[0];
  } else {
    usuario = demoUsuarios.find((u) => u.id === id) ?? demoUsuarios[0];
  }

  if (!usuario) notFound();

  const roleCfg = roleConfig[usuario.role];
  const isAtivo = (usuario as any).ativo ?? (usuario as any).status === "ativo";

  // OS atribuídas ao técnico
  const osDoTecnico = demoOS.filter((o) => o.tecnicoNome === usuario.nome).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/usuarios"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-xl font-bold uppercase">
              {usuario.nome.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{usuario.nome}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: roleCfg?.bg, color: roleCfg?.color }}
                >
                  <Shield className="size-3" />
                  {roleCfg?.label ?? usuario.role}
                </span>
                <span className={`text-xs font-semibold ${isAtivo ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                  {isAtivo ? "● Ativo" : "● Inativo"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/usuarios/${usuario.id}/editar`}>
            <Edit className="size-4" />
            Editar usuário
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dados pessoais */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Informações</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: User, label: "Nome completo", value: usuario.nome },
                { icon: Mail, label: "E-mail", value: usuario.email },
                { icon: Phone, label: "Telefone", value: usuario.telefone ?? "—" },
                { icon: Shield, label: "Perfil", value: roleCfg?.label ?? usuario.role },
                { icon: Calendar, label: "Desde", value: formatDate(usuario.createdAt) },
                { icon: Calendar, label: "Último acesso", value: usuario.ultimoAcesso ? formatDate(usuario.ultimoAcesso) : "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
                    <item.icon className="size-3.5 text-[var(--color-fg-subtle)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-fg-subtle)]">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OS atribuídas */}
          {(usuario.role === "tecnico" || usuario.role === "admin") && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
              <div className="border-b border-[var(--color-border)] px-5 py-4">
                <h2 className="font-semibold">OS atribuídas</h2>
              </div>
              {osDoTecnico.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <Wrench className="size-8 text-[var(--color-fg-subtle)]" />
                  <p className="text-sm text-[var(--color-fg-muted)]">Nenhuma OS atribuída a este técnico.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {osDoTecnico.map((os) => {
                    const cfg = statusOSConfig[os.status];
                    return (
                      <Link
                        key={os.id}
                        href={`/os/${os.id}`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-surface-muted)] transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">{os.numero}</span>
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--color-fg-muted)] truncate">
                            {os.clienteNome} · {os.equipamentoNome}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">{formatCurrency(os.valorTotal)}</p>
                          <p className="text-xs text-[var(--color-fg-subtle)]">{formatDate(os.dataAbertura)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4">
          {/* Permissões */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Permissões</h3>
            <div className="space-y-2">
              {[
                { label: "Ver OS", ok: true },
                { label: "Criar OS", ok: ["admin", "atendente", "gerente"].includes(usuario.role) },
                { label: "Editar OS", ok: ["admin", "tecnico", "gerente"].includes(usuario.role) },
                { label: "Financeiro", ok: ["admin", "financeiro", "gerente"].includes(usuario.role) },
                { label: "Configurações", ok: ["admin", "super_admin"].includes(usuario.role) },
                { label: "Gerenciar usuários", ok: ["admin", "super_admin"].includes(usuario.role) },
              ].map((perm) => (
                <div key={perm.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-fg-muted)]">{perm.label}</span>
                  <span className={`text-xs font-semibold ${perm.ok ? "text-[var(--color-success)]" : "text-[var(--color-fg-subtle)]"}`}>
                    {perm.ok ? "✓ Sim" : "— Não"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Estatísticas</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">OS em aberto</span>
                <span className="font-bold">{osDoTecnico.filter((o) => o.status !== "entregue").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">OS concluídas</span>
                <span className="font-bold">{osDoTecnico.filter((o) => o.status === "entregue").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Total produzido</span>
                <span className="font-bold">{formatCurrency(osDoTecnico.reduce((s, o) => s + o.valorTotal, 0))}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">Ações</h3>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Reenviar convite por e-mail
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Redefinir senha
            </Button>
            <Button variant="outline" size="sm"
              className="w-full justify-start text-[var(--color-danger)] hover:border-[var(--color-danger)]">
              {isAtivo ? "Desativar usuário" : "Reativar usuário"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
