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
  if (b.descripcion != null) set.descripcion = b.descripcion;
  if (b.precioCents != null) set.precioCents = Number(b.precioCents);
  if (b.duracionMin != null) set.duracionMin = Number(b.duracionMin);
  if (b.categoria != null) set.categoria = b.categoria;
  if (b.activo != null) set.activo = Boolean(b.activo);
  if (b.orden != null) set.orden = Number(b.orden);

  if (Object.keys(set).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const db = getDb();
  const [servicio] = await db
    .update(schema.servicios)
    .set(set)
    .where(eq(schema.servicios.id, Number(id)))
    .returning();
  return NextResponse.json({ servicio });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const no = await exigirSesion();
  if (no) return no;
  const { id } = await params;
  // Borrado lógico para no romper citas existentes.
  const db = getDb();
  await db
    .update(schema.servicios)
    .set({ activo: false })
    .where(eq(schema.servicios.id, Number(id)));
  return NextResponse.json({ ok: true });
}
