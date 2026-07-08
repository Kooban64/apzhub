import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { InvoiceFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl, lawOutboxEvent } from "@apzhub/config";

import { PostgresInvoiceRepository } from "../billing/postgres-invoice-repository";
import type { ManagedInvoice } from "../billing/invoice-types";
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
import { SEED_TIME_ENTRIES } from "../time/seed-time-entries";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("Invoice outbox wiring", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
  });

  it("records created, updated, cancelled, and paid outbox events", async () => {
    const previousOutbox = process.env.LAW_OUTBOX_ENABLED;
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    process.env.LAW_OUTBOX_ENABLED = "true";

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
          description: timeEntry.narrative,
          quantity: 1,
          unitPrice: timeEntry.rate,
          matterId: matter.matterId,
          timeEntryId: timeEntry.timeEntryId,
        },
      ],
      invoiceStatus: "draft",
    });

    const invoice: ManagedInvoice = {
      ...base,
      expensesPlaceholder: 25,
      disbursementsPlaceholder: 0,
      notes: "Outbox wiring invoice",
      createdAt: new Date().toISOString(),
    };

    repository.create(invoice);
    repository.update(invoice.invoiceId, {
      ...invoice,
      notes: "Updated outbox wiring invoice",
      invoiceStatus: "issued",
    });
    repository.update(invoice.invoiceId, {
      ...invoice,
      notes: "Updated outbox wiring invoice",
      invoiceStatus: "void",
    });

    const paidBase = InvoiceFactory.create({
      clientId: matter.clientId,
      matterId: matter.matterId,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
      lineItems: [
        {
          description: "Paid outbox line",
          quantity: 1,
          unitPrice: 200,
          matterId: matter.matterId,
          timeEntryId: timeEntry.timeEntryId,
        },
      ],
      invoiceStatus: "issued",
    });

    const paidInvoice: ManagedInvoice = {
      ...paidBase,
      expensesPlaceholder: 0,
      disbursementsPlaceholder: 0,
      createdAt: new Date().toISOString(),
    };

    repository.create(paidInvoice);
    repository.update(paidInvoice.invoiceId, {
      ...paidInvoice,
      invoiceStatus: "paid",
    });

    const rows = await db.select().from(lawOutboxEvent);
    const invoiceEvents = rows
      .filter((row) => row.aggregateType === "invoice")
      .map((row) => row.eventType)
      .sort();

    expect(invoiceEvents).toEqual([
      "legal.invoice.cancelled",
      "legal.invoice.created",
      "legal.invoice.created",
      "legal.invoice.paid",
      "legal.invoice.updated",
    ]);

    process.env.LAW_OUTBOX_ENABLED = previousOutbox;
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });
});

describe.runIf(!postgresAvailable)("Invoice outbox wiring", () => {
  it("skips postgres outbox tests when database is unavailable", () => {
    expect(postgresAvailable).toBe(false);
  });
});
