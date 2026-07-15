"use client";

import { Button } from "@apzhub/ui";
import type { ReactNode } from "react";

import { formatStatusLabel } from "@/lib/testing/format";

export function PageShell({
  title,
  description,
  actions,
  children,
  breadcrumbs,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly breadcrumbs?: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="testing-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Testing
          </p>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              <ol className="flex flex-wrap gap-1">
                {breadcrumbs.map((crumb, index) => (
                  <li key={`${crumb}-${index}`} className="inline-flex items-center gap-1">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    <span>{crumb}</span>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function LoadingState({ label = "Loading Testing…" }: { readonly label?: string }) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="testing-loading"
      role="status"
    >
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="testing-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid="testing-error"
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">Unable to load Testing</p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }: { readonly status: string }) {
  return (
    <span
      className="inline-flex rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-foreground)]"
      data-testid="testing-status-badge"
    >
      {formatStatusLabel(status)}
    </span>
  );
}

export function TestingStatCard({
  label,
  value,
  tone = "neutral",
}: {
  readonly label: string;
  readonly value: string;
  readonly tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] p-4"
      data-testid="testing-stat-card"
      data-tone={tone}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

export function TestingTable({
  columns,
  rows,
  onRowClick,
  caption,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly onRowClick?: (id: string) => void;
  readonly caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]" data-testid="testing-table">
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-2 font-medium text-[var(--color-foreground)]">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={
                onRowClick
                  ? "cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20"
                  : "border-b border-[var(--color-border)]"
              }
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row.id);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              data-testid={`testing-row-${row.id}`}
            >
              {row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`} className="px-3 py-2 text-[var(--color-foreground)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FilterBar({ children }: { readonly children: ReactNode }) {
  return (
    <div
      className="grid gap-3 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2 lg:grid-cols-4"
      data-testid="testing-filter-bar"
      role="search"
    >
      {children}
    </div>
  );
}

export function Panel({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] p-4"
      data-testid="testing-panel"
      aria-label={title}
    >
      <h2 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
