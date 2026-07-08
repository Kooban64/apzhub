import type { ManagedInvoice, InvoiceListCriteria } from "./invoice-types";

export interface InvoiceRepository {
  list(criteria?: InvoiceListCriteria): readonly ManagedInvoice[];
  getById(invoiceId: string): ManagedInvoice | undefined;
}
