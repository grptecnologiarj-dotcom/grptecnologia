/**
 * Tipos de domínio — Equipamentos
 * DeskControl
 */

export interface Equipamento {
  id: string;
  empresaId: string;
  clienteId?: string; // proprietário (opcional — pode ser estoque da loja)
  nome: string;
  categoria: string; // ex.: Notebook, Smartphone, Console, Impressora
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  acessorios?: string[]; // ex.: "Carregador", "Mochila"
  observacoes?: string;
  status: "com_cliente" | "na_loja" | "em_manutencao" | "descartado";
  createdAt: string;
  updatedAt: string;
}

export interface EquipamentoHistorico {
  id: string;
  equipamentoId: string;
  osId?: string;
  evento:
    | "entrada"
    | "saida"
    | "diagnostico"
    | "reparo"
    | "aguardando_pecas"
    | "pronto"
    | "entrega";
  descricao?: string;
  createdAt: string;
}