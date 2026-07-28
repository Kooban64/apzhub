import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { getDatabaseUrl } from "../env";
import { legalSchema } from "./legal-schema";
import { platformAuthorizationSchema } from "./platform-authorization-schema";
import { platformIdentitySchema } from "./platform-identity-schema";
import { platformPersonalisationSchema } from "./platform-personalisation-schema";
import { platformGovernanceSchema } from "./platform-governance-schema";
import { platformEntityMappingSchema } from "./platform-entity-mapping-schema";
import { platformDocumentSchema } from "./platform-document-schema";
import { platformSearchSchema } from "./platform-search-schema";
import { testingSchema } from "./testing-schema";
import * as schema from "./schema";

const fullSchema = {
  ...schema.schema,
  ...legalSchema,
  ...platformIdentitySchema,
  ...platformAuthorizationSchema,
  ...platformPersonalisationSchema,
  ...platformGovernanceSchema,
  ...platformEntityMappingSchema,
  ...platformDocumentSchema,
  ...platformSearchSchema,
  ...testingSchema,
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
  // Explicit connection strings must not reuse the process-global pool
  // (e.g. RLS tester role vs superuser DATABASE_URL — REM-001 / OR-DEF-003).
  if (connectionString) {
    return drizzle(createPool(connectionString), { schema: fullSchema });
  }
  return drizzle(getPool(), { schema: fullSchema });
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
