export type LawStatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<LawStatusTone, string> = {
  neutral: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
  success: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  danger: "bg-[var(--color-destructive)]/15 text-[var(--color-destructive)]",
  info: "bg-[var(--law-accent)]/15 text-[var(--law-accent)]",
};

const STATUS_TONE_MAP: Record<string, LawStatusTone> = {
  active: "success",
  open: "success",
  completed: "success",
  paid: "success",
  pending: "warning",
  prospect: "info",
  overdue: "danger",
  cancelled: "neutral",
  archived: "neutral",
  void: "neutral",
  draft: "neutral",
  sent: "info",
  partial: "warning",
};

export function resolveStatusTone(status: string): LawStatusTone {
  return STATUS_TONE_MAP[status.toLowerCase()] ?? "neutral";
}

export interface LawStatusBadgeProps {
  readonly status: string;
  readonly tone?: LawStatusTone;
}

/** Consistent status badge across list tables (LAW-013-05). */
export function LawStatusBadge({ status, tone }: LawStatusBadgeProps) {
  const resolvedTone = tone ?? resolveStatusTone(status);

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TONE_CLASSES[resolvedTone]}`}
      data-testid="law-status-badge"
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
