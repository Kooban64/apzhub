"use client";

import type { AdminHealthStrip } from "@/lib/admin/contracts/health";
import { cn } from "@/lib/utils";

function statusTone(status: AdminHealthStrip["overall"]): string {
  switch (status) {
    case "ok":
      return "text-emerald-700 dark:text-emerald-400";
    case "degraded":
      return "text-amber-700 dark:text-amber-400";
    case "down":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

export function AdminHealthModule({ health }: { health: AdminHealthStrip }) {
  return (
    <section className="rounded-md border border-border bg-background">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold uppercase tracking-wide", statusTone(health.overall))}>
            {health.overall}
          </span>
          <span className="text-xs text-muted-foreground">control plane</span>
        </div>
      </div>
      <p className="px-3 py-2 text-sm leading-snug text-foreground">{health.headline}</p>
      <div className="border-t border-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-1.5 font-medium">Subsystem</th>
              <th className="px-3 py-1.5 font-medium">Status</th>
              <th className="px-3 py-1.5 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {health.subsystems.map((row) => (
              <tr key={row.id} className="border-b border-border/80 last:border-0">
                <td className="px-3 py-1.5 font-medium text-foreground">{row.name}</td>
                <td className={cn("px-3 py-1.5 font-mono uppercase", statusTone(row.status))}>{row.status}</td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {row.detail}
                  {row.since ? (
                    <span className="mt-0.5 block font-mono text-[0.65rem] text-muted-foreground/90">
                      since {row.since}
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
