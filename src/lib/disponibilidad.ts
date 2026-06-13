import { and, eq, gte, lt, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { HORARIO, PASO_MIN } from "./negocio";
import {
  aMinutos,
  diaSemanaDeFecha,
  madridAUtc,
  parseFecha,
  partesMadrid,
} from "./fecha";

export interface Hueco {
  inicio: Date; // instante UTC
  fin: Date;
  hora: string; // "HH:MM" en Madrid
}

// Calcula los huecos libres para un profesional, servicio y fecha (YYYY-MM-DD).
export async function calcularHuecos(opts: {
  profesionalId: number;
  duracionMin: number;
  fecha: string; // "YYYY-MM-DD" en Madrid
}): Promise<Hueco[]> {
  const { profesionalId, duracionMin, fecha } = opts;
  const dia = diaSemanaDeFecha(fecha);
  const tramos = HORARIO[dia] ?? [];
  if (tramos.length === 0) return [];

  const { year, month, day } = parseFecha(fecha);

  // Genera candidatos dentro de cada tramo de apertura.
  const candidatos: Hueco[] = [];
  for (const [desde, hasta] of tramos) {
    const minDesde = aMinutos(desde);
    const minHasta = aMinutos(hasta);
    // El último inicio posible permite que el servicio acabe dentro del tramo.
    for (let m = minDesde; m + duracionMin <= minHasta; m += PASO_MIN) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const inicio = madridAUtc(year, month, day, h, min);
      const fin = new Date(inicio.getTime() + duracionMin * 60_000);
      candidatos.push({
        inicio,
        fin,
        hora: `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      });
    }
  }

  // Citas existentes del profesional en ese día (no canceladas).
  const inicioDia = madridAUtc(year, month, day, 0, 0);
  const finDia = new Date(inicioDia.getTime() + 24 * 3600_000);
  const db = getDb();
  const ocupadas = await db
    .select({ inicio: schema.citas.inicio, fin: schema.citas.fin })
    .from(schema.citas)
    .where(
      and(
        eq(schema.citas.profesionalId, profesionalId),
        ne(schema.citas.estado, "cancelada"),
        gte(schema.citas.inicio, inicioDia),
        lt(schema.citas.inicio, finDia)
      )
    );

  const ahora = Date.now();
  return candidatos.filter((c) => {
    if (c.inicio.getTime() <= ahora) return false; // no ofrecer pasado
    for (const o of ocupadas) {
      const oi = new Date(o.inicio).getTime();
      const of = new Date(o.fin).getTime();
      // Solapamiento de [inicio, fin)
      if (c.inicio.getTime() < of && oi < c.fin.getTime()) return false;
    }
    return true;
  });
}

// Comprueba si un instante de inicio concreto es válido (dentro de horario).
export function dentroDeHorario(inicio: Date, duracionMin: number): boolean {
  const p = partesMadrid(inicio);
  const tramos = HORARIO[p.weekday] ?? [];
  const minInicio = p.hour * 60 + p.minute;
  const minFin = minInicio + duracionMin;
  return tramos.some(
    ([desde, hasta]) => minInicio >= aMinutos(desde) && minFin <= aMinutos(hasta)
  );
}
