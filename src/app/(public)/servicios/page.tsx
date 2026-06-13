import Link from "next/link";
import { listarServicios, formatoPrecio } from "@/lib/datos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Servicios" };

export default async function ServiciosPage() {
  let servicios: Awaited<ReturnType<typeof listarServicios>> = [];
  try {
    servicios = await listarServicios();
  } catch {
    /* sin BD en build */
  }

  const barberia = servicios.filter((s) => s.categoria === "barberia");
  const estetica = servicios.filter((s) => s.categoria === "estetica");

  return (
    <div className="seccion py-16">
      <p className="etiqueta">Carta de precios</p>
      <h1 className="titulo-display mt-2 text-4xl sm:text-5xl">Servicios</h1>
      <p className="mt-4 max-w-xl text-cream/65">
        Precios cerrados y duración orientativa. Reserva el que quieras online o
        por WhatsApp.
      </p>

      <Grupo titulo="Barbería" items={barberia} />
      <Grupo titulo="Estética" items={estetica} />

      {servicios.length === 0 && (
        <p className="mt-10 text-cream/50">
          Configura la base de datos y ejecuta el seed para ver los servicios.
        </p>
      )}

      <div className="mt-14">
        <Link href="/reservar" className="btn-copper">
          Reservar cita
        </Link>
      </div>
    </div>
  );
}

function Grupo({
  titulo,
  items,
}: {
  titulo: string;
  items: Awaited<ReturnType<typeof listarServicios>>;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="titulo-display text-2xl text-copper-light">{titulo}</h2>
      <div className="mt-5 divide-y divide-ink-600/50 rounded-xl border border-ink-600/60 bg-ink-800/60">
        {items.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-6 p-5">
            <div>
              <p className="font-medium text-cream">{s.nombre}</p>
              {s.descripcion && (
                <p className="mt-1 text-sm text-cream/55">{s.descripcion}</p>
              )}
              <p className="mt-1 text-xs uppercase tracking-wide text-cream/40">
                {s.duracionMin} min
              </p>
            </div>
            <span className="whitespace-nowrap font-display text-xl text-copper-light">
              {formatoPrecio(s.precioCents)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
