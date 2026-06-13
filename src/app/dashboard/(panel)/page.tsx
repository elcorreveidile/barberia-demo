import { citasEnRango, formatoPrecio } from "@/lib/datos";
import { hoyMadrid, parseFecha, madridAUtc, horaMadrid, formatoLargo } from "@/lib/fecha";

export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  const hoy = hoyMadrid();
  const { year, month, day } = parseFecha(hoy);
  const inicioHoy = madridAUtc(year, month, day, 0, 0);
  const finHoy = new Date(inicioHoy.getTime() + 24 * 3600_000);
  const finSemana = new Date(inicioHoy.getTime() + 7 * 24 * 3600_000);

  let citasHoy: Awaited<ReturnType<typeof citasEnRango>> = [];
  let citasSemana: Awaited<ReturnType<typeof citasEnRango>> = [];
  try {
    [citasHoy, citasSemana] = await Promise.all([
      citasEnRango(inicioHoy, finHoy),
      citasEnRango(finHoy, finSemana),
    ]);
  } catch {
    /* sin BD */
  }

  const ingresosHoy = citasHoy.reduce((s, c) => s + c.servicio.precioCents, 0);

  return (
    <div>
      <h1 className="titulo-display text-3xl">Hoy</h1>
      <p className="mt-1 text-sm text-cream/50">{formatoLargo(new Date()).split(",")[0]}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metrica etiqueta="Citas hoy" valor={String(citasHoy.length)} />
        <Metrica etiqueta="Ingresos previstos" valor={formatoPrecio(ingresosHoy)} />
        <Metrica etiqueta="Próximos 7 días" valor={String(citasSemana.length)} />
      </div>

      <section className="mt-10">
        <h2 className="etiqueta">Agenda de hoy</h2>
        {citasHoy.length === 0 ? (
          <p className="mt-4 text-cream/50">No hay citas para hoy.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {citasHoy.map(({ cita, servicio, profesional }) => (
              <li key={cita.id} className="tarjeta flex items-center gap-4 p-4">
                <span className="font-display text-lg text-copper-light">
                  {horaMadrid(new Date(cita.inicio))}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-cream">
                    {cita.clienteNombre} · {servicio.nombre}
                  </p>
                  <p className="text-xs text-cream/50">
                    {profesional.nombre} · {servicio.duracionMin}min · {cita.clienteTelefono}
                  </p>
                </div>
                <Badge origen={cita.origen} estado={cita.estado} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="etiqueta">Esta semana</h2>
        {citasSemana.length === 0 ? (
          <p className="mt-4 text-cream/50">Sin citas en los próximos días.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {citasSemana.slice(0, 12).map(({ cita, servicio, profesional }) => (
              <li key={cita.id} className="flex items-center justify-between gap-4 border-b border-ink-600/30 py-2 text-sm">
                <span className="text-cream/80">{formatoLargo(new Date(cita.inicio))}</span>
                <span className="truncate text-cream/50">
                  {cita.clienteNombre} · {servicio.nombre} · {profesional.nombre}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-[11px] uppercase tracking-wide text-cream/40">{etiqueta}</p>
      <p className="mt-1 font-display text-2xl text-cream">{valor}</p>
    </div>
  );
}

function Badge({ origen, estado }: { origen: string; estado: string }) {
  const color =
    estado === "pendiente_humano"
      ? "bg-yellow-900/40 text-yellow-200"
      : origen === "whatsapp"
      ? "bg-green-900/40 text-green-200"
      : origen === "web"
      ? "bg-copper/15 text-copper-light"
      : "bg-ink-600 text-cream/60";
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] ${color}`}>
      {estado === "pendiente_humano" ? "revisar" : origen}
    </span>
  );
}
