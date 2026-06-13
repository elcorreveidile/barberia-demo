"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Cita {
  id: number;
  servicio: string;
  profesional: string;
  cuando: string;
  estado: string;
}

export default function MisCitas({
  identificador,
  citasIniciales,
}: {
  identificador: string;
  citasIniciales: Cita[];
}) {
  const router = useRouter();
  const [citas, setCitas] = useState(citasIniciales);
  const [ocupado, setOcupado] = useState<number | null>(null);

  async function cancelar(id: number) {
    if (!confirm("¿Seguro que quieres cancelar esta cita?")) return;
    setOcupado(id);
    try {
      const r = await fetch(`/api/cliente/citas/${id}`, { method: "DELETE" });
      if (r.ok) setCitas((prev) => prev.filter((c) => c.id !== id));
      else alert("No se pudo cancelar. Inténtalo de nuevo.");
    } finally {
      setOcupado(null);
    }
  }

  async function salir() {
    await fetch("/api/cliente/logout", { method: "POST" });
    router.push("/mis-citas");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream/50">Accediste como {identificador}</p>
        <button onClick={salir} className="text-sm text-cream/50 hover:text-copper">
          Salir
        </button>
      </div>

      {citas.length === 0 ? (
        <div className="mt-6 tarjeta p-6 text-center">
          <p className="text-cream/70">No tienes citas próximas.</p>
          <a href="/reservar" className="btn-copper mt-4">
            Reservar cita
          </a>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {citas.map((c) => (
            <li key={c.id} className="tarjeta flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium text-cream">{c.servicio}</p>
                <p className="text-sm text-cream/55">
                  {c.profesional} · <span className="text-copper-light">{c.cuando}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/reservar"
                  className="text-sm text-cream/60 hover:text-copper"
                  title="Para cambiarla, reserva una nueva hora y cancela esta"
                >
                  Reprogramar
                </a>
                <button
                  onClick={() => cancelar(c.id)}
                  disabled={ocupado === c.id}
                  className="text-sm text-red-300/80 hover:text-red-200 disabled:opacity-50"
                >
                  {ocupado === c.id ? "Cancelando…" : "Cancelar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs text-cream/40">
        ¿Quieres otra cita?{" "}
        <a href="/reservar" className="text-copper hover:text-copper-light">
          Reservar
        </a>{" "}
        · o escríbenos por WhatsApp.
      </p>
    </div>
  );
}
