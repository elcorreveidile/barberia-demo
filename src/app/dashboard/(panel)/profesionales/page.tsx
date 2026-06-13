"use client";

import { useEffect, useState } from "react";

interface Profesional {
  id: number;
  nombre: string;
  rol: string;
  bio: string;
  fotoUrl: string | null;
  activo: boolean;
}

export default function ProfesionalesPanel() {
  const [profs, setProfs] = useState<Profesional[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", rol: "", bio: "", fotoUrl: "" });

  async function cargar() {
    setCargando(true);
    const r = await fetch("/api/dashboard/profesionales");
    const d = await r.json();
    setProfs(d.profesionales ?? []);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, []);

  async function actualizar(id: number, cambios: Partial<Profesional>) {
    await fetch(`/api/dashboard/profesionales/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    cargar();
  }

  async function crear() {
    if (!nuevo.nombre || !nuevo.rol) return;
    await fetch("/api/dashboard/profesionales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });
    setNuevo({ nombre: "", rol: "", bio: "", fotoUrl: "" });
    setCreando(false);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="titulo-display text-3xl">Equipo</h1>
        <button onClick={() => setCreando((v) => !v)} className="btn-copper px-4 py-2 text-sm">
          {creando ? "Cerrar" : "+ Profesional"}
        </button>
      </div>

      {creando && (
        <div className="tarjeta mt-4 grid gap-3 p-4 sm:grid-cols-2">
          <input placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
          <input placeholder="Rol (Barbero, Esteticista…)" value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
          <input placeholder="URL de foto (opcional)" value={nuevo.fotoUrl} onChange={(e) => setNuevo({ ...nuevo, fotoUrl: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream sm:col-span-2" />
          <textarea placeholder="Bio" value={nuevo.bio} onChange={(e) => setNuevo({ ...nuevo, bio: e.target.value })}
            className="rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream sm:col-span-2" rows={2} />
          <button onClick={crear} className="btn-copper py-2 sm:col-span-2">Crear profesional</button>
        </div>
      )}

      {cargando ? (
        <p className="mt-6 text-cream/50">Cargando…</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {profs.map((p) => (
            <li key={p.id} className={`tarjeta p-4 ${!p.activo ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-cream">{p.nombre}</p>
                  <p className="text-xs text-cream/50">{p.rol}</p>
                  {p.bio && <p className="mt-2 text-sm text-cream/60">{p.bio}</p>}
                </div>
                <button
                  onClick={() => actualizar(p.id, { activo: !p.activo })}
                  className="whitespace-nowrap text-xs text-cream/60 hover:text-copper"
                >
                  {p.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
