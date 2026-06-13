import { NextResponse } from "next/server";
import { sesionActual } from "./auth";

// Devuelve null si hay sesión válida, o una respuesta 401 si no.
export async function exigirSesion(): Promise<NextResponse | null> {
  const email = await sesionActual();
  if (!email) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  return null;
}
