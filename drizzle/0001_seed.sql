-- ============================================================
-- Filo Barber Studio — Datos de ejemplo (seed)
-- ============================================================
-- Equivalente SQL de src/db/seed.ts. Ejecútalo DESPUÉS de 0000_init.sql.
-- Es idempotente: borra y reinserta, así que puedes reejecutarlo.
-- ============================================================

BEGIN;

DELETE FROM "servicio_profesional";
DELETE FROM "citas";
DELETE FROM "servicios";
DELETE FROM "profesionales";

-- Profesionales
INSERT INTO "profesionales" ("nombre", "rol", "bio", "foto_url", "orden") VALUES
('Marco Ferreira', 'Barbero',
 'Especialista en cortes clásicos y modernos, arreglo de barba y afeitado a navaja con ritual de toalla caliente. Más de 12 años tras el sillón.',
 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', 1),
('Lucía Hernández', 'Esteticista',
 'Diseño de cejas, color y mechas, tratamientos faciales y depilación. Mirada precisa y trato cercano.',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80', 2);

-- Servicios de barbería
INSERT INTO "servicios" ("nombre", "descripcion", "precio_cents", "duracion_min", "categoria", "orden") VALUES
('Corte caballero + peinado + producto', 'Corte a medida, peinado y producto de acabado.', 1300, 30, 'barberia', 1),
('Corte + arreglo de barba', 'Corte completo y perfilado de barba.', 1800, 45, 'barberia', 2),
('Corte estudiantes', 'Corte para estudiantes con carné.', 1200, 30, 'barberia', 3),
('Corte niño (hasta 10 años)', 'Corte infantil con paciencia y buen rollo.', 1100, 30, 'barberia', 4),
('Arreglo de barba / afeitado a navaja + ritual con toalla caliente', 'Afeitado clásico a navaja con toalla caliente y aceites.', 950, 25, 'barberia', 5),
('Tinte de barba', 'Coloración de barba para un acabado uniforme.', 1200, 30, 'barberia', 6),
('Lavado refrescante con mentol y masaje', 'Lavado con mentol y masaje capilar relajante.', 350, 10, 'barberia', 7);

-- Servicios de estética
INSERT INTO "servicios" ("nombre", "descripcion", "precio_cents", "duracion_min", "categoria", "orden") VALUES
('Tinte / Mechas + matiz (desde)', 'Color o mechas con matiz. Precio desde, según largo.', 5000, 90, 'estetica', 8),
('Diseño de cejas', 'Perfilado y diseño de cejas a medida.', 800, 15, 'estetica', 9),
('Tratamiento facial', 'Limpieza e hidratación facial.', 2500, 45, 'estetica', 10);

-- Asignación N:M: el barbero hace los de barbería; la esteticista, los de estética.
INSERT INTO "servicio_profesional" ("servicio_id", "profesional_id")
SELECT s.id, p.id FROM "servicios" s CROSS JOIN "profesionales" p
WHERE p.rol = 'Barbero' AND s.categoria = 'barberia';

INSERT INTO "servicio_profesional" ("servicio_id", "profesional_id")
SELECT s.id, p.id FROM "servicios" s CROSS JOIN "profesionales" p
WHERE p.rol = 'Esteticista' AND s.categoria = 'estetica';

COMMIT;
