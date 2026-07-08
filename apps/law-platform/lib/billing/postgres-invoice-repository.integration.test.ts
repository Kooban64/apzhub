import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { InvoiceFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl } from "@apzhub/config";

import { PostgresInvoiceRepository } from "./postgres-invoice-repository";
import { registerWritableInvoiceRepositoryContract } from "./writable-invoice-repository.contract.test";
import type { ManagedInvoice } from "./invoice-types";
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
import { SEED_DOCUMENTS } from "../documents/seed-documents";
import { SEED_TASKS } from "../tasks/seed-tasks";
import { SEED_TIME_ENTRIES } from "../time/seed-time-entries";
import { SEED_INVOICES } from "./seed-invoices";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("PostgresInvoiceRepository integration", () => {
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
        tasks: SEED_TASKS,
        timeEntries: SEED_TIME_ENTRIES,
        invoices: SEED_INVOICES,
      },
      connectionString,
    );
  });

  registerWritableInvoiceRepositoryContract(
    "PostgresInvoiceRepository",
    () => new PostgresInvoiceRepository(context()),
    { seedCount: 22 },
  );
});

describe.runIf(postgresAvailable)("PostgresInvoiceRepository tenant isolation", () => {
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
      timeEntries: SEED_TIME_ENTRIES,
    });

    const repoA = new PostgresInvoiceRepository(tenantA);
    const repoB = new PostgresInvoiceRepository(tenantB);
    const invoice = SEED_INVOICES[0]!;

    repoA.create(invoice);

    expect(repoA.getById(invoice.invoiceId)?.invoiceReference).toBe(
      invoice.invoiceReference,
    );
    expect(repoB.getById(invoice.invoiceId)).toBeUndefined();
    expect(repoB.list()).toHaveLength(0);
  });
});

describe.runIf(postgresAvailable)(
  "PostgresInvoiceRepository relationship validation",
  () => {
    let connectionString: string;

    beforeAll(async () => {
      connectionString = getDatabaseUrl();
      await ensureLawMigrations(connectionString);
    });

    beforeEach(async () => {
      await truncateLawTables(connectionString);
    });

    it("rejects unknown client, matter, and time entry references", async () => {
      const db = createDb(connectionString);
      const context = createLawPersistenceContext({
        tenantId: DEFAULT_LAW_TENANT_ID,
        db,
      });
      await seedPostgresLawDataAsync(context, {
        clients: SEED_CLIENTS,
        matters: SEED_MATTERS,
        timeEntries: SEED_TIME_ENTRIES,
      });

      const repository = new PostgresInvoiceRepository(context);
      const matter = SEED_MATTERS[0]!;
      const timeEntry = SEED_TIME_ENTRIES.find(
        (entry) => entry.matterId === matter.matterId,
      )!;

      const base = InvoiceFactory.create({
        clientId: matter.clientId,
        matterId: matter.matterId,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
        lineItems: [
          {
            description: "Validation line",
            quantity: 1,
            unitPrice: 100,
            matterId: matter.matterId,
            timeEntryId: timeEntry.timeEntryId,
          },
        ],
      });

      const invoice: ManagedInvoice = {
        ...base,
        expensesPlaceholder: 0,
        disbursementsPlaceholder: 0,
        createdAt: new Date().toISOString(),
      };

      expect(() =>
        repository.create({
          ...invoice,
          clientId: "c0000999-0000-4000-8000-000000000099",
        }),
      ).toThrow(/Client not found/);

      expect(() =>
        repository.create({
          ...invoice,
          matterId: "m0000999-0000-4000-8000-000000000099",
          lineItems: invoice.lineItems.map((item) => ({
            ...item,
            matterId: "m0000999-0000-4000-8000-000000000099",
          })),
        }),
      ).toThrow(/Matter not found/);

      expect(() =>
        repository.create({
          ...invoice,
          lineItems: invoice.lineItems.map((item) => ({
            ...item,
            timeEntryId: "te0000999-0000-4000-8000-000000000099",
          })),
        }),
      ).toThrow(/Time entry not found/);
    });
  },
);

describe.runIf(!postgresAvailable)("PostgresInvoiceRepository integration", () => {
  it("skips postgres invoice tests when database is unavailable", () => {
    expect(postgresAvailable).toBe(false);
  });
});
