"use client";

import { useState } from "react";
import { NEGOCIO, enlaceWhatsApp } from "@/lib/negocio";

export default function WhatsAppButton() {
  const [abierto, setAbierto] = useState(false);
  const href = enlaceWhatsApp();

  // Modo sandbox de Twilio: el texto prerrellenado es un "join …". En ese caso
  // mostramos un aviso explicativo antes de abrir WhatsApp (si no, el cliente
  // se encontraría con un código en inglés sin saber qué hacer). En producción
  // (sin "join") el botón abre WhatsApp directamente.
  const texto = (process.env.NEXT_PUBLIC_WHATSAPP_TEXTO || "").trim();
  const esSandbox = texto.toLowerCase().startsWith("join ");

  const claseFlotante =
    "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/40 transition hover:scale-105 hover:bg-[#1fb959]";

  return (
    <>
      {esSandbox ? (
        <button
          aria-label="Reservar por WhatsApp"
          onClick={() => setAbierto(true)}
          className={claseFlotante}
        >
          <IconoWhatsApp />
        </button>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Reservar por WhatsApp"
          className={claseFlotante}
        >
          <IconoWhatsApp />
        </a>
      )}

      {abierto && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl border border-ink-600/60 bg-ink-800 p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="titulo-display text-xl text-cream">Reservar por WhatsApp</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">
              Esta es una <b>demo</b>: la reserva la gestiona nuestro asistente a
              través de Twilio (entorno de pruebas).
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">
              Al abrir WhatsApp verás un <b>mensaje ya escrito</b> (un código para
              conectar). Solo tienes que <b>pulsar enviar</b> y, después, escribir lo
              que necesitas — por ejemplo: <i>«quiero corte y barba el sábado»</i>.
            </p>
            <p className="mt-2 text-xs text-cream/40">
              En la versión final hablarás directamente con {NEGOCIO.nombre}, sin este paso.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setAbierto(false)} className="btn-ghost flex-1 py-2">
                Cancelar
              </button>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAbierto(false)}
                className="flex-1 rounded-md bg-[#25D366] py-2 text-center font-semibold text-white transition hover:bg-[#1fb959]"
              >
                Abrir WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
      <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.6-1.72a12.74 12.74 0 0 0 6.2 1.58h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.72 12.72 0 0 0 16.003 3.2zm0 23.2h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.92 1.02 1.05-3.82-.25-.4a10.6 10.6 0 0 1-1.63-5.66c0-5.86 4.77-10.62 10.63-10.62 2.84 0 5.5 1.1 7.51 3.12a10.56 10.56 0 0 1 3.11 7.51c0 5.86-4.77 10.62-10.62 10.62zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.18-1.51-.08-.13-.29-.21-.61-.37z" />
    </svg>
  );
}
