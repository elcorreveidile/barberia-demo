import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { crearSesion, esAdmin, hashToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const loginUrl = new URL("/dashboard/login", origin);

  if (!token) {
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl);
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

  if (!fila || !esAdmin(fila.email)) {
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl);
  }

  // Token de un solo uso: lo marcamos como usado.
  await db
    .update(schema.magicTokens)
    .set({ usado: true })
    .where(eq(schema.magicTokens.id, fila.id));

  await crearSesion(fila.email);

  return NextResponse.redirect(new URL("/dashboard", origin));
}
