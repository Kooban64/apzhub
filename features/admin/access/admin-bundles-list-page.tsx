"use client";

import Link from "next/link";

import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";

export function AdminBundlesListPage() {
  const accessQuery = useAdminAccessQuery();
  const data = accessQuery.data?.accessData;
  const isLoading = accessQuery.isLoading;

  if (isLoading || !data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-bundles-loading">
        Loading bundles…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-testid="admin-bundles-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Bundles</h1>
        <p className="text-xs text-muted-foreground">Access bundles and service-role assignments.</p>
      </header>
      <ul className="divide-y divide-border rounded-md border border-border">
        {data.bundles.bundles.map((b) => (
          <li key={b.id}>
            <Link
              href={`/admin/bundles/${b.id}`}
              className="flex flex-col gap-0.5 px-3 py-2 text-sm hover:bg-muted/40"
              data-testid={`admin-bundle-row-${b.id}`}
            >
              <span className="font-medium text-foreground">{b.name}</span>
              <span className="text-xs text-muted-foreground">{b.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
