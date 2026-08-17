"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { MetricOrGap } from "@/components/platform-admin/ops-status-badge";
import type {
  PlatformProvisioningPayload,
  ProvisioningJobRow,
} from "@/lib/platform-admin/build-platform-provisioning";

async function fetchProvisioning(): Promise<PlatformProvisioningPayload> {
  const res = await fetch("/api/v1/platform-admin/provisioning", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: PlatformProvisioningPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Provisioning failed (${res.status})`);
  }
  return body.data;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function PlatformAdminProvisioningView() {
  const q = useQuery({
    queryKey: ["platform-admin", "provisioning"],
    queryFn: fetchProvisioning,
  });
  const [tab, setTab] = useState<"overview" | "queue" | "failures" | "history">(
    "queue",
  );
  const [selected, setSelected] = useState<ProvisioningJobRow | null>(null);

  const jobs = useMemo(() => {
    if (!q.data) return [];
    if (tab === "failures") return q.data.jobs.filter((j) => j.status === "failed");
    if (tab === "history") {
      return q.data.jobs.filter(
        (j) => j.status === "completed" || j.status === "failed",
      );
    }
    return q.data.jobs;
  }, [q.data, tab]);

  return (
    <div
      className="relative flex flex-col gap-3 p-4"
      data-testid="platform-admin-provisioning"
    >
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Provisioning</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Identity, product and provider provisioning
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
            className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
          >
            {(["overview", "queue", "failures", "history"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`rounded px-2.5 py-1.5 text-xs capitalize ${
                  tab === id ? "bg-[var(--color-muted)] font-medium" : "opacity-70"
                }`}
                onClick={() => setTab(id)}
                data-testid={`provisioning-tab-${id}`}
              >
                {id}
              </button>
            ))}
          </div>

          <p
            className="text-[11px] text-[var(--color-muted-foreground)]"
            title={q.data.feed.message}
            data-testid="provisioning-feed"
            data-availability={q.data.feed.availability}
          >
            Feed:{" "}
            {q.data.feed.availability === "ok"
              ? "Live records"
              : q.data.feed.availability === "empty"
                ? "Empty"
                : q.data.feed.availability === "not_configured"
                  ? "Not configured"
                  : "Unavailable"}
          </p>

          <dl
            className="grid gap-2 text-xs sm:grid-cols-4"
            data-testid="provisioning-counts"
          >
            {(
              [
                ["Pending", q.data.counts.pending],
                ["Processing", q.data.counts.processing],
                ["Failed", q.data.counts.failed],
                ["Completed", q.data.counts.completed],
              ] as const
            ).map(([label, field]) => (
              <div
                key={label}
                className="flex justify-between gap-2 border border-[var(--color-border)] px-2 py-1.5"
              >
                <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
                <dd title={field.message}>{MetricOrGap(field)}</dd>
              </div>
            ))}
          </dl>

          {jobs.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              No provisioning job rows to display. Queue history is not invented from
              entitlement state.
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-[var(--color-border)]">
              <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Tenant</th>
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="px-3 py-2 font-medium">Target</th>
                    <th className="px-3 py-2 font-medium">Started</th>
                    <th className="px-3 py-2 font-medium text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.provisioningId}
                      className="border-b border-[var(--color-border)]/60 last:border-0"
                    >
                      <td className="px-3 py-2">{job.statusLabel}</td>
                      <td className="px-3 py-2">{job.tenantName}</td>
                      <td className="px-3 py-2">{job.userLabel}</td>
                      <td className="px-3 py-2">{job.targetCapability}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {formatTime(job.startedAt)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[var(--color-primary)] hover:underline"
                          onClick={() => setSelected(job)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}

      {selected ? (
        <aside
          className="fixed inset-y-0 right-0 z-40 w-full max-w-sm border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg"
          data-testid="provisioning-failure-drawer"
          role="dialog"
          aria-label="Provisioning detail"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {selected.status === "failed"
                ? "Provisioning Failure"
                : "Provisioning Job"}
            </h2>
            <button
              type="button"
              className="text-xs text-[var(--color-muted-foreground)]"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
          </div>
          <dl className="space-y-2 text-xs">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Tenant</dt>
              <dd>{selected.tenantName}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">User</dt>
              <dd>{selected.userLabel}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Capability</dt>
              <dd>{selected.targetCapability}</dd>
            </div>
            {selected.providerName ? (
              <div>
                <dt className="text-[var(--color-muted-foreground)]">
                  Implementation Provider
                </dt>
                <dd>{selected.providerName}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd>{selected.statusLabel}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Attempt</dt>
              <dd title={selected.attempt.message}>{MetricOrGap(selected.attempt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Last Attempt</dt>
              <dd>{formatTime(selected.startedAt)}</dd>
            </div>
            {selected.message ? (
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Error</dt>
                <dd>{selected.message}</dd>
              </div>
            ) : null}
          </dl>
          <button
            type="button"
            disabled
            title={q.data?.retry.message}
            className="mt-4 cursor-not-allowed rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
            data-testid="provisioning-retry"
          >
            Retry Provisioning
          </button>
        </aside>
      ) : null}
    </div>
  );
}
