"use client";

import { useState } from "react";
import { BookOpen, Search, Plus, Tag, Clock, ChevronRight, Wrench, Package, FileText, Shield, Video, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Artigo {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  tags: string[];
  leituras: number;
  tempo: string;
  destaque?: boolean;
}

const categorias = [
  { key: "todos", label: "Todos", icon: BookOpen },
  { key: "diagnosticos", label: "Diagnósticos", icon: Wrench },
  { key: "pecas", label: "Peças & Compat.", icon: Package },
  { key: "procedimentos", label: "Procedimentos", icon: FileText },
  { key: "garantia", label: "Garantia & Legal", icon: Shield },
  { key: "tutoriais", label: "Tutoriais", icon: Video },
];

const artigos: Artigo[] = [
  {
    id: "1",
    titulo: "Diagnóstico de notebook sem imagem — checklist completo",
    resumo: "Passo a passo para identificar falha em tela, placa de vídeo, GPU integrada ou cabo flat. Inclui testes com monitor externo e multímetro.",
    categoria: "diagnosticos",
    tags: ["notebook", "tela", "placa-mãe"],
    leituras: 312,
    tempo: "8 min",
    destaque: true,
  },
  {
    id: "2",
    titulo: "Compatibilidade de memória RAM — DDR3, DDR4 e DDR5",
    resumo: "Guia de compatibilidade por geração, frequência e timings. Tabela com modelos populares e equivalências de mercado.",
    categoria: "pecas",
    tags: ["ram", "memória", "compatibilidade"],
    leituras: 241,
    tempo: "5 min",
    destaque: true,
  },
  {
    id: "3",
    titulo: "Procedimento de recebimento e conferência de OS",
    resumo: "Como documentar corretamente o estado do equipamento na entrada: fotos, acessórios, senha e assinatura do cliente.",
    categoria: "procedimentos",
    tags: ["os", "recebimento", "checklist"],
    leituras: 189,
    tempo: "4 min",
  },
  {
    id: "4",
    titulo: "Termos de garantia — o que cobrir e o que excluir",
    resumo: "Modelo de texto para termos de garantia, prazos legais (90 dias CDC), e como registrar exclusões no sistema.",
    categoria: "garantia",
    tags: ["garantia", "cdc", "jurídico"],
    leituras: 156,
    tempo: "6 min",
  },
  {
    id: "5",
    titulo: "Como usar o modo de diagnóstico da OS no DeskControl",
    resumo: "Tutorial completo do módulo de diagnóstico: adicionar itens, registrar solução, gerar orçamento e notificar cliente.",
    categoria: "tutoriais",
    tags: ["sistema", "os", "orçamento"],
    leituras: 203,
    tempo: "7 min",
  },
  {
    id: "6",
    titulo: "Diagnóstico de iPhone sem carga — passo a passo",
    resumo: "Verificação de cabo, porta, bateria e placa. Testes com ammeter USB para identificar curto na carga. Modelos 12, 13 e 14.",
    categoria: "diagnosticos",
    tags: ["iphone", "bateria", "carga"],
    leituras: 287,
    tempo: "6 min",
  },
  {
    id: "7",
    titulo: "Substituição de tela — iPhones série 14",
    resumo: "Procedimento completo com lista de ferramentas, ordem de desmontagem, calibração OLED e configuração Face ID.",
    categoria: "tutoriais",
    tags: ["iphone", "tela", "oled"],
    leituras: 198,
    tempo: "12 min",
  },
  {
    id: "8",
    titulo: "Tabela de preços médios de peças — atualizada Jun/26",
    resumo: "Referência de preços de atacado para telas, baterias, conectores e chips por modelo. Fontes: fornecedores homologados.",
    categoria: "pecas",
    tags: ["preços", "peças", "referência"],
    leituras: 175,
    tempo: "3 min",
    destaque: true,
  },
  {
    id: "9",
    titulo: "Procedimento de entrega e coleta de equipamentos",
    resumo: "Formulário de entrega, conferência de acessórios devolvidos, assinatura eletrônica e arquivamento da OS.",
    categoria: "procedimentos",
    tags: ["entrega", "os", "cliente"],
    leituras: 142,
    tempo: "4 min",
  },
  {
    id: "10",
    titulo: "Diagnóstico de impressora com falha de impressão",
    resumo: "Checklist para cabeças entupidas, drums gastos, sensores de papel e problemas de driver. HP, Epson e Canon.",
    categoria: "diagnosticos",
    tags: ["impressora", "hp", "epson"],
    leituras: 134,
    tempo: "5 min",
  },
];

const tagsPopulares = ["notebook", "iphone", "tela", "bateria", "os", "peças", "garantia", "placa-mãe"];

export default function ConhecimentoPage() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [tagAtiva, setTagAtiva] = useState<string | null>(null);

  const filtrados = artigos.filter((a) => {
    const matchCategoria = categoriaAtiva === "todos" || a.categoria === categoriaAtiva;
    const matchTag = !tagAtiva || a.tags.includes(tagAtiva);
    const matchBusca =
      !busca.trim() ||
      a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      a.resumo.toLowerCase().includes(busca.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(busca.toLowerCase()));
    return matchCategoria && matchTag && matchBusca;
  });

  const destaques = artigos.filter((a) => a.destaque);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centro de Conhecimento</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Base interna de diagnósticos, procedimentos e tutoriais para técnicos
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Novo artigo
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
        <Input
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setCategoriaAtiva("todos"); setTagAtiva(null); }}
          placeholder="Buscar artigos, procedimentos, peças..."
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Categorias */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3">Categorias</p>
            <nav className="space-y-0.5">
              {categorias.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setCategoriaAtiva(key); setTagAtiva(null); setBusca(""); }}
                  className={`flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${
                    categoriaAtiva === key && !tagAtiva && !busca
                      ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium"
                      : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                  <span className="ml-auto text-xs text-[var(--color-fg-subtle)]">
                    {key === "todos" ? artigos.length : artigos.filter((a) => a.categoria === key).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tags populares */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3 flex items-center gap-1.5">
              <Tag className="size-3" /> Tags populares
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tagsPopulares.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setTagAtiva(tagAtiva === tag ? null : tag); setBusca(""); }}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    tagAtiva === tag
                      ? "bg-[var(--color-brand-600)] text-white"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-fg-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Destaques */}
          {!busca && !tagAtiva && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3 flex items-center gap-1.5">
                <Star className="size-3" /> Mais acessados
              </p>
              <div className="space-y-2">
                {destaques.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 text-sm cursor-pointer hover:text-[var(--color-brand-700)] transition-colors group">
                    <ChevronRight className="size-3.5 mt-0.5 shrink-0 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-brand-600)]" />
                    <span className="text-[var(--color-fg-muted)] group-hover:text-[var(--color-brand-700)] leading-snug">{a.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Lista de artigos */}
        <div className="space-y-3">
          {filtrados.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
              <BookOpen className="mx-auto mb-3 size-10 text-[var(--color-fg-subtle)]" />
              <p className="font-semibold">Nenhum artigo encontrado</p>
              <p className="mt-1 text-sm text-[var(--color-fg-muted)]">Tente outros termos ou crie um novo artigo.</p>
              <Button className="mt-4" variant="outline">
                <Plus className="size-4" />
                Criar artigo
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--color-fg-muted)]">
                {filtrados.length} artigo{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
              </p>
              {filtrados.map((artigo) => (
                <div
                  key={artigo.id}
                  className="group cursor-pointer rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm hover:border-[var(--color-brand-300)] hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {artigo.destaque && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-warning)] uppercase tracking-wide">
                            <Star className="size-2.5" /> Destaque
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-fg-subtle)] capitalize">
                          {categorias.find((c) => c.key === artigo.categoria)?.label ?? artigo.categoria}
                        </span>
                      </div>
                      <h3 className="font-semibold leading-snug group-hover:text-[var(--color-brand-700)] transition-colors">
                        {artigo.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
                        {artigo.resumo}
                      </p>
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <div className="flex gap-1.5 flex-wrap">
                          {artigo.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={(e) => { e.stopPropagation(); setTagAtiva(tag); setBusca(""); }}
                              className="rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs text-[var(--color-fg-muted)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)] transition-colors cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="ml-auto flex items-center gap-3 text-xs text-[var(--color-fg-subtle)] shrink-0">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" /> {artigo.tempo}
                          </span>
                          <span>{artigo.leituras} leituras</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-brand-600)] mt-0.5 transition-colors" />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
