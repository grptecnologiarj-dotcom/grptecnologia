import { Search, ClipboardList, Users, Package, Wallet, Monitor, ChevronRight, SearchX } from "lucide-react";
import Link from "next/link";
import { demoOS, demoClientes, demoProdutos, demoTransacoes } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/auth";
import { buscarGlobalAction } from "@/lib/actions/busca";

export const metadata = { title: "Busca Global — DeskControl" };

interface SearchResult {
  tipo: "os" | "cliente" | "estoque" | "financeiro" | "equipamento";
  id: string;
  titulo: string;
  subtitulo: string;
  href: string;
  extra?: string;
}

function buscarTudo(q: string): SearchResult[] {
  const termo = q.toLowerCase().trim();
  if (!termo) return [];

  const resultados: SearchResult[] = [];

  // Ordens de Serviço
  for (const os of demoOS) {
    const match =
      (os as any).numero?.toLowerCase().includes(termo) ||
      (os as any).problema?.toLowerCase().includes(termo) ||
      (os as any).clientes?.nome?.toLowerCase().includes(termo);
    if (match) {
      resultados.push({
        tipo: "os",
        id: (os as any).id,
        titulo: (os as any).numero,
        subtitulo: (os as any).clientes?.nome ?? "—",
        href: `/os/${(os as any).id}`,
        extra: (os as any).status,
      });
    }
  }

  // Clientes
  for (const cli of demoClientes) {
    const match =
      (cli as any).nome?.toLowerCase().includes(termo) ||
      (cli as any).email?.toLowerCase().includes(termo) ||
      (cli as any).telefone?.includes(termo);
    if (match) {
      resultados.push({
        tipo: "cliente",
        id: (cli as any).id,
        titulo: (cli as any).nome,
        subtitulo: (cli as any).email ?? (cli as any).telefone ?? "",
        href: `/clientes/${(cli as any).id}`,
      });
    }
  }

  // Estoque
  for (const prod of demoProdutos) {
    const match =
      (prod as any).nome?.toLowerCase().includes(termo) ||
      (prod as any).categoria?.toLowerCase().includes(termo) ||
      (prod as any).codigo?.toLowerCase().includes(termo);
    if (match) {
      resultados.push({
        tipo: "estoque",
        id: (prod as any).id,
        titulo: (prod as any).nome,
        subtitulo: (prod as any).categoria ?? "",
        href: `/estoque/${(prod as any).id}`,
        extra: formatCurrency((prod as any).preco_venda ?? 0),
      });
    }
  }

  // Financeiro
  for (const tx of demoTransacoes) {
    const match =
      (tx as any).descricao?.toLowerCase().includes(termo) ||
      (tx as any).categoria?.toLowerCase().includes(termo);
    if (match) {
      resultados.push({
        tipo: "financeiro",
        id: (tx as any).id,
        titulo: (tx as any).descricao,
        subtitulo: (tx as any).categoria ?? "",
        href: `/financeiro/${(tx as any).id}`,
        extra: formatCurrency((tx as any).valor ?? 0),
      });
    }
  }

  return resultados;
}

const tipoConfig = {
  os: { label: "Ordens de Serviço", icon: ClipboardList, color: "var(--color-brand-600)", bg: "var(--color-brand-50)" },
  cliente: { label: "Clientes", icon: Users, color: "var(--color-success)", bg: "var(--color-success-bg)" },
  estoque: { label: "Estoque", icon: Package, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  financeiro: { label: "Financeiro", icon: Wallet, color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  equipamento: { label: "Equipamentos", icon: Monitor, color: "var(--color-info)", bg: "var(--color-info-bg)" },
};

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";

  let resultados: SearchResult[];
  if (isSupabaseConfigured() && query.trim()) {
    const { data } = await buscarGlobalAction(query);
    resultados = data;
  } else {
    resultados = buscarTudo(query);
  }

  const grupos = (Object.keys(tipoConfig) as Array<keyof typeof tipoConfig>)
    .map((tipo) => ({
      tipo,
      cfg: tipoConfig[tipo],
      items: resultados.filter((r) => r.tipo === tipo),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Busca global</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">Pesquise OS, clientes, estoque e transações de uma só vez</p>
      </div>

      {/* Campo de busca interativo — via GET form para SSR */}
      <form method="GET" action="/busca" className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
        <input
          name="q"
          type="text"
          defaultValue={query}
          autoFocus
          placeholder="Buscar em todo o sistema..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-3 pl-9 pr-4 text-sm placeholder:text-[var(--color-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] shadow-sm"
        />
      </form>

      {/* Resultados */}
      {!query ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <Search className="mx-auto mb-3 size-10 text-[var(--color-fg-subtle)]" />
          <p className="font-semibold">Digite algo para buscar</p>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Pesquise por número de OS, nome de cliente, peça ou descrição de transação.
          </p>
        </div>
      ) : resultados.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <SearchX className="mx-auto mb-3 size-10 text-[var(--color-fg-subtle)]" />
          <p className="font-semibold">Nenhum resultado para &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Verifique a ortografia ou tente termos mais simples.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-[var(--color-fg-muted)]">
            <strong>{resultados.length}</strong> resultado{resultados.length !== 1 ? "s" : ""} para &ldquo;{query}&rdquo;
          </p>
          {grupos.map(({ tipo, cfg, items }) => (
            <div key={tipo}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex size-6 items-center justify-center rounded"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  <cfg.icon className="size-3.5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
                  {cfg.label} ({items.length})
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)] overflow-hidden shadow-sm">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-muted)] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--color-brand-700)]">{item.titulo}</p>
                      <p className="text-xs text-[var(--color-fg-muted)] truncate">{item.subtitulo}</p>
                    </div>
                    {item.extra && (
                      <span className="text-xs text-[var(--color-fg-subtle)] shrink-0">{item.extra}</span>
                    )}
                    <ChevronRight className="size-4 shrink-0 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-brand-600)]" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
