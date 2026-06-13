import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { sesionCliente } from "@/lib/auth";
import { cancelarCita } from "@/lib/reservas";

export const dynamic = "force-dynamic";

// DELETE: el cliente cancela una cita SUYA (verificamos propiedad por la sesión).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const identificador = await sesionCliente();
  if (!identificador) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const citaId = Number(id);

  const db = getDb();
  const [cita] = await db
    .select()
    .from(schema.citas)
    .where(eq(schema.citas.id, citaId));

  if (!cita) {
    return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
  }

  // La cita debe pertenecer al identificador de la sesión.
  const id2 = identificador.trim().toLowerCase();
  const esSuya =
    (cita.clienteEmail ?? "").trim().toLowerCase() === id2 ||
    cita.clienteTelefono.trim() === identificador.trim();
  if (!esSuya) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  await cancelarCita(citaId);
  return NextResponse.json({ ok: true });
}
