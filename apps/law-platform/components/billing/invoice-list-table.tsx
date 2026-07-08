"use client";

import {
  formatInvoiceDate,
  formatInvoiceTotal,
  getClientNameForInvoice,
  getMatterTitleForInvoice,
  type ManagedInvoice,
} from "../../lib/billing";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { LawStatusBadge } from "../ux/law-status-badge";

export interface InvoiceListTableProps {
  readonly invoices: readonly ManagedInvoice[];
  readonly selectedInvoiceId?: string;
  readonly onSelect?: (invoice: ManagedInvoice) => void;
  readonly onOpen?: (invoice: ManagedInvoice) => void;
}

const COLUMNS = [
  { id: "invoiceReference", header: "Reference", width: "10rem" },
  { id: "issueDate", header: "Issue date", width: "8rem" },
  { id: "dueDate", header: "Due date", width: "8rem" },
  { id: "client", header: "Client", width: "12rem" },
  { id: "matter", header: "Matter", width: "12rem" },
  { id: "status", header: "Status", width: "9rem" },
  { id: "total", header: "Total", width: "8rem" },
] as const;

/** Invoice list table — standardised shell with status badges (LAW-013-05). */
export function InvoiceListTable({
  invoices,
  selectedInvoiceId,
  onSelect,
  onOpen,
}: InvoiceListTableProps) {
  return (
    <LawListTableShell
      columns={COLUMNS}
      testId="invoice-list-table"
      isEmpty={invoices.length === 0}
      emptyMessage="No invoices match the current filters."
    >
      {invoices.map((invoice) => {
        const selected = invoice.invoiceId === selectedInvoiceId;

        return (
          <tr
            key={invoice.invoiceId}
            data-testid={`invoice-list-row-${invoice.invoiceReference}`}
            className={selected ? "bg-[var(--color-muted)]/30" : undefined}
            onClick={() => onSelect?.(invoice)}
          >
            <td className="px-4 py-3 font-mono text-xs">{invoice.invoiceReference}</td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {formatInvoiceDate(invoice.issueDate)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {formatInvoiceDate(invoice.dueDate)}
            </td>
            <td className="px-4 py-3">{getClientNameForInvoice(invoice.clientId)}</td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getMatterTitleForInvoice(invoice.matterId)}
            </td>
            <td className="px-4 py-3">
              <LawStatusBadge status={invoice.invoiceStatus} />
            </td>
            <td className="px-4 py-3 font-medium">{formatInvoiceTotal(invoice)}</td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.(invoice);
                }}
              >
                Open
              </button>
            </td>
          </tr>
        );
      })}
    </LawListTableShell>
  );
}
