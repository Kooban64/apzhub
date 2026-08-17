"use client";

import type { OpsStatusField } from "@/lib/platform-admin/ops-status";

export function OpsStatusBadge({
  field,
  testId,
}: {
  readonly field: OpsStatusField;
  readonly testId?: string;
}) {
  return (
    <span
      className="text-xs text-[var(--color-muted-foreground)]"
      title={field.message}
      data-testid={testId}
      data-ops-status={field.status}
    >
      ● {field.label}
    </span>
  );
}

export function MetricOrGap(props: {
  readonly availability: string;
  readonly value?: string | number;
  readonly message?: string;
}): string {
  if (props.availability === "ok" && props.value !== undefined) {
    return String(props.value);
  }
  if (props.availability === "empty" && props.value !== undefined) {
    return String(props.value);
  }
  if (props.availability === "not_configured") return "Not configured";
  if (props.availability === "unavailable") return "Unavailable";
  return "—";
}
