import type { Invoice, InvoiceLineItem, InvoiceStatus } from "../domain";
import { ReferenceNumberGenerator } from "../reference";
import { createEntityId } from "./id";

export interface InvoiceLineItemFactoryInput {
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly matterId: string;
  readonly timeEntryId?: string;
  readonly expenseId?: string;
}

export interface InvoiceFactoryInput {
  readonly clientId: string;
  readonly matterId?: string;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly lineItems: readonly InvoiceLineItemFactoryInput[];
  readonly currency?: string;
  readonly invoiceReference?: string;
  readonly invoiceStatus?: InvoiceStatus;
  readonly expensesPlaceholder?: number;
  readonly disbursementsPlaceholder?: number;
  readonly taxRate?: number;
  readonly trustAppliedAmount?: number;
}

const DEFAULT_TAX_RATE = 0.1;
const defaultReferenceGenerator = new ReferenceNumberGenerator();

function buildLineItem(input: InvoiceLineItemFactoryInput): InvoiceLineItem {
  const amount = Math.round(input.quantity * input.unitPrice * 100) / 100;

  return {
    lineItemId: createEntityId("li"),
    description: input.description.trim(),
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    amount,
    matterId: input.matterId.trim(),
    timeEntryId: input.timeEntryId,
    expenseId: input.expenseId,
  };
}

export function calculateInvoiceTotals(
  lineItems: readonly InvoiceLineItem[],
  expensesPlaceholder = 0,
  disbursementsPlaceholder = 0,
  taxRate = DEFAULT_TAX_RATE,
): { readonly subtotal: number; readonly taxTotal: number; readonly total: number } {
  const lineSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const subtotal =
    Math.round((lineSubtotal + expensesPlaceholder + disbursementsPlaceholder) * 100) /
    100;
  const taxTotal = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxTotal) * 100) / 100;

  return { subtotal, taxTotal, total };
}

export const InvoiceFactory = {
  create(input: InvoiceFactoryInput): Invoice {
    const lineItems = input.lineItems.map(buildLineItem);
    const expensesPlaceholder = input.expensesPlaceholder ?? 0;
    const disbursementsPlaceholder = input.disbursementsPlaceholder ?? 0;
    const taxRate = input.taxRate ?? DEFAULT_TAX_RATE;
    const { subtotal, taxTotal, total } = calculateInvoiceTotals(
      lineItems,
      expensesPlaceholder,
      disbursementsPlaceholder,
      taxRate,
    );

    return {
      invoiceId: createEntityId("inv"),
      invoiceReference:
        input.invoiceReference ?? defaultReferenceGenerator.nextInvoiceReference(),
      clientId: input.clientId.trim(),
      matterId: input.matterId?.trim(),
      invoiceStatus: input.invoiceStatus ?? "draft",
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      subtotal,
      taxTotal,
      total,
      currency: input.currency ?? "AUD",
      lineItems,
      trustAppliedAmount: input.trustAppliedAmount,
    };
  },
};
