import type { ManagedInvoice } from "./invoice-types";
import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import { getClientDisplayName } from "../matters/matter-lookups";
import { formatInvoiceAmount } from "./invoice-types";

export interface InvoiceCompositionTimeEntry {
  readonly timeEntryId: string;
  readonly reference: string;
  readonly narrative: string;
  readonly durationMinutes: number;
  readonly amount: number;
}

export interface InvoiceDetailComposition {
  readonly invoiceId: string;
  readonly invoiceReference: string;
  readonly status: string;
  readonly issueDate: string;
  readonly dueDate: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly matterId?: string;
  readonly matterTitle: string;
  readonly timeEntries: readonly InvoiceCompositionTimeEntry[];
  readonly expensesPlaceholder: number;
  readonly disbursementsPlaceholder: number;
  readonly subtotal: number;
  readonly taxTotal: number;
  readonly total: number;
  readonly currency: string;
  readonly formattedSubtotal: string;
  readonly formattedTaxTotal: string;
  readonly formattedTotal: string;
  readonly formattedExpenses: string;
  readonly formattedDisbursements: string;
  readonly lineItemCount: number;
}

/** Composes invoice detail from related entities (LAW-010-01). */
export function composeInvoiceDetail(
  invoice: ManagedInvoice,
): InvoiceDetailComposition {
  const client = getSharedClientRepository().getById(invoice.clientId);
  const matterId = invoice.matterId ?? invoice.lineItems[0]?.matterId;
  const matter = matterId ? getSharedMatterRepository().getById(matterId) : undefined;
  const timeRepo = getSharedTimeEntryRepository();

  const timeEntries = invoice.lineItems
    .map((item) => {
      if (!item.timeEntryId) {
        return undefined;
      }

      const entry = timeRepo.getById(item.timeEntryId);
      if (!entry) {
        return {
          timeEntryId: item.timeEntryId,
          reference: item.timeEntryId,
          narrative: item.description,
          durationMinutes: Math.round(item.quantity * 60),
          amount: item.amount,
        };
      }

      return {
        timeEntryId: entry.timeEntryId,
        reference: entry.timeEntryReference,
        narrative: entry.narrative,
        durationMinutes: entry.durationMinutes,
        amount: item.amount,
      };
    })
    .filter(Boolean) as InvoiceCompositionTimeEntry[];

  return {
    invoiceId: invoice.invoiceId,
    invoiceReference: invoice.invoiceReference,
    status: invoice.invoiceStatus,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    clientId: invoice.clientId,
    clientName: client?.displayName ?? getClientDisplayName(invoice.clientId),
    matterId,
    matterTitle: matter?.title ?? matterId ?? "—",
    timeEntries,
    expensesPlaceholder: invoice.expensesPlaceholder,
    disbursementsPlaceholder: invoice.disbursementsPlaceholder,
    subtotal: invoice.subtotal,
    taxTotal: invoice.taxTotal,
    total: invoice.total,
    currency: invoice.currency,
    formattedSubtotal: formatInvoiceAmount(invoice.subtotal, invoice.currency),
    formattedTaxTotal: formatInvoiceAmount(invoice.taxTotal, invoice.currency),
    formattedTotal: formatInvoiceAmount(invoice.total, invoice.currency),
    formattedExpenses: formatInvoiceAmount(
      invoice.expensesPlaceholder,
      invoice.currency,
    ),
    formattedDisbursements: formatInvoiceAmount(
      invoice.disbursementsPlaceholder,
      invoice.currency,
    ),
    lineItemCount: invoice.lineItems.length,
  };
}
