"use client";

import { useAdminInspector } from "@/features/admin/admin-inspector-context";
import type { AdminActionRequiredItem } from "@/lib/admin/contracts/alerts";
import { selectHomeAlert } from "@/lib/admin/admin-inspector-selection";
import { cn } from "@/lib/utils";

function severityClass(sev: AdminActionRequiredItem["severity"]): string {
  switch (sev) {
    case "critical":
      return "border-l-destructive bg-destructive/5";
    case "warning":
      return "border-l-amber-500 bg-amber-500/5";
    default:
      return "border-l-border bg-muted/30";
  }
}

export function AdminAlertsModule({ items }: { items: AdminActionRequiredItem[] }) {
  const { selection, setSelection } = useAdminInspector();

  return (
    <div className="rounded-md border border-border">
      <div className="border-b border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
        {items.length} open
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const active = selection.kind === "home_alert" && selection.id === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-testid={`admin-alert-row-${item.id}`}
                onClick={() => setSelection(selectHomeAlert(item))}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-l-4 px-3 py-2 text-left transition-colors hover:bg-muted/50",
                  severityClass(item.severity),
                  active && "bg-muted/60",
                )}
              >
                <span className="text-xs font-semibold text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.summary}</span>
                {item.domain ? (
                  <span className="font-mono text-[0.6rem] text-muted-foreground">domain={item.domain}</span>
                ) : null}
                {item.pointerRoute ? (
                  <span className="font-mono text-[0.6rem] text-muted-foreground">→ {item.pointerRoute}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
