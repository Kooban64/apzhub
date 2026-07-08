import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, getDatabaseUrl } from "@apzhub/config";

import { PostgresDocumentRepository } from "./postgres-document-repository";
import { registerWritableDocumentRepositoryContract } from "./writable-document-repository.contract.test";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  ensureLawMigrations,
  isPostgresIntegrationAvailable,
  seedPostgresLawDataAsync,
  truncateLawTables,
} from "../persistence";
import { SEED_CLIENTS } from "../clients/seed-clients";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_DOCUMENTS } from "./seed-documents";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("PostgresDocumentRepository integration", () => {
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
      {
        clients: SEED_CLIENTS,
        matters: SEED_MATTERS,
        documents: SEED_DOCUMENTS,
      },
      connectionString,
    );
  });

  registerWritableDocumentRepositoryContract(
    "PostgresDocumentRepository",
    () => new PostgresDocumentRepository(context()),
    { seedCount: 20 },
  );
});

describe.runIf(postgresAvailable)("PostgresDocumentRepository tenant isolation", () => {
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

    await seedPostgresLawDataAsync(tenantA, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
    });

    const repoA = new PostgresDocumentRepository(tenantA);
    const repoB = new PostgresDocumentRepository(tenantB);
    const document = SEED_DOCUMENTS[0]!;

    repoA.create(document);

    expect(repoA.getById(document.documentId)?.title).toBe(document.title);
    expect(repoB.getById(document.documentId)).toBeUndefined();
    expect(repoB.list()).toHaveLength(0);
  });
});

describe.runIf(!postgresAvailable)(
  "PostgresDocumentRepository integration availability",
  () => {
    it("skips postgres contract tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);
