import Link from "next/link";
import {
  Building2, Users, ClipboardList, TrendingUp, DollarSign,
  ShieldCheck, AlertCircle, CheckCircle2, Clock, ExternalLink,
  Wrench,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Super Admin — DeskControl · GRP Tecnologia" };

const tenants = [
  {
    id: "t1", nome: "TechRepair Assistência", slug: "techrepair", plano: "pro",
    status: "trial", diasTrial: 8,
    usuarios: 5, totalOs: 42, osAtivas: 6,
    mrr: 149, ultimoAcesso: "há 2 horas",
    cidade: "São Paulo, SP",
  },
  {
    id: "t2", nome: "InfoFix Computadores", slug: "infofix", plano: "starter",
    status: "ativo", diasTrial: null,
    usuarios: 2, totalOs: 198, osAtivas: 3,
    mrr: 79, ultimoAcesso: "há 30 min",
    cidade: "Campinas, SP",
  },
  {
    id: "t3", nome: "CelFone Service", slug: "celfone", plano: "business",
    status: "ativo", diasTrial: null,
    usuarios: 9, totalOs: 1240, osAtivas: 21,
    mrr: 299, ultimoAcesso: "há 5 min",
    cidade: "Belo Horizonte, MG",
  },
  {
    id: "t4", nome: "Eletro Reparo Ltda", slug: "eletroreparo", plano: "pro",
    status: "ativo", diasTrial: null,
    usuarios: 4, totalOs: 312, osAtivas: 8,
    mrr: 149, ultimoAcesso: "há 2 dias",
    cidade: "Curitiba, PR",
  },
  {
    id: "t5", nome: "Suporte Plus", slug: "suporteplus", plano: "starter",
    status: "inadimplente", diasTrial: null,
    usuarios: 1, totalOs: 45, osAtivas: 0,
    mrr: 79, ultimoAcesso: "há 15 dias",
    cidade: "Porto Alegre, RS",
  },
  {
    id: "t6", nome: "Tec Vision CFTV", slug: "tecvision", plano: "pro",
    status: "trial", diasTrial: 3,
    usuarios: 3, totalOs: 8, osAtivas: 2,
    mrr: 149, ultimoAcesso: "há 1 hora",
    cidade: "Recife, PE",
  },
];

const mrrTotal = tenants.filter((t) => t.status === "ativo").reduce((s, t) => s + t.mrr, 0);
const totalEmpresasAtivas = tenants.filter((t) => t.status === "ativo").length;
const totalTrials = tenants.filter((t) => t.status === "trial").length;
const totalOs = tenants.reduce((s, t) => s + t.totalOs, 0);

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  ativo: { label: "Ativo", color: "var(--color-success)", bg: "var(--color-success-bg)", icon: CheckCircle2 },
  trial: { label: "Trial", color: "var(--color-warning)", bg: "var(--color-warning-bg)", icon: Clock },
  inadimplente: { label: "Inadimplente", color: "var(--color-danger)", bg: "var(--color-danger-bg)", icon: AlertCircle },
  cancelado: { label: "Cancelado", color: "var(--color-fg-subtle)", bg: "var(--color-surface-muted)", icon: AlertCircle },
};

const planoConfig: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "var(--color-fg-muted)" },
  pro: { label: "Pro", color: "var(--color-brand-600)" },
  business: { label: "Business", color: "var(--color-success)" },
  enterprise: { label: "Enterprise", color: "var(--color-warning)" },
};

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white">
              <Wrench className="size-5" />
            </div>
            <div>
              <p className="text-sm font-black">DeskControl</p>
              <p className="text-xs text-[var(--color-fg-muted)]">Super Admin · GRP Tecnologia</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[var(--color-danger-bg)] px-3 py-1 text-xs font-bold text-[var(--color-danger)]">
              SUPER ADMIN
            </span>
            <Link href="/dashboard" className="text-xs text-[var(--color-brand-600)] hover:underline flex items-center gap-1">
              <ExternalLink className="size-3" />
              Entrar como empresa
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div>
          <h1 className="text-2xl font-bold">Painel de controle global</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Gerencie todos os tenants da plataforma DeskControl</p>
        </div>

        {/* KPIs globais */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "MRR total", value: formatCurrency(mrrTotal), icon: DollarSign, color: "var(--color-success)", bg: "var(--color-success-bg)", hint: `ARR: ${formatCurrency(mrrTotal * 12)}` },
            { label: "Empresas ativas", value: String(totalEmpresasAtivas), icon: Building2, color: "var(--color-brand-600)", bg: "var(--color-brand-50)", hint: `${totalTrials} em trial` },
            { label: "Total de OS", value: String(totalOs.toLocaleString("pt-BR")), icon: ClipboardList, color: "var(--color-info)", bg: "var(--color-info-bg)", hint: `${tenants.reduce((s, t) => s + t.osAtivas, 0)} ativas agora` },
            { label: "Usuários totais", value: String(tenants.reduce((s, t) => s + t.usuarios, 0)), icon: Users, color: "var(--color-warning)", bg: "var(--color-warning-bg)", hint: "em todas as empresas" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)]" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon className="size-5" style={{ color: kpi.color }} />
              </div>
              <p className="mt-4 text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm text-[var(--color-fg-muted)]">{kpi.label}</p>
              <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">{kpi.hint}</p>
            </div>
          ))}
        </div>

        {/* Alertas */}
        {tenants.some((t) => t.status === "inadimplente" || (t.status === "trial" && (t.diasTrial ?? 99) <= 3)) && (
          <div className="space-y-2">
            {tenants.filter((t) => t.status === "inadimplente").map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-5 py-3">
                <AlertCircle className="size-4 text-[var(--color-danger)] shrink-0" />
                <p className="text-sm font-medium text-[var(--color-danger)]">
                  <strong>{t.nome}</strong> está inadimplente há mais de 15 dias. Considere suspender o acesso.
                </p>
              </div>
            ))}
            {tenants.filter((t) => t.status === "trial" && (t.diasTrial ?? 99) <= 3).map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-5 py-3">
                <Clock className="size-4 text-[var(--color-warning)] shrink-0" />
                <p className="text-sm font-medium text-[var(--color-warning)]">
                  <strong>{t.nome}</strong> tem trial expirando em <strong>{t.diasTrial} dias</strong>. Enviar oferta de conversão.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tabela de tenants */}
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="font-semibold">Empresas cadastradas</h2>
            <button className="rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-brand-700)] transition-colors">
              + Nova empresa
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Empresa</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] md:table-cell">Plano</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)]">Status</th>
                  <th className="hidden px-4 py-3 text-center font-semibold text-[var(--color-fg-muted)] sm:table-cell">Usuários</th>
                  <th className="hidden px-4 py-3 text-center font-semibold text-[var(--color-fg-muted)] lg:table-cell">OS totais</th>
                  <th className="hidden px-4 py-3 text-center font-semibold text-[var(--color-fg-muted)] lg:table-cell">OS ativas</th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">MRR</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-[var(--color-fg-muted)] xl:table-cell">Último acesso</th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-fg-muted)]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {tenants.map((t) => {
                  const stCfg = statusConfig[t.status];
                  const plCfg = planoConfig[t.plano];
                  const StatusIcon = stCfg.icon;
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-100)] text-sm font-bold text-[var(--color-brand-700)]">
                            {t.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{t.nome}</p>
                            <p className="text-xs text-[var(--color-fg-subtle)]">{t.cidade}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-sm font-semibold" style={{ color: plCfg.color }}>{plCfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className="size-3.5" style={{ color: stCfg.color }} />
                          <span className="text-xs font-medium" style={{ color: stCfg.color }}>
                            {stCfg.label}
                            {t.status === "trial" && t.diasTrial && ` (${t.diasTrial}d)`}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-center sm:table-cell">{t.usuarios}</td>
                      <td className="hidden px-4 py-3 text-center lg:table-cell">{t.totalOs}</td>
                      <td className="hidden px-4 py-3 text-center lg:table-cell">
                        {t.osAtivas > 0 ? <span className="font-semibold text-[var(--color-brand-600)]">{t.osAtivas}</span> : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {t.status === "ativo" ? formatCurrency(t.mrr) : <span className="text-[var(--color-fg-subtle)]">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--color-fg-subtle)] xl:table-cell text-xs">{t.ultimoAcesso}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="rounded px-2 py-1 text-xs border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors">
                            Entrar
                          </button>
                          <button className="rounded px-2 py-1 text-xs border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors">
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                <tr>
                  <td colSpan={6} className="px-4 py-3 font-semibold">MRR Total (empresas ativas)</td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--color-success)]">{formatCurrency(mrrTotal)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Saúde da plataforma */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Distribuição por plano</h3>
            <div className="space-y-3">
              {Object.entries(planoConfig).map(([plano, cfg]) => {
                const count = tenants.filter((t) => t.plano === plano).length;
                if (!count) return null;
                return (
                  <div key={plano} className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Status das assinaturas</h3>
            <div className="space-y-3">
              {Object.entries(statusConfig).map(([status, cfg]) => {
                const count = tenants.filter((t) => t.status === status).length;
                const StatusIcon = cfg.icon;
                if (!count) return null;
                return (
                  <div key={status} className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="size-4" style={{ color: cfg.color }} />
                      <span className="text-sm">{cfg.label}</span>
                    </div>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Projeção mensal</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-muted)]">MRR atual</span>
                <span className="font-bold">{formatCurrency(mrrTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-muted)]">Se trials converterem</span>
                <span className="font-bold text-[var(--color-success)]">
                  {formatCurrency(mrrTotal + tenants.filter((t) => t.status === "trial").reduce((s, t) => s + t.mrr, 0))}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                <span className="text-[var(--color-fg-muted)]">ARR projetado</span>
                <span className="font-bold">{formatCurrency(mrrTotal * 12)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-[var(--color-fg-subtle)] pb-4">
          Desenvolvido por{" "}
          <span className="font-semibold text-[var(--color-brand-600)]">GRP Tecnologia</span>
          {" "}· DeskControl Super Admin · Acesso restrito
        </div>
      </main>
    </div>
  );
}
