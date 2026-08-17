"use client";

import { useQuery } from "@tanstack/react-query";

import {
  PlatformAdminTenantChrome,
  fieldDisplay,
} from "@/components/platform-admin/platform-admin-tenant-chrome";
import type { TenantSubscriptionPayload } from "@/lib/platform-admin/build-tenant-commercial";

async function fetchSubscription(tenantId: string): Promise<TenantSubscriptionPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/subscription`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: TenantSubscriptionPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Subscription failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminTenantSubscription({
  tenantId,
}: {
  readonly tenantId: string;
}) {
  const q = useQuery({
    queryKey: ["platform-admin", "tenant-subscription", tenantId],
    queryFn: () => fetchSubscription(tenantId),
  });

  if (q.isLoading) {
    return (
      <p className="p-4 text-xs text-[var(--color-muted-foreground)]">
        Loading subscription…
      </p>
    );
  }
  if (q.isError) {
    return (
      <p className="p-4 text-xs text-[var(--color-destructive)]" role="alert">
        {(q.error as Error).message}
      </p>
    );
  }
  if (!q.data) return null;

  const rows = [
    { label: "Plan", field: q.data.plan },
    { label: "Status", field: q.data.status },
    { label: "Billing Cycle", field: q.data.billingCycle },
    { label: "Next Billing Date", field: q.data.nextBillingDate },
    { label: "Payment Method", field: q.data.paymentMethod },
  ] as const;

  return (
    <PlatformAdminTenantChrome
      tenantId={tenantId}
      tenantName={q.data.tenantName}
      tenantStatus={q.data.tenantStatus}
      activeTab="subscription"
    >
      <section data-testid="platform-admin-tenant-subscription">
        <h2 className="mb-3 text-[11px] font-semibold tracking-wide uppercase">
          Subscription
        </h2>

        <dl className="grid gap-1 text-xs sm:max-w-md">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
            >
              <dt className="text-[var(--color-muted-foreground)]">{row.label}</dt>
              <dd title={row.field.message}>{fieldDisplay(row.field)}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-6 mb-2 text-[11px] font-semibold tracking-wide uppercase">
          Products
        </h3>
        <ul className="space-y-1 text-xs sm:max-w-md">
          {q.data.products.map((p) => (
            <li
              key={p.brand}
              className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
              data-testid={`subscription-product-${p.brand.toLowerCase()}`}
            >
              <span>{p.brand}</span>
              <span title={p.detail.message}>{fieldDisplay(p.detail)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-[var(--color-border)] pt-3 text-xs sm:max-w-md">
          <div className="flex justify-between gap-4">
            <span className="text-[var(--color-muted-foreground)]">Current Period</span>
            <span title={q.data.currentPeriod.message}>
              {fieldDisplay(q.data.currentPeriod)}
            </span>
          </div>
          <button
            type="button"
            disabled
            title={q.data.manageSubscription.message}
            className="mt-3 cursor-not-allowed rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
            data-testid="tenant-subscription-manage"
          >
            Manage Subscription
          </button>
        </div>
      </section>
    </PlatformAdminTenantChrome>
  );
}
