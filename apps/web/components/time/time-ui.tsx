"use client";

import { Button } from "@apzhub/ui";
import type { ReactNode } from "react";

import { formatSafeDiagnosticsJson, formatTimesheetStatus } from "@/lib/time/format";
import type { TimesheetStatus } from "@/lib/time/types";

export const TIME_PRODUCT_NAME = "APZ Time";

export function PageShell({
  title,
  description,
  actions,
  breadcrumbs,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly breadcrumbs?: readonly string[];
  readonly children: ReactNode;
}) {
  const crumbs =
    breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : [TIME_PRODUCT_NAME, title];

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="time-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {TIME_PRODUCT_NAME}
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-1 text-xs text-[var(--color-muted-foreground)]"
            data-testid="time-breadcrumbs"
          >
            <ol className="flex flex-wrap gap-1">
              {crumbs.map((crumb, index) => (
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
          <h1 className="mt-1 text-2xl font-semibold text-[var(--color-foreground)]">
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

/** Primary workspace + optional context panel (native APZHUB composition). */
export function TimeWorkspaceFrame({
  children,
  context,
}: {
  readonly children: ReactNode;
  readonly context?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
      data-testid="time-workspace-frame"
    >
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
      {context ? (
        <aside
          className="w-full shrink-0 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 p-4 lg:sticky lg:top-2 lg:w-72"
          data-testid="time-context-panel"
          aria-label="APZ Time context"
        >
          {context}
        </aside>
      ) : null}
    </div>
  );
}

export function ContextSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {title}
      </h2>
      <div className="space-y-2 text-sm text-[var(--color-foreground)]">{children}</div>
    </section>
  );
}

export function LoadingState({
  label = "Loading APZ Time…",
}: {
  readonly label?: string;
}) {
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

export function SelectField({
  label,
  value,
  onChange,
  options,
  emptyLabel = "None",
  testId,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly { readonly value: string; readonly label: string }[];
  readonly emptyLabel?: string;
  readonly testId?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[var(--color-foreground)]">{label}</span>
      <select
        className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Collapsible developer-only JSON — always uses safe formatter. */
export function DeveloperDetails({
  title,
  value,
  testId,
}: {
  readonly title: string;
  readonly value: unknown;
  readonly testId?: string;
}) {
  return (
    <details
      className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-3 py-2"
      data-testid={testId}
    >
      <summary className="cursor-pointer text-xs font-medium text-[var(--color-muted-foreground)]">
        {title}
      </summary>
      <pre className="mt-2 overflow-x-auto text-xs text-[var(--color-foreground)]">
        {formatSafeDiagnosticsJson(value)}
      </pre>
    </details>
  );
}
