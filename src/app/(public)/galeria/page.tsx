import Image from "next/image";

export const metadata = { title: "Galería" };

// Trabajos de muestra (placeholder). Sustituye por fotos reales del local.
const fotos = [
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
  "https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=600&q=80",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80",
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80",
  "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?w=600&q=80",
  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&q=80",
  "https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=600&q=80",
];

export default function GaleriaPage() {
  return (
    <div className="seccion py-16">
      <p className="etiqueta">Nuestro trabajo</p>
      <h1 className="titulo-display mt-2 text-4xl sm:text-5xl">Galería</h1>
      <p className="mt-4 max-w-xl text-cream/65">
        Una muestra de cortes, barbas y acabados.
      </p>

      <div className="mt-10 columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {fotos.map((src, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg border border-ink-600/50">
            <Image
              src={src}
              alt={`Trabajo ${i + 1}`}
              width={600}
              height={i % 2 === 0 ? 800 : 600}
              className="h-auto w-full object-cover transition duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
