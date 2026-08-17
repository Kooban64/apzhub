"use client";

import { useQuery } from "@tanstack/react-query";

import {
  PlatformAdminTenantChrome,
  fieldDisplay,
} from "@/components/platform-admin/platform-admin-tenant-chrome";
import type { TenantProductsPayload } from "@/lib/platform-admin/build-tenant-commercial";

async function fetchProducts(tenantId: string): Promise<TenantProductsPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/products`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: TenantProductsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Products failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminTenantProducts({
  tenantId,
}: {
  readonly tenantId: string;
}) {
  const q = useQuery({
    queryKey: ["platform-admin", "tenant-products", tenantId],
    queryFn: () => fetchProducts(tenantId),
  });

  if (q.isLoading) {
    return (
      <p className="p-4 text-xs text-[var(--color-muted-foreground)]">
        Loading products…
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
      activeTab="products"
    >
      <section data-testid="platform-admin-tenant-products">
        <h2 className="mb-3 text-[11px] font-semibold tracking-wide uppercase">
          Products
        </h2>
        {q.data.empty ? (
          <p
            className="text-xs text-[var(--color-muted-foreground)]"
            data-testid="tenant-products-empty"
          >
            No commercial product subscriptions on file for this tenant.
          </p>
        ) : null}

        <div className="space-y-6">
          {q.data.suites.map((suite) => (
            <article
              key={suite.suiteId}
              className="border-b border-[var(--color-border)] pb-4"
              data-testid={`tenant-suite-${suite.suiteId}`}
              data-status={suite.status.value ?? suite.status.availability}
            >
              <p className="text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
                {suite.section}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold">{suite.brand}</h3>
                <span
                  className="text-xs text-[var(--color-muted-foreground)]"
                  title={suite.status.message}
                >
                  ● {fieldDisplay(suite.status)}
                </span>
              </div>

              <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted-foreground)]">Plan</dt>
                  <dd title={suite.plan.message}>{fieldDisplay(suite.plan)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted-foreground)]">Licences</dt>
                  <dd title={suite.licences.message}>{fieldDisplay(suite.licences)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted-foreground)]">Renewal</dt>
                  <dd title={suite.renewal.message}>{fieldDisplay(suite.renewal)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted-foreground)]">
                    Assigned users
                  </dt>
                  <dd title={suite.assignedUsers.message}>
                    {fieldDisplay(suite.assignedUsers)}
                  </dd>
                </div>
              </dl>

              {suite.suiteId === "productivity" ? (
                <ul className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
                  {suite.modules.map((m) => (
                    <li
                      key={m.productKey}
                      className="flex justify-between gap-2 border-b border-[var(--color-border)]/50 py-0.5"
                      data-testid={`tenant-module-${m.productKey}`}
                      data-module-status={m.status}
                    >
                      <span>{m.label}</span>
                      <span className="text-[var(--color-muted-foreground)]">
                        {m.status === "enabled" ? "Enabled" : "Not subscribed"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="mt-2 text-right text-[11px] text-[var(--color-muted-foreground)]">
                Manage →
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-[var(--color-muted-foreground)]">
          {q.data.note}
        </p>
      </section>
    </PlatformAdminTenantChrome>
  );
}
