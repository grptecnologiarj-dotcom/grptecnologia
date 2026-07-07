import { isSupabaseConfigured } from "@/lib/auth";
import { listarNotificacoesAction } from "@/lib/actions/notificacoes";
import { NotificacoesClient, type NotificacaoView } from "./notificacoes-client";

export const metadata = { title: "Notificações — DeskControl" };

const notificacoesDemo: NotificacaoView[] = [
  { id: "1", tipo: "alerta", titulo: "OS #0038 com prazo vencido", mensagem: "O reparo do notebook de João Carlos está atrasado há 2 dias. Entre em contato com o cliente.", tempo: "há 5 min", lida: false },
  { id: "2", tipo: "orcamento", titulo: "Orçamento aprovado pelo cliente", mensagem: "Maria Silva aprovou o orçamento #ORC-2024-005 no valor de R$ 480,00. Inicie o atendimento.", tempo: "há 23 min", lida: false },
  { id: "3", tipo: "prazo", titulo: "2 OS com entrega para hoje", mensagem: "OS #0040 (Dell Inspiron) e #0042 (iPhone 14) têm previsão de entrega para hoje.", tempo: "há 1h", lida: false },
  { id: "4", tipo: "os", titulo: "Nova OS recebida", mensagem: "OS #0044 criada para Pedro Almeida — TV Samsung com problema de imagem.", tempo: "há 2h", lida: true },
  { id: "5", tipo: "sucesso", titulo: "Pagamento confirmado", mensagem: "Recebido R$ 320,00 via Pix referente à OS #0041 de Ana Rodrigues.", tempo: "há 3h", lida: true },
  { id: "6", tipo: "alerta", titulo: "Estoque crítico: Tela iPhone 14", mensagem: "Produto 'Tela iPhone 14 Pro (OLED)' está com estoque zerado. 3 OS aguardando esta peça.", tempo: "há 5h", lida: true },
  { id: "7", tipo: "info", titulo: "Relatório mensal disponível", mensagem: "O relatório financeiro de maio de 2024 foi gerado. Receita total: R$ 12.480,00.", tempo: "ontem", lida: true },
  { id: "8", tipo: "os", titulo: "OS concluída por Carlos Mendes", mensagem: "OS #0039 (Impressora HP LaserJet) marcada como concluída. Aguardando retirada do cliente.", tempo: "ontem", lida: true },
];

function tempoRelativo(dataIso: string): string {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  return new Date(dataIso).toLocaleDateString("pt-BR");
}

export default async function NotificacoesPage() {
  if (!isSupabaseConfigured()) {
    return <NotificacoesClient notificacoes={notificacoesDemo} demo />;
  }

  const { data } = await listarNotificacoesAction();
  const notificacoes: NotificacaoView[] = data.map((n) => ({
    id: n.id,
    tipo: n.tipo,
    titulo: n.titulo,
    mensagem: n.mensagem,
    tempo: tempoRelativo(n.created_at),
    lida: n.lida,
  }));

  return <NotificacoesClient notificacoes={notificacoes} demo={false} />;
}
