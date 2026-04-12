import { EmptyState } from "@/components/shared/empty-state";

export function ActivityFeed() {
  return (
    <section className="rounded-lg border border-border bg-surface p-[var(--shell-pad)]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity</h2>
      <EmptyState
        title="No recent activity"
        description="Audit-style events and notifications will stream here without embedding full tools."
      />
    </section>
  );
}
