export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="flex max-w-md flex-col gap-2 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm"
      data-testid="empty-state"
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
