"use client";

import type { AccessRealizationStatus } from "@/lib/admin/access/realization-status";
import { REALIZATION_PILL_TONE, REALIZATION_STATUS_LABELS } from "@/lib/admin/access/realization-status";
import { cn } from "@/lib/utils";

export function RealizationPill({ status }: { status: AccessRealizationStatus }) {
  return (
    <span
      className={cn(
        "rounded px-1 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide",
        REALIZATION_PILL_TONE[status],
      )}
    >
      {REALIZATION_STATUS_LABELS[status]}
    </span>
  );
}
