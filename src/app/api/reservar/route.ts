import { NextRequest, NextResponse } from "next/server";
import { crearCita } from "@/lib/reservas";

export const dynamic = "force-dynamic";

interface Cuerpo {
  servicioId?: number;
  profesionalId?: number;
  inicio?: string; // ISO
  nombre?: string;
  telefono?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  let body: Cuerpo;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { servicioId, profesionalId, inicio, nombre, telefono, email } = body;
  if (!servicioId || !profesionalId || !inicio || !nombre || !telefono) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
  }

  const fecha = new Date(inicio);
  if (isNaN(fecha.getTime())) {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }

  const res = await crearCita({
    servicioId,
    profesionalId,
    inicio: fecha,
    clienteNombre: nombre,
    clienteTelefono: telefono,
    clienteEmail: email || null,
    origen: "web",
    enviarEmail: true,
  });

  if (!res.ok) {
    const status = res.motivo === "ocupado" ? 409 : 400;
    return NextResponse.json({ error: res.mensaje, motivo: res.motivo }, { status });
  }

  return NextResponse.json({ ok: true, citaId: res.citaId });
}
