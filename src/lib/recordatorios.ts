import { and, asc, eq, gte, lte } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { formatoLargo } from "./fecha";
import { NEGOCIO } from "./negocio";
import { enviarRecordatorioCita } from "./email";
import { enviarWhatsApp } from "./twilio";
import { crearEnlaceGestion } from "./accesoCliente";

const H = 3_600_000;

// Envía los recordatorios pendientes para las próximas 24 h.
// - 24 h antes: si aún no se envió.
// - 2 h antes: si aún no se envió.
// Devuelve cuántos recordatorios se han mandado.
export async function enviarRecordatoriosPendientes(): Promise<number> {
  const db = getDb();
  const ahora = new Date();
  const limite = new Date(ahora.getTime() + 24 * H);

  const filas = await db
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
        eq(schema.citas.estado, "confirmada"),
        gte(schema.citas.inicio, ahora),
        lte(schema.citas.inicio, limite)
      )
    )
    .orderBy(asc(schema.citas.inicio));

  let enviados = 0;

  for (const { cita, servicio, profesional } of filas) {
    const horas = (new Date(cita.inicio).getTime() - ahora.getTime()) / H;

    let tipo: "2h" | "24h" | null = null;
    if (horas <= 2 && !cita.recordatorio2hEnviado) tipo = "2h";
    else if (horas <= 24 && horas > 2 && !cita.recordatorio24hEnviado) tipo = "24h";
    if (!tipo) continue;

    const cuando = formatoLargo(new Date(cita.inicio));
    const texto =
      `Hola ${cita.clienteNombre}, te recordamos tu cita en ${NEGOCIO.nombre}:\n` +
      `${servicio.nombre} con ${profesional.nombre}\n${cuando}.\n` +
      `¿La confirmas? Responde *SÍ* para confirmar o *NO* para cancelarla o cambiarla.`;

    // WhatsApp (best-effort; en el sandbox el número debe haber hecho "join").
    if (cita.clienteTelefono?.startsWith("+")) {
      await enviarWhatsApp(`whatsapp:${cita.clienteTelefono}`, texto).catch((e) =>
        console.error("Recordatorio WhatsApp falló:", e)
      );
    }
    // Email (si hay), con enlace de gestión.
    if (cita.clienteEmail) {
      const enlace = await crearEnlaceGestion(cita.clienteEmail).catch(() => null);
      await enviarRecordatorioCita({
        para: cita.clienteEmail,
        nombre: cita.clienteNombre,
        servicio: servicio.nombre,
        profesional: profesional.nombre,
        cuando,
        enlaceGestion: enlace ?? undefined,
      }).catch((e) => console.error("Recordatorio email falló:", e));
    }

    await db
      .update(schema.citas)
      .set(tipo === "2h" ? { recordatorio2hEnviado: true } : { recordatorio24hEnviado: true })
      .where(eq(schema.citas.id, cita.id));
    enviados++;
  }

  return enviados;
}
