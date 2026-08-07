"use client";

import { Button } from "@apzhub/ui";
import type { ReactNode } from "react";

/** Native product name — APZ-WORKFLOW-NATIVE-001-N03 */
export const WORKFLOW_PRODUCT_NAME = "APZ Workflow";

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
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : [WORKFLOW_PRODUCT_NAME, title];

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="workflow-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {WORKFLOW_PRODUCT_NAME}
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-1 text-xs text-[var(--color-muted-foreground)]"
            data-testid="workflow-breadcrumbs"
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

/** Primary workspace + optional Enterprise Context panel (CONTEXT-002). */
export function WorkflowWorkspaceFrame({
  children,
  context,
}: {
  readonly children: ReactNode;
  readonly context?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
      data-testid="workflow-workspace-frame"
    >
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
      {context ? (
        <aside
          className="w-full shrink-0 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 p-4 lg:sticky lg:top-2 lg:w-72"
          data-testid="workflow-context-panel"
          aria-label="APZ Workflow context"
        >
          {context}
        </aside>
      ) : null}
    </div>
  );
}

export function LoadingState({
  label = "Loading APZ Workflow…",
}: {
  readonly label?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="workflow-loading"
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
      data-testid="workflow-empty"
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
      data-testid="workflow-error"
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

export function WorkflowTable({
  headers,
  children,
  testId,
}: {
  readonly headers: readonly string[];
  readonly children: ReactNode;
  readonly testId?: string;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid={testId}
    >
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-3 py-2 font-medium text-[var(--color-muted-foreground)]"
              >
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

export function StatusBadge({ status }: { readonly status: string }) {
  return (
    <span
      className="inline-flex rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs font-medium"
      data-testid="workflow-status-badge"
    >
      {status}
    </span>
  );
}

export function DetailList({
  items,
  testId,
}: {
  readonly items: readonly { readonly label: string; readonly value: string }[];
  readonly testId?: string;
}) {
  return (
    <dl
      className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 text-sm md:grid-cols-2"
      data-testid={testId}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[var(--color-muted-foreground)]">{item.label}</dt>
          <dd className="font-medium text-[var(--color-foreground)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
