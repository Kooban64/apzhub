import { describe, expect, it } from "vitest";
import { InvoiceFactory } from "@apzhub/legal-business-core";

import type { WritableInvoiceRepository } from "./writable-invoice-repository";
import type { ManagedInvoice } from "./invoice-types";
import { InMemoryInvoiceRepository } from "./in-memory-invoice-repository";
import { SEED_INVOICES } from "./seed-invoices";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_TIME_ENTRIES } from "../time/seed-time-entries";

export function registerWritableInvoiceRepositoryContract(
  label: string,
  createRepository: () => WritableInvoiceRepository,
  options?: { readonly seedCount?: number },
): void {
  describe(`${label} — writable invoice repository contract`, () => {
    it("lists and retrieves seeded invoices with line items", () => {
      const repository = createRepository();
      const expectedCount = options?.seedCount ?? 22;

      expect(repository.count()).toBe(expectedCount);
      expect(repository.list()).toHaveLength(expectedCount);

      const seeded = SEED_INVOICES[0]!;
      const loaded = repository.getById(seeded.invoiceId);
      expect(loaded?.invoiceReference).toBe(seeded.invoiceReference);
      expect(loaded?.lineItems.length).toBeGreaterThan(0);
      expect(loaded?.lineItems[0]?.timeEntryId).toBeTruthy();
    });

    it("filters invoices by query, client, matter, and status", () => {
      const repository = createRepository();
      const matter = SEED_MATTERS[0]!;

      expect(repository.list({ query: "INV-2026" }).length).toBeGreaterThan(0);
      expect(repository.list({ clientId: matter.clientId }).length).toBeGreaterThan(0);
      expect(repository.list({ matterId: matter.matterId }).length).toBeGreaterThan(0);
      expect(repository.list({ invoiceStatus: "paid" }).length).toBeGreaterThan(0);
      expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
    });

    it("creates, updates, and persists line items", () => {
      const repository = createRepository();
      const matter = SEED_MATTERS[0]!;
      const timeEntry = SEED_TIME_ENTRIES.find(
        (entry) => entry.matterId === matter.matterId,
      )!;

      const createdBase = InvoiceFactory.create({
        clientId: matter.clientId,
        matterId: matter.matterId,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
        lineItems: [
          {
            description: timeEntry.narrative,
            quantity: timeEntry.durationMinutes / 60,
            unitPrice: timeEntry.rate,
            matterId: matter.matterId,
            timeEntryId: timeEntry.timeEntryId,
          },
        ],
        invoiceStatus: "draft",
      });

      const created: ManagedInvoice = {
        ...createdBase,
        expensesPlaceholder: 0,
        disbursementsPlaceholder: 0,
        notes: "Contract test invoice",
        createdAt: new Date().toISOString(),
      };

      repository.create(created);
      const loaded = repository.getById(created.invoiceId);
      expect(loaded?.notes).toBe("Contract test invoice");
      expect(loaded?.lineItems).toHaveLength(1);
      expect(loaded?.lineItems[0]?.timeEntryId).toBe(timeEntry.timeEntryId);

      const updated = repository.update(created.invoiceId, {
        ...created,
        notes: "Updated contract invoice",
        invoiceStatus: "issued",
      });
      expect(updated?.invoiceStatus).toBe("issued");
      expect(repository.getById(created.invoiceId)?.notes).toBe(
        "Updated contract invoice",
      );
    });

    it("persists void and paid status transitions", () => {
      const repository = createRepository();
      const matter = SEED_MATTERS[1]!;
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
        expensesPlaceholder: 0,
        disbursementsPlaceholder: 0,
        createdAt: new Date().toISOString(),
      };

      repository.create(invoice);

      const cancelled = repository.update(invoice.invoiceId, {
        ...invoice,
        invoiceStatus: "void",
      });
      expect(cancelled?.invoiceStatus).toBe("void");

      const paidBase = InvoiceFactory.create({
        clientId: matter.clientId,
        matterId: matter.matterId,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
        lineItems: [
          {
            description: "Paid transition line",
            quantity: 1,
            unitPrice: 100,
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
      const paid = repository.update(paidInvoice.invoiceId, {
        ...paidInvoice,
        invoiceStatus: "paid",
      });
      expect(paid?.invoiceStatus).toBe("paid");
    });
  });
}

registerWritableInvoiceRepositoryContract(
  "InMemoryInvoiceRepository",
  () => new InMemoryInvoiceRepository(),
);
