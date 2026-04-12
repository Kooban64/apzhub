import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "@/db/schema";
import { loadAppSecrets } from "@/lib/config/secrets";

export type AppDbClient = NodePgDatabase<typeof schema>;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  const url =
    loadAppSecrets().databaseUrl?.trim() ??
    process.env.APZHUB_DATABASE_URL?.trim() ??
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Database is not configured (set APZHUB_DATABASE_URL or DATABASE_URL, or APZHUB_DATABASE_URL_FILE with file contents).",
    );
  }
  if (!pool) {
    pool = new pg.Pool({ connectionString: url.trim(), max: 10 });
  }
  return pool;
}

export function getDb(): AppDbClient {
  return drizzle(getPool(), { schema });
}

/** Test / scripts: release pool handles. */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
