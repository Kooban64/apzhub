/** UI form model for Billing screens — LAW-010-01. */
import type { Invoice, InvoiceStatus } from "@apzhub/legal-business-core";

export type {
  Invoice,
  InvoiceLineItem,
  InvoiceSearchCriteria,
  InvoiceStatus,
} from "@apzhub/legal-business-core";
export { INVOICE_STATUSES } from "@apzhub/legal-business-core";

/** App-layer invoice with placeholder expense/disbursement amounts (LAW-010-01). */
export interface ManagedInvoice extends Invoice {
  readonly expensesPlaceholder: number;
  readonly disbursementsPlaceholder: number;
  readonly notes?: string;
  readonly createdAt: string;
}

export interface InvoiceFormValues {
  readonly invoiceReference: string;
  readonly clientId: string;
  readonly matterId: string;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly timeEntryIds: string;
  readonly expensesPlaceholder: string;
  readonly disbursementsPlaceholder: string;
  readonly notes: string;
}

export interface InvoiceListCriteria {
  readonly query?: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly invoiceStatus?: InvoiceStatus | "all";
}

export function invoiceToFormValues(invoice: ManagedInvoice): InvoiceFormValues {
  const timeEntryIds = invoice.lineItems
    .map((item) => item.timeEntryId)
    .filter(Boolean)
    .join(",");

  return {
    invoiceReference: invoice.invoiceReference,
    clientId: invoice.clientId,
    matterId: invoice.matterId ?? "",
    issueDate: invoice.issueDate.slice(0, 10),
    dueDate: invoice.dueDate.slice(0, 10),
    timeEntryIds,
    expensesPlaceholder: String(invoice.expensesPlaceholder),
    disbursementsPlaceholder: String(invoice.disbursementsPlaceholder),
    notes: invoice.notes ?? "",
  };
}

export function createEmptyInvoiceFormValues(
  matterId = "",
  clientId = "",
): InvoiceFormValues {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 30);

  return {
    invoiceReference: "",
    clientId,
    matterId,
    issueDate: today,
    dueDate: due.toISOString().slice(0, 10),
    timeEntryIds: "",
    expensesPlaceholder: "0",
    disbursementsPlaceholder: "0",
    notes: "",
  };
}

export function parsePlaceholderAmount(value: string): number {
  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}

export function parseTimeEntryIdsInput(value: string): readonly string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatInvoiceAmount(amount: number, currency = "AUD"): string {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency }).format(amount);
}

export function isOutstandingInvoiceStatus(status: InvoiceStatus): boolean {
  return status !== "paid" && status !== "void" && status !== "written_off";
}
