"use client";

import { useState } from "react";
import { NEGOCIO } from "@/lib/negocio";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function pedirEnlace(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    try {
      await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEnviado(true);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink bg-textura px-5">
      <div className="tarjeta w-full max-w-sm p-8">
        <p className="etiqueta">{NEGOCIO.nombre}</p>
        <h1 className="titulo-display mt-2 text-2xl">Panel de gestión</h1>

        {enviado ? (
          <div className="mt-6 rounded-lg border border-copper/40 bg-copper/10 p-4 text-sm text-cream/80">
            Si el correo está autorizado, te hemos enviado un enlace de acceso.
            Revisa tu bandeja (caduca en 15 minutos).
          </div>
        ) : (
          <form onSubmit={pedirEnlace} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm text-cream/70">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream outline-none focus:border-copper"
              />
            </label>
            <button type="submit" disabled={cargando} className="btn-copper w-full">
              {cargando ? "Enviando…" : "Enviar enlace de acceso"}
            </button>
          </form>
        )}
        <p className="mt-6 text-xs text-cream/40">
          Acceso por enlace mágico de un solo uso. Sin contraseñas.
        </p>
      </div>
    </div>
  );
}
