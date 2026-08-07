"use client";

import type { ReactNode } from "react";

/** Native product name — APZ-KNOWLEDGE-NATIVE-001 Memory Companion */
export const KNOWLEDGE_PRODUCT_NAME = "APZ Knowledge";

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
      : [KNOWLEDGE_PRODUCT_NAME, title];

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="knowledge-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {KNOWLEDGE_PRODUCT_NAME}
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-1 text-xs text-[var(--color-muted-foreground)]"
            data-testid="knowledge-breadcrumbs"
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
export function KnowledgeWorkspaceFrame({
  children,
  context,
}: {
  readonly children: ReactNode;
  readonly context?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
      data-testid="knowledge-workspace-frame"
    >
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
      {context ? (
        <aside
          className="w-full shrink-0 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 p-4 lg:sticky lg:top-2 lg:w-72"
          data-testid="knowledge-context-panel"
          aria-label="APZ Knowledge context"
        >
          {context}
        </aside>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="knowledge-empty"
      role="status"
    >
      <p className="text-sm font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function LoadingState({
  label = "Loading organisational memory…",
}: {
  readonly label?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="knowledge-loading"
      role="status"
    >
      {label}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Organisational memory could not be loaded. Try again or contact your administrator.",
}: {
  readonly title?: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/5 px-4 py-8 text-center"
      data-testid="knowledge-error"
      role="alert"
    >
      <p className="text-sm font-medium text-[var(--color-foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
    </div>
  );
}
