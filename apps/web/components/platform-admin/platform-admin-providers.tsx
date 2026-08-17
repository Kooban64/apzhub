"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  MetricOrGap,
  OpsStatusBadge,
} from "@/components/platform-admin/ops-status-badge";
import type { PlatformProvidersPayload } from "@/lib/platform-admin/build-platform-providers";

async function fetchProviders(): Promise<PlatformProvidersPayload> {
  const res = await fetch("/api/v1/platform-admin/providers", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformProvidersPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Providers failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminProvidersView() {
  const q = useQuery({
    queryKey: ["platform-admin", "providers"],
    queryFn: fetchProviders,
  });

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-providers">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Providers</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Implementation providers supporting APZ capabilities
        </p>
      </div>

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
          <div
            role="tablist"
            className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2 text-xs"
          >
            {q.data.tabs.map((tab, i) => (
              <span
                key={tab}
                className={`rounded px-2.5 py-1.5 capitalize ${
                  i === 0 ? "bg-[var(--color-muted)] font-medium" : "opacity-60"
                }`}
              >
                {tab === "mappings" ? "Provider Mappings" : tab}
              </span>
            ))}
          </div>

          {q.data.providers.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              No integration manifests found under integrations/.
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-[var(--color-border)]">
              <table
                className="w-full min-w-[40rem] border-collapse text-left text-xs"
                data-testid="providers-table"
              >
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Provider</th>
                    <th className="px-3 py-2 font-medium">APZ Capability</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Health</th>
                    <th className="px-3 py-2 font-medium">Tenants</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.providers.map((p) => (
                    <tr
                      key={p.providerId}
                      className="border-b border-[var(--color-border)]/60 last:border-0"
                      data-testid={`provider-row-${p.providerId}`}
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={p.href}
                          className="font-medium text-[var(--color-primary)] hover:underline"
                        >
                          {p.displayName}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{p.capability}</td>
                      <td className="px-3 py-2">{p.statusLabel}</td>
                      <td className="px-3 py-2">
                        <OpsStatusBadge field={p.health} />
                      </td>
                      <td className="px-3 py-2" title={p.tenants.message}>
                        {MetricOrGap(p.tenants)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </>
      ) : null}
    </div>
  );
}
