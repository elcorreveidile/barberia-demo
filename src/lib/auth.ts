import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "filo_session";
const DURACION_SESION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días
export const DURACION_MAGIC_MS = 1000 * 60 * 15; // 15 min

function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret-cambia-esto";
}

export function emailsAutorizados(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function esAdmin(email: string): boolean {
  return emailsAutorizados().includes(email.trim().toLowerCase());
}

// --- Tokens de magic link ---
export function generarToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

// --- Cookie de sesión firmada ---
function firmar(payload: string): string {
  const firma = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${firma}`;
}

function verificar(valor: string): string | null {
  const idx = valor.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = valor.slice(0, idx);
  const firma = valor.slice(idx + 1);
  const esperada = createHmac("sha256", secret()).update(payload).digest("hex");
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export async function crearSesion(email: string) {
  const expira = Date.now() + DURACION_SESION_MS;
  const payload = `${email.toLowerCase()}|${expira}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, firmar(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_MS / 1000,
  });
}

export async function cerrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

// Devuelve el email de la sesión válida, o null.
export async function sesionActual(): Promise<string | null> {
  const cookieStore = await cookies();
  const valor = cookieStore.get(COOKIE)?.value;
  if (!valor) return null;
  const payload = verificar(valor);
  if (!payload) return null;
  const [email, expiraStr] = payload.split("|");
  if (!email || Number(expiraStr) < Date.now()) return null;
  if (!esAdmin(email)) return null;
  return email;
}

// ===== Sesión de CLIENTE (área "Mis citas") =====
// Independiente del admin: cookie distinta y sin lista de autorizados.
// La identidad es el email o teléfono con el que reservó.
const COOKIE_CLIENTE = "filo_cliente";
// Prefijo con el que se guardan los magic tokens de cliente en magic_tokens.email,
// para distinguirlos de los de admin sin tocar el esquema.
export const PREFIJO_CLIENTE = "cliente:";

export async function crearSesionCliente(identificador: string) {
  const expira = Date.now() + DURACION_SESION_MS;
  const payload = `${identificador}|${expira}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_CLIENTE, firmar(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_MS / 1000,
  });
}

export async function cerrarSesionCliente() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_CLIENTE);
}

// Devuelve el identificador (email o teléfono) del cliente, o null.
export async function sesionCliente(): Promise<string | null> {
  const cookieStore = await cookies();
  const valor = cookieStore.get(COOKIE_CLIENTE)?.value;
  if (!valor) return null;
  const payload = verificar(valor);
  if (!payload) return null;
  const idx = payload.lastIndexOf("|");
  const identificador = payload.slice(0, idx);
  const expira = Number(payload.slice(idx + 1));
  if (!identificador || expira < Date.now()) return null;
  return identificador;
}
