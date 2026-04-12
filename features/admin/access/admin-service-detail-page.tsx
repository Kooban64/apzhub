"use client";

import { AccessStatusBadge } from "@/features/admin/access/access-status-badge";
import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";

export function AdminServiceDetailPage({ serviceId }: { serviceId: string }) {
  const accessQuery = useAdminAccessQuery();
  const data = accessQuery.data?.accessData;
  const isLoading = accessQuery.isLoading;
  const detail = data?.serviceDetailsById[serviceId];

  if (isLoading || !data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-service-loading">
        Loading service…
      </div>
    );
  }

  if (!detail) {
    return (
      <div data-testid="admin-service-not-found">
        <p className="text-sm text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="admin-service-detail">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">{detail.name}</h1>
        <p className="text-xs text-muted-foreground">
          {detail.internalExternal} · {detail.authType} · {detail.provisioningType}
        </p>
      </header>
      <section className="rounded-md border border-border p-3">
        <h2 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Health</h2>
        <div className="flex flex-wrap items-center gap-2">
          <AccessStatusBadge
            label={detail.healthStatus}
            tone={detail.healthStatus === "ok" ? "ok" : detail.healthStatus === "degraded" ? "warning" : "critical"}
          />
          <span className="text-xs text-muted-foreground">{detail.healthDetail}</span>
        </div>
      </section>
      <section>
        <h2 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Role mapping</h2>
        <div className="overflow-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 font-medium">Role id</th>
                <th className="px-2 py-1.5 font-medium">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {detail.roleMappings.map((r) => (
                <tr key={r.roleId}>
                  <td className="px-2 py-1 font-mono text-[0.65rem]">{r.roleId}</td>
                  <td className="px-2 py-1">{r.roleLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
