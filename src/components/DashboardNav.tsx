"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NEGOCIO } from "@/lib/negocio";

const items = [
  { href: "/dashboard", label: "Hoy", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard/citas", label: "Citas", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/dashboard/servicios", label: "Servicios", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  { href: "/dashboard/profesionales", label: "Equipo", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" },
];

export default function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function salir() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  }

  return (
    <>
      {/* Cabecera */}
      <header className="sticky top-0 z-30 border-b border-ink-600/50 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="font-display text-base font-bold text-cream">{NEGOCIO.nombre}</p>
            <p className="text-[11px] text-cream/40">{email}</p>
          </div>
          <div className="hidden gap-1 md:flex">
            {items.map((it) => (
              <NavLink key={it.href} {...it} active={isActive(pathname, it.href)} />
            ))}
          </div>
          <button onClick={salir} className="text-sm text-cream/60 hover:text-copper">
            Salir
          </button>
        </div>
      </header>

      {/* Barra inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-600/50 bg-ink/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl justify-around">
          {items.map((it) => {
            const activo = isActive(pathname, it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
                  activo ? "text-copper" : "text-cream/50"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={it.icon} />
                </svg>
                {it.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm transition ${
        active ? "bg-copper/15 text-copper" : "text-cream/70 hover:text-copper"
      }`}
    >
      {label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}
