import "dotenv/config";
import { getDb, schema } from "./index";

async function main() {
  const db = getDb();

  console.log("Limpiando datos existentes…");
  await db.delete(schema.servicioProfesional);
  await db.delete(schema.citas);
  await db.delete(schema.servicios);
  await db.delete(schema.profesionales);

  console.log("Insertando profesionales…");
  const [barbero, esteticista] = await db
    .insert(schema.profesionales)
    .values([
      {
        nombre: "Marco Ferreira",
        rol: "Barbero",
        bio: "Especialista en cortes clásicos y modernos, arreglo de barba y afeitado a navaja con ritual de toalla caliente. Más de 12 años tras el sillón.",
        fotoUrl:
          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
        orden: 1,
      },
      {
        nombre: "Lucía Hernández",
        rol: "Esteticista",
        bio: "Diseño de cejas, color y mechas, tratamientos faciales y depilación. Mirada precisa y trato cercano.",
        fotoUrl:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
        orden: 2,
      },
    ])
    .returning();

  console.log("Insertando servicios…");
  // categoria: "barberia" | "estetica"
  const serviciosBarberia = await db
    .insert(schema.servicios)
    .values([
      { nombre: "Corte caballero + peinado + producto", descripcion: "Corte a medida, peinado y producto de acabado.", precioCents: 1300, duracionMin: 30, categoria: "barberia", orden: 1 },
      { nombre: "Corte + arreglo de barba", descripcion: "Corte completo y perfilado de barba.", precioCents: 1800, duracionMin: 45, categoria: "barberia", orden: 2 },
      { nombre: "Corte estudiantes", descripcion: "Corte para estudiantes con carné.", precioCents: 1200, duracionMin: 30, categoria: "barberia", orden: 3 },
      { nombre: "Corte niño (hasta 10 años)", descripcion: "Corte infantil con paciencia y buen rollo.", precioCents: 1100, duracionMin: 30, categoria: "barberia", orden: 4 },
      { nombre: "Arreglo de barba / afeitado a navaja + ritual con toalla caliente", descripcion: "Afeitado clásico a navaja con toalla caliente y aceites.", precioCents: 950, duracionMin: 25, categoria: "barberia", orden: 5 },
      { nombre: "Tinte de barba", descripcion: "Coloración de barba para un acabado uniforme.", precioCents: 1200, duracionMin: 30, categoria: "barberia", orden: 6 },
      { nombre: "Lavado refrescante con mentol y masaje", descripcion: "Lavado con mentol y masaje capilar relajante.", precioCents: 350, duracionMin: 10, categoria: "barberia", orden: 7 },
    ])
    .returning();

  const serviciosEstetica = await db
    .insert(schema.servicios)
    .values([
      { nombre: "Tinte / Mechas + matiz (desde)", descripcion: "Color o mechas con matiz. Precio desde, según largo.", precioCents: 5000, duracionMin: 90, categoria: "estetica", orden: 8 },
      { nombre: "Diseño de cejas", descripcion: "Perfilado y diseño de cejas a medida.", precioCents: 800, duracionMin: 15, categoria: "estetica", orden: 9 },
      { nombre: "Tratamiento facial", descripcion: "Limpieza e hidratación facial.", precioCents: 2500, duracionMin: 45, categoria: "estetica", orden: 10 },
    ])
    .returning();

  console.log("Asignando servicios a profesionales…");
  await db.insert(schema.servicioProfesional).values([
    ...serviciosBarberia.map((s) => ({ servicioId: s.id, profesionalId: barbero.id })),
    ...serviciosEstetica.map((s) => ({ servicioId: s.id, profesionalId: esteticista.id })),
  ]);

  console.log(
    `\n✅ Seed completado: 2 profesionales, ${serviciosBarberia.length + serviciosEstetica.length} servicios.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
