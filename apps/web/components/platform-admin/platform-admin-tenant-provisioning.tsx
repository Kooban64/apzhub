"use client";

import { useQuery } from "@tanstack/react-query";

import {
  PlatformAdminTenantChrome,
  fieldDisplay,
} from "@/components/platform-admin/platform-admin-tenant-chrome";
import type { TenantProvisioningPayload } from "@/lib/platform-admin/build-tenant-provisioning";

async function fetchProvisioning(tenantId: string): Promise<TenantProvisioningPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/provisioning`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: TenantProvisioningPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Provisioning failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminTenantProvisioning({
  tenantId,
}: {
  readonly tenantId: string;
}) {
  const q = useQuery({
    queryKey: ["platform-admin", "tenant-provisioning", tenantId],
    queryFn: () => fetchProvisioning(tenantId),
  });

  if (q.isLoading) {
    return (
      <p className="p-4 text-xs text-[var(--color-muted-foreground)]">
        Loading provisioning…
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

  return (
    <PlatformAdminTenantChrome
      tenantId={tenantId}
      tenantName={q.data.tenantName}
      tenantStatus={q.data.tenantStatus}
      activeTab="provisioning"
    >
      <section data-testid="platform-admin-tenant-provisioning">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[11px] font-semibold tracking-wide uppercase">
            Provisioning
          </h2>
          <span className="text-xs" title={q.data.overall.message}>
            Overall: {fieldDisplay(q.data.overall)}
          </span>
        </div>

        <dl className="mb-4 grid gap-1 text-xs sm:grid-cols-3">
          {q.data.strips.map((strip) => (
            <div
              key={strip.label}
              className="flex justify-between gap-2 border border-[var(--color-border)] px-2 py-1.5"
              data-testid={`provision-strip-${strip.label.toLowerCase()}`}
            >
              <dt className="text-[var(--color-muted-foreground)]">{strip.label}</dt>
              <dd title={strip.status.message}>{fieldDisplay(strip.status)}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
          Entitlement readiness
        </h3>
        <ul className="mb-4 space-y-1 text-xs" data-testid="provision-steps">
          {q.data.steps.map((step) => (
            <li
              key={step.id}
              className="flex justify-between gap-2 border-b border-[var(--color-border)]/60 py-1"
              data-step-status={step.status}
            >
              <span>{step.label}</span>
              <span className="capitalize text-[var(--color-muted-foreground)]">
                {step.status}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
          Subscribed products
        </h3>
        {q.data.subscribedProducts.length === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">None</p>
        ) : (
          <ul className="mb-4 space-y-1 text-xs" data-testid="provision-products">
            {q.data.subscribedProducts.map((p) => (
              <li
                key={p.productKey}
                className="flex justify-between gap-2 border-b border-[var(--color-border)]/60 py-1"
              >
                <span>{p.label}</span>
                <span className="text-[var(--color-muted-foreground)]">{p.status}</span>
              </li>
            ))}
          </ul>
        )}

        <p
          className="text-[11px] text-[var(--color-muted-foreground)]"
          data-testid="provision-queue-note"
          title={q.data.queue.message}
        >
          Queue: Not configured
        </p>
      </section>
    </PlatformAdminTenantChrome>
  );
}
