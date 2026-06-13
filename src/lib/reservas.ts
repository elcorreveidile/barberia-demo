import { and, eq, gte, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { dentroDeHorario } from "./disponibilidad";
import { enviarConfirmacionCita } from "./email";
import { formatoLargo } from "./fecha";

export type ResultadoReserva =
  | { ok: true; citaId: number }
  | { ok: false; motivo: "ocupado" | "fuera_horario" | "datos" | "error"; mensaje: string };

// ¿Es un error de violación del constraint EXCLUDE (solapamiento)?
function esSolapamiento(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return (
    err?.code === "23P01" ||
    /exclus|solap|sin_solapamiento|overlap/i.test(err?.message ?? "")
  );
}

// Crea una cita. El anti-solapamiento lo garantiza la BD (EXCLUDE gist):
// aunque dos peticiones lleguen a la vez, sólo una puede insertar.
export async function crearCita(opts: {
  servicioId: number;
  profesionalId: number;
  inicio: Date;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string | null;
  origen?: "web" | "whatsapp" | "panel";
  notas?: string;
  enviarEmail?: boolean;
}): Promise<ResultadoReserva> {
  const db = getDb();

  const [servicio] = await db
    .select()
    .from(schema.servicios)
    .where(eq(schema.servicios.id, opts.servicioId));
  if (!servicio) return { ok: false, motivo: "datos", mensaje: "Servicio no encontrado." };

  const fin = new Date(opts.inicio.getTime() + servicio.duracionMin * 60_000);

  if (!dentroDeHorario(opts.inicio, servicio.duracionMin)) {
    return {
      ok: false,
      motivo: "fuera_horario",
      mensaje: "Ese horario está fuera del horario de apertura.",
    };
  }

  if (!opts.clienteNombre?.trim() || !opts.clienteTelefono?.trim()) {
    return { ok: false, motivo: "datos", mensaje: "Faltan nombre o teléfono." };
  }

  try {
    const [cita] = await db
      .insert(schema.citas)
      .values({
        servicioId: opts.servicioId,
        profesionalId: opts.profesionalId,
        clienteNombre: opts.clienteNombre.trim(),
        clienteTelefono: opts.clienteTelefono.trim(),
        clienteEmail: opts.clienteEmail?.trim() || null,
        inicio: opts.inicio,
        fin,
        estado: "confirmada",
        origen: opts.origen ?? "web",
        notas: opts.notas ?? "",
      })
      .returning({ id: schema.citas.id });

    if (opts.enviarEmail && opts.clienteEmail) {
      const [prof] = await db
        .select()
        .from(schema.profesionales)
        .where(eq(schema.profesionales.id, opts.profesionalId));
      // No bloqueamos la reserva si falla el email.
      enviarConfirmacionCita({
        para: opts.clienteEmail,
        nombre: opts.clienteNombre,
        servicio: servicio.nombre,
        profesional: prof?.nombre ?? "",
        cuando: formatoLargo(opts.inicio),
      }).catch((e) => console.error("Error enviando email de confirmación:", e));
    }

    return { ok: true, citaId: cita.id };
  } catch (e) {
    if (esSolapamiento(e)) {
      return {
        ok: false,
        motivo: "ocupado",
        mensaje: "Ese hueco se acaba de ocupar. Elige otra hora.",
      };
    }
    console.error("Error creando cita:", e);
    return { ok: false, motivo: "error", mensaje: "No se pudo crear la cita." };
  }
}

export async function cancelarCita(citaId: number): Promise<boolean> {
  const db = getDb();
  const res = await db
    .update(schema.citas)
    .set({ estado: "cancelada" })
    .where(eq(schema.citas.id, citaId))
    .returning({ id: schema.citas.id });
  return res.length > 0;
}

export async function moverCita(
  citaId: number,
  nuevoInicio: Date
): Promise<ResultadoReserva> {
  const db = getDb();
  const [cita] = await db
    .select()
    .from(schema.citas)
    .where(eq(schema.citas.id, citaId));
  if (!cita) return { ok: false, motivo: "datos", mensaje: "Cita no encontrada." };

  const [servicio] = await db
    .select()
    .from(schema.servicios)
    .where(eq(schema.servicios.id, cita.servicioId));
  if (!servicio) return { ok: false, motivo: "datos", mensaje: "Servicio no encontrado." };

  const fin = new Date(nuevoInicio.getTime() + servicio.duracionMin * 60_000);
  if (!dentroDeHorario(nuevoInicio, servicio.duracionMin)) {
    return { ok: false, motivo: "fuera_horario", mensaje: "Fuera de horario." };
  }

  try {
    await db
      .update(schema.citas)
      .set({ inicio: nuevoInicio, fin })
      .where(eq(schema.citas.id, citaId));
    return { ok: true, citaId };
  } catch (e) {
    if (esSolapamiento(e)) {
      return { ok: false, motivo: "ocupado", mensaje: "Ese hueco está ocupado." };
    }
    return { ok: false, motivo: "error", mensaje: "No se pudo mover la cita." };
  }
}

// Busca la próxima cita futura de un teléfono (para cancelar/mover por WhatsApp).
export async function proximaCitaDeTelefono(telefono: string) {
  const db = getDb();
  const filas = await db
    .select()
    .from(schema.citas)
    .where(
      and(
        eq(schema.citas.clienteTelefono, telefono),
        ne(schema.citas.estado, "cancelada"),
        gte(schema.citas.inicio, new Date())
      )
    )
    .orderBy(schema.citas.inicio)
    .limit(1);
  return filas[0] ?? null;
}
