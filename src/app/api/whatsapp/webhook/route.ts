import { NextRequest, NextResponse } from "next/server";
import { responderWhatsApp } from "@/lib/agente";
import { enviarWhatsApp } from "@/lib/twilio";

export const dynamic = "force-dynamic";

// Webhook entrante de WhatsApp.
//
// DEMO: configurado para el SANDBOX de Twilio para WhatsApp, que envía un
// POST con form-urlencoded (campos `From`, `Body`, `ProfileName`, ...).
//
// PRODUCCIÓN (Meta WhatsApp Cloud API): Meta envía JSON con otra estructura y
// exige verificación del webhook (GET con hub.challenge) y validación de firma
// (X-Hub-Signature-256). Ver README, sección "Pasar a producción".
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let from = "";
    let body = "";

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
      return new NextResponse("ok", { status: 200 });
    }

    const respuesta = await responderWhatsApp({ telefono: from, mensaje: body });

    // Respondemos enviando un mensaje saliente por Twilio. (También se podría
    // devolver TwiML, pero enviar por API funciona igual en sandbox y producción.)
    await enviarWhatsApp(from, respuesta);

    return new NextResponse("ok", { status: 200 });
  } catch (e) {
    console.error("Error en webhook de WhatsApp:", e);
    // Devolvemos 200 para que Twilio no reintente en bucle.
    return new NextResponse("ok", { status: 200 });
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
