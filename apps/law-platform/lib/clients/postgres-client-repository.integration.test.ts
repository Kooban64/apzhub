import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl } from "@apzhub/config";

import { PostgresClientRepository } from "./postgres-client-repository";
import { registerWritableClientRepositoryContract } from "./writable-client-repository.contract.test";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  ensureLawMigrations,
  isPostgresIntegrationAvailable,
  seedPostgresLawDataAsync,
  truncateLawTables,
} from "../persistence";
import { SEED_CLIENTS } from "./seed-clients";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("PostgresClientRepository integration", () => {
  let connectionString: string;
  let db: ReturnType<typeof createDb>;
  const context = () =>
    createLawPersistenceContext({ tenantId: DEFAULT_LAW_TENANT_ID, db });

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
    db = createDb(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
    await seedPostgresLawDataAsync(
      context(),
      { clients: SEED_CLIENTS, matters: [] },
      connectionString,
    );
  });

  registerWritableClientRepositoryContract(
    "PostgresClientRepository",
    () => new PostgresClientRepository(context()),
    { seedCount: 20 },
  );
});

describe.runIf(!postgresAvailable)(
  "PostgresClientRepository integration availability",
  () => {
    it("skips postgres contract tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);

describe.runIf(postgresAvailable)("PostgresClientRepository tenant isolation", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
  });

  it("scopes reads and writes to tenantId", async () => {
    const db = createDb(connectionString);
    const tenantA = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    const tenantB = createLawPersistenceContext({
      tenantId: "t0000002-0000-4000-8000-000000000002",
      db,
    });

    const repoA = new PostgresClientRepository(tenantA);
    const repoB = new PostgresClientRepository(tenantB);

    const client = ClientFactory.create({
      displayName: "Tenant A Only",
      clientType: "individual",
      status: "active",
    });

    repoA.create(client);

    expect(repoA.getById(client.clientId)?.displayName).toBe("Tenant A Only");
    expect(repoB.getById(client.clientId)).toBeUndefined();
    expect(repoB.list()).toHaveLength(0);
  });
});
