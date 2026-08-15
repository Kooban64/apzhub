"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { QepPageShell, QepPanel } from "./qep-ui";

type AuditRow = {
  auditId: string;
  action: string;
  actor?: string;
  createdAt: string;
  correlationId?: string;
};

async function fetchAudit(): Promise<readonly AuditRow[]> {
  const res = await fetch("/api/v1/qep/audit");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load audit");
  return (body.data?.items ?? []) as AuditRow[];
}

export function QepAuditRouterView() {
  const q = useQuery({ queryKey: ["qep", "audit"], queryFn: fetchAudit });

  return (
    <QepPageShell
      title="Audit and Compliance"
      description="QEP change trail for certification and investigation (WF-28)."
      breadcrumbs={["QEP", "Audit"]}
    >
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <Link
          href="/workspace/administration/audit"
          className="text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          Platform administration audit
        </Link>
        <Link
          href="/workspace/qep/certification"
          className="text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          Certification packs
        </Link>
      </div>

      <QepPanel title="Recent QEP events">
        {q.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {q.error ? (
          <p className="text-xs text-[var(--color-destructive)]">
            {(q.error as Error).message}
          </p>
        ) : null}
        {(q.data?.length ?? 0) === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            No QEP audit events recorded yet. Mutations in Caps and Release Control
            append here with correlation ids.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
            {(q.data ?? []).map((row) => (
              <li key={row.auditId} className="px-3 py-2.5 text-xs">
                <p className="font-medium">{row.action}</p>
                <p className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                  {row.createdAt}
                  {row.actor ? ` · ${row.actor}` : ""}
                  {row.correlationId ? ` · ${row.correlationId}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </QepPanel>
    </QepPageShell>
  );
}
