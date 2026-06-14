import { enviarAvisoNegocio } from "./email";
import { enviarWhatsApp } from "./twilio";

export interface AvisoCita {
  servicio: string;
  profesional: string;
  cuando: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  origen: string;
}

// Avisa al negocio de una cita nueva por email y/o WhatsApp (lo que esté
// configurado). Pensado para llamarse en segundo plano (fire-and-forget).
export async function avisarNuevaCita(c: AvisoCita) {
  // Destinatario del email de aviso: EMAIL_AVISOS, o el primer ADMIN_EMAILS.
  const emailDestino =
    (process.env.EMAIL_AVISOS || process.env.ADMIN_EMAILS || "")
      .split(",")[0]
      .trim();

  if (emailDestino) {
    await enviarAvisoNegocio(emailDestino, c).catch((e) =>
      console.error("Error en email de aviso al negocio:", e)
    );
  }

  // Aviso por WhatsApp al móvil del barbero (opcional). En el sandbox de
  // Twilio, ese número debe haber hecho el "join" para poder recibirlo.
  const waDestino = process.env.WHATSAPP_AVISOS_TO; // formato whatsapp:+34...
  if (waDestino) {
    const texto =
      `📅 Nueva cita (${c.origen})\n` +
      `${c.servicio} con ${c.profesional}\n` +
      `${c.cuando}\n` +
      `${c.clienteNombre} · ${c.clienteTelefono}`;
    await enviarWhatsApp(waDestino, texto).catch((e) =>
      console.error("Error en WhatsApp de aviso al negocio:", e)
    );
  }
}
