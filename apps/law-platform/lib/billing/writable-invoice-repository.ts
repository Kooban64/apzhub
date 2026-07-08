import type { ManagedInvoice } from "./invoice-types";
import type { InvoiceRepository } from "./invoice-repository";

export interface WritableInvoiceRepository extends InvoiceRepository {
  create(invoice: ManagedInvoice): ManagedInvoice;
  update(invoiceId: string, invoice: ManagedInvoice): ManagedInvoice | undefined;
  count(): number;
}
