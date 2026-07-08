import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, getDatabaseUrl, lawOutboxEvent } from "@apzhub/config";

import {
  createLawPersistenceContext,
  createTrustServiceBundle,
  DEFAULT_LAW_TENANT_ID,
  ensureLawMigrations,
  isPostgresIntegrationAvailable,
  resetSharedTrustServiceBundle,
  truncateLawTables,
} from "../persistence";
import { resetTrustIdCounter } from "../trust/trust-id";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)(
  "PostgresTrustLedgerRepository tenant isolation",
  () => {
    let connectionString: string;

    beforeAll(async () => {
      connectionString = getDatabaseUrl();
      await ensureLawMigrations(connectionString);
    });

    beforeEach(async () => {
      resetTrustIdCounter();
      resetSharedTrustServiceBundle();
      await truncateLawTables(connectionString);
    });

    it("scopes reads and writes to tenantId", async () => {
      const previousMode = process.env.LAW_REPOSITORY_MODE;
      process.env.LAW_REPOSITORY_MODE = "postgres";

      const db = createDb(connectionString);
      const tenantA = createLawPersistenceContext({
        tenantId: DEFAULT_LAW_TENANT_ID,
        db,
      });
      const tenantB = createLawPersistenceContext({
        tenantId: "t0000002-0000-4000-8000-000000000002",
        db,
      });

      const bundleA = createTrustServiceBundle(tenantA);
      const bundleB = createTrustServiceBundle(tenantB);

      const opened = bundleA.ledgerService.openAccount({
        tenantId: tenantA.tenantId,
        name: "Tenant A Trust",
        currency: "ZAR",
        institutionName: "Bank",
        accountNumberMasked: "****1111",
        actorUserId: "user-a",
      }).data!;

      expect(
        bundleA.ledgerService.getAccount(tenantA.tenantId, opened.trustAccountId)?.name,
      ).toBe("Tenant A Trust");
      expect(
        bundleB.ledgerService.getAccount(tenantB.tenantId, opened.trustAccountId),
      ).toBeUndefined();
      expect(bundleB.ledgerService.listAccounts(tenantB.tenantId)).toHaveLength(0);

      process.env.LAW_REPOSITORY_MODE = previousMode;
    });
  },
);

describe.runIf(!postgresAvailable)(
  "PostgresTrustLedgerRepository tenant isolation",
  () => {
    it("skips postgres trust tests when database is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);

describe.runIf(postgresAvailable)("Trust outbox wiring", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    resetTrustIdCounter();
    resetSharedTrustServiceBundle();
    await truncateLawTables(connectionString);
  });

  it("records trust account and transaction outbox events", async () => {
    const previousOutbox = process.env.LAW_OUTBOX_ENABLED;
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    process.env.LAW_OUTBOX_ENABLED = "true";

    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    const bundle = createTrustServiceBundle(context);

    const account = bundle.ledgerService.openAccount({
      tenantId: context.tenantId,
      name: "Outbox Trust",
      currency: "ZAR",
      institutionName: "Bank",
      accountNumberMasked: "****9999",
      actorUserId: "user-outbox",
    }).data!;

    bundle.ledgerService.postTransaction({
      tenantId: context.tenantId,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 1000,
      currency: "ZAR",
      transactionDate: new Date().toISOString().slice(0, 10),
      postingDate: new Date().toISOString().slice(0, 10),
      clientId: "c1000001-0001-4000-8000-000000000001",
      narrative: "Outbox deposit",
      actorUserId: "user-outbox",
    });

    const rows = await db.select().from(lawOutboxEvent);
    const trustEvents = rows
      .filter((row) => row.aggregateType === "trust")
      .map((row) => row.eventType)
      .sort();

    expect(trustEvents).toEqual([
      "legal.trust.account.created",
      "legal.trust.transaction.posted",
    ]);

    process.env.LAW_OUTBOX_ENABLED = previousOutbox;
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });
});

describe.runIf(!postgresAvailable)("Trust outbox wiring", () => {
  it("skips postgres outbox tests when database is unavailable", () => {
    expect(postgresAvailable).toBe(false);
  });
});
