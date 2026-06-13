import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { calcularHuecos } from "@/lib/disponibilidad";

export const dynamic = "force-dynamic";

// GET /api/disponibilidad?servicioId=1&profesionalId=2&fecha=2026-06-14
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const servicioId = Number(searchParams.get("servicioId"));
  const profesionalId = Number(searchParams.get("profesionalId"));
  const fecha = searchParams.get("fecha") ?? "";

  if (!servicioId || !profesionalId || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }

  try {
    const db = getDb();
    const [servicio] = await db
      .select()
      .from(schema.servicios)
      .where(eq(schema.servicios.id, servicioId));
    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }

    const huecos = await calcularHuecos({
      profesionalId,
      duracionMin: servicio.duracionMin,
      fecha,
    });

    return NextResponse.json({
      huecos: huecos.map((h) => ({ inicio: h.inicio.toISOString(), hora: h.hora })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular disponibilidad." }, { status: 500 });
  }
}
