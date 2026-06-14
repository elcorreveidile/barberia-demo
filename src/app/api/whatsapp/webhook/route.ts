import { NextRequest, NextResponse } from "next/server";
import { responderWhatsApp } from "@/lib/agente";
import { enviarWhatsApp } from "@/lib/twilio";

export const dynamic = "force-dynamic";
// Damos margen a la función: el agente hace varias llamadas a Claude (con
// thinking + herramientas) por mensaje. Sin esto, podría cortarse a medias.
export const maxDuration = 60;

// Respuesta TwiML vacía: le dice a Twilio "no envíes nada como respuesta del
// webhook". El mensaje real al cliente ya se envía por la API de Twilio
// (enviarWhatsApp). Si devolviéramos texto plano, el sandbox lo reenviaría
// como un segundo mensaje (el "ok" fantasma).
function twimlVacio() {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { status: 200, headers: { "Content-Type": "text/xml" } }
  );
}

// Webhook entrante de WhatsApp.
//
// DEMO: configurado para el SANDBOX de Twilio para WhatsApp, que envía un
// POST con form-urlencoded (campos `From`, `Body`, `ProfileName`, ...).
//
// PRODUCCIÓN (Meta WhatsApp Cloud API): Meta envía JSON con otra estructura y
// exige verificación del webhook (GET con hub.challenge) y validación de firma
// (X-Hub-Signature-256). Ver README, sección "Pasar a producción".
export async function POST(req: NextRequest) {
  let from = "";
  let body = "";
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Estructura de Meta WhatsApp Cloud API.
      const json = await req.json();
      const msg = json?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      from = msg?.from ? `whatsapp:+${msg.from}` : "";
      body = msg?.text?.body ?? "";
    } else {
      // Sandbox de Twilio: form-urlencoded.
      const form = await req.formData();
      from = String(form.get("From") ?? "");
      body = String(form.get("Body") ?? "");
    }

    if (!from || !body.trim()) {
      return twimlVacio();
    }

    const respuesta = await responderWhatsApp({ telefono: from, mensaje: body });

    // Respondemos enviando un mensaje saliente por Twilio. (También se podría
    // devolver TwiML, pero enviar por API funciona igual en sandbox y producción.)
    await enviarWhatsApp(from, respuesta);

    return twimlVacio();
  } catch (e) {
    console.error("Error en webhook de WhatsApp:", e);
    // Que el cliente NUNCA se quede sin respuesta: mensaje de cortesía.
    if (from) {
      await enviarWhatsApp(
        from,
        "Uy, ahora mismo no puedo procesar tu mensaje 🙈. Inténtalo de nuevo en un momento; si sigue fallando, te atenderá una persona del equipo."
      ).catch((err) => console.error("Error enviando mensaje de cortesía:", err));
    }
    // Devolvemos 200 para que Twilio no reintente en bucle.
    return twimlVacio();
  }
}

// Verificación del webhook para Meta WhatsApp Cloud API (no usado por Twilio).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}
