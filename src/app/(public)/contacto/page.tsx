import Link from "next/link";
import { NEGOCIO, HORARIO } from "@/lib/negocio";

export const metadata = { title: "Contacto" };

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function ContactoPage() {
  const waHref = `https://wa.me/${NEGOCIO.whatsapp.replace(/\D/g, "")}`;
  const mapsQuery = encodeURIComponent(`${NEGOCIO.direccion}`);

  return (
    <div className="seccion py-16">
      <p className="etiqueta">Dónde y cuándo</p>
      <h1 className="titulo-display mt-2 text-4xl sm:text-5xl">Contacto</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-7">
          <Dato titulo="Dirección" valor={NEGOCIO.direccion} />
          <Dato titulo="Teléfono" valor={NEGOCIO.telefono} />
          <Dato titulo="Email" valor={NEGOCIO.email} />
          <div>
            <p className="etiqueta">Horario</p>
            <ul className="mt-3 space-y-1 text-sm text-cream/70">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const tramos = HORARIO[d] ?? [];
                return (
                  <li key={d} className="flex justify-between gap-6 border-b border-ink-600/30 py-1">
                    <span>{DIAS[d]}</span>
                    <span className="text-cream/90">
                      {tramos.length === 0
                        ? "Cerrado"
                        : tramos.map((t) => `${t[0]}–${t[1]}`).join(" · ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/reservar" className="btn-copper">
              Reservar cita
            </Link>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink-600/60">
          <iframe
            title="Mapa"
            className="h-full min-h-[360px] w-full grayscale"
            loading="lazy"
            src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="etiqueta">{titulo}</p>
      <p className="mt-1 text-cream/85">{valor}</p>
    </div>
  );
}
