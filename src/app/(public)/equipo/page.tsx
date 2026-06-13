import Image from "next/image";
import { listarProfesionales } from "@/lib/datos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Equipo" };

export default async function EquipoPage() {
  let equipo: Awaited<ReturnType<typeof listarProfesionales>> = [];
  try {
    equipo = await listarProfesionales();
  } catch {
    /* sin BD en build */
  }

  return (
    <div className="seccion py-16">
      <p className="etiqueta">Quiénes somos</p>
      <h1 className="titulo-display mt-2 text-4xl sm:text-5xl">El equipo</h1>
      <p className="mt-4 max-w-xl text-cream/65">
        Manos expertas para tu corte, tu barba y tu imagen.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {equipo.map((p) => (
          <div key={p.id} className="tarjeta overflow-hidden">
            <div className="relative aspect-[4/3]">
              {p.fotoUrl ? (
                <Image src={p.fotoUrl} alt={p.nombre} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-ink-700 text-cream/30">
                  Sin foto
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="etiqueta">{p.rol}</p>
              <h2 className="titulo-display mt-1 text-2xl">{p.nombre}</h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/65">{p.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {equipo.length === 0 && (
        <p className="mt-10 text-cream/50">
          Configura la base de datos y ejecuta el seed para ver el equipo.
        </p>
      )}
    </div>
  );
}
