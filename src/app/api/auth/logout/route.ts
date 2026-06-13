import { NextResponse } from "next/server";
import { cerrarSesion } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await cerrarSesion();
  return NextResponse.json({ ok: true });
}
