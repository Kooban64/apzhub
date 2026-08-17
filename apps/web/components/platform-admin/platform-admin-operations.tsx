"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { OpsStatusBadge } from "@/components/platform-admin/ops-status-badge";
import type { PlatformOperationsPayload } from "@/lib/platform-admin/build-platform-operations";

async function fetchOperations(): Promise<PlatformOperationsPayload> {
  const res = await fetch("/api/v1/platform-admin/operations", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformOperationsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Operations failed (${res.status})`);
  }
  return body.data;
}

function CapabilityGrid({
  title,
  rows,
  testId,
}: {
  readonly title: string;
  readonly rows: PlatformOperationsPayload["core"];
  readonly testId: string;
}) {
  return (
    <section data-testid={testId}>
      <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
        {title}
      </h2>
      <ul className="grid gap-1 text-xs sm:grid-cols-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
            data-testid={`ops-cap-${row.id}`}
          >
            <span>{row.label}</span>
            <OpsStatusBadge field={row.health} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PlatformAdminOperationsView() {
  const q = useQuery({
    queryKey: ["platform-admin", "operations"],
    queryFn: fetchOperations,
  });

  return (
    <div className="flex flex-col gap-4 p-4" data-testid="platform-admin-operations">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Operations</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Current APZ Platform operational state
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
          <CapabilityGrid title="Core Platform" rows={q.data.core} testId="ops-core" />
          <CapabilityGrid
            title="Product Capabilities"
            rows={q.data.products}
            testId="ops-products"
          />

          <section data-testid="ops-issues">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Active Issues
            </h2>
            {q.data.issues.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                No active issues from current health signals.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {q.data.issues.map((issue) => (
                  <li
                    key={issue.title}
                    className="border border-[var(--color-border)] px-2 py-1.5"
                  >
                    <p className="font-medium">
                      {issue.severity === "error" ? "⚠" : "⚠"} {issue.title}
                    </p>
                    <p className="text-[var(--color-muted-foreground)]">
                      {issue.detail}
                    </p>
                    {issue.href ? (
                      <Link
                        href={issue.href}
                        className="mt-1 inline-block text-[var(--color-primary)] hover:underline"
                      >
                        Open →
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </>
      ) : null}
    </div>
  );
}
