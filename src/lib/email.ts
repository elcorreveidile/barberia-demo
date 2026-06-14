import { Resend } from "resend";
import { NEGOCIO } from "./negocio";

let _resend: Resend | null = null;
function cliente(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // en local sin clave, los emails se omiten
  _resend = new Resend(key);
  return _resend;
}

const FROM = () => process.env.EMAIL_FROM || `${NEGOCIO.nombre} <onboarding@resend.dev>`;

function marco(titulo: string, cuerpo: string): string {
  return `
  <div style="background:#121212;padding:32px 0;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#1C1917;border:1px solid #3A332F;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;border-bottom:1px solid #3A332F;">
        <span style="color:#B68D40;font-size:20px;letter-spacing:2px;font-weight:700;">${NEGOCIO.nombre.toUpperCase()}</span>
      </div>
      <div style="padding:28px;color:#F5F0E6;">
        <h1 style="font-size:20px;margin:0 0 16px;color:#F5F0E6;">${titulo}</h1>
        ${cuerpo}
      </div>
      <div style="padding:18px 28px;border-top:1px solid #3A332F;color:#8a8178;font-size:12px;">
        ${NEGOCIO.nombre} · ${NEGOCIO.direccion}
      </div>
    </div>
  </div>`;
}

export async function enviarMagicLink(para: string, enlace: string) {
  const c = cliente();
  const cuerpo = `
    <p style="color:#cfc7ba;line-height:1.6;">Pulsa el botón para acceder al panel. El enlace caduca en 15 minutos y solo se puede usar una vez.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${enlace}" style="background:#B68D40;color:#121212;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;display:inline-block;">Entrar al panel</a>
    </p>
    <p style="color:#8a8178;font-size:13px;">Si no has solicitado este acceso, ignora este correo.</p>`;
  if (!c) {
    console.log(`\n[EMAIL omitido — sin RESEND_API_KEY]\nMagic link para ${para}:\n${enlace}\n`);
    return;
  }
  await c.emails.send({
    from: FROM(),
    to: para,
    subject: `Acceso al panel · ${NEGOCIO.nombre}`,
    html: marco("Tu acceso al panel", cuerpo),
  });
}

export async function enviarEnlaceCitas(para: string, enlace: string) {
  const c = cliente();
  const cuerpo = `
    <p style="color:#cfc7ba;line-height:1.6;">Pulsa el botón para ver y gestionar tus citas. El enlace caduca en 15 minutos y solo se puede usar una vez.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${enlace}" style="background:#B68D40;color:#121212;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;display:inline-block;">Ver mis citas</a>
    </p>
    <p style="color:#8a8178;font-size:13px;">Si no has solicitado este acceso, ignora este correo.</p>`;
  if (!c) {
    console.log(`\n[EMAIL omitido — sin RESEND_API_KEY]\nEnlace "mis citas" para ${para}:\n${enlace}\n`);
    return;
  }
  await c.emails.send({
    from: FROM(),
    to: para,
    subject: `Tus citas · ${NEGOCIO.nombre}`,
    html: marco("Tus citas", cuerpo),
  });
}

export async function enviarRecordatorioCita(opts: {
  para: string;
  nombre: string;
  servicio: string;
  profesional: string;
  cuando: string;
  enlaceGestion?: string;
}) {
  const c = cliente();
  const cuerpo = `
    <p style="color:#cfc7ba;line-height:1.6;">Hola ${opts.nombre}, te recordamos tu próxima cita:</p>
    <table style="width:100%;color:#F5F0E6;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#8a8178;">Servicio</td><td style="text-align:right;">${opts.servicio}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Profesional</td><td style="text-align:right;">${opts.profesional}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Cuándo</td><td style="text-align:right;color:#B68D40;font-weight:700;">${opts.cuando}</td></tr>
    </table>
    ${botonGestion(opts.enlaceGestion)}
    <p style="color:#8a8178;font-size:13px;">¿No puedes venir? Cancela o cámbiala desde el botón, respondiendo a este correo o por WhatsApp.</p>`;
  if (!c) {
    console.log(`\n[EMAIL omitido — sin RESEND_API_KEY]\nRecordatorio para ${opts.para}: ${opts.servicio} · ${opts.cuando}\n`);
    return;
  }
  await c.emails.send({
    from: FROM(),
    to: opts.para,
    subject: `Recordatorio de tu cita · ${opts.cuando}`,
    html: marco("Recordatorio de tu cita", cuerpo),
  });
}

export async function enviarAvisoNegocio(
  para: string,
  c: {
    servicio: string;
    profesional: string;
    cuando: string;
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail: string | null;
    origen: string;
  },
  accion: "nueva" | "movida" | "cancelada" = "nueva"
) {
  const cli = cliente();
  const titulos = {
    nueva: "Nueva cita",
    movida: "Cita reprogramada",
    cancelada: "Cita cancelada",
  } as const;
  const intro = {
    nueva: `Nueva cita reservada (vía <b>${c.origen}</b>):`,
    movida: `Una cita se ha reprogramado (vía <b>${c.origen}</b>):`,
    cancelada: `Una cita se ha cancelado (vía <b>${c.origen}</b>):`,
  } as const;
  const cuerpo = `
    <p style="color:#cfc7ba;line-height:1.6;">${intro[accion]}</p>
    <table style="width:100%;color:#F5F0E6;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#8a8178;">Servicio</td><td style="text-align:right;">${c.servicio}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Profesional</td><td style="text-align:right;">${c.profesional}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Cuándo</td><td style="text-align:right;color:#B68D40;font-weight:700;">${c.cuando}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Cliente</td><td style="text-align:right;">${c.clienteNombre}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Teléfono</td><td style="text-align:right;">${c.clienteTelefono}</td></tr>
      ${c.clienteEmail ? `<tr><td style="padding:6px 0;color:#8a8178;">Email</td><td style="text-align:right;">${c.clienteEmail}</td></tr>` : ""}
    </table>`;
  if (!cli) {
    console.log(`\n[EMAIL omitido — sin RESEND_API_KEY]\nAviso al negocio (${para}) [${accion}]: ${c.servicio} · ${c.cuando} · ${c.clienteNombre}\n`);
    return;
  }
  await cli.emails.send({
    from: FROM(),
    to: para,
    subject: `${titulos[accion]} · ${c.cuando} · ${c.clienteNombre}`,
    html: marco(titulos[accion], cuerpo),
  });
}

// Email al cliente cuando su cita se mueve o se cancela.
export async function enviarActualizacionCliente(opts: {
  para: string;
  nombre: string;
  servicio: string;
  profesional: string;
  cuando: string;
  accion: "movida" | "cancelada";
  enlaceGestion?: string;
}) {
  const c = cliente();
  const titulo = opts.accion === "cancelada" ? "Cita cancelada" : "Cita reprogramada";
  const intro =
    opts.accion === "cancelada"
      ? `Hola ${opts.nombre}, tu cita ha sido <b>cancelada</b>:`
      : `Hola ${opts.nombre}, tu cita se ha <b>reprogramado</b>. Nuevos datos:`;
  const pie =
    opts.accion === "cancelada"
      ? `<p style="color:#8a8178;font-size:13px;">¿Quieres pedir otra? Reserva en la web o escríbenos por WhatsApp.</p>`
      : `<p style="color:#8a8178;font-size:13px;">Si no reconoces este cambio, contáctanos.</p>`;
  const cuerpo = `
    <p style="color:#cfc7ba;line-height:1.6;">${intro}</p>
    <table style="width:100%;color:#F5F0E6;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#8a8178;">Servicio</td><td style="text-align:right;">${opts.servicio}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Profesional</td><td style="text-align:right;">${opts.profesional}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">${opts.accion === "cancelada" ? "Era" : "Cuándo"}</td><td style="text-align:right;color:#B68D40;font-weight:700;">${opts.cuando}</td></tr>
    </table>
    ${botonGestion(opts.enlaceGestion)}
    ${pie}`;
  if (!c) {
    console.log(`\n[EMAIL omitido — sin RESEND_API_KEY]\nActualización (${opts.accion}) para ${opts.para}: ${opts.servicio} · ${opts.cuando}\n`);
    return;
  }
  await c.emails.send({
    from: FROM(),
    to: opts.para,
    subject: `${titulo} · ${opts.cuando}`,
    html: marco(titulo, cuerpo),
  });
}

function botonGestion(enlace?: string): string {
  if (!enlace) return "";
  return `
    <p style="text-align:center;margin:24px 0;">
      <a href="${enlace}" style="background:#B68D40;color:#121212;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;display:inline-block;">Ver / gestionar mi cita</a>
    </p>`;
}

export async function enviarConfirmacionCita(opts: {
  para: string;
  nombre: string;
  servicio: string;
  profesional: string;
  cuando: string;
  enlaceGestion?: string;
}) {
  const c = cliente();
  const cuerpo = `
    <p style="color:#cfc7ba;line-height:1.6;">Hola ${opts.nombre}, tu cita está confirmada:</p>
    <table style="width:100%;color:#F5F0E6;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#8a8178;">Servicio</td><td style="text-align:right;">${opts.servicio}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Profesional</td><td style="text-align:right;">${opts.profesional}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178;">Cuándo</td><td style="text-align:right;color:#B68D40;font-weight:700;">${opts.cuando}</td></tr>
    </table>
    ${botonGestion(opts.enlaceGestion)}
    <p style="color:#8a8178;font-size:13px;">¿Necesitas cambiarla? Pulsa el botón de arriba, responde a este correo o escríbenos por WhatsApp.</p>`;
  if (!c) {
    console.log(`\n[EMAIL omitido — sin RESEND_API_KEY]\nConfirmación para ${opts.para}: ${opts.servicio} · ${opts.cuando}\n`);
    return;
  }
  await c.emails.send({
    from: FROM(),
    to: opts.para,
    subject: `Cita confirmada · ${opts.cuando}`,
    html: marco("Cita confirmada", cuerpo),
  });
}
