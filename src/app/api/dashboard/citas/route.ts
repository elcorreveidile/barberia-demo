import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { exigirSesion } from "@/lib/guard";
import { crearCita } from "@/lib/reservas";

export const dynamic = "force-dynamic";

// GET /api/dashboard/citas?desde=ISO&hasta=ISO&profesionalId=
export async function GET(req: NextRequest) {
  const no = await exigirSesion();
  if (no) return no;

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const profesionalId = searchParams.get("profesionalId");

  const db = getDb();
  const condiciones = [] as ReturnType<typeof gte>[];
  if (desde) condiciones.push(gte(schema.citas.inicio, new Date(desde)));
  if (hasta) condiciones.push(lt(schema.citas.inicio, new Date(hasta)));
  if (profesionalId) condiciones.push(eq(schema.citas.profesionalId, Number(profesionalId)));

  const filas = await db
    .select({
      cita: schema.citas,
      servicio: schema.servicios,
      profesional: schema.profesionales,
    })
    .from(schema.citas)
    .innerJoin(schema.servicios, eq(schema.servicios.id, schema.citas.servicioId))
    .innerJoin(schema.profesionales, eq(schema.profesionales.id, schema.citas.profesionalId))
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(asc(schema.citas.inicio));

  return NextResponse.json({ citas: filas });
}

// POST /api/dashboard/citas — crear cita desde el panel
export async function POST(req: NextRequest) {
  const no = await exigirSesion();
  if (no) return no;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  const { servicioId, profesionalId, inicio, nombre, telefono, email, notas } = body;
  if (!servicioId || !profesionalId || !inicio || !nombre || !telefono) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  const res = await crearCita({
    servicioId: Number(servicioId),
    profesionalId: Number(profesionalId),
    inicio: new Date(inicio),
    clienteNombre: nombre,
    clienteTelefono: telefono,
    clienteEmail: email || null,
    notas: notas || "",
    origen: "panel",
    enviarEmail: false,
  });

  if (!res.ok) {
    const status = res.motivo === "ocupado" ? 409 : 400;
    return NextResponse.json({ error: res.mensaje, motivo: res.motivo }, { status });
  }
  return NextResponse.json({ ok: true, citaId: res.citaId });
}
