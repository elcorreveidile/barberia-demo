import Link from "next/link";
import { NEGOCIO, HORARIO_TEXTO } from "@/lib/negocio";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-600/50 bg-ink-900">
      <div className="seccion grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-cream">{NEGOCIO.nombre}</p>
          <p className="mt-3 text-sm leading-relaxed text-cream/60">{NEGOCIO.claim}.</p>
          <p className="mt-3 text-sm text-cream/60">{NEGOCIO.instagram}</p>
        </div>
        <div>
          <p className="etiqueta">Horario</p>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">{HORARIO_TEXTO}</p>
        </div>
        <div>
          <p className="etiqueta">Dónde estamos</p>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">{NEGOCIO.direccion}</p>
          <p className="mt-2 text-sm text-cream/70">{NEGOCIO.telefono}</p>
          <Link href="/reservar" className="btn-ghost mt-4 px-4 py-2 text-sm">
            Reservar cita
          </Link>
        </div>
      </div>
      <div className="border-t border-ink-600/40 py-5">
        <p className="seccion text-center text-xs text-cream/40">
          © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.ciudad}
        </p>
      </div>
    </footer>
  );
}
