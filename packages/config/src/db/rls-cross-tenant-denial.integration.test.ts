/**
 * Law PostgreSQL RLS cross-tenant denial (TD-P10).
 * REM-001 / OR-DEF-003:
 * - Gate availability inside tests (not describe.runIf before beforeAll).
 * - Exercise RLS via non-superuser role: POSTGRES_USER=apzhub is SUPERUSER and
 *   always bypasses RLS even with FORCE ROW LEVEL SECURITY.
 */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientFactory } from "@apzhub/legal-business-core";
import { sql } from "drizzle-orm";

import {
  applyPostgresTenantSession,
  checkDatabaseHealth,
  clientToRow,
  createDb,
  lawClient,
  runMigrations,
} from "./index";
import { getDatabaseUrl } from "../env";

const DEFAULT_LAW_TENANT_ID = "t0000001-0000-4000-8000-000000000001";
const SECONDARY_LAW_TENANT_ID = "t0000002-0000-4000-8000-000000000002";
const RLS_TESTER_USER = "apzhub_rls_tester";
const RLS_TESTER_PASSWORD = "apzhub_rls_tester";

let postgresAvailable = false;
let adminDb: ReturnType<typeof createDb> | undefined;
let db: ReturnType<typeof createDb> | undefined;

function rlsTesterDatabaseUrl(baseUrl: string): string {
  // Prefer literal rewrite — WHATWG URL can mishandle postgresql:// credentials.
  if (/\/\/([^:@/]+):([^@/]+)@/.test(baseUrl)) {
    return baseUrl.replace(
      /\/\/([^:@/]+):([^@/]+)@/,
      `//${RLS_TESTER_USER}:${RLS_TESTER_PASSWORD}@`,
    );
  }
  const url = new URL(baseUrl);
  url.username = RLS_TESTER_USER;
  url.password = RLS_TESTER_PASSWORD;
  return url.toString();
}

async function ensureRlsTesterRole(admin: ReturnType<typeof createDb>): Promise<void> {
  await admin.execute(
    sql.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${RLS_TESTER_USER}') THEN
        CREATE ROLE ${RLS_TESTER_USER} LOGIN PASSWORD '${RLS_TESTER_PASSWORD}'
          NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
      ELSE
        ALTER ROLE ${RLS_TESTER_USER} WITH LOGIN PASSWORD '${RLS_TESTER_PASSWORD}'
          NOSUPERUSER NOBYPASSRLS;
      END IF;
    END
    $$;
  `),
  );
  const dbNameResult = await admin.execute(sql`SELECT current_database() AS name`);
  const rows = dbNameResult as unknown as {
    rows?: Array<{ name?: string }>;
  };
  const dbIdent =
    rows.rows?.[0]?.name ??
    (Array.isArray(dbNameResult)
      ? (dbNameResult[0] as { name?: string } | undefined)?.name
      : undefined) ??
    "apzhub";
  await admin.execute(
    sql.raw(
      `GRANT CONNECT ON DATABASE "${String(dbIdent).replace(/"/g, "")}" TO ${RLS_TESTER_USER}`,
    ),
  );
  await admin.execute(sql.raw(`GRANT USAGE ON SCHEMA public TO ${RLS_TESTER_USER}`));
  await admin.execute(
    sql.raw(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE law_client TO ${RLS_TESTER_USER}`,
    ),
  );
}

beforeAll(async () => {
  postgresAvailable =
    Boolean(process.env.DATABASE_URL) && (await checkDatabaseHealth()).ok;
  if (!postgresAvailable) return;
  const baseUrl = getDatabaseUrl();
  await runMigrations(baseUrl);
  adminDb = createDb(baseUrl);
  await ensureRlsTesterRole(adminDb);
  db = createDb(rlsTesterDatabaseUrl(baseUrl));
});

describe("Law PostgreSQL RLS cross-tenant denial (TD-P10)", () => {
  beforeEach(async () => {
    // Superuser cleanup — tester role cannot see/delete other-tenant leftovers
    if (postgresAvailable && adminDb) {
      await adminDb.delete(lawClient);
    }
  });

  it("reports availability (RLS tester role required when Postgres is up)", () => {
    if (!postgresAvailable) {
      expect(postgresAvailable).toBe(false);
      return;
    }
    expect(postgresAvailable).toBe(true);
    expect(db).toBeDefined();
  });

  it("denies cross-tenant reads when app.tenant_id session mismatches", async ({
    skip,
  }) => {
    if (!postgresAvailable || !db) {
      skip();
      return;
    }
    const client = ClientFactory.create({
      displayName: "RLS Tenant A Client",
      clientType: "individual",
      status: "active",
    });

    await db.transaction(async (tx) => {
      await applyPostgresTenantSession(tx, DEFAULT_LAW_TENANT_ID);
      await tx.insert(lawClient).values(clientToRow(client, DEFAULT_LAW_TENANT_ID));
    });

    const rowsForTenantB = await db.transaction(async (tx) => {
      await applyPostgresTenantSession(tx, SECONDARY_LAW_TENANT_ID);
      return tx.select().from(lawClient);
    });

    expect(rowsForTenantB.some((row) => row.clientId === client.clientId)).toBe(false);
  });

  it("denies inserts when row tenant_id does not match app.tenant_id session", async ({
    skip,
  }) => {
    if (!postgresAvailable || !db) {
      skip();
      return;
    }
    const client = ClientFactory.create({
      displayName: "RLS Insert Guard",
      clientType: "individual",
      status: "active",
    });

    await expect(
      db.transaction(async (tx) => {
        await applyPostgresTenantSession(tx, DEFAULT_LAW_TENANT_ID);
        await tx.insert(lawClient).values(clientToRow(client, SECONDARY_LAW_TENANT_ID));
      }),
    ).rejects.toThrow();
  });
});
