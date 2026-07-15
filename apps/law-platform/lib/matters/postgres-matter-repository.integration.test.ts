import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientFactory, MatterFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl } from "@apzhub/config";

import { PostgresClientRepository } from "../clients/postgres-client-repository";
import { PostgresMatterRepository } from "./postgres-matter-repository";
import { registerWritableMatterRepositoryContract } from "./writable-matter-repository.contract.test";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  ensureLawMigrations,
  isPostgresIntegrationAvailable,
  seedPostgresLawDataAsync,
  truncateLawTables,
} from "../persistence";
import { SEED_CLIENTS } from "../clients/seed-clients";
import { SEED_ATTORNEYS } from "./seed-attorneys";
import { SEED_MATTERS } from "./seed-matters";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("PostgresMatterRepository integration", () => {
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
      { clients: SEED_CLIENTS, matters: SEED_MATTERS },
      connectionString,
    );
  });

  registerWritableMatterRepositoryContract(
    "PostgresMatterRepository",
    () => new PostgresMatterRepository(context()),
    { seedCount: 20 },
  );
});

describe.runIf(!postgresAvailable)("PostgresMatterRepository integration availability",
  () => {
    it("skips postgres contract tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);

describe.runIf(postgresAvailable)("PostgresMatterRepository tenant isolation", () => {
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

    const repoA = new PostgresMatterRepository(tenantA);
    const repoB = new PostgresMatterRepository(tenantB);
    const clientRepo = new PostgresClientRepository(tenantA);

    const client = ClientFactory.create({
      displayName: "Matter Tenant A Client",
      clientType: "individual",
      status: "active",
    });
    clientRepo.create(client);

    const matter = MatterFactory.create({
      clientId: client.clientId,
      title: "Tenant A Matter Only",
      matterReference: "MAT-TEN-001",
      matterStatus: "open",
      matterTypeId: "litigation",
      practiceAreaId: "property",
      leadAttorneyId: SEED_ATTORNEYS[0]!.attorneyId,
    });

    repoA.create(matter);

    expect(repoA.getById(matter.matterId)?.title).toBe("Tenant A Matter Only");
    expect(repoB.getById(matter.matterId)).toBeUndefined();
    expect(repoB.list()).toHaveLength(0);
  });
});
