import "dotenv/config";
import { Pool } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Ejecuta los .sql de ./drizzle en orden. Las migraciones usan
// IF NOT EXISTS / ADD CONSTRAINT, así que son idempotentes salvo el
// constraint EXCLUDE (que ignoramos si ya existe).
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está definida.");
  const pool = new Pool({ connectionString: url });

  const dir = join(process.cwd(), "drizzle");
  const archivos = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const archivo of archivos) {
    const contenido = readFileSync(join(dir, archivo), "utf8");
    // Dividimos por ';' respetando que las funciones no usan $$ aquí.
    const sentencias = contenido
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`\n▶ Aplicando ${archivo} (${sentencias.length} sentencias)…`);
    for (const sentencia of sentencias) {
      try {
        await pool.query(sentencia);
      } catch (e) {
        const msg = (e as Error).message;
        if (/already exists|ya existe/i.test(msg)) {
          console.log(`  · omitida (ya existe)`);
          continue;
        }
        console.error(`  ✗ Error en sentencia:\n${sentencia}\n`, msg);
        throw e;
      }
    }
  }
  console.log("\n✅ Migraciones aplicadas.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
