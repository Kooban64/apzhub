"use client";

export function TimelineLoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="activity-timeline-loading"
      className="space-y-3 px-4 py-6"
    >
      <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-muted)]" />
      <div className="h-12 animate-pulse rounded bg-[var(--color-muted)]/70" />
      <div className="h-12 animate-pulse rounded bg-[var(--color-muted)]/70" />
    </div>
  );
}
