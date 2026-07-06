import { notFound } from "next/navigation";
import { buscarOSAction } from "@/lib/actions/os";
import { isSupabaseConfigured } from "@/lib/auth";
import { demoOSDetalhe } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QRCodeImg } from "@/components/ui/qr-code";

interface Props { params: Promise<{ id: string }> }

export default async function OSImprimirPage({ params }: Props) {
  const { id } = await params;

  let os: any = null;
  if (isSupabaseConfigured()) {
    const { data, error } = await buscarOSAction(id);
    if (error || !data) notFound();
    os = data;
  } else {
    os = demoOSDetalhe;
  }

  const cliente = os.clientes ?? os.cliente;
  const equipamento = os.equipamentos ?? os.equipamento;
  const tecnico = os.usuarios ?? os.tecnico;
  const itens = os.os_itens ?? os.itens ?? [];

  return (
    <>
      {/* Print controls — ocultos na impressão */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-3 shadow-sm">
        <span className="text-sm font-semibold">Pré-visualização de impressão — {os.numero}</span>
        <div className="flex gap-2">
          <a href={`/os/${id}`} className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-surface-muted)] transition-colors">
            Voltar
          </a>
          <button
            onClick={() => window.print()}
            className="rounded bg-[var(--color-brand-600)] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-700)] transition-colors"
          >
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { padding-top: 0 !important; }
        }
        @page { margin: 15mm; }
      `}</style>

      {/* Documento imprimível */}
      <div className="pt-16 no-print-pt print:pt-0">
        <div className="mx-auto max-w-3xl bg-white text-gray-900 p-8 print:p-0 print:max-w-none print:shadow-none shadow-lg my-6 print:my-0">
          {/* Cabeçalho da empresa */}
          <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight">TechRepair Assistência</h1>
              <p className="text-sm text-gray-600">Rua das Tecnologias, 500 · São Paulo, SP · (11) 3000-4000</p>
              <p className="text-sm text-gray-600">contato@techrepair.com.br · CNPJ: 12.345.678/0001-90</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-gray-800">{os.numero}</p>
              <p className="text-sm text-gray-500">Ordem de Serviço</p>
              <p className="text-xs text-gray-500">{formatDate(os.data_abertura)}</p>
            </div>
          </div>

          {/* Grid cliente + equipamento */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Cliente</h2>
              <p className="font-bold">{cliente?.nome}</p>
              {cliente?.cpf_cnpj && <p className="text-sm text-gray-600">CPF/CNPJ: {cliente.cpf_cnpj}</p>}
              {cliente?.telefone && <p className="text-sm text-gray-600">Tel: {cliente.telefone}</p>}
              {cliente?.whatsapp && <p className="text-sm text-gray-600">WhatsApp: {cliente.whatsapp}</p>}
              {cliente?.email && <p className="text-sm text-gray-600">{cliente.email}</p>}
              {cliente?.endereco && (
                <p className="text-sm text-gray-600">{cliente.endereco}{cliente.cidade && ` · ${cliente.cidade}/${cliente.estado}`}</p>
              )}
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Equipamento</h2>
              <p className="font-bold">{equipamento?.nome}</p>
              {equipamento?.marca && <p className="text-sm text-gray-600">Marca: {equipamento.marca}</p>}
              {equipamento?.modelo && <p className="text-sm text-gray-600">Modelo: {equipamento.modelo}</p>}
              {equipamento?.numero_serie && (
                <p className="text-sm text-gray-600 font-mono">Série: {equipamento.numero_serie}</p>
              )}
              {equipamento?.imei && (
                <p className="text-sm text-gray-600 font-mono">IMEI: {equipamento.imei}</p>
              )}
              {equipamento?.cor && <p className="text-sm text-gray-600">Cor: {equipamento.cor}</p>}
            </div>
          </div>

          {/* Detalhes da OS */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            <div className="rounded border border-gray-200 p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Prioridade</p>
              <p className="font-bold capitalize mt-1">{os.prioridade}</p>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
              <p className="font-bold capitalize mt-1">{os.status?.replace(/_/g, " ")}</p>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Técnico responsável</p>
              <p className="font-bold mt-1">{tecnico?.nome ?? "Não atribuído"}</p>
            </div>
            {os.condicao_visual && (
              <div className="rounded border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase font-semibold">Condição visual</p>
                <p className="font-bold capitalize mt-1">{os.condicao_visual}</p>
              </div>
            )}
            {os.data_previsao && (
              <div className="rounded border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase font-semibold">Previsão</p>
                <p className="font-bold mt-1">{formatDate(os.data_previsao)}</p>
              </div>
            )}
            {os.origem && (
              <div className="rounded border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase font-semibold">Canal</p>
                <p className="font-bold capitalize mt-1">{os.origem}</p>
              </div>
            )}
          </div>

          {/* Problema */}
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Problema relatado pelo cliente</h2>
            <p className="text-sm leading-relaxed border border-gray-200 rounded p-3 bg-gray-50">{os.problema}</p>
          </div>

          {os.acessorios && os.acessorios.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Acessórios entregues</h2>
              <p className="text-sm">{Array.isArray(os.acessorios) ? os.acessorios.join(", ") : os.acessorios}</p>
            </div>
          )}

          {/* Diagnóstico (se houver) */}
          {os.diagnostico && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Diagnóstico técnico</h2>
              <p className="text-sm leading-relaxed border border-gray-200 rounded p-3">{os.diagnostico}</p>
            </div>
          )}

          {/* Itens e orçamento */}
          {itens.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Serviços e peças</h2>
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-left">Descrição</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Tipo</th>
                    <th className="border border-gray-200 px-3 py-2 text-center w-16">Qtd.</th>
                    <th className="border border-gray-200 px-3 py-2 text-right w-24">Unit.</th>
                    <th className="border border-gray-200 px-3 py-2 text-right w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item: any) => (
                    <tr key={item.id}>
                      <td className="border border-gray-200 px-3 py-2">{item.descricao}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center capitalize">{item.tipo}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{item.quantidade}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(item.valor_unit)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-semibold">{formatCurrency(item.valor_total)}</td>
                    </tr>
                  ))}
                  {os.valor_desconto > 0 && (
                    <tr>
                      <td colSpan={4} className="border border-gray-200 px-3 py-2 text-right text-gray-600">Desconto</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-red-600">-{formatCurrency(os.valor_desconto)}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={4} className="border border-gray-200 px-3 py-2 text-right">TOTAL</td>
                    <td className="border border-gray-200 px-3 py-2 text-right text-lg">{formatCurrency(os.valor_total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Garantia */}
          {os.garantia_dias && (
            <div className="mb-6 rounded border border-gray-800 p-3 text-sm">
              <span className="font-bold">Garantia: </span>
              {os.garantia_dias} dias a partir da data de entrega. A garantia cobre exclusivamente o serviço prestado,
              não incluindo danos causados por mau uso, quedas ou terceiros.
            </div>
          )}

          {/* QR Code — Portal do cliente */}
          <div className="mt-6 mb-6 flex items-center gap-5 rounded border border-gray-200 bg-gray-50 p-4">
            <QRCodeImg
              value={`https://deskcontrol.app/acompanhar/${os.portal_token ?? "demo-token"}`}
              size={80}
              className="rounded shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-gray-800">Acompanhe sua OS pelo celular</p>
              <p className="text-xs text-gray-500 mt-1">
                Aponte a câmera para o QR Code ou acesse:
              </p>
              <p className="text-xs font-mono text-gray-700 mt-0.5 break-all">
                deskcontrol.app/acompanhar/{os.portal_token ?? "demo-token"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1.5">
                Veja o status em tempo real, aprovação de orçamento e muito mais.
              </p>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="mt-12 grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-t border-gray-800 pt-2">
                <p className="text-sm font-semibold">{cliente?.nome ?? "Cliente"}</p>
                <p className="text-xs text-gray-500">Autorização / Retirada</p>
                <p className="text-xs text-gray-400 mt-1">Data: ___/___/______</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-800 pt-2">
                <p className="text-sm font-semibold">TechRepair Assistência</p>
                <p className="text-xs text-gray-500">Responsável técnico</p>
                <p className="text-xs text-gray-400 mt-1">Data: ___/___/______</p>
              </div>
            </div>
          </div>

          {/* Footer do documento */}
          <div className="mt-8 border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400">
            Documento gerado por DeskControl · GRP Tecnologia · {os.numero} · {formatDate(os.data_abertura)}
            {" "}· Acesse o portal do cliente: deskcontrol.app/acompanhar/{os.portal_token}
          </div>
        </div>
      </div>
    </>
  );
}
