import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { formatInvoiceAmount } from "./invoice-types";
import type { ManagedInvoice } from "./invoice-types";

export function getClientNameForInvoice(clientId: string): string {
  return getSharedClientRepository().getById(clientId)?.displayName ?? clientId;
}

export function getMatterTitleForInvoice(matterId?: string): string {
  if (!matterId) {
    return "—";
  }

  return getSharedMatterRepository().getById(matterId)?.title ?? matterId;
}

export function formatInvoiceDate(value?: string): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString();
}

export function formatInvoiceStatusLabel(
  status: ManagedInvoice["invoiceStatus"],
): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatInvoiceTotal(invoice: ManagedInvoice): string {
  return formatInvoiceAmount(invoice.total, invoice.currency);
}

export const INVOICE_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "sent", label: "Sent" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "void", label: "Void" },
  { value: "written_off", label: "Written off" },
] as const;
