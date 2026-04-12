"use client";

import Link from "next/link";

import { useAdminInspector } from "@/features/admin/admin-inspector-context";
import type { AdminAuditEvent } from "@/lib/admin/contracts/audit";
import { selectHomeAudit } from "@/lib/admin/admin-inspector-selection";
import { cn } from "@/lib/utils";

export function AdminAuditModule({ events }: { events: AdminAuditEvent[] }) {
  const { selection, setSelection } = useAdminInspector();

  return (
    <div className="rounded-md border border-border font-mono text-[0.65rem] leading-relaxed">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1 text-[0.6rem] uppercase tracking-wide text-muted-foreground">
        <span>Last events</span>
        <Link href="/admin/audit" className="font-sans text-[0.6rem] font-medium normal-case text-primary underline">
          View all
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {events.map((ev) => {
          const active = selection.kind === "home_audit" && selection.id === ev.id;
          return (
            <li key={ev.id}>
              <button
                type="button"
                data-testid={`admin-audit-row-${ev.id}`}
                onClick={() => setSelection(selectHomeAudit(ev))}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-3 py-1.5 text-left hover:bg-muted/40",
                  active && "bg-muted/50",
                )}
              >
                <span className="text-muted-foreground">
                  <span className="text-foreground">{ev.at}</span> · {ev.actor} ·{" "}
                  <span className="text-foreground">{ev.verb}</span> → {ev.target}
                </span>
                {ev.metadata ? <span className="text-muted-foreground/80">{ev.metadata}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
