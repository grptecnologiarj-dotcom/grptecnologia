import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL ?? "";
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY ?? "";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE ?? "deskcontrol";

export async function GET(request: Request) {
  // Verifica autorização do cron (Vercel injeta automaticamente em produção)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Busca eventos de hoje
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString();

  const { data: eventos } = await supabase
    .from("agenda_eventos")
    .select(`
      titulo, tipo, data_inicio, data_fim, local,
      usuarios!tecnico_id(id, nome, telefone),
      clientes(nome)
    `)
    .gte("data_inicio", inicioHoje)
    .lte("data_inicio", fimHoje)
    .not("tecnico_id", "is", null)
    .neq("status", "cancelado")
    .order("data_inicio");

  if (!eventos || eventos.length === 0) {
    return NextResponse.json({ ok: true, message: "Sem eventos hoje" });
  }

  // Agrupa por técnico
  const porTecnico: Record<string, { nome: string; telefone: string; eventos: any[] }> = {};
  for (const ev of eventos) {
    const tec = ev.usuarios as any;
    if (!tec?.telefone) continue;
    const id = tec.id;
    if (!porTecnico[id]) porTecnico[id] = { nome: tec.nome, telefone: tec.telefone, eventos: [] };
    porTecnico[id].eventos.push(ev);
  }

  const resultados: any[] = [];

  for (const [, { nome, telefone, eventos: evs }] of Object.entries(porTecnico)) {
    const dataFormatada = hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

    const linhasEventos = evs.map((ev: any) => {
      const hora = ev.data_inicio ? new Date(ev.data_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
      const cliente = ev.clientes?.nome ? ` — ${ev.clientes.nome}` : "";
      const local = ev.local ? `\n   📍 ${ev.local}` : "";
      return `▸ ${hora} ${ev.titulo}${cliente}${local}`;
    }).join("\n");

    const mensagem =
      `🌅 *Bom dia, ${nome.split(" ")[0]}!*\n\n` +
      `Aqui está sua agenda de hoje, *${dataFormatada}*:\n\n` +
      `${linhasEventos}\n\n` +
      `Tenha um ótimo dia! 💪\n` +
      `_DeskControl · GRP Tecnologia_`;

    try {
      const res = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": EVOLUTION_KEY,
        },
        body: JSON.stringify({
          number: telefone.replace(/\D/g, ""),
          text: mensagem,
        }),
      });
      resultados.push({ nome, status: res.ok ? "enviado" : "erro", code: res.status });
    } catch (err) {
      resultados.push({ nome, status: "erro", error: String(err) });
    }
  }

  return NextResponse.json({ ok: true, enviados: resultados });
}
