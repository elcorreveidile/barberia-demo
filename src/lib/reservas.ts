import { and, eq, gte, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { dentroDeHorario } from "./disponibilidad";
import { enviarConfirmacionCita, enviarActualizacionCliente } from "./email";
import { avisarNuevaCita, avisarCitaActualizada } from "./avisos";
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

    const [prof] = await db
      .select()
      .from(schema.profesionales)
      .where(eq(schema.profesionales.id, opts.profesionalId));
    const cuando = formatoLargo(opts.inicio);

    // Confirmación al cliente (solo si hay email). No bloquea la reserva.
    if (opts.enviarEmail && opts.clienteEmail) {
      enviarConfirmacionCita({
        para: opts.clienteEmail,
        nombre: opts.clienteNombre,
        servicio: servicio.nombre,
        profesional: prof?.nombre ?? "",
        cuando,
      }).catch((e) => console.error("Error enviando email de confirmación:", e));
    }

    // Aviso al negocio en cada cita nueva, salvo las creadas desde el panel
    // (esas las hace el propio negocio). No bloquea la reserva.
    if ((opts.origen ?? "web") !== "panel") {
      avisarNuevaCita({
        servicio: servicio.nombre,
        profesional: prof?.nombre ?? "",
        cuando,
        clienteNombre: opts.clienteNombre,
        clienteTelefono: opts.clienteTelefono,
        clienteEmail: opts.clienteEmail ?? null,
        origen: opts.origen ?? "web",
      }).catch((e) => console.error("Error avisando al negocio:", e));
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

export async function cancelarCita(
  citaId: number,
  opts?: { avisarNegocio?: boolean; origen?: string }
): Promise<boolean> {
  const db = getDb();
  // Cargamos los datos antes de cancelar para poder avisar.
  const datos = await datosCita(citaId);
  const res = await db
    .update(schema.citas)
    .set({ estado: "cancelada" })
    .where(eq(schema.citas.id, citaId))
    .returning({ id: schema.citas.id });
  if (res.length === 0) return false;

  if (datos) notificarCambio(datos, "cancelada", datos.cita.inicio, opts);
  return true;
}

// Carga cita + servicio + profesional (para los avisos).
async function datosCita(citaId: number) {
  const db = getDb();
  const [fila] = await db
    .select({
      cita: schema.citas,
      servicio: schema.servicios,
      profesional: schema.profesionales,
    })
    .from(schema.citas)
    .innerJoin(schema.servicios, eq(schema.servicios.id, schema.citas.servicioId))
    .innerJoin(schema.profesionales, eq(schema.profesionales.id, schema.citas.profesionalId))
    .where(eq(schema.citas.id, citaId));
  return fila ?? null;
}

// Envía (fire-and-forget) los avisos de cambio: email al cliente (si tiene) y
// aviso al negocio (salvo que se desactive, p. ej. cuando lo hace el panel).
function notificarCambio(
  datos: NonNullable<Awaited<ReturnType<typeof datosCita>>>,
  accion: "movida" | "cancelada",
  cuandoFecha: Date | string,
  opts?: { avisarNegocio?: boolean; origen?: string }
) {
  const cuando = formatoLargo(new Date(cuandoFecha));
  if (datos.cita.clienteEmail) {
    enviarActualizacionCliente({
      para: datos.cita.clienteEmail,
      nombre: datos.cita.clienteNombre,
      servicio: datos.servicio.nombre,
      profesional: datos.profesional.nombre,
      cuando,
      accion,
    }).catch((e) => console.error("Error email actualización cliente:", e));
  }
  if (opts?.avisarNegocio !== false) {
    avisarCitaActualizada(
      {
        servicio: datos.servicio.nombre,
        profesional: datos.profesional.nombre,
        cuando,
        clienteNombre: datos.cita.clienteNombre,
        clienteTelefono: datos.cita.clienteTelefono,
        clienteEmail: datos.cita.clienteEmail,
        origen: opts?.origen ?? datos.cita.origen,
      },
      accion
    ).catch((e) => console.error("Error aviso negocio actualización:", e));
  }
}

export async function moverCita(
  citaId: number,
  nuevoInicio: Date,
  opts?: { avisarNegocio?: boolean; origen?: string }
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
    const datos = await datosCita(citaId);
    if (datos) notificarCambio(datos, "movida", nuevoInicio, opts);
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
