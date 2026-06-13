"use client";

import Link from "next/link";
import { useState } from "react";
import { NEGOCIO } from "@/lib/negocio";

const enlaces = [
  { href: "/servicios", label: "Servicios" },
  { href: "/equipo", label: "Equipo" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
  { href: "/mis-citas", label: "Mis citas" },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-600/50 bg-ink/90 backdrop-blur">
      <nav className="seccion flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Emblema />
          <span className="font-display text-lg font-bold tracking-wide text-cream">
            {NEGOCIO.nombre}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-medium text-cream/80 transition hover:text-copper"
            >
              {e.label}
            </Link>
          ))}
          <Link href="/reservar" className="btn-copper px-5 py-2 text-sm">
            Reservar cita
          </Link>
        </div>

        <button
          className="md:hidden"
          aria-label="Abrir menú"
          onClick={() => setAbierto((v) => !v)}
        >
          <svg className="h-6 w-6 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {abierto && (
        <div className="border-t border-ink-600/50 bg-ink px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setAbierto(false)}
                className="py-1 text-cream/90"
              >
                {e.label}
              </Link>
            ))}
            <Link href="/reservar" onClick={() => setAbierto(false)} className="btn-copper mt-2">
              Reservar cita
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Emblema() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke="#B68D40" strokeWidth="2" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="#B68D40" strokeWidth="1" opacity="0.5" />
      <path
        d="M24 11 L24 37 M16 16 C20 20 28 20 32 16 M16 32 C20 28 28 28 32 32"
        fill="none"
        stroke="#D9B26A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
