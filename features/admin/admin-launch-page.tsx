"use client";

import Link from "next/link";

import { useAdminLaunchEventsQuery } from "@/lib/hooks/use-admin-launch-events-query";
import {
  formatLaunchEventOutcome,
  formatLaunchEventReason,
  formatLaunchMethod,
} from "@/lib/launch/launch-event-presenter";

export function AdminLaunchPage() {
  const q = useAdminLaunchEventsQuery(150);

  if (q.isPending) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-launch-loading">
        Loading launch events…
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-destructive" data-testid="admin-launch-error">
        Failed to load launch events.
      </div>
    );
  }

  const items = q.data?.items ?? [];

  return (
    <div className="flex flex-col gap-4 p-[var(--shell-pad)]" data-testid="admin-launch-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Launch events</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Persisted outcomes from JWT mint/landing, OIDC start, and blocked launcher clicks (Postgres).
        </p>
        <Link href="/admin/audit" className="mt-2 inline-block text-[0.65rem] font-medium text-primary underline">
          Back to audit
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No launch events recorded yet.</p>
      ) : (
        <div className="overflow-auto rounded-md border border-border">
          <table className="w-full min-w-[52rem] text-left text-xs" data-testid="admin-launch-events-table">
            <thead className="border-b border-border bg-muted/40 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 font-medium">Time</th>
                <th className="px-2 py-1.5 font-medium">Service</th>
                <th className="px-2 py-1.5 font-medium">User</th>
                <th className="px-2 py-1.5 font-medium">Method</th>
                <th className="px-2 py-1.5 font-medium">Outcome</th>
                <th className="px-2 py-1.5 font-medium">Reason</th>
                <th className="px-2 py-1.5 font-medium">User message</th>
                <th className="px-2 py-1.5 font-medium">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[0.65rem]">
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="px-2 py-1.5 text-muted-foreground">{row.createdAt}</td>
                  <td className="px-2 py-1.5">{row.serviceId}</td>
                  <td className="px-2 py-1.5">{row.userId ?? "—"}</td>
                  <td className="px-2 py-1.5">{formatLaunchMethod(row.launchMethod)}</td>
                  <td className="px-2 py-1.5">{formatLaunchEventOutcome(row.outcome)}</td>
                  <td className="px-2 py-1.5">{formatLaunchEventReason(row.reasonCode)}</td>
                  <td className="max-w-[12rem] truncate px-2 py-1.5">{row.userMessage}</td>
                  <td className="max-w-[14rem] truncate px-2 py-1.5 text-muted-foreground">{row.operatorMessage ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
