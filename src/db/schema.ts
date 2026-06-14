import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// === Profesionales (barbero / esteticista) ===
export const profesionales = pgTable("profesionales", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  rol: text("rol").notNull(), // p.ej. "Barbero", "Esteticista"
  bio: text("bio").notNull().default(""),
  fotoUrl: text("foto_url"),
  activo: boolean("activo").notNull().default(true),
  orden: integer("orden").notNull().default(0),
});

// === Servicios ===
export const servicios = pgTable("servicios", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion").notNull().default(""),
  // Precio en céntimos para evitar problemas de coma flotante.
  precioCents: integer("precio_cents").notNull(),
  duracionMin: integer("duracion_min").notNull(),
  categoria: text("categoria").notNull().default("barberia"), // "barberia" | "estetica"
  activo: boolean("activo").notNull().default(true),
  orden: integer("orden").notNull().default(0),
});

// === Qué servicios ofrece cada profesional (N:M) ===
export const servicioProfesional = pgTable(
  "servicio_profesional",
  {
    servicioId: integer("servicio_id")
      .notNull()
      .references(() => servicios.id, { onDelete: "cascade" }),
    profesionalId: integer("profesional_id")
      .notNull()
      .references(() => profesionales.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.servicioId, t.profesionalId] }),
  })
);

// === Citas ===
// El anti-solapamiento real lo garantiza un constraint EXCLUDE USING gist
// definido en la migración SQL (ver drizzle/0000_init.sql). Aquí sólo
// declaramos las columnas que usa la app.
export const citas = pgTable(
  "citas",
  {
    id: serial("id").primaryKey(),
    servicioId: integer("servicio_id")
      .notNull()
      .references(() => servicios.id),
    profesionalId: integer("profesional_id")
      .notNull()
      .references(() => profesionales.id),
    clienteNombre: text("cliente_nombre").notNull(),
    clienteTelefono: text("cliente_telefono").notNull(),
    clienteEmail: text("cliente_email"),
    inicio: timestamp("inicio", { withTimezone: true }).notNull(),
    fin: timestamp("fin", { withTimezone: true }).notNull(),
    estado: text("estado").notNull().default("confirmada"), // confirmada | cancelada | pendiente_humano
    origen: text("origen").notNull().default("web"), // web | whatsapp | panel
    notas: text("notas").notNull().default(""),
    // Recordatorios automáticos enviados (anti no-show).
    recordatorio24hEnviado: boolean("recordatorio_24h_enviado").notNull().default(false),
    recordatorio2hEnviado: boolean("recordatorio_2h_enviado").notNull().default(false),
    creadaEn: timestamp("creada_en", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    profIdx: index("citas_profesional_inicio_idx").on(t.profesionalId, t.inicio),
  })
);

// === Magic links (login del panel) ===
export const magicTokens = pgTable("magic_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  // Guardamos el hash del token, nunca el token en claro.
  tokenHash: text("token_hash").notNull().unique(),
  expiraEn: timestamp("expira_en", { withTimezone: true }).notNull(),
  usado: boolean("usado").notNull().default(false),
  creadoEn: timestamp("creado_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// === Conversaciones de WhatsApp (historial por número) ===
export const conversaciones = pgTable("conversaciones", {
  telefono: text("telefono").primaryKey(), // p.ej. whatsapp:+34...
  // Historial de mensajes en formato Anthropic Messages API.
  historial: jsonb("historial").notNull().default([]),
  nombreCliente: text("nombre_cliente"),
  actualizadaEn: timestamp("actualizada_en", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Profesional = typeof profesionales.$inferSelect;
export type Servicio = typeof servicios.$inferSelect;
export type Cita = typeof citas.$inferSelect;
export type NuevaCita = typeof citas.$inferInsert;
export type Conversacion = typeof conversaciones.$inferSelect;
