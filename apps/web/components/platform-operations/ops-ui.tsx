"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@apzhub/ui";
import type { ReactNode } from "react";

export function OpsPageShell({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="platform-operations-page">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Platform Operations
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function OpsStatCard({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function OpsStatusBadge({
  status,
}: {
  readonly status: string;
}) {
  const normalized = status.toLowerCase();
  const tone =
    normalized === "ready" ||
    normalized.includes("healthy") ||
    normalized === "active" ||
    normalized === "allow"
      ? "bg-emerald-500/15 text-emerald-700"
      : normalized.includes("ready_with") || normalized.includes("degraded") || normalized === "pending"
        ? "bg-amber-500/15 text-amber-700"
        : normalized.includes("not_ready") || normalized.includes("unhealthy")
          ? "bg-red-500/15 text-red-700"
          : "bg-muted text-[var(--color-muted-foreground)]";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}

export function OpsTable({
  columns,
  rows,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="min-w-full text-sm">
        <thead className="bg-[var(--color-muted)]/40 text-left">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-[var(--color-muted-foreground)]"
              >
                No records.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`row-${index}`} className="border-t border-[var(--color-border)]">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="px-4 py-2 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function OpsJsonPanel({ value }: { readonly value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-4 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function OpsLoadingState() {
  return <p className="text-sm text-[var(--color-muted-foreground)]">Loading platform data…</p>;
}

export function OpsErrorState({ message }: { readonly message: string }) {
  return <p className="text-sm text-red-600">{message}</p>;
}
