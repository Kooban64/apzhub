import type { Invoice, InvoiceLineItem } from "@apzhub/legal-business-core";

import { lawInvoice, lawInvoiceLineItem } from "../legal-schema";

type InvoiceRow = typeof lawInvoice.$inferSelect;
type InvoiceLineItemRow = typeof lawInvoiceLineItem.$inferSelect;

/** Invoice persistence shape including app-layer ManagedInvoice fields. */
export interface LawInvoicePersistenceModel extends Invoice {
  readonly expensesPlaceholder: number;
  readonly disbursementsPlaceholder: number;
  readonly notes?: string;
  readonly createdAt: string;
}

export function invoiceToRow(
  invoice: LawInvoicePersistenceModel,
  tenantId: string,
): typeof lawInvoice.$inferInsert {
  return {
    invoiceId: invoice.invoiceId,
    tenantId,
    clientId: invoice.clientId,
    matterId: invoice.matterId ?? null,
    invoiceReference: invoice.invoiceReference,
    invoiceStatus: invoice.invoiceStatus,
    issueDate: new Date(invoice.issueDate),
    dueDate: new Date(invoice.dueDate),
    subtotal: invoice.subtotal,
    taxTotal: invoice.taxTotal,
    total: invoice.total,
    currency: invoice.currency,
    trustAppliedAmount: invoice.trustAppliedAmount ?? null,
    expensesPlaceholder: invoice.expensesPlaceholder,
    disbursementsPlaceholder: invoice.disbursementsPlaceholder,
    notes: invoice.notes ?? null,
    createdAt: new Date(invoice.createdAt),
  };
}

export function lineItemToRow(
  lineItem: InvoiceLineItem,
  invoiceId: string,
  tenantId: string,
): typeof lawInvoiceLineItem.$inferInsert {
  return {
    lineItemId: lineItem.lineItemId,
    tenantId,
    invoiceId,
    description: lineItem.description,
    quantity: lineItem.quantity,
    unitPrice: lineItem.unitPrice,
    amount: lineItem.amount,
    matterId: lineItem.matterId,
    timeEntryId: lineItem.timeEntryId ?? null,
    expenseId: lineItem.expenseId ?? null,
  };
}

export function rowToLineItem(row: InvoiceLineItemRow): InvoiceLineItem {
  return {
    lineItemId: row.lineItemId,
    description: row.description,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    amount: row.amount,
    matterId: row.matterId,
    timeEntryId: row.timeEntryId ?? undefined,
    expenseId: row.expenseId ?? undefined,
  };
}

export function rowToInvoice(
  row: InvoiceRow,
  lineItems: readonly InvoiceLineItem[],
): LawInvoicePersistenceModel {
  return {
    invoiceId: row.invoiceId,
    invoiceReference: row.invoiceReference,
    clientId: row.clientId,
    matterId: row.matterId ?? undefined,
    invoiceStatus: row.invoiceStatus as Invoice["invoiceStatus"],
    issueDate: row.issueDate.toISOString().slice(0, 10),
    dueDate: row.dueDate.toISOString().slice(0, 10),
    subtotal: row.subtotal,
    taxTotal: row.taxTotal,
    total: row.total,
    currency: row.currency,
    lineItems,
    trustAppliedAmount: row.trustAppliedAmount ?? undefined,
    expensesPlaceholder: row.expensesPlaceholder,
    disbursementsPlaceholder: row.disbursementsPlaceholder,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}
