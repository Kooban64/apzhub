"use client";

import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";
import { isMockFallbackOrigin } from "@/lib/admin/access/admin-access-load-meta";

/**
 * Warns operators when admin access JSON is not backed by Postgres (silent mock fallback paths).
 */
export function AdminAccessDatasourceBanner() {
  const { data, isLoading, isError } = useAdminAccessQuery();

  if (isLoading || isError || !data) {
    return null;
  }

  const { loadMeta } = data;
  if (!isMockFallbackOrigin(loadMeta.origin)) {
    return null;
  }

  const detail = loadMeta.detail ? ` Details: ${loadMeta.detail}` : "";

  return (
    <div
      className="border-b border-amber-500/40 bg-amber-500/10 px-[var(--shell-pad)] py-2 text-xs text-amber-950 dark:text-amber-100"
      role="status"
      data-testid="admin-access-datasource-banner"
    >
      <p className="font-semibold">Access data is not from Postgres</p>
      <p className="mt-1 text-[0.65rem] opacity-90">
        Origin: <span className="font-mono">{loadMeta.origin}</span>. The UI may show the in-repo mock catalog while
        `APZHUB_ACCESS_SOURCE` expects real or file-backed data. Fix database connectivity, file path, or set{" "}
        <span className="font-mono">APZHUB_ACCESS_STRICT_REAL=true</span> to fail fast instead of masking errors.
        {detail}
      </p>
    </div>
  );
}
