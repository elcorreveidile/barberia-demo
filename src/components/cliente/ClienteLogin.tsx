"use client";

import { useState } from "react";

export default function ClienteLogin() {
  const [identificador, setIdentificador] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    try {
      await fetch("/api/cliente/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador }),
      });
      setEnviado(true);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mt-6 max-w-md">
      <p className="text-cream/65">
        Consulta y gestiona tus citas. Introduce el email o el teléfono con el
        que reservaste y te enviaremos un enlace de acceso.
      </p>

      {enviado ? (
        <div className="mt-6 rounded-lg border border-copper/40 bg-copper/10 p-4 text-sm text-cream/80">
          Si hay citas asociadas a ese contacto, te hemos enviado un enlace de
          acceso por email (caduca en 15 minutos). Revisa también la carpeta de spam.
        </div>
      ) : (
        <form onSubmit={pedir} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-cream/70">Email o teléfono</span>
            <input
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="tu@email.com o 600 000 000"
              className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-800 px-3 py-2 text-cream outline-none focus:border-copper"
            />
          </label>
          <button type="submit" disabled={cargando} className="btn-copper w-full">
            {cargando ? "Enviando…" : "Enviar enlace de acceso"}
          </button>
        </form>
      )}

      <p className="mt-6 text-xs text-cream/40">
        ¿Aún no tienes cita?{" "}
        <a href="/reservar" className="text-copper hover:text-copper-light">
          Reserva aquí
        </a>
        .
      </p>
    </div>
  );
}
