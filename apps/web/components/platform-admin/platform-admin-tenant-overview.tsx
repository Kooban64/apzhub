"use client";

import { useQuery } from "@tanstack/react-query";

import { PlatformAdminTenantChrome } from "@/components/platform-admin/platform-admin-tenant-chrome";
import type { PlatformAdminTenantRow } from "@/lib/platform-admin/tenants-types";

async function fetchTenant(tenantId: string): Promise<PlatformAdminTenantRow> {
  const res = await fetch(
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: { tenant?: PlatformAdminTenantRow };
    error?: { message?: string };
  };
  if (!res.ok || !body.data?.tenant) {
    throw new Error(body.error?.message ?? `Tenant failed (${res.status})`);
  }
  return body.data.tenant;
}

/** Minimal tenant overview — commercial depth lives on sibling tabs. */
export function PlatformAdminTenantOverview({
  tenantId,
}: {
  readonly tenantId: string;
}) {
  const q = useQuery({
    queryKey: ["platform-admin", "tenant", tenantId],
    queryFn: () => fetchTenant(tenantId),
  });

  if (q.isLoading) {
    return (
      <p className="p-4 text-xs text-[var(--color-muted-foreground)]">
        Loading tenant…
      </p>
    );
  }
  if (q.isError || !q.data) {
    return (
      <p className="p-4 text-xs text-[var(--color-destructive)]" role="alert">
        {(q.error as Error)?.message ?? "Tenant not found"}
      </p>
    );
  }

  return (
    <PlatformAdminTenantChrome
      tenantId={tenantId}
      tenantName={q.data.name}
      tenantStatus={q.data.status}
      activeTab="overview"
    >
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Tenant overview is partial. Use Subscription, Products, Users, and Provisioning
        for durable commercial and access detail.
      </p>
    </PlatformAdminTenantChrome>
  );
}
