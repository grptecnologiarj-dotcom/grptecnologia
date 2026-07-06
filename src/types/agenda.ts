export type TipoEvento =
  | "visita_tecnica"
  | "atendimento_remoto"
  | "instalacao"
  | "manutencao_preventiva"
  | "retirada_equipamento"
  | "entrega_equipamento"
  | "diagnostico"
  | "retorno_garantia"
  | "cobranca"
  | "reuniao"
  | "tarefa_interna"
  | "prioridade_urgente"
  | "evento_privado"
  | "lembrete";

export type StatusEvento =
  | "agendado"
  | "confirmado"
  | "em_deslocamento"
  | "em_atendimento"
  | "finalizado"
  | "reagendado"
  | "cancelado"
  | "nao_compareceu"
  | "aguardando_cliente"
  | "urgente";

export type PrioridadeEvento = "baixa" | "normal" | "alta" | "urgente" | "critica";

export type VisibilidadeEvento = "todos" | "tecnico" | "gerente" | "admin";

export type VisualizacaoAgenda = "dia" | "semana" | "mes" | "lista" | "tecnico";

export interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
}

export interface EventoAgenda {
  id: string;
  titulo: string;
  tipo: TipoEvento;
  status: StatusEvento;
  prioridade: PrioridadeEvento;
  visibilidade: VisibilidadeEvento;
  cor: string;

  // Relações
  clienteId?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  osId?: string;
  osNumero?: string;
  tecnicoId?: string;
  tecnicoNome?: string;
  contratoId?: string;

  // Tempo
  data: string;
  horaInicio: string;
  horaFim: string;
  duracaoMinutos?: number;
  recorrencia?: "diaria" | "semanal" | "quinzenal" | "mensal" | null;

  // Local
  endereco?: string;
  complemento?: string;
  linkMaps?: string;

  // Conteúdo
  descricao?: string;
  observacoesInternas?: string;
  checklist?: ChecklistItem[];

  // Notificações
  notificacoes?: number[]; // minutos antes: [1440, 120, 30]

  // Audit
  criadoPor?: string;
  criadoEm?: string;
  editadoPor?: string;
  editadoEm?: string;
  canceladoMotivo?: string;
  confirmadoEm?: string;
  iniciadoEm?: string;
  finalizadoEm?: string;
}

export interface PermissoesAgenda {
  agendaGeralVisivel: boolean;
  tecnicosVeemOutros: boolean;
  tecnicosCriam: boolean;
  tecnicosEditamProprios: boolean;
  tecnicosReagendam: boolean;
  atendenteAlteraTecnico: boolean;
  eventosPrivadosParaGerentes: boolean;
  alertaUmDiaAntes: boolean;
  alertaNoDia: boolean;
  alertaParaCliente: boolean;
  exigirJustificativaCancelamento: boolean;
  exigirChecklistParaFinalizar: boolean;
}
