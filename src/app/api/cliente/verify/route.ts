import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { crearSesionCliente, hashToken, PREFIJO_CLIENTE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const destino = new URL("/mis-citas", origin);

  if (!token) {
    destino.searchParams.set("error", "1");
    return NextResponse.redirect(destino);
  }

  const db = getDb();
  const hash = hashToken(token);
  const [fila] = await db
    .select()
    .from(schema.magicTokens)
    .where(
      and(
        eq(schema.magicTokens.tokenHash, hash),
        eq(schema.magicTokens.usado, false),
        gt(schema.magicTokens.expiraEn, new Date())
      )
    );

  // Debe ser un token de cliente (prefijo), no de admin.
  if (!fila || !fila.email.startsWith(PREFIJO_CLIENTE)) {
    destino.searchParams.set("error", "1");
    return NextResponse.redirect(destino);
  }

  await db
    .update(schema.magicTokens)
    .set({ usado: true })
    .where(eq(schema.magicTokens.id, fila.id));

  const identificador = fila.email.slice(PREFIJO_CLIENTE.length);
  await crearSesionCliente(identificador);

  return NextResponse.redirect(new URL("/mis-citas", origin));
}
