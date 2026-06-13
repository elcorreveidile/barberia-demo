import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { listarServicios, listarProfesionales } from "@/lib/datos";

export const dynamic = "force-dynamic";

// Devuelve servicios, profesionales y la relación entre ellos, para que el
// flujo de reserva pueda filtrar profesionales por servicio.
export async function GET() {
  try {
    const db = getDb();
    const [servicios, profesionales, relaciones] = await Promise.all([
      listarServicios(),
      listarProfesionales(),
      db
        .select()
        .from(schema.servicioProfesional)
        .innerJoin(
          schema.servicios,
          eq(schema.servicios.id, schema.servicioProfesional.servicioId)
        ),
    ]);

    const profesionalesPorServicio: Record<number, number[]> = {};
    for (const r of relaciones) {
      const sid = r.servicio_profesional.servicioId;
      (profesionalesPorServicio[sid] ??= []).push(
        r.servicio_profesional.profesionalId
      );
    }

    return NextResponse.json({ servicios, profesionales, profesionalesPorServicio });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudieron cargar los servicios." },
      { status: 500 }
    );
  }
}
