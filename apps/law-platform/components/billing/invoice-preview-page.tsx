"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import {
  LawBreadcrumbs,
  LawInformationCard,
  LawPageHeader,
  LawPageHeaderButton,
  LawWorkspaceLayout,
} from "../ux";
import { useInvoiceWorkflow } from "../../lib/billing/invoice-workflow-context";
import {
  composeInvoiceDetail,
  formatInvoiceDate,
  formatInvoiceStatusLabel,
  getSharedInvoiceRepository,
  invoiceDetailRoute,
  invoiceListRoute,
} from "../../lib/billing";

export interface InvoicePreviewPageProps {
  readonly invoiceId: string;
}

export function InvoicePreviewPage({ invoiceId }: InvoicePreviewPageProps) {
  const router = useRouter();
  const workflow = useInvoiceWorkflow();
  const repository = getSharedInvoiceRepository();
  const invoice = useMemo(() => repository.getById(invoiceId), [repository, invoiceId]);
  const composition = useMemo(
    () => (invoice ? composeInvoiceDetail(invoice) : undefined),
    [invoice],
  );
  const previewedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!invoice || previewedRef.current === invoice.invoiceId) {
      return;
    }

    previewedRef.current = invoice.invoiceId;
    workflow.previewInvoice(invoice.invoiceId);
  }, [invoice, workflow]);

  if (!invoice || !composition) {
    return (
      <LawWorkspaceLayout
        header={
          <LawPageHeader
            eyebrow="Billing"
            title="Invoice preview not available"
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(invoiceListRoute())}>
                Back to invoices
              </LawPageHeaderButton>
            }
          />
        }
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Invoice not found.
        </p>
      </LawWorkspaceLayout>
    );
  }

  return (
    <div data-testid="invoice-preview-page">
      <LawWorkspaceLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Billing", href: invoiceListRoute() },
                {
                  label: invoice.invoiceReference,
                  href: invoiceDetailRoute(invoice.invoiceId),
                },
                { label: "Preview" },
              ]}
            />
            <LawPageHeader
              eyebrow="Billing"
              title={`Invoice Preview — ${invoice.invoiceReference}`}
              subtitle={`${formatInvoiceStatusLabel(invoice.invoiceStatus)} · Due ${formatInvoiceDate(invoice.dueDate)}`}
              secondaryActions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(invoiceDetailRoute(invoice.invoiceId))}
                  >
                    Back to detail
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                  >
                    Print preview
                  </Button>
                </>
              }
            />
          </>
        }
      >
        <LawInformationCard title="Invoice summary">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Bill to
              </dt>
              <dd className="mt-1 font-medium">{composition.clientName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Matter
              </dt>
              <dd className="mt-1 font-medium">{composition.matterTitle}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Issue date
              </dt>
              <dd className="mt-1">{formatInvoiceDate(invoice.issueDate)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Due date
              </dt>
              <dd className="mt-1">{formatInvoiceDate(invoice.dueDate)}</dd>
            </div>
          </dl>
        </LawInformationCard>

        <LawInformationCard title="Line items">
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
                <th className="py-2">Description</th>
                <th className="py-2">Reference</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {composition.timeEntries.map((entry) => (
                <tr
                  key={entry.timeEntryId}
                  className="border-b border-[var(--color-border)]"
                >
                  <td className="py-2">{entry.narrative}</td>
                  <td className="py-2 font-mono text-xs">{entry.reference}</td>
                  <td className="py-2 text-right">{entry.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2" colSpan={2}>
                  Expenses (placeholder)
                </td>
                <td className="py-2 text-right">
                  {composition.expensesPlaceholder.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2" colSpan={2}>
                  Disbursements (placeholder)
                </td>
                <td className="py-2 text-right">
                  {composition.disbursementsPlaceholder.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </LawInformationCard>

        <LawInformationCard title="Totals">
          <dl className="grid max-w-sm gap-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{composition.formattedSubtotal}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>{composition.formattedTaxTotal}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{composition.formattedTotal}</dd>
            </div>
          </dl>
        </LawInformationCard>
      </LawWorkspaceLayout>
    </div>
  );
}
