import path from "node:path";
import { runner } from "node-pg-migrate";

// Applies any pending migrations in migrations/.
export async function migrate() {
  await runner({
    databaseUrl: process.env.DATABASE_URL!,
    dir: path.join(process.cwd(), "migrations"),
    migrationsTable: "pgmigrations",
    direction: "up",
    log: (msg) => console.log(`[migrate] ${msg}`),
  });
}
