"use client";

import type { WorkflowAuditViewModel } from "@/lib/workflows/workflow-types";

export function AuditTimeline({
  entries,
  title = "Audit timeline",
}: {
  readonly entries: readonly WorkflowAuditViewModel[];
  readonly title?: string;
}) {
  if (entries.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-6 text-center"
        data-testid="audit-timeline-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No audit entries for this workflow.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="audit-timeline" aria-label={title}>
      <h2 className="mb-3 text-base font-semibold text-[var(--color-foreground)]">
        {title}
      </h2>
      <ol className="relative border-l border-[var(--color-border)] pl-4">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="mb-4 ml-1"
            data-testid={`audit-entry-${entry.id}`}
          >
            <span
              className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-foreground)]"
              aria-hidden
            />
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              {entry.action}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {entry.createdAt} · actor {entry.actorUserId}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
