import { getDb, schema } from "@/db";
import { generarToken, PREFIJO_CLIENTE } from "./auth";

// Enlaces de "gestión de cita" que se incrustan en los emails al cliente:
// un magic link que, al pulsarlo, abre /mis-citas ya identificado.
// Más longevo que el enlace de acceso normal (15 min), porque el cliente
// puede abrir el correo horas o días después.
const DURACION_ENLACE_GESTION_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

export async function crearEnlaceGestion(
  email: string | null | undefined
): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const correo = email?.trim();
  if (!correo || !base) return null;
  try {
    const { token, hash } = generarToken();
    await getDb()
      .insert(schema.magicTokens)
      .values({
        email: `${PREFIJO_CLIENTE}${correo}`,
        tokenHash: hash,
        expiraEn: new Date(Date.now() + DURACION_ENLACE_GESTION_MS),
      });
    return `${base}/api/cliente/verify?token=${token}`;
  } catch (e) {
    console.error("Error creando enlace de gestión:", e);
    return null;
  }
}
