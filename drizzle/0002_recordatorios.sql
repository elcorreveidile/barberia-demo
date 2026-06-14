-- V2 · Recordatorios automáticos (anti no-show)
-- Marca si ya se envió el recordatorio de 24 h y el de 2 h para cada cita.
ALTER TABLE "citas"
  ADD COLUMN IF NOT EXISTS "recordatorio_24h_enviado" boolean NOT NULL DEFAULT false;
ALTER TABLE "citas"
  ADD COLUMN IF NOT EXISTS "recordatorio_2h_enviado" boolean NOT NULL DEFAULT false;
