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
