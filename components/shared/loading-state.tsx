export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground"
      role="status"
      aria-live="polite"
      data-testid="loading-state"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
