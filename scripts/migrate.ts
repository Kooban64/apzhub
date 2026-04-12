import path from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { loadAppSecrets } from "@/lib/config/secrets";

async function main() {
  const url =
    loadAppSecrets().databaseUrl?.trim() ??
    process.env.APZHUB_DATABASE_URL?.trim() ??
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Set APZHUB_DATABASE_URL or DATABASE_URL (or APZHUB_DATABASE_URL_FILE with file contents) before running migrations.",
    );
  }
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = path.join(__dirname, "../db/migrations");
  const pool = new pg.Pool({ connectionString: url.trim() });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
