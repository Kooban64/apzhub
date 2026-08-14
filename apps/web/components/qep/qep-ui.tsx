"use client";

import { Button } from "@apzhub/ui";
import Link from "next/link";
import type { ReactNode } from "react";

export function QepPageShell({
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
    <div className="flex flex-col gap-6 p-1" data-testid="qep-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            QEP
          </p>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav
              aria-label="Breadcrumb"
              className="mt-1 text-xs text-[var(--color-muted-foreground)]"
            >
              <ol className="flex flex-wrap gap-1">
                {breadcrumbs.map((crumb, index) => (
                  <li
                    key={`${crumb}-${index}`}
                    className="inline-flex items-center gap-1"
                  >
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    <span>{crumb}</span>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function QepLoadingState({
  label = "Loading requirements…",
}: {
  readonly label?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="qep-loading"
      role="status"
    >
      {label}
    </div>
  );
}

export function QepErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-6 text-sm"
      data-testid="qep-error"
      role="alert"
    >
      <p className="text-[var(--color-destructive)]">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function QepEmptyState({ title }: { readonly title: string }) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="qep-empty"
    >
      {title}
    </div>
  );
}

/** Honest unavailable surface for stub / unrouted QEP modules (Q6). */
export function QepUnavailableState({
  title,
  detail,
}: {
  readonly title: string;
  readonly detail?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="qep-unavailable"
      role="status"
    >
      <p className="text-sm font-medium text-[var(--color-foreground)]">{title}</p>
      {detail ? (
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{detail}</p>
      ) : null}
    </div>
  );
}

export function QepFilterBar({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3" data-testid="qep-filter-bar">
      {children}
    </div>
  );
}

export function QepTable({
  caption,
  columns,
  rows,
}: {
  readonly caption: string;
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
    readonly href?: string;
  }[];
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="min-w-full text-sm" data-testid="qep-table">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--color-muted)]/40 text-left">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[var(--color-border)]">
              {row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`} className="px-3 py-2 align-top">
                  {index === 0 && row.href ? (
                    <Link
                      href={row.href}
                      className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                    >
                      {cell}
                    </Link>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QepStatusBadge({ status }: { readonly status: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className="inline-flex rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs capitalize"
      data-testid="qep-status-badge"
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}

export function QepPanel({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
