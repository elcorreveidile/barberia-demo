import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { exigirSesion } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const no = await exigirSesion();
  if (no) return no;
  const db = getDb();
  const servicios = await db
    .select()
    .from(schema.servicios)
    .orderBy(asc(schema.servicios.orden));
  return NextResponse.json({ servicios });
}

export async function POST(req: NextRequest) {
  const no = await exigirSesion();
  if (no) return no;
  const b = await req.json().catch(() => null);
  if (!b?.nombre || b.precioCents == null || !b.duracionMin) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }
  const db = getDb();
  const [nuevo] = await db
    .insert(schema.servicios)
    .values({
      nombre: b.nombre,
      descripcion: b.descripcion ?? "",
      precioCents: Number(b.precioCents),
      duracionMin: Number(b.duracionMin),
      categoria: b.categoria ?? "barberia",
      orden: Number(b.orden ?? 100),
    })
    .returning();
  return NextResponse.json({ servicio: nuevo });
}
