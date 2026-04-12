import { EmptyState } from "@/components/shared/empty-state";

export function TodaySummaryStrip() {
  return (
    <section className="rounded-lg border border-border bg-surface-elevated/60 p-[var(--shell-pad)]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today</h2>
      <EmptyState
        title="Summary strip"
        description="Meetings, deadlines, and focus items will populate here when calendar and work data are wired. Phase 3 keeps this view-only."
      />
    </section>
  );
}
