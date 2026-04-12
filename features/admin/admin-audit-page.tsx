"use client";

import Link from "next/link";

import { useAdminControlPlaneQuery } from "@/lib/hooks/use-admin-control-plane-query";
import { useAdminPrivilegedTracesQuery } from "@/lib/hooks/use-admin-privileged-traces-query";

export function AdminAuditPage() {
  const homeQ = useAdminControlPlaneQuery();
  const privQ = useAdminPrivilegedTracesQuery();

  if (homeQ.isPending || !homeQ.data || privQ.isPending) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-audit-loading">
        Loading audit…
      </div>
    );
  }

  const home = homeQ.data;
  const privileged = privQ.data ?? [];
  const { audit } = home;

  return (
    <div className="flex flex-col gap-6 p-[var(--shell-pad)]" data-testid="admin-audit-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Append-oriented events: actor, action, target, time, domain, outcome, and context. Mock data only.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Persisted workspace launch outcomes (JWT, OIDC, blocked clicks) live on{" "}
          <Link href="/admin/launch" className="font-medium text-primary underline">
            /admin/launch
          </Link>
          .
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Events</h2>
        <div className="overflow-auto rounded-md border border-border">
          <table className="w-full min-w-[48rem] text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 font-medium">Time</th>
                <th className="px-2 py-1.5 font-medium">Actor</th>
                <th className="px-2 py-1.5 font-medium">Action</th>
                <th className="px-2 py-1.5 font-medium">Target</th>
                <th className="px-2 py-1.5 font-medium">Domain</th>
                <th className="px-2 py-1.5 font-medium">Outcome</th>
                <th className="px-2 py-1.5 font-medium">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[0.65rem]">
              {audit.events.map((ev) => (
                <tr key={ev.id} data-testid={`admin-audit-table-row-${ev.id}`}>
                  <td className="px-2 py-1.5 text-muted-foreground">{ev.at}</td>
                  <td className="px-2 py-1.5">{ev.actor}</td>
                  <td className="px-2 py-1.5 text-foreground">{ev.verb}</td>
                  <td className="px-2 py-1.5">{ev.target}</td>
                  <td className="px-2 py-1.5">{ev.domain}</td>
                  <td className="px-2 py-1.5">{ev.outcome}</td>
                  <td className="max-w-xs truncate px-2 py-1.5 text-muted-foreground">{ev.contextSummary ?? ev.metadata ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Privileged actions</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          High-risk verbs with correlation ids for cross-reference to audit rows (mock traceability layer).
        </p>
        <div className="overflow-auto rounded-md border border-border">
          <table className="w-full min-w-[44rem] text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 font-medium">Time</th>
                <th className="px-2 py-1.5 font-medium">Correlation</th>
                <th className="px-2 py-1.5 font-medium">Actor</th>
                <th className="px-2 py-1.5 font-medium">Verb</th>
                <th className="px-2 py-1.5 font-medium">Target</th>
                <th className="px-2 py-1.5 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[0.65rem]">
              {privileged.map((p) => (
                <tr key={p.id} data-testid={`admin-priv-row-${p.id}`}>
                  <td className="px-2 py-1.5 text-muted-foreground">{p.at}</td>
                  <td className="px-2 py-1.5">{p.correlationId}</td>
                  <td className="px-2 py-1.5">{p.actor}</td>
                  <td className="px-2 py-1.5">{p.verb}</td>
                  <td className="px-2 py-1.5">{p.target}</td>
                  <td className="px-2 py-1.5">{p.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
