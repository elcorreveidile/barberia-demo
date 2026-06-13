"use client";

import { useEffect, useState } from "react";

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precioCents: number;
  duracionMin: number;
  categoria: string;
  activo: boolean;
}

export default function ServiciosPanel() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", duracionMin: "30", categoria: "barberia" });

  async function cargar() {
    setCargando(true);
    const r = await fetch("/api/dashboard/servicios");
    const d = await r.json();
    setServicios(d.servicios ?? []);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, []);

  async function actualizar(id: number, cambios: Partial<Servicio>) {
    await fetch(`/api/dashboard/servicios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    cargar();
  }

  async function crear() {
    const precioCents = Math.round(parseFloat(nuevo.precio.replace(",", ".")) * 100);
    if (!nuevo.nombre || isNaN(precioCents)) return;
    await fetch("/api/dashboard/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevo.nombre,
        precioCents,
        duracionMin: Number(nuevo.duracionMin),
        categoria: nuevo.categoria,
      }),
    });
    setNuevo({ nombre: "", precio: "", duracionMin: "30", categoria: "barberia" });
    setCreando(false);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="titulo-display text-3xl">Servicios</h1>
        <button onClick={() => setCreando((v) => !v)} className="btn-copper px-4 py-2 text-sm">
          {creando ? "Cerrar" : "+ Servicio"}
        </button>
      </div>

      {creando && (
        <div className="tarjeta mt-4 grid gap-3 p-4 sm:grid-cols-4">
          <input placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream sm:col-span-2" />
          <input placeholder="Precio €" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
          <input placeholder="Min" value={nuevo.duracionMin} onChange={(e) => setNuevo({ ...nuevo, duracionMin: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
          <select value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream sm:col-span-2">
            <option value="barberia">Barbería</option>
            <option value="estetica">Estética</option>
          </select>
          <button onClick={crear} className="btn-copper py-2 sm:col-span-2">Crear servicio</button>
        </div>
      )}

      {cargando ? (
        <p className="mt-6 text-cream/50">Cargando…</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {servicios.map((s) => (
            <li key={s.id} className={`tarjeta p-4 ${!s.activo ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-cream">{s.nombre}</p>
                <span className="text-xs uppercase text-cream/40">{s.categoria}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-1 text-cream/60">
                  €
                  <input
                    type="number" step="0.5" defaultValue={(s.precioCents / 100).toFixed(2)}
                    onBlur={(e) => {
                      const c = Math.round(parseFloat(e.target.value) * 100);
                      if (!isNaN(c) && c !== s.precioCents) actualizar(s.id, { precioCents: c });
                    }}
                    className="w-20 rounded border border-ink-600/60 bg-ink-900 px-2 py-1 text-cream"
                  />
                </label>
                <label className="flex items-center gap-1 text-cream/60">
                  min
                  <input
                    type="number" step="5" defaultValue={s.duracionMin}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (v && v !== s.duracionMin) actualizar(s.id, { duracionMin: v });
                    }}
                    className="w-16 rounded border border-ink-600/60 bg-ink-900 px-2 py-1 text-cream"
                  />
                </label>
                <button
                  onClick={() => actualizar(s.id, { activo: !s.activo })}
                  className="ml-auto text-xs text-cream/60 hover:text-copper"
                >
                  {s.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
