import { enviarAvisoNegocio } from "./email";
import { enviarWhatsApp } from "./twilio";

export type AccionCita = "nueva" | "movida" | "cancelada";

export interface AvisoCita {
  servicio: string;
  profesional: string;
  cuando: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  origen: string;
}

const ENCABEZADO: Record<AccionCita, string> = {
  nueva: "📅 Nueva cita",
  movida: "🔄 Cita reprogramada",
  cancelada: "❌ Cita cancelada",
};

// Avisa al negocio (email y/o WhatsApp) de un cambio en una cita.
async function avisar(c: AvisoCita, accion: AccionCita) {
  const emailDestino =
    (process.env.EMAIL_AVISOS || process.env.ADMIN_EMAILS || "")
      .split(",")[0]
      .trim();

  if (emailDestino) {
    await enviarAvisoNegocio(emailDestino, c, accion).catch((e) =>
      console.error("Error en email de aviso al negocio:", e)
    );
  }

  const waDestino = process.env.WHATSAPP_AVISOS_TO; // whatsapp:+34...
  if (waDestino) {
    const texto =
      `${ENCABEZADO[accion]} (${c.origen})\n` +
      `${c.servicio} con ${c.profesional}\n` +
      `${c.cuando}\n` +
      `${c.clienteNombre} · ${c.clienteTelefono}`;
    await enviarWhatsApp(waDestino, texto).catch((e) =>
      console.error("Error en WhatsApp de aviso al negocio:", e)
    );
  }
}

export const avisarNuevaCita = (c: AvisoCita) => avisar(c, "nueva");
export const avisarCitaActualizada = (c: AvisoCita, accion: AccionCita) =>
  avisar(c, accion);
