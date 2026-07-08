import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, getDatabaseUrl } from "@apzhub/config";

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

describe.runIf(!postgresAvailable)(
  "PostgresMatterRepository integration availability",
  () => {
    it("skips postgres contract tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);
