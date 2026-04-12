import { EmptyState } from "@/components/shared/empty-state";

export function AttentionCards() {
  return (
    <section className="rounded-lg border border-border bg-surface p-[var(--shell-pad)]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Needs attention</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <EmptyState
          title="No urgent items"
          description="Escalations and SLA breaches will appear as cards when integrations exist."
        />
      </div>
    </section>
  );
}
