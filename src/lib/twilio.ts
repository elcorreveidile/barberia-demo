import twilio from "twilio";

let _cliente: ReturnType<typeof twilio> | null = null;
function cliente() {
  if (_cliente) return _cliente;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  _cliente = twilio(sid, token);
  return _cliente;
}

// Envía un mensaje de WhatsApp. `para` y el FROM deben venir con prefijo
// "whatsapp:" (formato Twilio).
export async function enviarWhatsApp(para: string, cuerpo: string) {
  const c = cliente();
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!c || !from) {
    console.log(`\n[WhatsApp omitido — sin credenciales Twilio]\nPara ${para}:\n${cuerpo}\n`);
    return;
  }
  await c.messages.create({ from, to: para, body: cuerpo });
}
