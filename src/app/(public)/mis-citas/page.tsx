import { sesionCliente } from "@/lib/auth";
import { citasFuturasDeCliente } from "@/lib/datos";
import { formatoLargo } from "@/lib/fecha";
import ClienteLogin from "@/components/cliente/ClienteLogin";
import MisCitas from "@/components/cliente/MisCitas";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis citas" };

export default async function MisCitasPage() {
  const identificador = await sesionCliente();

  if (!identificador) {
    return (
      <div className="seccion py-16">
        <p className="etiqueta">Área de cliente</p>
        <h1 className="titulo-display mt-2 text-4xl sm:text-5xl">Mis citas</h1>
        <ClienteLogin />
      </div>
    );
  }

  let citas: {
    id: number;
    servicio: string;
    profesional: string;
    cuando: string;
    estado: string;
  }[] = [];
  try {
    const filas = await citasFuturasDeCliente(identificador);
    citas = filas.map(({ cita, servicio, profesional }) => ({
      id: cita.id,
      servicio: servicio.nombre,
      profesional: profesional.nombre,
      cuando: formatoLargo(new Date(cita.inicio)),
      estado: cita.estado,
    }));
  } catch {
    /* sin BD */
  }

  return (
    <div className="seccion py-16">
      <p className="etiqueta">Área de cliente</p>
      <h1 className="titulo-display mt-2 text-4xl sm:text-5xl">Mis citas</h1>
      <MisCitas identificador={identificador} citasIniciales={citas} />
    </div>
  );
}
