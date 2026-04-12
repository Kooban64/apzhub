"use client";

import { useAdminInspector } from "@/features/admin/admin-inspector-context";
import type { AdminProvisioningQueueRow } from "@/lib/admin/contracts/provisioning";
import { selectHomeQueue } from "@/lib/admin/admin-inspector-selection";
import { cn } from "@/lib/utils";

export function AdminProvisioningModule({ rows }: { rows: AdminProvisioningQueueRow[] }) {
  const { selection, setSelection } = useAdminInspector();

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-3 py-1.5 font-medium">Tenant</th>
            <th className="px-3 py-1.5 font-medium">Request</th>
            <th className="px-3 py-1.5 font-medium">Stage</th>
            <th className="px-3 py-1.5 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const active = selection.kind === "home_queue" && selection.id === row.id;
            return (
              <tr key={row.id} className={cn("border-b border-border/80 last:border-0", active && "bg-muted/50")}>
                <td className="p-0" colSpan={4}>
                  <button
                    type="button"
                    data-testid={`admin-queue-row-${row.id}`}
                    onClick={() => setSelection(selectHomeQueue(row))}
                    className="grid w-full grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-left hover:bg-muted/40"
                  >
                    <span className="min-w-0 truncate font-medium text-foreground">{row.tenantLabel}</span>
                    <span className="text-muted-foreground">{row.requestType}</span>
                    <span className="font-mono text-[0.65rem] uppercase text-muted-foreground">
                      {row.stage.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-[0.65rem] text-muted-foreground">{row.updatedAt}</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
