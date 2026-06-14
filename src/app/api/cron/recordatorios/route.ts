import { NextRequest, NextResponse } from "next/server";
import { enviarRecordatoriosPendientes } from "@/lib/recordatorios";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Tarea programada (Vercel Cron) que manda los recordatorios pendientes.
// Vercel añade automáticamente la cabecera Authorization: Bearer <CRON_SECRET>
// si defines la variable CRON_SECRET. Si está definida, la exigimos.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
  }

  try {
    const enviados = await enviarRecordatoriosPendientes();
    return NextResponse.json({ ok: true, enviados });
  } catch (e) {
    console.error("Error en cron de recordatorios:", e);
    return NextResponse.json({ ok: false, error: "fallo" }, { status: 500 });
  }
}
