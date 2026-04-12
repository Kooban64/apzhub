"use client";

import Link from "next/link";
import { AccessStatusBadge } from "@/features/admin/access/access-status-badge";
import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";

export function AdminServicesListPage() {
  const accessQuery = useAdminAccessQuery();
  const data = accessQuery.data?.accessData;
  const isLoading = accessQuery.isLoading;

  if (isLoading || !data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-services-loading">
        Loading services…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-testid="admin-services-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Services</h1>
        <p className="text-xs text-muted-foreground">Integrated services, auth, and role mappings.</p>
      </header>
      <div className="overflow-auto rounded-md border border-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 font-medium">Name</th>
              <th className="px-2 py-1.5 font-medium">Type</th>
              <th className="px-2 py-1.5 font-medium">Auth</th>
              <th className="px-2 py-1.5 font-medium">Provisioning</th>
              <th className="px-2 py-1.5 font-medium">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.services.services.map((s) => (
              <tr key={s.id}>
                <td className="p-0">
                  <Link
                    href={`/admin/services/${s.id}`}
                    className="block px-2 py-1.5 font-medium text-primary hover:underline"
                    data-testid={`admin-service-row-${s.id}`}
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="px-2 py-1.5 text-muted-foreground">{s.internalExternal}</td>
                <td className="px-2 py-1.5 font-mono text-[0.65rem] text-muted-foreground">{s.authType}</td>
                <td className="px-2 py-1.5 text-muted-foreground">{s.provisioningType}</td>
                <td className="px-2 py-1.5">
                  <AccessStatusBadge
                    label={s.healthStatus}
                    tone={s.healthStatus === "ok" ? "ok" : s.healthStatus === "degraded" ? "warning" : "critical"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
