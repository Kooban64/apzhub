import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { getDatabaseUrl } from "../env";
import { legalSchema } from "./legal-schema";
import * as schema from "./schema";

const fullSchema = {
  ...schema.schema,
  ...legalSchema,
};

const globalForDb = globalThis as unknown as {
  pool: pg.Pool | undefined;
};

function createPool(connectionString?: string): pg.Pool {
  return new pg.Pool({
    connectionString: connectionString ?? getDatabaseUrl(),
    max: 10,
  });
}

export function getPool(connectionString?: string): pg.Pool {
  if (!globalForDb.pool) {
    globalForDb.pool = createPool(connectionString);
  }
  return globalForDb.pool;
}

export function createDb(connectionString?: string) {
  return drizzle(getPool(connectionString), { schema: fullSchema });
}

export type Database = ReturnType<typeof createDb>;

/** Drizzle transaction handle — usable anywhere a database executor is required. */
export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type DatabaseExecutor = Database | DatabaseTransaction;

let dbInstance: Database | null = null;

export function getDb(): Database {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

export async function checkDatabaseHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
  message?: string;
}> {
  const start = Date.now();
  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    return { ok: true, latencyMs: Date.now() - start };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : "Database unreachable",
    };
  }
}
