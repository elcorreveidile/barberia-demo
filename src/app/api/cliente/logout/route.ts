import { NextResponse } from "next/server";
import { cerrarSesionCliente } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await cerrarSesionCliente();
  return NextResponse.json({ ok: true });
}
