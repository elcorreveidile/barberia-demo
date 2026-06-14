// Configuración del negocio. Cambia estos valores para renombrar / reubicar.
export const NEGOCIO = {
  nombre: "Filo Barber Studio",
  claim: "Barbería y estética masculina en Granada",
  ciudad: "Granada",
  direccion: "Calle de la Navaja, 12 · 18001 Granada",
  telefono: "+34 600 000 000",
  whatsapp: "+34600000000", // sin espacios, para el enlace wa.me
  email: "hola@filobarberstudio.com",
  instagram: "@filobarberstudio",
  // Zona horaria del negocio (todo se calcula en hora de Madrid).
  zonaHoraria: "Europe/Madrid",
} as const;

// Horario de apertura por día de la semana (0 = domingo … 6 = sábado).
// Cada tramo es [horaInicio, horaFin] en formato "HH:MM" (hora local Madrid).
// L-V 10:00-14:00 y 17:00-20:30 · S 10:00-14:00 · D cerrado.
export const HORARIO: Record<number, [string, string][]> = {
  0: [], // domingo
  1: [["10:00", "14:00"], ["17:00", "20:30"]], // lunes
  2: [["10:00", "14:00"], ["17:00", "20:30"]],
  3: [["10:00", "14:00"], ["17:00", "20:30"]],
  4: [["10:00", "14:00"], ["17:00", "20:30"]],
  5: [["10:00", "14:00"], ["17:00", "20:30"]], // viernes
  6: [["10:00", "14:00"]], // sábado
};

// Granularidad de los huecos ofrecidos (en minutos).
export const PASO_MIN = 15;

export const HORARIO_TEXTO = "Lunes a viernes: 10:00–14:00 y 17:00–20:30 · Sábado: 10:00–14:00 · Domingo cerrado";

// Enlace de WhatsApp del botón flotante y de Contacto.
// Por defecto apunta al número del negocio con un mensaje de reserva.
// Para conectar con el BOT del sandbox de Twilio en la demo, define en el
// entorno (Vercel):
//   NEXT_PUBLIC_WHATSAPP_NUMERO = 14155238886   (número del sandbox, solo dígitos)
//   NEXT_PUBLIC_WHATSAPP_TEXTO  = join tu-codigo (el código join de tu sandbox)
// Así, al pulsar el botón, el cliente envía el "join" y queda conectado al bot.
export function enlaceWhatsApp(textoPorDefecto?: string): string {
  const numero = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || NEGOCIO.whatsapp
  ).replace(/\D/g, "");
  const texto =
    process.env.NEXT_PUBLIC_WHATSAPP_TEXTO ||
    textoPorDefecto ||
    `Hola, me gustaría reservar una cita en ${NEGOCIO.nombre}.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
