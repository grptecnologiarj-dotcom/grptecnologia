import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Laptop, Wrench, Calendar, FileText,
  Hash, Palette, Info, Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/auth";
import { buscarEquipamentoAction } from "@/lib/actions/equipamentos";
import { demoEquipamentos, demoOS, statusOSConfig } from "@/lib/demo-data";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Equipamento #${id.slice(0, 6)}` };
}

export default async function EquipamentoDetalhePage({ params }: Props) {
  const { id } = await params;

  let equip: any;
  let osDoEquipamento: { id: string; numero: string; status: string; clienteNome: string; valorTotal: number; dataAbertura: string }[];

  if (isSupabaseConfigured()) {
    const result = await buscarEquipamentoAction(id);
    if (!result.data) return notFound();
    const d = result.data as any;
    equip = {
      id: d.id,
      nome: d.nome,
      tipo: d.categoria ?? null,
      marca: d.marca ?? null,
      modelo: d.modelo ?? null,
      numero_serie: d.numero_serie ?? null,
      imei: d.imei ?? null,
      cor: d.cor ?? null,
      observacoes: d.observacoes ?? null,
      clienteId: d.clientes?.id ?? null,
      clienteNome: d.clientes?.nome ?? "Sem cliente",
      createdAt: d.created_at ?? null,
    };
    osDoEquipamento = ((d.ordens_servico ?? []) as any[])
      .sort((a, b) => (b.data_abertura ?? "").localeCompare(a.data_abertura ?? ""))
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        numero: o.numero,
        status: o.status,
        clienteNome: d.clientes?.nome ?? "—",
        valorTotal: Number(o.valor_total ?? 0),
        dataAbertura: o.data_abertura,
      }));
  } else {
    equip = demoEquipamentos.find((e) => e.id === id) ?? demoEquipamentos[0];
    osDoEquipamento = demoOS
      .filter((o) => o.equipamentoNome?.toLowerCase().includes(equip!.nome.split(" ")[0].toLowerCase()))
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        numero: o.numero,
        status: o.status,
        clienteNome: o.clienteNome,
        valorTotal: o.valorTotal,
        dataAbertura: o.dataAbertura,
      }));
  }

  if (!equip) notFound();

  const infoItems = [
    { label: "Tipo", value: (equip as any).tipo, icon: Laptop },
    { label: "Marca", value: equip.marca, icon: Info },
    { label: "Modelo", value: equip.modelo, icon: Info },
    { label: "Número de série", value: equip.numero_serie, icon: Hash },
    { label: "IMEI", value: equip.imei, icon: Hash },
    { label: "Cor", value: equip.cor, icon: Palette },
    { label: "Ano", value: (equip as any).ano?.toString(), icon: Calendar },
    { label: "Condição", value: (equip as any).condicao, icon: Info },
  ].filter((i) => i.value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/equipamentos"
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
                <Laptop className="size-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">{equip.nome}</h1>
            </div>
            <p className="mt-0.5 ml-11 text-sm text-[var(--color-fg-muted)]">
              Proprietário:{" "}
              <Link href={`/clientes/${equip.clienteId}`} className="font-medium text-[var(--color-brand-600)] hover:underline">
                {equip.clienteNome}
              </Link>
              {(equip as any).createdAt && ` · Cadastrado em ${formatDate((equip as any).createdAt)}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/equipamentos/${equip.id}/editar`}>
              <Edit className="size-4" />
              Editar
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/os/nova?equipamento_id=${equip.id}`}>
              <Wrench className="size-4" />
              Nova OS
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Detalhes */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Informações do equipamento</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
                    <item.icon className="size-3.5 text-[var(--color-fg-subtle)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-fg-subtle)]">{item.label}</p>
                    <p className="text-sm font-medium font-mono">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {(equip as any).acessorios && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <p className="text-xs text-[var(--color-fg-subtle)] mb-1">Acessórios</p>
                <p className="text-sm">{(equip as any).acessorios}</p>
              </div>
            )}
            {(equip as any).observacoes && (
              <div className="mt-3">
                <p className="text-xs text-[var(--color-fg-subtle)] mb-1">Observações</p>
                <p className="text-sm leading-relaxed">{(equip as any).observacoes}</p>
              </div>
            )}
          </div>

          {/* Histórico de OS */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-semibold">Histórico de ordens de serviço</h2>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/os/nova?equipamento_id=${equip.id}`}>
                  <FileText className="size-4" />
                  Nova OS
                </Link>
              </Button>
            </div>
            {osDoEquipamento.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <Wrench className="size-8 text-[var(--color-fg-subtle)]" />
                <p className="text-sm text-[var(--color-fg-muted)]">Nenhuma OS registrada para este equipamento.</p>
                <Button size="sm" asChild>
                  <Link href={`/os/nova?equipamento_id=${equip.id}`}>Criar primeira OS</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {osDoEquipamento.map((os) => {
                  const cfg = statusOSConfig[os.status as keyof typeof statusOSConfig] ?? { label: os.status, color: "#6b7280", bg: "#f3f4f6" };
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
                        <p className="mt-0.5 text-xs text-[var(--color-fg-muted)] truncate">{os.clienteNome}</p>
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
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4">
          {/* Cliente */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">
              Proprietário
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-sm font-bold uppercase">
                {equip.clienteNome.charAt(0)}
              </div>
              <div>
                <Link href={`/clientes/${equip.clienteId}`}
                  className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline">
                  {equip.clienteNome}
                </Link>
                <p className="text-xs text-[var(--color-fg-muted)]">Ver perfil completo →</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">
              Estatísticas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Total de OS</span>
                <span className="font-bold">{osDoEquipamento.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Total gasto</span>
                <span className="font-bold">{formatCurrency(osDoEquipamento.reduce((s, o) => s + o.valorTotal, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-fg-muted)]">Última OS</span>
                <span className="font-bold text-xs">
                  {osDoEquipamento.length > 0 ? formatDate(osDoEquipamento[0].dataAbertura) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline de vida */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">
              Linha do tempo
            </h3>
            <div className="space-y-3">
              {[
                { label: "Cadastrado", date: (equip as any).createdAt ?? "2024-01-10", color: "var(--color-brand-500)" },
                ...osDoEquipamento.map((o) => ({
                  label: `OS ${o.numero}`,
                  date: o.dataAbertura,
                  color: (statusOSConfig[o.status as keyof typeof statusOSConfig] ?? { color: "#6b7280" }).color,
                })),
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 flex justify-between">
                    <span className="text-xs">{e.label}</span>
                    <span className="text-xs text-[var(--color-fg-subtle)]">{formatDate(e.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
