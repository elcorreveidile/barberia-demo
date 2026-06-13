import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { esAdmin, generarToken, DURACION_MAGIC_MS } from "@/lib/auth";
import { enviarMagicLink } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  // Respuesta idéntica tanto si el email está autorizado como si no,
  // para no filtrar qué correos son administradores.
  if (esAdmin(email)) {
    try {
      const { token, hash } = generarToken();
      const db = getDb();
      await db.insert(schema.magicTokens).values({
        email,
        tokenHash: hash,
        expiraEn: new Date(Date.now() + DURACION_MAGIC_MS),
      });
      const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
      const enlace = `${base}/api/auth/verify?token=${token}`;
      await enviarMagicLink(email, enlace);
    } catch (e) {
      console.error("Error generando magic link:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
