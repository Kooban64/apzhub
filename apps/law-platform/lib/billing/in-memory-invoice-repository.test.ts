import { beforeEach, describe, expect, it } from "vitest";

import {
  getSharedInvoiceRepository,
  resetSharedInvoiceRepository,
} from "./in-memory-invoice-repository";
import { SEED_INVOICES } from "./seed-invoices";

describe("InMemoryInvoiceRepository", () => {
  beforeEach(() => {
    resetSharedInvoiceRepository();
  });

  it("seeds at least 20 invoices and filters by matter", () => {
    const repository = getSharedInvoiceRepository();
    expect(repository.count()).toBeGreaterThanOrEqual(20);
    expect(SEED_INVOICES.length).toBeGreaterThanOrEqual(20);

    const matterId = SEED_INVOICES[0]!.matterId!;
    const matterInvoices = repository.list({ matterId });
    expect(matterInvoices.length).toBeGreaterThan(0);
    expect(
      matterInvoices.every(
        (invoice) =>
          invoice.matterId === matterId ||
          invoice.lineItems.some((item) => item.matterId === matterId),
      ),
    ).toBe(true);
  });
});
