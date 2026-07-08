import type { ManagedInvoice, InvoiceListCriteria } from "./invoice-types";

function matchesMatter(invoice: ManagedInvoice, matterId: string): boolean {
  if (invoice.matterId === matterId) {
    return true;
  }

  return invoice.lineItems.some((item) => item.matterId === matterId);
}

export function matchesInvoiceCriteria(
  invoice: ManagedInvoice,
  criteria?: InvoiceListCriteria,
): boolean {
  if (!criteria) {
    return true;
  }

  if (
    criteria.clientId &&
    criteria.clientId !== "all" &&
    invoice.clientId !== criteria.clientId
  ) {
    return false;
  }

  if (
    criteria.matterId &&
    criteria.matterId !== "all" &&
    !matchesMatter(invoice, criteria.matterId)
  ) {
    return false;
  }

  if (
    criteria.invoiceStatus &&
    criteria.invoiceStatus !== "all" &&
    invoice.invoiceStatus !== criteria.invoiceStatus
  ) {
    return false;
  }

  const query = criteria.query?.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    invoice.invoiceReference,
    invoice.clientId,
    invoice.matterId ?? "",
    invoice.invoiceStatus,
    invoice.notes ?? "",
    ...invoice.lineItems.map((item) => item.description),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function sortInvoicesByIssueDate(
  invoices: readonly ManagedInvoice[],
): ManagedInvoice[] {
  return [...invoices].sort((left, right) =>
    right.issueDate.localeCompare(left.issueDate),
  );
}
