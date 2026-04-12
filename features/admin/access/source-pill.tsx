"use client";

import {
  ACCESS_SOURCE_LABELS,
  type AccessSourceVisibility,
} from "@/lib/admin/access/access-source-visibility";
import { cn } from "@/lib/utils";

const toneClass: Record<AccessSourceVisibility, string> = {
  bundle: "bg-secondary text-secondary-foreground",
  override: "bg-primary/15 text-primary",
  bundle_plus_override: "bg-primary/25 text-primary",
  direct: "bg-muted text-muted-foreground",
  none: "border border-border text-muted-foreground",
};

export function SourcePill({ source }: { source: AccessSourceVisibility }) {
  return (
    <span
      className={cn("rounded px-1 py-0.5 font-mono text-[0.6rem] uppercase", toneClass[source])}
      title={ACCESS_SOURCE_LABELS[source]}
    >
      {source}
    </span>
  );
}
