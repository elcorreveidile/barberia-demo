// Utilidades de fecha/hora con zona horaria, sin dependencias externas.
// Todo el negocio razona en hora local de Madrid, pero persistimos en UTC.

import { NEGOCIO } from "./negocio";

const TZ = NEGOCIO.zonaHoraria;

// Offset (en ms) de la zona horaria respecto a UTC para un instante dado.
function offsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = Number(p.value);
  // Intl puede devolver hour 24 a medianoche en algunos entornos.
  const hour = map.hour === 24 ? 0 : map.hour;
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    hour,
    map.minute,
    map.second
  );
  return asUTC - date.getTime();
}

// Convierte una hora "de pared" de Madrid (YYYY, M, D, h, m) al instante UTC.
export function madridAUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number
): Date {
  const wallAsUTC = Date.UTC(year, month - 1, day, hour, minute);
  const off1 = offsetMs(new Date(wallAsUTC), TZ);
  let instante = new Date(wallAsUTC - off1);
  const off2 = offsetMs(instante, TZ);
  if (off2 !== off1) instante = new Date(wallAsUTC - off2);
  return instante;
}

// Partes de la hora "de pared" de Madrid para un instante dado.
export function partesMadrid(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 dom … 6 sáb
} {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) map[p.type] = p.value;
  const weekdays: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: map.hour === "24" ? 0 : Number(map.hour),
    minute: Number(map.minute),
    weekday: weekdays[map.weekday],
  };
}

// "YYYY-MM-DD" (en Madrid) -> {year, month, day}
export function parseFecha(fecha: string): { year: number; month: number; day: number } {
  const [year, month, day] = fecha.split("-").map(Number);
  return { year, month, day };
}

// Día de la semana (0-6) de una fecha "YYYY-MM-DD" interpretada en Madrid.
export function diaSemanaDeFecha(fecha: string): number {
  const { year, month, day } = parseFecha(fecha);
  const instante = madridAUtc(year, month, day, 12, 0); // mediodía, sin ambigüedad DST
  return partesMadrid(instante).weekday;
}

// "HH:MM" -> minutos desde medianoche
export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Formatea un instante como "HH:MM" en hora de Madrid.
export function horaMadrid(date: Date): string {
  const p = partesMadrid(date);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "sábado 14 de junio, 17:30" en hora de Madrid.
export function formatoLargo(date: Date): string {
  const p = partesMadrid(date);
  return `${DIAS[p.weekday]} ${p.day} de ${MESES[p.month - 1]}, ${String(
    p.hour
  ).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

// Fecha de hoy en Madrid como "YYYY-MM-DD".
export function hoyMadrid(): string {
  const p = partesMadrid(new Date());
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}
