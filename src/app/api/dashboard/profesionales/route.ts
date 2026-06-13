import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { exigirSesion } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const no = await exigirSesion();
  if (no) return no;
  const db = getDb();
  const profesionales = await db
    .select()
    .from(schema.profesionales)
    .orderBy(asc(schema.profesionales.orden));
  return NextResponse.json({ profesionales });
}

export async function POST(req: NextRequest) {
  const no = await exigirSesion();
  if (no) return no;
  const b = await req.json().catch(() => null);
  if (!b?.nombre || !b?.rol) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }
  const db = getDb();
  const [nuevo] = await db
    .insert(schema.profesionales)
    .values({
      nombre: b.nombre,
      rol: b.rol,
      bio: b.bio ?? "",
      fotoUrl: b.fotoUrl ?? null,
      orden: Number(b.orden ?? 100),
    })
    .returning();
  return NextResponse.json({ profesional: nuevo });
}
