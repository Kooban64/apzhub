"use client";

import { cn } from "@/lib/utils";

const toneClass: Record<string, string> = {
  ok: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  critical: "bg-destructive/15 text-destructive",
  blocked: "bg-muted text-muted-foreground",
};

export function AccessStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warning" | "critical" | "blocked";
}) {
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide", toneClass[tone])}>
      {label}
    </span>
  );
}
