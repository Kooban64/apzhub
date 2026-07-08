import type { ManagedInvoice } from "@apzhub/law-platform/api";

import {
  createEntityMetadataCache,
  type EntityApiMetadata,
} from "../framework/entity-metadata-cache";
import {
  toMoneyAmountV1,
  type MoneyAmountV1,
} from "../time-entries/time-entry-dto-mapper";

/** Invoice API DTO shapes aligned with LAW-OpenAPI-v1 (LAW-014-06). */

export interface InvoiceLineItemV1 {
  readonly lineItemId: string;
  readonly description: string;
  readonly quantity: string;
  readonly unitPrice: MoneyAmountV1;
  readonly amount: MoneyAmountV1;
  readonly matterId: string;
  readonly timeEntryId: string | null;
  readonly expenseId: string | null;
}

export interface InvoiceSummaryV1 {
  readonly invoiceId: string;
  readonly invoiceReference: string;
  readonly clientId: string;
  readonly matterId: string | null;
  readonly invoiceStatus: ManagedInvoice["invoiceStatus"];
  readonly issueDate: string;
  readonly dueDate: string;
  readonly total: MoneyAmountV1;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InvoiceDetailV1 extends InvoiceSummaryV1 {
  readonly version: number;
  readonly subtotal: MoneyAmountV1;
  readonly taxTotal: MoneyAmountV1;
  readonly trustAppliedAmount: MoneyAmountV1;
  readonly lineItems: readonly InvoiceLineItemV1[];
}

export interface CreateInvoiceLineItemV1Request {
  readonly description: string;
  readonly quantity: string;
  readonly unitPrice: MoneyAmountV1;
  readonly matterId: string;
  readonly timeEntryId?: string;
  readonly expenseId?: string;
}

export interface CreateInvoiceV1Request {
  readonly clientId: string;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly lineItems: readonly CreateInvoiceLineItemV1Request[];
  readonly matterId?: string;
}

export interface UpdateInvoiceLineItemV1Request {
  readonly lineItemId: string;
  readonly description: string;
  readonly quantity: string;
  readonly unitPrice: MoneyAmountV1;
  readonly matterId: string;
  readonly timeEntryId?: string;
  readonly expenseId?: string;
}

export interface UpdateInvoiceV1Request {
  readonly dueDate?: string;
  readonly lineItems?: readonly UpdateInvoiceLineItemV1Request[];
}

export interface InvoiceCancelResponseV1 {
  readonly invoiceId: string;
  readonly status: "cancelled";
}

const metadataCache = createEntityMetadataCache();

export function resetInvoiceApiMetadataCache(): void {
  metadataCache.reset();
}

export function getInvoiceApiMetadata(invoiceId: string): EntityApiMetadata {
  return metadataCache.get(invoiceId);
}

export function touchInvoiceApiMetadata(
  invoiceId: string,
  created = false,
): EntityApiMetadata {
  return metadataCache.touch(invoiceId, created);
}

export function mapInvoiceLineItemToV1(
  item: ManagedInvoice["lineItems"][number],
  currency: string,
): InvoiceLineItemV1 {
  return {
    lineItemId: item.lineItemId,
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: toMoneyAmountV1(item.unitPrice, currency),
    amount: toMoneyAmountV1(item.amount, currency),
    matterId: item.matterId,
    timeEntryId: item.timeEntryId ?? null,
    expenseId: item.expenseId ?? null,
  };
}

export function mapInvoiceToSummaryV1(
  invoice: ManagedInvoice,
  metadata: EntityApiMetadata,
): InvoiceSummaryV1 {
  return {
    invoiceId: invoice.invoiceId,
    invoiceReference: invoice.invoiceReference,
    clientId: invoice.clientId,
    matterId: invoice.matterId ?? null,
    invoiceStatus: invoice.invoiceStatus,
    issueDate: invoice.issueDate.slice(0, 10),
    dueDate: invoice.dueDate.slice(0, 10),
    total: toMoneyAmountV1(invoice.total, invoice.currency),
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export function mapInvoiceToDetailV1(
  invoice: ManagedInvoice,
  metadata: EntityApiMetadata,
): InvoiceDetailV1 {
  return {
    ...mapInvoiceToSummaryV1(invoice, metadata),
    version: metadata.version,
    subtotal: toMoneyAmountV1(invoice.subtotal, invoice.currency),
    taxTotal: toMoneyAmountV1(invoice.taxTotal, invoice.currency),
    trustAppliedAmount: toMoneyAmountV1(
      invoice.trustAppliedAmount ?? 0,
      invoice.currency,
    ),
    lineItems: invoice.lineItems.map((item) =>
      mapInvoiceLineItemToV1(item, invoice.currency),
    ),
  };
}

export function lineItemsToTimeEntryIdsInput(
  lineItems: ReadonlyArray<{ readonly timeEntryId?: string }>,
): string {
  return lineItems
    .map((item) => item.timeEntryId)
    .filter((id): id is string => Boolean(id))
    .join(",");
}

export function resolveInvoiceMatterIdFromRequest(
  matterId: string | undefined,
  lineItems: ReadonlyArray<{ readonly matterId: string }>,
): string {
  if (matterId) {
    return matterId;
  }

  return lineItems[0]?.matterId ?? "";
}
