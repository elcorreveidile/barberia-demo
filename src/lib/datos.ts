import { and, asc, desc, eq, gte, isNotNull, lt, ne, or, sql } from "drizzle-orm";
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

// Coincidencia de cliente: por email (sin distinguir mayúsculas) o teléfono exacto.
function coincideCliente(identificador: string) {
  const id = identificador.trim();
  return or(
    sql`lower(${schema.citas.clienteEmail}) = lower(${id})`,
    eq(schema.citas.clienteTelefono, id)
  );
}

// Próximas citas (no canceladas) de un cliente identificado por email o teléfono.
export async function citasFuturasDeCliente(identificador: string) {
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
        coincideCliente(identificador),
        ne(schema.citas.estado, "cancelada"),
        gte(schema.citas.inicio, new Date())
      )
    )
    .orderBy(asc(schema.citas.inicio));
}

// ¿Existe alguna cita asociada a este identificador? (para no enviar enlaces a desconocidos)
export async function clienteTieneCitas(identificador: string): Promise<boolean> {
  const db = getDb();
  const filas = await db
    .select({ id: schema.citas.id })
    .from(schema.citas)
    .where(coincideCliente(identificador))
    .limit(1);
  return filas.length > 0;
}

// Email al que enviar el enlace: si el identificador ya es un email, ese mismo;
// si es un teléfono, el email de su cita más reciente que tenga email.
export async function emailDeContacto(identificador: string): Promise<string | null> {
  const id = identificador.trim();
  if (id.includes("@")) return id;
  const db = getDb();
  const [fila] = await db
    .select({ email: schema.citas.clienteEmail })
    .from(schema.citas)
    .where(and(eq(schema.citas.clienteTelefono, id), isNotNull(schema.citas.clienteEmail)))
    .orderBy(desc(schema.citas.creadaEn))
    .limit(1);
  return fila?.email ?? null;
}

export function formatoPrecio(cents: number): string {
  return (cents / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}
