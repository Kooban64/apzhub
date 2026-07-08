import type { ManagedInvoice, InvoiceListCriteria } from "./invoice-types";
import {
  matchesInvoiceCriteria,
  sortInvoicesByIssueDate,
} from "./invoice-repository-filters";
import type { WritableInvoiceRepository } from "./writable-invoice-repository";
import { SEED_INVOICES } from "./seed-invoices";

/** In-memory writable invoice repository (LAW-010-01). */
export class InMemoryInvoiceRepository implements WritableInvoiceRepository {
  private readonly invoices: Map<string, ManagedInvoice>;

  constructor(seed: readonly ManagedInvoice[] = SEED_INVOICES) {
    this.invoices = new Map(seed.map((invoice) => [invoice.invoiceId, invoice]));
  }

  list(criteria?: InvoiceListCriteria): readonly ManagedInvoice[] {
    return sortInvoicesByIssueDate(
      [...this.invoices.values()].filter((invoice) =>
        matchesInvoiceCriteria(invoice, criteria),
      ),
    );
  }

  getById(invoiceId: string): ManagedInvoice | undefined {
    return this.invoices.get(invoiceId);
  }

  create(invoice: ManagedInvoice): ManagedInvoice {
    this.invoices.set(invoice.invoiceId, invoice);
    return invoice;
  }

  update(invoiceId: string, invoice: ManagedInvoice): ManagedInvoice | undefined {
    if (!this.invoices.has(invoiceId)) {
      return undefined;
    }

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  count(): number {
    return this.invoices.size;
  }
}

export {
  getSharedInvoiceRepository,
  resetSharedInvoiceRepository,
} from "../persistence/repository-factory";
