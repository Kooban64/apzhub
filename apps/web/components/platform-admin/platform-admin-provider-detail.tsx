"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  MetricOrGap,
  OpsStatusBadge,
} from "@/components/platform-admin/ops-status-badge";
import type { PlatformProviderDetailPayload } from "@/lib/platform-admin/build-platform-providers";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

async function fetchDetail(providerId: string): Promise<PlatformProviderDetailPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/providers/${encodeURIComponent(providerId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: PlatformProviderDetailPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Provider detail failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminProviderDetail({
  providerId,
}: {
  readonly providerId: string;
}) {
  const q = useQuery({
    queryKey: ["platform-admin", "provider", providerId],
    queryFn: () => fetchDetail(providerId),
  });

  return (
    <div
      className="flex flex-col gap-3 p-4"
      data-testid="platform-admin-provider-detail"
    >
      <Link
        href={`${PLATFORM_ADMIN_BASE}/providers`}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        ← Providers
      </Link>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {q.data.displayName}
            </h1>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {q.data.capability} Provider
              {q.data.version ? ` · v${q.data.version}` : ""}
            </p>
          </div>

          <dl className="max-w-md space-y-2 text-xs">
            <div className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd>{q.data.statusLabel}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
              <dt className="text-[var(--color-muted-foreground)]">Health</dt>
              <dd>
                <OpsStatusBadge field={q.data.health} testId="provider-health" />
              </dd>
            </div>
          </dl>

          <section>
            <h2 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
              Capability
            </h2>
            <p className="text-xs">APZ {q.data.capability}</p>
          </section>

          <section>
            <h2 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
              Tenants
            </h2>
            <p className="text-xs" title={q.data.tenants.message}>
              {MetricOrGap(q.data.tenants)}
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
              Configuration
            </h2>
            <dl className="max-w-md space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-muted-foreground)]">Connection</dt>
                <dd>
                  <OpsStatusBadge field={q.data.connection} />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-muted-foreground)]">Authentication</dt>
                <dd>
                  <OpsStatusBadge field={q.data.authentication} />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-muted-foreground)]">
                  Last Health Check
                </dt>
                <dd title={q.data.lastHealthCheck.message}>
                  {MetricOrGap(q.data.lastHealthCheck)}
                </dd>
              </div>
            </dl>
          </section>

          <button
            type="button"
            disabled
            title={q.data.diagnostics.message}
            className="w-fit cursor-not-allowed rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
          >
            Diagnostics
          </button>
        </>
      ) : null}
    </div>
  );
}
