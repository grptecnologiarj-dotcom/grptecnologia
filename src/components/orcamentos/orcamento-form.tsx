"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { demoProdutos } from "@/lib/demo-data";
import { criarOrcamentoAction } from "@/lib/actions/orcamentos";
import { formatCurrency } from "@/lib/utils";

interface ClienteOption {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
}

type ItemLinha = {
  id: string;
  descricao: string;
  tipo: "peca" | "servico";
  quantidade: number;
  valorUnitario: number;
};

let _itemCounter = 1;

export function OrcamentoForm({ clientes, isSupabase }: { clientes: ClienteOption[]; isSupabase: boolean }) {
  const router = useRouter();
  const [saving, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  // Cliente
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<{ id: string; nome: string; email?: string; telefone?: string } | null>(null);
  const [showClientes, setShowClientes] = useState(false);

  // Itens
  const [itens, setItens] = useState<ItemLinha[]>([
    { id: "1", descricao: "", tipo: "servico", quantidade: 1, valorUnitario: 0 },
  ]);

  // Busca produto
  const [buscaProduto, setBuscaProduto] = useState<string | null>(null);
  const [buscaProdutoQuery, setBuscaProdutoQuery] = useState("");

  const sugestoesCliente = buscaCliente.trim() && !clienteSelecionado
    ? clientes.filter((c) => c.nome.toLowerCase().includes(buscaCliente.toLowerCase())).slice(0, 5)
    : [];

  const sugestoesProduto = buscaProdutoQuery.trim()
    ? demoProdutos.filter((p) => p.nome.toLowerCase().includes(buscaProdutoQuery.toLowerCase())).slice(0, 5)
    : [];

  const total = itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);

  function addItem() {
    _itemCounter++;
    setItens((prev) => [
      ...prev,
      { id: String(_itemCounter), descricao: "", tipo: "servico", quantidade: 1, valorUnitario: 0 },
    ]);
  }

  function removeItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof ItemLinha, value: string | number) {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function selectProduto(itemId: string, produto: (typeof demoProdutos)[0]) {
    setItens((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, descricao: produto.nome, tipo: "peca", valorUnitario: produto.valorVenda }
          : i
      )
    );
    setBuscaProduto(null);
    setBuscaProdutoQuery("");
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabase) {
      success("Orçamento criado! (demo)", "Em produção os dados serão persistidos no banco.");
      router.push("/orcamentos");
      return;
    }
    if (!clienteSelecionado) {
      toastError("Cliente obrigatório", "Selecione um cliente para o orçamento.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const titulo = (form.get("titulo") as string) ?? "";
    const validadeDias = parseInt((form.get("validade") as string) || "15", 10);
    const validadeData = new Date();
    validadeData.setDate(validadeData.getDate() + (isNaN(validadeDias) ? 15 : validadeDias));

    const linhasItens = itens
      .filter((i) => i.descricao.trim())
      .map((i) => `- ${i.descricao} (${i.tipo === "peca" ? "Peça" : "Serviço"}) x${i.quantidade} — ${formatCurrency(i.valorUnitario)}`)
      .join("\n");
    const descricao = linhasItens ? `${titulo}\n\nItens:\n${linhasItens}` : titulo;

    const fd = new FormData();
    fd.set("cliente_id", clienteSelecionado.id);
    fd.set("equipamento_id", "");
    fd.set("os_id", "");
    fd.set("descricao", descricao);
    fd.set("valor_total", String(total));
    fd.set("validade", validadeData.toISOString().split("T")[0]);
    startTransition(async () => {
      const result = await criarOrcamentoAction(fd);
      if (result?.error) {
        toastError("Erro ao criar orçamento", result.error);
      } else {
        success("Orçamento criado!", "O orçamento foi cadastrado.");
        router.push("/orcamentos");
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Cliente */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Cliente</h2>
        <FormField label="Selecionar cliente" required>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
            <Input
              value={buscaCliente}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                if (clienteSelecionado) setClienteSelecionado(null);
                setShowClientes(true);
              }}
              onFocus={() => setShowClientes(true)}
              onBlur={() => setTimeout(() => setShowClientes(false), 150)}
              placeholder="Buscar cliente por nome..."
              className="pl-9"
              autoComplete="off"
            />
            {clienteSelecionado && (
              <button type="button" onClick={() => { setClienteSelecionado(null); setBuscaCliente(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]">
                <X className="size-4" />
              </button>
            )}
            {showClientes && sugestoesCliente.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                {sugestoesCliente.map((c) => (
                  <button key={c.id} type="button"
                    onMouseDown={() => { setClienteSelecionado(c); setBuscaCliente(c.nome); setShowClientes(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--color-surface-muted)] first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)]">
                    <div className="flex size-7 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-bold text-[var(--color-brand-700)] uppercase">
                      {c.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.nome}</p>
                      {(c as any).email && <p className="text-xs text-[var(--color-fg-muted)]">{(c as any).email}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {clienteSelecionado && (
            <div className="mt-2 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-50)] px-3 py-1.5">
              <span className="text-xs font-medium text-[var(--color-brand-700)]">✓ {clienteSelecionado.nome}</span>
            </div>
          )}
        </FormField>
      </div>

      {/* Cabeçalho */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Informações do orçamento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Título / descrição" required>
            <Input name="titulo" placeholder="Ex.: Troca de tela iPhone 14..." />
          </FormField>
          <FormField label="Validade (dias)">
            <Input name="validade" type="number" defaultValue={15} min={1} max={90} />
          </FormField>
          <FormField label="OS vinculada">
            <Input name="os_id" placeholder="Número da OS (opcional)" />
          </FormField>
          <FormField label="Forma de pagamento">
            <select name="forma_pagamento"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
              <option value="">Selecionar...</option>
              <option>Pix</option>
              <option>Cartão de crédito</option>
              <option>Cartão de débito</option>
              <option>Dinheiro</option>
              <option>Boleto</option>
            </select>
          </FormField>
          <FormField label="Observações para o cliente" className="sm:col-span-2">
            <textarea name="obs_cliente" rows={2} placeholder="Mensagem que aparecerá no orçamento enviado ao cliente..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none" />
          </FormField>
        </div>
      </div>

      {/* Itens */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold">Itens do orçamento</h2>
          <Button size="sm" variant="outline" onClick={addItem} type="button">
            <Plus className="size-4" />
            Adicionar item
          </Button>
        </div>

        {/* Cabeçalho tabela */}
        <div className="hidden sm:grid grid-cols-[2fr_120px_100px_120px_40px] gap-3 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] bg-[var(--color-surface-muted)]">
          <span>Descrição</span>
          <span>Tipo</span>
          <span>Qtd.</span>
          <span>Valor unit.</span>
          <span />
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {itens.map((item, idx) => (
            <div key={item.id} className="px-5 py-3">
              <div className="grid gap-2 sm:grid-cols-[2fr_120px_100px_120px_40px] sm:gap-3">
                {/* Descrição com busca de produto */}
                <div className="relative">
                  <Input
                    value={item.descricao}
                    onChange={(e) => {
                      updateItem(item.id, "descricao", e.target.value);
                      setBuscaProduto(item.id);
                      setBuscaProdutoQuery(e.target.value);
                    }}
                    onFocus={() => { setBuscaProduto(item.id); setBuscaProdutoQuery(item.descricao); }}
                    onBlur={() => setTimeout(() => setBuscaProduto(null), 150)}
                    placeholder={`Item ${idx + 1} — peça ou serviço...`}
                    className="text-sm"
                  />
                  {buscaProduto === item.id && sugestoesProduto.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                      {sugestoesProduto.map((p) => (
                        <button key={p.id} type="button"
                          onMouseDown={() => selectProduto(item.id, p)}
                          className="flex w-full justify-between px-3 py-2 text-left hover:bg-[var(--color-surface-muted)] first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)]">
                          <span className="text-sm">{p.nome}</span>
                          <span className="text-xs font-semibold text-[var(--color-brand-600)]">{formatCurrency(p.valorVenda)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <select
                  value={item.tipo}
                  onChange={(e) => updateItem(item.id, "tipo", e.target.value)}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
                  <option value="servico">Serviço</option>
                  <option value="peca">Peça</option>
                </select>

                <Input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => updateItem(item.id, "quantidade", Number(e.target.value))}
                  min={1}
                  className="text-sm text-center"
                />

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-subtle)]">R$</span>
                  <Input
                    type="number"
                    value={item.valorUnitario}
                    onChange={(e) => updateItem(item.id, "valorUnitario", Number(e.target.value))}
                    min={0}
                    step={0.01}
                    className="pl-8 text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={itens.length === 1}
                  className="flex items-center justify-center text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {/* Subtotal linha */}
              <div className="mt-1 text-right">
                <span className="text-xs text-[var(--color-fg-muted)]">
                  Subtotal: <strong>{formatCurrency(item.quantidade * item.valorUnitario)}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
          <div className="flex justify-end gap-8">
            <div className="text-right space-y-1.5">
              <div className="flex justify-between gap-12 text-sm">
                <span className="text-[var(--color-fg-muted)]">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between gap-12 text-sm">
                <span className="text-[var(--color-fg-muted)]">Desconto</span>
                <input type="number" min={0} step={0.01} defaultValue={0}
                  className="w-24 rounded border border-[var(--color-border)] bg-transparent px-2 py-0.5 text-right text-sm" />
              </div>
              <div className="flex justify-between gap-12 border-t border-[var(--color-border)] pt-2 text-base font-bold">
                <span>Total</span>
                <span className="text-[var(--color-success)]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
        <Button variant="outline" type="button">
          <FileText className="size-4" />
          Salvar como rascunho
        </Button>
        <Button type="submit" loading={saving}>
          Criar orçamento
        </Button>
      </div>
    </form>
  );
}
