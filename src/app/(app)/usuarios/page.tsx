import Link from "next/link";
import { Plus, Search, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { demoUsuarios, roleConfig } from "@/lib/demo-data";

export const metadata = { title: "Usuários — DeskControl" };

export default function UsuariosPage() {
  const ativos = demoUsuarios.filter((u) => u.status === "ativo").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {ativos} usuários ativos de {demoUsuarios.length} cadastrados
          </p>
        </div>
        <Button asChild>
          <Link href="/usuarios/novo">
            <Plus className="size-4" />
            Convidar usuário
          </Link>
        </Button>
      </div>

      {/* Cards de papéis */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { role: "admin", count: demoUsuarios.filter((u) => u.role === "admin").length },
          { role: "tecnico", count: demoUsuarios.filter((u) => u.role === "tecnico").length },
          { role: "atendente", count: demoUsuarios.filter((u) => u.role === "atendente").length },
          { role: "financeiro", count: demoUsuarios.filter((u) => u.role === "financeiro").length },
        ].map(({ role, count }) => {
          const cfg = roleConfig[role];
          return (
            <div
              key={role}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <input
          placeholder="Buscar por nome ou e-mail..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Usuário</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Papel</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">OS atribuídas</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] lg:table-cell">Último acesso</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {demoUsuarios.map((usr) => {
                const roleCfg = roleConfig[usr.role] ?? roleConfig.atendente;
                return (
                  <tr key={usr.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3">
                      <Link href={`/usuarios/${usr.id}`} className="flex items-center gap-3 group">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-sm font-bold uppercase text-[var(--color-brand-700)]">
                          {usr.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-[var(--color-brand-600)] transition-colors">{usr.nome}</p>
                          <p className="text-xs text-[var(--color-fg-muted)]">{usr.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}
                      >
                        {roleCfg.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        {usr.status === "ativo" ? (
                          <UserCheck className="size-3.5 text-[var(--color-success)]" />
                        ) : (
                          <UserX className="size-3.5 text-[var(--color-fg-subtle)]" />
                        )}
                        <span className={usr.status === "ativo" ? "text-[var(--color-success)]" : "text-[var(--color-fg-subtle)]"}>
                          {usr.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                      {usr.totalOs > 0 ? <span className="font-semibold">{usr.totalOs}</span> : <span className="text-[var(--color-fg-subtle)]">—</span>}
                    </td>
                    <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] lg:table-cell">
                      {formatDate(usr.ultimoAcesso)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/usuarios/${usr.id}`}
                        className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--color-surface-muted)] transition-colors">
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
