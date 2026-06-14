import { NextRequest, NextResponse } from "next/server";
import { exigirSesion } from "@/lib/guard";
import { cancelarCita, moverCita } from "@/lib/reservas";

export const dynamic = "force-dynamic";

// PATCH /api/dashboard/citas/[id] — mover (nuevo inicio) o cambiar estado
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const no = await exigirSesion();
  if (no) return no;

  const { id } = await params;
  const citaId = Number(id);
  const body = await req.json().catch(() => ({}));

  if (body.inicio) {
    const res = await moverCita(citaId, new Date(body.inicio), { avisarNegocio: false, origen: "panel" });
    if (!res.ok) {
      const status = res.motivo === "ocupado" ? 409 : 400;
      return NextResponse.json({ error: res.mensaje }, { status });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.estado === "cancelada") {
    const ok = await cancelarCita(citaId, { avisarNegocio: false, origen: "panel" });
    return NextResponse.json({ ok });
  }

  return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
}

// DELETE = cancelar
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const no = await exigirSesion();
  if (no) return no;
  const { id } = await params;
  const ok = await cancelarCita(Number(id), { avisarNegocio: false, origen: "panel" });
  return NextResponse.json({ ok });
}
