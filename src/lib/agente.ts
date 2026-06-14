import Anthropic from "@anthropic-ai/sdk";
import { listarServicios, listarProfesionales, profesionalesDeServicio } from "./datos";
import { calcularHuecos } from "./disponibilidad";
import {
  crearCita,
  cancelarCita,
  moverCita,
  proximaCitaDeTelefono,
} from "./reservas";
import { madridAUtc, hoyMadrid, formatoLargo, partesMadrid } from "./fecha";
import { NEGOCIO, HORARIO_TEXTO } from "./negocio";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";

const MODELO = "claude-opus-4-8";

// --- Definición de herramientas que ejecuta el backend contra Neon ---
const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: "listar_servicios",
    description:
      "Devuelve el catálogo de servicios con precio (en euros), duración (min), categoría y qué profesional lo ofrece. Úsalo cuando el cliente pregunte por servicios o precios, o antes de proponer disponibilidad si no sabes el servicio.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "consultar_disponibilidad",
    description:
      "Devuelve los huecos libres reales para un servicio en una fecha. Si no se indica profesional, busca en todos los que ofrecen el servicio. La fecha debe ser 'YYYY-MM-DD'.",
    input_schema: {
      type: "object",
      properties: {
        servicio: { type: "string", description: "Nombre del servicio (puede ser aproximado)." },
        profesional: { type: "string", description: "Nombre del profesional (opcional)." },
        fecha: { type: "string", description: "Fecha en formato YYYY-MM-DD." },
      },
      required: ["servicio", "fecha"],
    },
  },
  {
    name: "reservar_cita",
    description:
      "Reserva una cita en firme. fecha_hora en formato 'YYYY-MM-DDTHH:MM' (hora local de Granada). Confirma siempre con el cliente el servicio, profesional, día y hora ANTES de llamar a esta herramienta.",
    input_schema: {
      type: "object",
      properties: {
        servicio: { type: "string" },
        profesional: { type: "string" },
        fecha_hora: { type: "string", description: "YYYY-MM-DDTHH:MM" },
        nombre: { type: "string", description: "Nombre del cliente." },
        email: {
          type: "string",
          description: "Email del cliente (opcional) para enviarle confirmación por correo.",
        },
      },
      required: ["servicio", "profesional", "fecha_hora", "nombre"],
    },
  },
  {
    name: "cancelar_cita",
    description: "Cancela la próxima cita futura asociada al teléfono del cliente.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "mover_cita",
    description:
      "Mueve la próxima cita futura del cliente a una nueva fecha y hora. nueva_fecha_hora en formato 'YYYY-MM-DDTHH:MM' (hora local).",
    input_schema: {
      type: "object",
      properties: {
        nueva_fecha_hora: { type: "string", description: "YYYY-MM-DDTHH:MM" },
      },
      required: ["nueva_fecha_hora"],
    },
  },
];

// Resuelve un servicio por nombre aproximado.
async function buscarServicio(nombre: string) {
  const servicios = await listarServicios();
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const n = norm(nombre);
  return (
    servicios.find((s) => norm(s.nombre) === n) ||
    servicios.find((s) => norm(s.nombre).includes(n) || n.includes(norm(s.nombre))) ||
    servicios.find((s) => norm(s.nombre).split(" ").some((p) => n.includes(p) && p.length > 3))
  );
}

async function buscarProfesional(nombre?: string) {
  if (!nombre) return null;
  const profs = await listarProfesionales();
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const n = norm(nombre);
  return (
    profs.find((p) => norm(p.nombre).includes(n) || norm(p.rol).includes(n)) || null
  );
}

function parseMadridLocal(s: string): Date | null {
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  return madridAUtc(+m[1], +m[2], +m[3], +m[4], +m[5]);
}

// Ejecuta una herramienta y devuelve el resultado como texto para Claude.
async function ejecutarHerramienta(
  nombre: string,
  input: Record<string, unknown>,
  ctx: { telefono: string; nombreCliente: string | null }
): Promise<string> {
  try {
    switch (nombre) {
      case "listar_servicios": {
        const servicios = await listarServicios();
        const profs = await listarProfesionales();
        const lineas = await Promise.all(
          servicios.map(async (s) => {
            const ps = await profesionalesDeServicio(s.id);
            return `- ${s.nombre} · ${(s.precioCents / 100).toFixed(2)}€ · ${s.duracionMin}min · con: ${ps.map((p) => p.nombre).join(", ")}`;
          })
        );
        return `Servicios:\n${lineas.join("\n")}\n\nProfesionales: ${profs
          .map((p) => `${p.nombre} (${p.rol})`)
          .join(", ")}`;
      }

      case "consultar_disponibilidad": {
        const servicio = await buscarServicio(String(input.servicio ?? ""));
        if (!servicio) return "No encuentro ese servicio. Pídele al cliente que lo aclare o usa listar_servicios.";
        const fecha = String(input.fecha ?? "");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return "Fecha inválida, usa formato YYYY-MM-DD.";

        let profs = await profesionalesDeServicio(servicio.id);
        const profPedido = await buscarProfesional(input.profesional as string | undefined);
        if (profPedido) profs = profs.filter((p) => p.id === profPedido.id);
        if (profs.length === 0) return "Ningún profesional ofrece ese servicio.";

        const partes: string[] = [];
        for (const p of profs) {
          const huecos = await calcularHuecos({
            profesionalId: p.id,
            duracionMin: servicio.duracionMin,
            fecha,
          });
          partes.push(
            huecos.length === 0
              ? `${p.nombre}: sin huecos el ${fecha}.`
              : `${p.nombre}: ${huecos.map((h) => h.hora).join(", ")}`
          );
        }
        return `Disponibilidad para "${servicio.nombre}" (${servicio.duracionMin}min) el ${fecha}:\n${partes.join("\n")}`;
      }

      case "reservar_cita": {
        const servicio = await buscarServicio(String(input.servicio ?? ""));
        if (!servicio) return "No encuentro ese servicio.";
        const profs = await profesionalesDeServicio(servicio.id);
        const profPedido = await buscarProfesional(input.profesional as string | undefined);
        const prof = profPedido && profs.find((p) => p.id === profPedido.id);
        if (!prof) return `Ese profesional no ofrece "${servicio.nombre}". Ofrecen: ${profs.map((p) => p.nombre).join(", ")}.`;

        const inicio = parseMadridLocal(String(input.fecha_hora ?? ""));
        if (!inicio) return "fecha_hora inválida, usa YYYY-MM-DDTHH:MM.";

        const emailCliente = input.email ? String(input.email).trim() : null;
        const res = await crearCita({
          servicioId: servicio.id,
          profesionalId: prof.id,
          inicio,
          clienteNombre: String(input.nombre ?? ctx.nombreCliente ?? "Cliente WhatsApp"),
          clienteTelefono: ctx.telefono,
          clienteEmail: emailCliente,
          origen: "whatsapp",
          enviarEmail: !!emailCliente,
        });
        if (!res.ok) return `No se pudo reservar (${res.motivo}): ${res.mensaje}`;
        return `RESERVA CONFIRMADA: ${servicio.nombre} con ${prof.nombre} el ${formatoLargo(inicio)}. (id ${res.citaId})`;
      }

      case "cancelar_cita": {
        const cita = await proximaCitaDeTelefono(ctx.telefono);
        if (!cita) return "No hay ninguna cita futura asociada a este teléfono.";
        await cancelarCita(cita.id);
        return `Cita cancelada (era el ${formatoLargo(new Date(cita.inicio))}).`;
      }

      case "mover_cita": {
        const cita = await proximaCitaDeTelefono(ctx.telefono);
        if (!cita) return "No hay ninguna cita futura que mover.";
        const nuevo = parseMadridLocal(String(input.nueva_fecha_hora ?? ""));
        if (!nuevo) return "nueva_fecha_hora inválida.";
        const res = await moverCita(cita.id, nuevo);
        if (!res.ok) return `No se pudo mover (${res.motivo}): ${res.mensaje}`;
        return `Cita movida al ${formatoLargo(nuevo)}.`;
      }

      default:
        return `Herramienta desconocida: ${nombre}`;
    }
  } catch (e) {
    console.error("Error en herramienta", nombre, e);
    return "Error interno al ejecutar la herramienta.";
  }
}

function sistema(): string {
  const hoy = hoyMadrid();
  const p = partesMadrid(new Date());
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  return `Eres el asistente de reservas de ${NEGOCIO.nombre}, una barbería y estética masculina en ${NEGOCIO.ciudad}. Atiendes por WhatsApp en español, con tono cercano y profesional, mensajes breves.

Tu único trabajo es AGENDAR: informar de servicios y precios, proponer huecos reales y reservar, cancelar o mover citas. No inventes horarios ni precios: usa siempre las herramientas.

Hoy es ${dias[p.weekday]} ${hoy} (hora de Granada). Cuando el cliente diga "mañana", "el sábado", "esta tarde", calcula la fecha concreta (YYYY-MM-DD) a partir de hoy.
Horario del negocio: ${HORARIO_TEXTO}.

Franjas (interprétalas así):
- "Por la mañana" = 10:00–14:00.
- "Por la tarde" = 17:00–20:30 (solo de lunes a viernes).
- Los SÁBADOS solo se abre por la MAÑANA (10:00–14:00): no hay turno de tarde.
- Los DOMINGOS está cerrado.

IMPORTANTE sobre las franjas: si el cliente pide una franja en la que el negocio está cerrado (p. ej. "el sábado por la tarde" o "el domingo"), DÍSELO claramente ("los sábados solo abrimos por la mañana") y ofrece la alternativa real más cercana; NO cambies de franja en silencio. Cuando consultes disponibilidad, ofrece huecos que de verdad caigan en la franja pedida si existe.

Flujo recomendado:
1. Entiende qué servicio quiere. OJO: no des por hecho extras. Si la petición es ambigua sobre el servicio (p. ej. "corte y barba" puede ser solo corte, o "Corte + arreglo de barba"), PREGUNTA cuál quiere antes de seguir; no añadas la barba (ni ningún extra) por tu cuenta.
2. Si no especifica profesional, ofrece según quién haga ese servicio.
3. Consulta disponibilidad real con la herramienta y propón 2-3 huecos concretos.
4. Pide el nombre si no lo tienes. Ofrece (opcional) enviarle confirmación por email: si quiere, pídele el correo; si no, no insistas. No hace falta pedir el teléfono (usamos su número de WhatsApp).
5. ANTES de reservar, resume en una línea bien clara y pide un "sí" explícito:
   «Servicio (precio, duración) · profesional · día · hora».
   No llames a reservar_cita hasta que el cliente confirme ESE resumen. Si cambia algo, vuelve a resumir.
6. Tras reservar, confirma con un mensaje claro.

Si el cliente pide algo que no puedes resolver (queja, producto que no existe, caso raro), dilo con sinceridad e indica que un compañero le atenderá. Responde siempre en texto plano para WhatsApp, sin markdown.`;
}

// Procesa un mensaje entrante y devuelve la respuesta de texto a enviar.
export async function responderWhatsApp(opts: {
  telefono: string;
  mensaje: string;
}): Promise<string> {
  const { telefono, mensaje } = opts;
  const db = getDb();

  // Carga historial previo del número.
  const [conv] = await db
    .select()
    .from(schema.conversaciones)
    .where(eq(schema.conversaciones.telefono, telefono));

  const historial: Anthropic.MessageParam[] = Array.isArray(conv?.historial)
    ? (conv!.historial as Anthropic.MessageParam[])
    : [];
  // Guardamos el teléfono limpio (+34…) en las citas y lo usamos para buscar
  // citas del cliente; el "telefono" con prefijo whatsapp: solo identifica la
  // conversación y se usa para responder por Twilio.
  const telefonoLimpio = telefono.replace(/^whatsapp:/i, "").trim();
  const ctx = { telefono: telefonoLimpio, nombreCliente: conv?.nombreCliente ?? null };

  historial.push({ role: "user", content: mensaje });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let textoFinal = "";
  // Bucle de tool use (máximo de seguridad para no quedar en bucle).
  for (let i = 0; i < 8; i++) {
    const respuesta = await client.messages.create({
      model: MODELO,
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: sistema(),
      tools: HERRAMIENTAS,
      messages: historial,
    });

    if (respuesta.stop_reason === "refusal") {
      textoFinal =
        "Lo siento, no puedo ayudarte con eso. Te atenderá un compañero en cuanto pueda.";
      break;
    }

    // Guardamos el turno completo del asistente (incluye bloques de thinking,
    // que deben devolverse sin modificar en el mismo modelo).
    historial.push({ role: "assistant", content: respuesta.content });

    if (respuesta.stop_reason === "tool_use") {
      const resultados: Anthropic.ToolResultBlockParam[] = [];
      for (const bloque of respuesta.content) {
        if (bloque.type === "tool_use") {
          const salida = await ejecutarHerramienta(
            bloque.name,
            (bloque.input ?? {}) as Record<string, unknown>,
            ctx
          );
          resultados.push({
            type: "tool_result",
            tool_use_id: bloque.id,
            content: salida,
          });
        }
      }
      historial.push({ role: "user", content: resultados });
      continue; // vuelve a llamar al modelo con los resultados
    }

    // Respuesta normal: extrae el texto.
    textoFinal = respuesta.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    break;
  }

  if (!textoFinal) {
    textoFinal = "Disculpa, ha habido un problema. ¿Puedes repetirlo?";
  }

  // Intenta recordar el nombre del cliente a partir de reservas hechas.
  let nombreCliente = ctx.nombreCliente;
  if (!nombreCliente) {
    const cita = await proximaCitaDeTelefono(telefono);
    if (cita) nombreCliente = cita.clienteNombre;
  }

  // Persiste el historial actualizado (recortado para no crecer sin límite).
  const historialRecortado = historial.slice(-24);
  await db
    .insert(schema.conversaciones)
    .values({
      telefono,
      historial: historialRecortado,
      nombreCliente,
      actualizadaEn: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.conversaciones.telefono,
      set: {
        historial: historialRecortado,
        nombreCliente,
        actualizadaEn: new Date(),
      },
    });

  return textoFinal;
}
