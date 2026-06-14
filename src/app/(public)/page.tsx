import Link from "next/link";
import Image from "next/image";
import { NEGOCIO, HORARIO_TEXTO } from "@/lib/negocio";
import { listarServicios, formatoPrecio } from "@/lib/datos";

export const dynamic = "force-dynamic";

export default async function Home() {
  let destacados: Awaited<ReturnType<typeof listarServicios>> = [];
  try {
    destacados = (await listarServicios()).slice(0, 6);
  } catch {
    // Sin BD configurada (p.ej. en build): la home sigue funcionando.
  }

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/imagenes/barberia-hero.jpg"
          alt="Interior de Filo Barber Studio"
          fill
          priority
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="seccion relative flex min-h-[78vh] flex-col items-start justify-center py-24">
          <p className="etiqueta">{NEGOCIO.ciudad} · Barbería &amp; estética masculina</p>
          <h1 className="titulo-display mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            {NEGOCIO.claim}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-cream/70">
            Cortes de precisión, barba a navaja y estética masculina en pleno
            corazón de {NEGOCIO.ciudad}. Reserva en segundos.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/reservar" className="btn-copper">
              Reservar cita
            </Link>
            <Link href="/servicios" className="btn-ghost">
              Ver servicios
            </Link>
          </div>
          <p className="mt-10 text-sm text-cream/50">{HORARIO_TEXTO}</p>
        </div>
      </section>

      {/* PROPUESTA */}
      <section className="seccion py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { t: "Oficio clásico", d: "Afeitado a navaja, toalla caliente y atención al detalle de toda la vida." },
            { t: "Estilo actual", d: "Cortes y acabados modernos adaptados a ti, no a una plantilla." },
            { t: "Reserva sin fricción", d: "Online o por WhatsApp con nuestro asistente. Sin llamadas, sin esperas." },
          ].map((c) => (
            <div key={c.t} className="tarjeta p-7">
              <h3 className="titulo-display text-xl">{c.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/65">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICIOS DESTACADOS */}
      {destacados.length > 0 && (
        <section className="seccion py-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="etiqueta">Carta</p>
              <h2 className="titulo-display mt-2 text-3xl sm:text-4xl">Servicios</h2>
            </div>
            <Link href="/servicios" className="text-sm text-copper hover:text-copper-light">
              Ver todos →
            </Link>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-ink-600/60 bg-ink-600/40 sm:grid-cols-2">
            {destacados.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 bg-ink-800 p-5">
                <div>
                  <p className="font-medium text-cream">{s.nombre}</p>
                  <p className="text-xs text-cream/50">{s.duracionMin} min</p>
                </div>
                <span className="whitespace-nowrap font-display text-lg text-copper-light">
                  {formatoPrecio(s.precioCents)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BANDA DE ACENTO */}
      <section className="relative my-12 h-[300px] overflow-hidden sm:h-[380px]">
        <Image
          src="/imagenes/afeitado.jpg"
          alt="Afeitado a navaja en Filo Barber Studio"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
        <div className="seccion relative flex h-full flex-col justify-center">
          <p className="etiqueta">Oficio</p>
          <h2 className="titulo-display mt-2 max-w-md text-3xl sm:text-4xl">
            Afeitado a navaja con ritual de toalla caliente
          </h2>
          <p className="mt-3 max-w-sm text-cream/70">
            La tradición de siempre, con el cuidado de hoy.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="seccion py-16">
        <div className="tarjeta flex flex-col items-center gap-6 px-6 py-14 text-center">
          <h2 className="titulo-display max-w-xl text-3xl sm:text-4xl">
            ¿Listo para tu próxima cita?
          </h2>
          <p className="max-w-md text-cream/65">
            Elige servicio, profesional y hora. Te confirmamos al instante.
          </p>
          <Link href="/reservar" className="btn-copper">
            Reservar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
