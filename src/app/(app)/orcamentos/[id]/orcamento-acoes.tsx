"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, Send, Edit, CheckCircle2, XCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { atualizarStatusOrcamentoAction } from "@/lib/actions/orcamentos";

interface AcoesProps {
  id: string;
  status: string;
  isSupabase: boolean;
}

export function OrcamentoAcoes({ id, status, isSupabase }: AcoesProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  function mudarStatus(novoStatus: "enviado" | "aprovado" | "recusado", msg: string) {
    if (!isSupabase) {
      success(`${msg} (demo)`, "Em produção o status será persistido no banco.");
      return;
    }
    startTransition(async () => {
      const result = await atualizarStatusOrcamentoAction(id, novoStatus);
      if (result?.error) {
        toastError("Erro", result.error);
      } else {
        success(msg, "Status atualizado com sucesso.");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex gap-2 shrink-0 flex-wrap">
      <Button variant="outline" size="sm" type="button" onClick={() => window.print()}>
        <Printer className="size-4" />
        Imprimir
      </Button>
      {(status === "rascunho" || status === "enviado") && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orcamentos/${id}/editar`}>
            <Edit className="size-4" />
            Editar
          </Link>
        </Button>
      )}
      {status === "rascunho" && (
        <Button size="sm" type="button" loading={isPending}
          onClick={() => mudarStatus("enviado", "Orçamento enviado!")}>
          <Send className="size-4" />
          Enviar ao cliente
        </Button>
      )}
      {status === "enviado" && (
        <>
          <Button variant="outline" size="sm" type="button" loading={isPending}
            className="text-[var(--color-danger)] hover:border-[var(--color-danger)]"
            onClick={() => mudarStatus("recusado", "Orçamento reprovado.")}>
            <XCircle className="size-4" />
            Reprovar
          </Button>
          <Button size="sm" type="button" loading={isPending}
            onClick={() => mudarStatus("aprovado", "Orçamento aprovado!")}>
            <CheckCircle2 className="size-4" />
            Aprovar
          </Button>
        </>
      )}
    </div>
  );
}

export function CopiarLinkButton({ token }: { token: string }) {
  const { success } = useToast();

  function copiar() {
    const link = `${window.location.origin}/aprovar/${token}`;
    navigator.clipboard.writeText(link);
    success("Link copiado!", "Compartilhe com o cliente para aprovação online.");
  }

  return (
    <Button size="sm" variant="outline" type="button" onClick={copiar}>
      <Copy className="size-3.5" />
      Copiar
    </Button>
  );
}
