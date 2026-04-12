import { EmptyState } from "@/components/shared/empty-state";

export function MyWorkLists() {
  return (
    <section className="rounded-lg border border-border bg-surface p-[var(--shell-pad)]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">My work</h2>
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <EmptyState title="Assigned to me" description="Tasks and reviews ship with work tracking in a later phase." />
        <EmptyState title="Following" description="Subscriptions and mentions will list here when available." />
      </div>
    </section>
  );
}
