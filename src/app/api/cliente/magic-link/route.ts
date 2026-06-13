import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { generarToken, DURACION_MAGIC_MS, PREFIJO_CLIENTE } from "@/lib/auth";
import { clienteTieneCitas, emailDeContacto } from "@/lib/datos";
import { enviarEnlaceCitas } from "@/lib/email";

export const dynamic = "force-dynamic";

// El cliente introduce su email o teléfono. Si tiene citas, le enviamos un
// enlace mágico al email asociado. Respuesta siempre idéntica (no filtramos
// quién tiene citas).
export async function POST(req: NextRequest) {
  let identificador = "";
  try {
    const body = await req.json();
    identificador = String(body.identificador ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  if (identificador) {
    try {
      if (await clienteTieneCitas(identificador)) {
        const para = await emailDeContacto(identificador);
        if (para) {
          const { token, hash } = generarToken();
          const db = getDb();
          await db.insert(schema.magicTokens).values({
            email: `${PREFIJO_CLIENTE}${identificador}`,
            tokenHash: hash,
            expiraEn: new Date(Date.now() + DURACION_MAGIC_MS),
          });
          const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
          await enviarEnlaceCitas(para, `${base}/api/cliente/verify?token=${token}`);
        }
      }
    } catch (e) {
      console.error("Error generando enlace de cliente:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
