"use client";

import { Button } from "@apzhub/ui";
import type { ReactNode } from "react";

import { formatTimesheetStatus } from "@/lib/time/format";
import type { TimesheetStatus } from "@/lib/time/types";

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="time-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Time
          </p>
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

export function LoadingState({ label = "Loading Time…" }: { readonly label?: string }) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="time-loading"
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
      data-testid="time-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
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
      className="rounded-lg border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/5 px-4 py-6"
      data-testid="time-error"
      role="alert"
    >
      <p className="text-sm text-[var(--color-foreground)]">{message}</p>
      {onRetry ? (
        <Button type="button" size="sm" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }: { readonly status: TimesheetStatus }) {
  return (
    <span
      className="inline-flex rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs font-medium"
      data-testid="time-status-badge"
    >
      {formatTimesheetStatus(status)}
    </span>
  );
}

export function TimeTable({
  headers,
  children,
}: {
  readonly headers: readonly string[];
  readonly children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table
        className="w-full min-w-[640px] text-left text-sm"
        data-testid="time-table"
      >
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
