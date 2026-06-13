import { and, asc, eq, gte, lt, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";

export async function listarServicios() {
  const db = getDb();
  return db
    .select()
    .from(schema.servicios)
    .where(eq(schema.servicios.activo, true))
    .orderBy(asc(schema.servicios.orden));
}

export async function listarProfesionales() {
  const db = getDb();
  return db
    .select()
    .from(schema.profesionales)
    .where(eq(schema.profesionales.activo, true))
    .orderBy(asc(schema.profesionales.orden));
}

// Profesionales que ofrecen un servicio dado.
export async function profesionalesDeServicio(servicioId: number) {
  const db = getDb();
  const filas = await db
    .select({ prof: schema.profesionales })
    .from(schema.servicioProfesional)
    .innerJoin(
      schema.profesionales,
      eq(schema.profesionales.id, schema.servicioProfesional.profesionalId)
    )
    .where(
      and(
        eq(schema.servicioProfesional.servicioId, servicioId),
        eq(schema.profesionales.activo, true)
      )
    )
    .orderBy(asc(schema.profesionales.orden));
  return filas.map((f) => f.prof);
}

// Citas (no canceladas) en un rango, con servicio y profesional embebidos.
export async function citasEnRango(desde: Date, hasta: Date) {
  const db = getDb();
  return db
    .select({
      cita: schema.citas,
      servicio: schema.servicios,
      profesional: schema.profesionales,
    })
    .from(schema.citas)
    .innerJoin(schema.servicios, eq(schema.servicios.id, schema.citas.servicioId))
    .innerJoin(schema.profesionales, eq(schema.profesionales.id, schema.citas.profesionalId))
    .where(
      and(
        gte(schema.citas.inicio, desde),
        lt(schema.citas.inicio, hasta),
        ne(schema.citas.estado, "cancelada")
      )
    )
    .orderBy(asc(schema.citas.inicio));
}

export function formatoPrecio(cents: number): string {
  return (cents / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}
