"use client";

import { Button } from "@apzhub/ui";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  WORK_CONTEXT_SLOTS,
  type DocumentWorkReference,
  formatWorkReferenceKind,
} from "@/lib/documents/work-context";

export const DOCUMENTS_PRODUCT_NAME = "APZ Documents";

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
      : [DOCUMENTS_PRODUCT_NAME, title];

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="documents-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {DOCUMENTS_PRODUCT_NAME}
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-1 text-xs text-[var(--color-muted-foreground)]"
            data-testid="documents-breadcrumbs"
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

export function DocumentsWorkspaceFrame({
  children,
  context,
}: {
  readonly children: ReactNode;
  readonly context?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
      data-testid="documents-workspace-frame"
    >
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
      {context ? (
        <aside
          className="w-full shrink-0 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 p-4 lg:sticky lg:top-2 lg:w-80"
          data-testid="documents-context-panel"
          aria-label="Document work context"
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
  label = "Loading APZ Documents…",
}: {
  readonly label?: string;
}) {
  return (
    <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
      {label}
    </p>
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
      data-testid="documents-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center gap-2">{action}</div> : null}
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
      data-testid="documents-error"
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        Unable to load APZ Documents
      </p>
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

/** Work-first context: references only; empty slots guide attach-from-work. */
export function WorkContextPanel({
  title,
  ownerUserId,
  lifecycleStatus,
  references = [],
}: {
  readonly title?: string;
  readonly ownerUserId?: string;
  readonly lifecycleStatus?: string;
  readonly references?: readonly DocumentWorkReference[];
}) {
  const byKind = new Map(references.map((ref) => [ref.kind, ref]));

  return (
    <div className="space-y-4" data-testid="documents-work-context">
      <ContextSection title="This document">
        {title ? <p className="font-medium">{title}</p> : null}
        <p>
          <span className="text-[var(--color-muted-foreground)]">Owner: </span>
          {ownerUserId ?? "Unassigned"}
        </p>
        <p>
          <span className="text-[var(--color-muted-foreground)]">Lifecycle: </span>
          {lifecycleStatus ?? "—"}
        </p>
      </ContextSection>

      <ContextSection title="Related work">
        <ul className="space-y-3">
          {WORK_CONTEXT_SLOTS.map((slot) => {
            const ref = byKind.get(slot.kind);
            return (
              <li key={slot.kind} className="space-y-1">
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {slot.label}
                </p>
                {ref ? (
                  <p>
                    {ref.label ?? formatWorkReferenceKind(ref.kind)}{" "}
                    <span className="text-[var(--color-muted-foreground)]">
                      ({ref.externalId})
                    </span>
                  </p>
                ) : (
                  <p className="text-[var(--color-muted-foreground)]">Not linked</p>
                )}
                {!ref ? (
                  <Link
                    href={slot.startPath}
                    className="text-xs font-medium text-[var(--color-foreground)] underline-offset-2 hover:underline"
                  >
                    {slot.startLabel} to attach
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="pt-2 text-xs text-[var(--color-muted-foreground)]">
          Documents support work. Start from a project, support request, or evidence —
          not from a repository browse.
        </p>
      </ContextSection>
    </div>
  );
}

/** Admin-only readiness summary — no provider IDs or storage keys. */
export function AdminReadinessSummary({
  serviceReady,
  storageReady,
  integrityReady,
  issueCount,
}: {
  readonly serviceReady: boolean;
  readonly storageReady: boolean;
  readonly integrityReady: boolean;
  readonly issueCount: number;
}) {
  const row = (label: string, ok: boolean) => (
    <div>
      <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
      <dd className="font-medium text-[var(--color-foreground)]">
        {ok ? "Ready" : "Attention required"}
      </dd>
    </div>
  );

  return (
    <dl
      className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 text-sm sm:grid-cols-2"
      data-testid="documents-diagnostics"
    >
      {row("Document service", serviceReady)}
      {row("Storage service", storageReady)}
      {row("Integrity checks", integrityReady)}
      <div>
        <dt className="text-[var(--color-muted-foreground)]">Reconciliation issues</dt>
        <dd className="font-medium text-[var(--color-foreground)]">{issueCount}</dd>
      </div>
    </dl>
  );
}
