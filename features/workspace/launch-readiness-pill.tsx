"use client";

import type { LaunchReadiness } from "@/lib/launch/launch-readiness";
import { LAUNCH_READINESS_LABELS, LAUNCH_READINESS_PILL_TONE } from "@/lib/launch/launch-readiness";
import { cn } from "@/lib/utils";

export function LaunchReadinessPill({ readiness }: { readiness: LaunchReadiness }) {
  return (
    <span
      className={cn(
        "rounded px-1 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide",
        LAUNCH_READINESS_PILL_TONE[readiness],
      )}
    >
      {LAUNCH_READINESS_LABELS[readiness]}
    </span>
  );
}
