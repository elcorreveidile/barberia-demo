"use client";

import { useEffect, useMemo, useState } from "react";

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precioCents: number;
  duracionMin: number;
  categoria: string;
}
interface Profesional {
  id: number;
  nombre: string;
  rol: string;
  fotoUrl: string | null;
}
interface Hueco {
  inicio: string;
  hora: string;
}

const euro = (c: number) =>
  (c / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: c % 100 === 0 ? 0 : 2,
  });

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Genera fechas "YYYY-MM-DD" en hora local del navegador para los próximos N días.
function proximasFechas(n: number) {
  const out: { iso: string; etiqueta: string; dow: number }[] = [];
  const hoy = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    out.push({ iso, etiqueta: `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`, dow: d.getDay() });
  }
  return out;
}

export default function ReservarPage() {
  const [paso, setPaso] = useState(1);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [mapa, setMapa] = useState<Record<number, number[]>>({});
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [huecos, setHuecos] = useState<Hueco[]>([]);
  const [cargandoHuecos, setCargandoHuecos] = useState(false);
  const [hueco, setHueco] = useState<Hueco | null>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState(false);

  useEffect(() => {
    fetch("/api/servicios")
      .then((r) => r.json())
      .then((d) => {
        setServicios(d.servicios ?? []);
        setProfesionales(d.profesionales ?? []);
        setMapa(d.profesionalesPorServicio ?? {});
      })
      .catch(() => setError("No se pudo cargar el catálogo."))
      .finally(() => setCargandoCatalogo(false));
  }, []);

  const fechas = useMemo(() => proximasFechas(21), []);

  const profesValidos = useMemo(() => {
    if (!servicio) return [];
    const ids = mapa[servicio.id] ?? [];
    return profesionales.filter((p) => ids.includes(p.id));
  }, [servicio, mapa, profesionales]);

  async function cargarHuecos(f: string) {
    if (!servicio || !profesional) return;
    setCargandoHuecos(true);
    setHuecos([]);
    setHueco(null);
    try {
      const r = await fetch(
        `/api/disponibilidad?servicioId=${servicio.id}&profesionalId=${profesional.id}&fecha=${f}`
      );
      const d = await r.json();
      setHuecos(d.huecos ?? []);
    } catch {
      setHuecos([]);
    } finally {
      setCargandoHuecos(false);
    }
  }

  async function confirmar() {
    if (!servicio || !profesional || !hueco) return;
    setEnviando(true);
    setError(null);
    try {
      const r = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicioId: servicio.id,
          profesionalId: profesional.id,
          inicio: hueco.inicio,
          nombre,
          telefono,
          email,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "No se pudo reservar.");
        if (d.motivo === "ocupado" && fecha) await cargarHuecos(fecha);
        return;
      }
      setHecho(true);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (hecho) {
    return (
      <div className="seccion flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-copper/20 text-copper">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="titulo-display mt-6 text-3xl">¡Cita confirmada!</h1>
        <p className="mt-3 max-w-md text-cream/65">
          {servicio?.nombre} con {profesional?.nombre}.
          {email ? " Te hemos enviado un email de confirmación." : ""}
        </p>
        <a href="/" className="btn-ghost mt-8">Volver al inicio</a>
      </div>
    );
  }

  return (
    <div className="seccion py-14">
      <p className="etiqueta">Reserva online</p>
      <h1 className="titulo-display mt-2 text-4xl sm:text-5xl">Pide tu cita</h1>

      <Pasos paso={paso} />

      {cargandoCatalogo ? (
        <p className="mt-10 text-cream/50">Cargando…</p>
      ) : (
        <div className="mt-8">
          {/* PASO 1: SERVICIO */}
          {paso === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {servicios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServicio(s);
                    setProfesional(null);
                    setPaso(2);
                  }}
                  className="tarjeta flex items-center justify-between gap-4 p-5 text-left transition hover:border-copper"
                >
                  <div>
                    <p className="font-medium text-cream">{s.nombre}</p>
                    <p className="text-xs text-cream/50">{s.duracionMin} min</p>
                  </div>
                  <span className="font-display text-lg text-copper-light">{euro(s.precioCents)}</span>
                </button>
              ))}
              {servicios.length === 0 && (
                <p className="text-cream/50">No hay servicios. Ejecuta el seed de la base de datos.</p>
              )}
            </div>
          )}

          {/* PASO 2: PROFESIONAL */}
          {paso === 2 && servicio && (
            <div>
              <Resumen servicio={servicio} />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {profesValidos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProfesional(p);
                      setFecha(null);
                      setHuecos([]);
                      setPaso(3);
                    }}
                    className="tarjeta flex items-center gap-4 p-4 text-left transition hover:border-copper"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.fotoUrl && (
                      <img src={p.fotoUrl} alt={p.nombre} className="h-14 w-14 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-cream">{p.nombre}</p>
                      <p className="text-xs text-cream/50">{p.rol}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Atras onClick={() => setPaso(1)} />
            </div>
          )}

          {/* PASO 3: FECHA Y HORA */}
          {paso === 3 && servicio && profesional && (
            <div>
              <Resumen servicio={servicio} profesional={profesional} />
              <p className="mt-6 etiqueta">Elige día</p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {fechas.map((f) => (
                  <button
                    key={f.iso}
                    disabled={f.dow === 0}
                    onClick={() => {
                      setFecha(f.iso);
                      cargarHuecos(f.iso);
                    }}
                    className={`min-w-[80px] rounded-lg border px-3 py-2 text-center text-sm transition disabled:opacity-30 ${
                      fecha === f.iso
                        ? "border-copper bg-copper/15 text-copper-light"
                        : "border-ink-600/60 text-cream/70 hover:border-copper/60"
                    }`}
                  >
                    {f.etiqueta}
                  </button>
                ))}
              </div>

              {fecha && (
                <>
                  <p className="mt-6 etiqueta">Elige hora</p>
                  {cargandoHuecos ? (
                    <p className="mt-3 text-cream/50">Buscando huecos…</p>
                  ) : huecos.length === 0 ? (
                    <p className="mt-3 text-cream/50">No hay huecos disponibles ese día. Prueba otra fecha.</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {huecos.map((h) => (
                        <button
                          key={h.inicio}
                          onClick={() => {
                            setHueco(h);
                            setPaso(4);
                          }}
                          className="rounded-lg border border-ink-600/60 py-2 text-sm text-cream/80 transition hover:border-copper hover:bg-copper/10"
                        >
                          {h.hora}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <Atras onClick={() => setPaso(2)} />
            </div>
          )}

          {/* PASO 4: DATOS */}
          {paso === 4 && servicio && profesional && hueco && (
            <div className="max-w-md">
              <Resumen servicio={servicio} profesional={profesional} hueco={hueco} />
              <div className="mt-6 space-y-4">
                <Campo label="Nombre y apellidos" value={nombre} onChange={setNombre} />
                <Campo label="Teléfono" value={telefono} onChange={setTelefono} type="tel" />
                <Campo label="Email (para la confirmación)" value={email} onChange={setEmail} type="email" />
              </div>
              {error && <p className="mt-4 rounded-md bg-red-900/40 px-4 py-2 text-sm text-red-200">{error}</p>}
              <button
                onClick={confirmar}
                disabled={enviando || !nombre.trim() || !telefono.trim()}
                className="btn-copper mt-6 w-full"
              >
                {enviando ? "Confirmando…" : "Confirmar cita"}
              </button>
              <Atras onClick={() => setPaso(3)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pasos({ paso }: { paso: number }) {
  const etiquetas = ["Servicio", "Profesional", "Día y hora", "Tus datos"];
  return (
    <div className="mt-6 flex flex-wrap gap-2 text-xs">
      {etiquetas.map((e, i) => (
        <span
          key={e}
          className={`rounded-full px-3 py-1 ${
            paso === i + 1
              ? "bg-copper text-ink"
              : paso > i + 1
              ? "bg-copper/20 text-copper-light"
              : "bg-ink-700 text-cream/40"
          }`}
        >
          {i + 1}. {e}
        </span>
      ))}
    </div>
  );
}

function Resumen({
  servicio,
  profesional,
  hueco,
}: {
  servicio: Servicio;
  profesional?: Profesional;
  hueco?: Hueco;
}) {
  return (
    <div className="tarjeta flex flex-wrap gap-x-6 gap-y-1 p-4 text-sm">
      <span className="text-copper-light">{servicio.nombre}</span>
      <span className="text-cream/50">{servicio.duracionMin} min · {euro(servicio.precioCents)}</span>
      {profesional && <span className="text-cream/70">· {profesional.nombre}</span>}
      {hueco && <span className="text-cream/70">· {hueco.hora}</span>}
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-cream/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-600/60 bg-ink-800 px-3 py-2 text-cream outline-none focus:border-copper"
      />
    </label>
  );
}

function Atras({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-6 text-sm text-cream/50 hover:text-copper">
      ← Volver
    </button>
  );
}
