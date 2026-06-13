"use client";

import { useEffect, useState } from "react";

// Guiño "Por 2 Duros" adaptado a peluquería: frases-pun de barbería que
// juegan con lo de "barato/demo". Botón para ir cambiándolas (como en fisio).
const FRASES = [
  "sin trasquilones en el presupuesto",
  "webs cortadas a navaja, no a tijeretazos",
  "más barata que un corte con barba",
  "código al cero, sin marcas",
  "degradado limpio y factura plana",
  "ni un pelo (de bug) fuera de sitio",
  "afeitado de errores con toalla caliente",
  "buen corte, mejor precio",
];

export default function CreditoPor2Duros() {
  // Empezamos en un índice fijo (coincide en servidor y cliente) y
  // randomizamos tras montar para evitar desajustes de hidratación.
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(Math.floor(Math.random() * FRASES.length));
  }, []);

  return (
    <p className="text-xs text-cream/40">
      Desarrollado por{" "}
      <a
        href="https://www.por2duros.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold tracking-wide text-copper transition hover:text-copper-light"
      >
        Por 2 Duros
      </a>{" "}
      <span className="text-cream/30">· {FRASES[i]}</span>{" "}
      <button
        type="button"
        onClick={() => setI((n) => (n + 1) % FRASES.length)}
        className="text-copper/70 transition hover:text-copper"
        aria-label="Otra frase"
      >
        otra ✂️
      </button>
    </p>
  );
}
