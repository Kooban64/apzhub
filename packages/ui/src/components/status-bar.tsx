export interface StatusBarProps {
  environment?: string;
  connectionStatus?: "connected" | "degraded" | "disconnected";
}

export function StatusBar({
  environment = "development",
  connectionStatus = "connected",
}: StatusBarProps) {
  const statusColor =
    connectionStatus === "connected"
      ? "text-[var(--color-success)]"
      : connectionStatus === "degraded"
        ? "text-[var(--color-warning)]"
        : "text-[var(--color-destructive)]";

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-muted-foreground)]">
      <span>Environment: {environment}</span>
      <span className={statusColor}>Platform: {connectionStatus}</span>
    </footer>
  );
}
