-- ============================================================
-- Filo Barber Studio — Migración inicial para Neon (Postgres)
-- ============================================================
-- Incluye el ANTI-SOLAPAMIENTO a nivel de base de datos mediante
-- un constraint EXCLUDE USING gist sobre (profesional, rango horario).
-- ============================================================

-- Necesario para combinar igualdad de enteros (profesional_id) con
-- solapamiento de rangos (&&) dentro de un índice gist.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------- Profesionales ----------
CREATE TABLE IF NOT EXISTS "profesionales" (
  "id"        serial PRIMARY KEY,
  "nombre"    text    NOT NULL,
  "rol"       text    NOT NULL,
  "bio"       text    NOT NULL DEFAULT '',
  "foto_url"  text,
  "activo"    boolean NOT NULL DEFAULT true,
  "orden"     integer NOT NULL DEFAULT 0
);

-- ---------- Servicios ----------
CREATE TABLE IF NOT EXISTS "servicios" (
  "id"           serial PRIMARY KEY,
  "nombre"       text    NOT NULL,
  "descripcion"  text    NOT NULL DEFAULT '',
  "precio_cents" integer NOT NULL,
  "duracion_min" integer NOT NULL,
  "categoria"    text    NOT NULL DEFAULT 'barberia',
  "activo"       boolean NOT NULL DEFAULT true,
  "orden"        integer NOT NULL DEFAULT 0
);

-- ---------- Servicios que ofrece cada profesional (N:M) ----------
CREATE TABLE IF NOT EXISTS "servicio_profesional" (
  "servicio_id"    integer NOT NULL REFERENCES "servicios"("id") ON DELETE CASCADE,
  "profesional_id" integer NOT NULL REFERENCES "profesionales"("id") ON DELETE CASCADE,
  CONSTRAINT "servicio_profesional_pk" PRIMARY KEY ("servicio_id", "profesional_id")
);

-- ---------- Citas ----------
CREATE TABLE IF NOT EXISTS "citas" (
  "id"               serial PRIMARY KEY,
  "servicio_id"      integer NOT NULL REFERENCES "servicios"("id"),
  "profesional_id"   integer NOT NULL REFERENCES "profesionales"("id"),
  "cliente_nombre"   text    NOT NULL,
  "cliente_telefono" text    NOT NULL,
  "cliente_email"    text,
  "inicio"           timestamptz NOT NULL,
  "fin"              timestamptz NOT NULL,
  "estado"           text    NOT NULL DEFAULT 'confirmada',
  "origen"           text    NOT NULL DEFAULT 'web',
  "notas"            text    NOT NULL DEFAULT '',
  "creada_en"        timestamptz NOT NULL DEFAULT now(),
  -- Columna de rango GENERADA a partir de inicio/fin. Es la que indexa
  -- el constraint de exclusión. '[)' = incluye inicio, excluye fin
  -- (así dos citas consecutivas que se tocan en el borde NO solapan).
  "rango" tstzrange GENERATED ALWAYS AS (tstzrange("inicio", "fin", '[)')) STORED,
  -- La duración debe ser positiva.
  CONSTRAINT "citas_rango_valido" CHECK ("fin" > "inicio")
);

CREATE INDEX IF NOT EXISTS "citas_profesional_inicio_idx"
  ON "citas" ("profesional_id", "inicio");

-- ============================================================
-- ANTI-SOLAPAMIENTO (la pieza clave)
-- Dos citas del MISMO profesional no pueden tener rangos que se
-- solapen. Se ignoran las citas canceladas.
-- ============================================================
ALTER TABLE "citas"
  ADD CONSTRAINT "citas_sin_solapamiento"
  EXCLUDE USING gist (
    "profesional_id" WITH =,
    "rango"          WITH &&
  )
  WHERE ("estado" <> 'cancelada');

-- ---------- Magic links (login del panel) ----------
CREATE TABLE IF NOT EXISTS "magic_tokens" (
  "id"         serial PRIMARY KEY,
  "email"      text    NOT NULL,
  "token_hash" text    NOT NULL UNIQUE,
  "expira_en"  timestamptz NOT NULL,
  "usado"      boolean NOT NULL DEFAULT false,
  "creado_en"  timestamptz NOT NULL DEFAULT now()
);

-- ---------- Conversaciones de WhatsApp ----------
CREATE TABLE IF NOT EXISTS "conversaciones" (
  "telefono"        text PRIMARY KEY,
  "historial"       jsonb NOT NULL DEFAULT '[]'::jsonb,
  "nombre_cliente"  text,
  "actualizada_en"  timestamptz NOT NULL DEFAULT now()
);
