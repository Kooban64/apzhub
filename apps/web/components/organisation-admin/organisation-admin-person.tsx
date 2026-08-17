"use client";

import { useQuery } from "@tanstack/react-query";

import { PlatformAdminUserInspector } from "@/components/platform-admin/platform-admin-user-inspector";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";

async function fetchSessionTenantId(): Promise<string> {
  const res = await fetch("/api/v1/organisation-admin/home", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: { tenant?: { tenantId?: string } };
    meta?: { tenantId?: string };
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(body.error?.message ?? `Session tenant failed (${res.status})`);
  }
  const tenantId = body.meta?.tenantId ?? body.data?.tenant?.tenantId;
  if (!tenantId) {
    throw new Error("Organisation Admin requires an active tenant context");
  }
  return tenantId;
}

export function OrganisationAdminPersonView({ userId }: { readonly userId: string }) {
  const tenantQ = useQuery({
    queryKey: ["organisation-admin", "session-tenant"],
    queryFn: fetchSessionTenantId,
  });

  if (tenantQ.isLoading) {
    return <p className="p-4 text-xs text-[var(--color-muted-foreground)]">Loading…</p>;
  }

  if (tenantQ.isError || !tenantQ.data) {
    return (
      <p className="p-4 text-xs text-[var(--color-destructive)]" role="alert">
        {(tenantQ.error as Error)?.message ?? "Unable to resolve organisation"}
      </p>
    );
  }

  return (
    <PlatformAdminUserInspector
      tenantId={tenantQ.data}
      userId={userId}
      context="organisation-admin"
      allowManageAccess={false}
      backHref={`${ORGANISATION_ADMIN_BASE}/people`}
      backLabel="People"
      apiPath={`/api/v1/organisation-admin/people/${encodeURIComponent(userId)}`}
    />
  );
}
