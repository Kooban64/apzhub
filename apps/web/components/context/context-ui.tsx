"use client";

import type { ReactNode } from "react";

/** Shared Context section chrome — consistent across product consumers. */
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

/** Shared workspace + sticky context panel layout (CONTEXT-002 consistency). */
export function EnterpriseContextWorkspaceFrame({
  children,
  context,
  testId = "enterprise-context-workspace-frame",
  ariaLabel = "Enterprise Context",
}: {
  readonly children: ReactNode;
  readonly context?: ReactNode;
  readonly testId?: string;
  readonly ariaLabel?: string;
}) {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
      data-testid={testId}
    >
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
      {context ? (
        <aside
          className="w-full shrink-0 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 p-4 lg:sticky lg:top-2 lg:w-72"
          data-testid="enterprise-context-aside"
          aria-label={ariaLabel}
        >
          {context}
        </aside>
      ) : null}
    </div>
  );
}
