"use client";

import { useCallback, useEffect, useState } from "react";

interface CitaRow {
  cita: {
    id: number;
    clienteNombre: string;
    clienteTelefono: string;
    inicio: string;
    fin: string;
    estado: string;
    origen: string;
    notas: string;
  };
  servicio: { id: number; nombre: string; duracionMin: number };
  profesional: { id: number; nombre: string };
}
interface Servicio { id: number; nombre: string; duracionMin: number }
interface Profesional { id: number; nombre: string }

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const horaDe = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

export default function CitasPage() {
  const [fecha, setFecha] = useState(hoyISO());
  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [creando, setCreando] = useState(false);
  const [moviendo, setMoviendo] = useState<CitaRow | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    const desde = new Date(`${fecha}T00:00:00`);
    const hasta = new Date(desde.getTime() + 24 * 3600_000);
    try {
      const r = await fetch(
        `/api/dashboard/citas?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`
      );
      const d = await r.json();
      setCitas((d.citas ?? []).filter((c: CitaRow) => c.cita.estado !== "cancelada"));
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    fetch("/api/servicios")
      .then((r) => r.json())
      .then((d) => {
        setServicios(d.servicios ?? []);
        setProfesionales(d.profesionales ?? []);
      })
      .catch(() => {});
  }, []);

  async function cancelar(id: number) {
    if (!confirm("¿Cancelar esta cita?")) return;
    await fetch(`/api/dashboard/citas/${id}`, { method: "DELETE" });
    cargar();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo-display text-3xl">Citas</h1>
        <button onClick={() => setCreando(true)} className="btn-copper px-4 py-2 text-sm">
          + Nueva cita
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setFecha(shift(fecha, -1))}
          className="rounded-md border border-ink-600/60 px-3 py-2 text-cream/70 hover:border-copper"
        >
          ←
        </button>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-md border border-ink-600/60 bg-ink-800 px-3 py-2 text-cream"
        />
        <button
          onClick={() => setFecha(shift(fecha, 1))}
          className="rounded-md border border-ink-600/60 px-3 py-2 text-cream/70 hover:border-copper"
        >
          →
        </button>
      </div>

      <div className="mt-6">
        {cargando ? (
          <p className="text-cream/50">Cargando…</p>
        ) : citas.length === 0 ? (
          <p className="text-cream/50">No hay citas este día.</p>
        ) : (
          <ul className="space-y-2">
            {citas.map(({ cita, servicio, profesional }) => (
              <li key={cita.id} className="tarjeta flex items-center gap-4 p-4">
                <span className="font-display text-lg text-copper-light">{horaDe(cita.inicio)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-cream">
                    {cita.clienteNombre} · {servicio.nombre}
                  </p>
                  <p className="text-xs text-cream/50">
                    {profesional.nombre} · {servicio.duracionMin}min · {cita.clienteTelefono}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMoviendo({ cita, servicio, profesional })}
                    className="text-xs text-cream/60 hover:text-copper"
                  >
                    Mover
                  </button>
                  <button
                    onClick={() => cancelar(cita.id)}
                    className="text-xs text-red-300/80 hover:text-red-200"
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {creando && (
        <ModalNuevaCita
          fecha={fecha}
          servicios={servicios}
          profesionales={profesionales}
          onClose={() => setCreando(false)}
          onCreada={() => {
            setCreando(false);
            cargar();
          }}
        />
      )}

      {moviendo && (
        <ModalMover
          cita={moviendo}
          onClose={() => setMoviendo(null)}
          onMovida={() => {
            setMoviendo(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function ModalMover({
  cita,
  onClose,
  onMovida,
}: {
  cita: CitaRow;
  onClose: () => void;
  onMovida: () => void;
}) {
  const inicio = new Date(cita.cita.inicio);
  const isoFecha = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}-${String(inicio.getDate()).padStart(2, "0")}`;
  const isoHora = `${String(inicio.getHours()).padStart(2, "0")}:${String(inicio.getMinutes()).padStart(2, "0")}`;
  const [fecha, setFecha] = useState(isoFecha);
  const [hora, setHora] = useState(isoHora);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setError(null);
    setGuardando(true);
    try {
      const nuevoInicio = new Date(`${fecha}T${hora}:00`);
      const r = await fetch(`/api/dashboard/citas/${cita.cita.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inicio: nuevoInicio.toISOString() }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "No se pudo mover la cita.");
        return;
      }
      onMovida();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl border border-ink-600/60 bg-ink-800 p-6 sm:rounded-2xl">
        <h2 className="titulo-display text-xl">Mover cita</h2>
        <p className="mt-1 text-sm text-cream/55">
          {cita.cita.clienteNombre} · {cita.servicio.nombre} · {cita.profesional.nombre}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-cream/70">Día</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
          </label>
          <label className="block">
            <span className="text-sm text-cream/70">Hora</span>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
          </label>
        </div>
        {error && <p className="mt-3 rounded bg-red-900/40 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 py-2">Cancelar</button>
          <button onClick={guardar} disabled={guardando} className="btn-copper flex-1 py-2">
            {guardando ? "Guardando…" : "Mover"}
          </button>
        </div>
      </div>
    </div>
  );
}

function shift(fecha: string, dias: number) {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ModalNuevaCita({
  fecha,
  servicios,
  profesionales,
  onClose,
  onCreada,
}: {
  fecha: string;
  servicios: Servicio[];
  profesionales: Profesional[];
  onClose: () => void;
  onCreada: () => void;
}) {
  const [servicioId, setServicioId] = useState<number | "">("");
  const [profesionalId, setProfesionalId] = useState<number | "">("");
  const [hora, setHora] = useState("10:00");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setError(null);
    if (!servicioId || !profesionalId || !nombre || !telefono) {
      setError("Completa todos los campos.");
      return;
    }
    setGuardando(true);
    try {
      const inicio = new Date(`${fecha}T${hora}:00`);
      const r = await fetch("/api/dashboard/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicioId, profesionalId, inicio: inicio.toISOString(), nombre, telefono }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "No se pudo crear.");
        return;
      }
      onCreada();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl border border-ink-600/60 bg-ink-800 p-6 sm:rounded-2xl">
        <h2 className="titulo-display text-xl">Nueva cita · {fecha}</h2>
        <div className="mt-4 space-y-3">
          <Select label="Servicio" value={servicioId} onChange={(v) => setServicioId(v ? Number(v) : "")}
            options={servicios.map((s) => ({ value: s.id, label: s.nombre }))} />
          <Select label="Profesional" value={profesionalId} onChange={(v) => setProfesionalId(v ? Number(v) : "")}
            options={profesionales.map((p) => ({ value: p.id, label: p.nombre }))} />
          <label className="block">
            <span className="text-sm text-cream/70">Hora</span>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
          </label>
          <Input label="Nombre" value={nombre} onChange={setNombre} />
          <Input label="Teléfono" value={telefono} onChange={setTelefono} />
        </div>
        {error && <p className="mt-3 rounded bg-red-900/40 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 py-2">Cancelar</button>
          <button onClick={guardar} disabled={guardando} className="btn-copper flex-1 py-2">
            {guardando ? "Guardando…" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm text-cream/70">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream" />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string;
  value: number | "";
  onChange: (v: string) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-sm text-cream/70">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-900 px-3 py-2 text-cream">
        <option value="">Elige…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
