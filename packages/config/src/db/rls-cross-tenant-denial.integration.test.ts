import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientFactory } from "@apzhub/legal-business-core";

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

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable =
    Boolean(process.env.DATABASE_URL) && (await checkDatabaseHealth()).ok;
});

describe.runIf(postgresAvailable)(
  "Law PostgreSQL RLS cross-tenant denial (TD-P10)",
  () => {
    let db: ReturnType<typeof createDb>;

    beforeAll(async () => {
      await runMigrations(getDatabaseUrl());
      db = createDb(getDatabaseUrl());
    });

    beforeEach(async () => {
      await db.delete(lawClient);
    });

    it("denies cross-tenant reads when app.tenant_id session mismatches", async () => {
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

      expect(rowsForTenantB.some((row) => row.clientId === client.clientId)).toBe(
        false,
      );
    });

    it("denies inserts when row tenant_id does not match app.tenant_id session", async () => {
      const client = ClientFactory.create({
        displayName: "RLS Insert Guard",
        clientType: "individual",
        status: "active",
      });

      await expect(
        db.transaction(async (tx) => {
          await applyPostgresTenantSession(tx, DEFAULT_LAW_TENANT_ID);
          await tx
            .insert(lawClient)
            .values(clientToRow(client, SECONDARY_LAW_TENANT_ID));
        }),
      ).rejects.toThrow();
    });
  },
);

describe.runIf(!postgresAvailable)(
  "Law PostgreSQL RLS cross-tenant denial availability",
  () => {
    it("skips postgres RLS tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);
