import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { exigirSesion } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const no = await exigirSesion();
  if (no) return no;
  const { id } = await params;
  const b = await req.json().catch(() => ({}));

  const set: Record<string, unknown> = {};
  if (b.nombre != null) set.nombre = b.nombre;
  if (b.rol != null) set.rol = b.rol;
  if (b.bio != null) set.bio = b.bio;
  if (b.fotoUrl != null) set.fotoUrl = b.fotoUrl;
  if (b.activo != null) set.activo = Boolean(b.activo);
  if (b.orden != null) set.orden = Number(b.orden);

  if (Object.keys(set).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const db = getDb();
  const [profesional] = await db
    .update(schema.profesionales)
    .set(set)
    .where(eq(schema.profesionales.id, Number(id)))
    .returning();
  return NextResponse.json({ profesional });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const no = await exigirSesion();
  if (no) return no;
  const { id } = await params;
  const db = getDb();
  await db
    .update(schema.profesionales)
    .set({ activo: false })
    .where(eq(schema.profesionales.id, Number(id)));
  return NextResponse.json({ ok: true });
}
