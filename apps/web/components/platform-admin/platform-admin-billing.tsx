"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { MetricOrGap } from "@/components/platform-admin/ops-status-badge";
import type { PlatformBillingPayload } from "@/lib/platform-admin/build-platform-billing";

async function fetchBilling(): Promise<PlatformBillingPayload> {
  const res = await fetch("/api/v1/platform-admin/billing", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformBillingPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Billing failed (${res.status})`);
  }
  return body.data;
}

type TabId = "overview" | "invoices" | "payments" | "billing-issues";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
  { id: "billing-issues", label: "Billing Issues" },
];

function GapPanel({
  title,
  message,
  testId,
}: {
  readonly title: string;
  readonly message: string;
  readonly testId: string;
}) {
  return (
    <section data-testid={testId}>
      <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
        {title}
      </h2>
      <div className="rounded border border-[var(--color-border)] px-3 py-4 text-xs">
        <p className="font-medium">Not configured</p>
        <p className="mt-1 text-[var(--color-muted-foreground)]">{message}</p>
      </div>
    </section>
  );
}

export function PlatformAdminBillingView() {
  const q = useQuery({
    queryKey: ["platform-admin", "billing"],
    queryFn: fetchBilling,
  });
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-billing">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Billing</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Platform commercial operations
        </p>
      </div>

      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`rounded px-2.5 py-1.5 text-xs ${
              tab === t.id ? "bg-[var(--color-muted)] font-medium" : "opacity-70"
            }`}
            onClick={() => setTab(t.id)}
            data-testid={`billing-tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data && tab === "overview" ? (
        <div className="flex flex-col gap-4" data-testid="billing-overview">
          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Revenue
            </h2>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>Current Month</span>
                <span title={q.data.revenue.currentMonth.message}>
                  {MetricOrGap(q.data.revenue.currentMonth)}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>Active Subscriptions</span>
                <span
                  title={q.data.revenue.activeSubscriptions.message}
                  data-testid="billing-active-subscriptions"
                >
                  {MetricOrGap(q.data.revenue.activeSubscriptions)}
                </span>
              </li>
            </ul>
            <p className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
              Status mix — active {q.data.revenue.byStatus.active} · trial{" "}
              {q.data.revenue.byStatus.trial} · past due{" "}
              {q.data.revenue.byStatus.pastDue}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Receivables
            </h2>
            <ul className="space-y-1 text-xs">
              {(
                [
                  ["Outstanding", q.data.receivables.outstanding],
                  ["Overdue", q.data.receivables.overdue],
                  ["Failed Payments", q.data.receivables.failedPayments],
                  ["Renewals — 30 days", q.data.receivables.renewals30d],
                ] as const
              ).map(([label, field]) => (
                <li
                  key={label}
                  className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
                >
                  <span>{label}</span>
                  <span title={field.message}>{MetricOrGap(field)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section data-testid="billing-recent-activity">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Recent Billing Activity
            </h2>
            <div className="rounded border border-[var(--color-border)] px-3 py-4 text-xs">
              <p className="font-medium">Not configured</p>
              <p className="mt-1 text-[var(--color-muted-foreground)]">
                {q.data.recentActivity.message}
              </p>
            </div>
          </section>

          <section data-testid="billing-subscriptions">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Subscriptions (durable)
            </h2>
            {q.data.subscriptions.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                No durable org product subscriptions on file.
              </p>
            ) : (
              <div className="overflow-x-auto rounded border border-[var(--color-border)]">
                <table className="w-full min-w-[36rem] border-collapse text-left text-xs">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                    <tr>
                      <th className="px-2 py-1.5 font-medium">Tenant</th>
                      <th className="px-2 py-1.5 font-medium">Product</th>
                      <th className="px-2 py-1.5 font-medium">Plan</th>
                      <th className="px-2 py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.data.subscriptions.map((row) => (
                      <tr
                        key={row.subscriptionId}
                        className="border-b border-[var(--color-border)]/60"
                        data-testid={`billing-sub-${row.subscriptionId}`}
                      >
                        <td className="px-2 py-1.5">{row.tenantLabel}</td>
                        <td className="px-2 py-1.5 font-mono text-[11px]">
                          {row.productKey}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-[11px]">
                          {row.planId}
                        </td>
                        <td className="px-2 py-1.5 capitalize">
                          {row.status.replace("_", " ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </div>
      ) : null}

      {q.data && tab === "invoices" ? (
        <GapPanel
          title="Invoices"
          message={q.data.invoices.message}
          testId="billing-invoices"
        />
      ) : null}

      {q.data && tab === "payments" ? (
        <GapPanel
          title="Payments"
          message={q.data.payments.message}
          testId="billing-payments"
        />
      ) : null}

      {q.data && tab === "billing-issues" ? (
        <GapPanel
          title="Billing Issues"
          message={q.data.billingIssues.message}
          testId="billing-issues"
        />
      ) : null}
    </div>
  );
}
