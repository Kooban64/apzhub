"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import {
  LawBreadcrumbs,
  LawDetailPageLayout,
  LawEmptyState,
  LawInformationCard,
  LawPageHeader,
  LawPageHeaderButton,
  LawStatisticsCard,
  LawStatusCard,
} from "../ux";
import { InvoiceContextPanel } from "./invoice-context-panel";
import { useInvoiceWorkflow } from "../../lib/billing/invoice-workflow-context";
import {
  composeInvoiceDetail,
  formatInvoiceDate,
  formatInvoiceStatusLabel,
  formatInvoiceTotal,
  getSharedInvoiceRepository,
  invoiceEditRoute,
  invoiceListRoute,
  invoicePreviewRoute,
} from "../../lib/billing";
import { matterDetailRoute } from "../../lib/matters";
import { clientDetailRoute } from "../../lib/clients";

export interface InvoiceDetailPageProps {
  readonly invoiceId: string;
}

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const router = useRouter();
  const workflow = useInvoiceWorkflow();
  const repository = getSharedInvoiceRepository();
  const invoice = useMemo(() => repository.getById(invoiceId), [repository, invoiceId]);
  const composition = useMemo(
    () => (invoice ? composeInvoiceDetail(invoice) : undefined),
    [invoice],
  );
  const openedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!invoice || openedRef.current === invoice.invoiceId) {
      return;
    }

    openedRef.current = invoice.invoiceId;
    workflow.openInvoice(invoice.invoiceId);
  }, [invoice, workflow]);

  function handleCancel() {
    const result = workflow.cancelInvoice(invoiceId);
    if (result.ok) {
      router.refresh();
    }
  }

  function handleMarkPaid() {
    const result = workflow.markInvoicePaid(invoiceId);
    if (result.ok) {
      router.refresh();
    }
  }

  if (!invoice || !composition) {
    return (
      <LawDetailPageLayout
        header={
          <LawPageHeader
            eyebrow="Billing"
            title="Invoice not found"
            subtitle="The requested invoice is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(invoiceListRoute())}>
                Back to invoices
              </LawPageHeaderButton>
            }
          />
        }
        properties={<LawEmptyState variant="no-results" />}
      />
    );
  }

  const canEdit = invoice.invoiceStatus !== "void" && invoice.invoiceStatus !== "paid";
  const canCancel = canEdit;
  const canMarkPaid = canEdit;

  return (
    <LawDetailPageLayout
      header={
        <>
          <LawBreadcrumbs
            items={[
              { label: "Billing", href: invoiceListRoute() },
              { label: invoice.invoiceReference },
            ]}
          />
          <LawPageHeader
            eyebrow="Billing"
            title={invoice.invoiceReference}
            subtitle={`${composition.clientName} · ${composition.matterTitle}`}
            primaryAction={
              canEdit ? (
                <LawPageHeaderButton
                  onClick={() => router.push(invoiceEditRoute(invoice.invoiceId))}
                >
                  Edit Invoice
                </LawPageHeaderButton>
              ) : undefined
            }
            secondaryActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(invoiceListRoute())}
                >
                  Back to list
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(invoicePreviewRoute(invoice.invoiceId))}
                >
                  Preview
                </Button>
                {canCancel ? (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel Invoice
                  </Button>
                ) : null}
                {canMarkPaid ? (
                  <Button
                    type="button"
                    onClick={handleMarkPaid}
                    data-testid="invoice-mark-paid-button"
                  >
                    Mark Paid
                  </Button>
                ) : null}
              </>
            }
          />
        </>
      }
      summaryCards={
        <>
          <LawStatisticsCard label="Total" value={formatInvoiceTotal(invoice)} />
          <LawStatusCard
            label="Status"
            status={formatInvoiceStatusLabel(invoice.invoiceStatus)}
            tone={
              invoice.invoiceStatus === "paid"
                ? "success"
                : invoice.invoiceStatus === "overdue"
                  ? "warning"
                  : "neutral"
            }
          />
          <LawStatisticsCard
            label="Issue date"
            value={formatInvoiceDate(invoice.issueDate)}
          />
          <LawStatisticsCard
            label="Due date"
            value={formatInvoiceDate(invoice.dueDate)}
          />
        </>
      }
      properties={
        <div className="space-y-6">
          <LawInformationCard title="Invoice composition">
            <dl
              className="grid gap-3 sm:grid-cols-2"
              data-testid="invoice-detail-composition"
            >
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Client
                </dt>
                <dd className="mt-1">
                  <a
                    href={clientDetailRoute(invoice.clientId)}
                    className="text-[var(--law-accent)] hover:underline"
                  >
                    {composition.clientName}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Matter
                </dt>
                <dd className="mt-1">
                  {composition.matterId ? (
                    <a
                      href={matterDetailRoute(composition.matterId)}
                      className="text-[var(--law-accent)] hover:underline"
                    >
                      {composition.matterTitle}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Subtotal
                </dt>
                <dd className="mt-1">{composition.formattedSubtotal}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Tax
                </dt>
                <dd className="mt-1">{composition.formattedTaxTotal}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Expenses (placeholder)
                </dt>
                <dd className="mt-1">{composition.formattedExpenses}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Disbursements (placeholder)
                </dt>
                <dd className="mt-1">{composition.formattedDisbursements}</dd>
              </div>
            </dl>
          </LawInformationCard>

          <LawInformationCard title="Time entries">
            <ul className="space-y-2 text-sm">
              {composition.timeEntries.map((entry) => (
                <li key={entry.timeEntryId}>
                  {entry.reference} — {entry.narrative}
                </li>
              ))}
            </ul>
          </LawInformationCard>
        </div>
      }
      contextPanel={<InvoiceContextPanel />}
    />
  );
}
