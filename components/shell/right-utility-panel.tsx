"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useAdminRightPanelSlot } from "@/lib/admin/admin-right-panel-slot";
import type { ShellMode } from "@/types/shell-config";
import { useWorkspaceRightPanelSlot } from "@/lib/workspace/right-panel-slot";

export function RightUtilityPanelHeader({
  mode,
  onCollapse,
}: {
  mode: ShellMode;
  onCollapse: () => void;
}) {
  const label = mode === "admin" ? "Inspector" : "Context";
  const hideLabel = mode === "admin" ? "Hide inspector panel" : "Hide context panel";

  return (
    <div className="flex items-center justify-between border-b border-border px-[var(--shell-pad)] py-2">
      <span
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        data-testid="right-utility-panel-title"
      >
        {label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onCollapse}
        aria-label={hideLabel}
        data-testid="right-panel-collapse"
      >
        Hide
      </Button>
    </div>
  );
}

export function RightUtilityPanelBody({ mode }: { mode: ShellMode }) {
  const workspaceSlot = useWorkspaceRightPanelSlot();
  const adminSlot = useAdminRightPanelSlot();

  if (mode === "admin" && adminSlot) {
    return (
      <div
        className="flex flex-1 flex-col gap-3 overflow-auto p-[var(--shell-pad)]"
        data-testid="admin-inspector-body"
        role="region"
        aria-label="Admin inspector"
      >
        {adminSlot}
      </div>
    );
  }

  if (mode === "workspace" && workspaceSlot) {
    return (
      <div className="flex flex-1 flex-col gap-3 overflow-auto p-[var(--shell-pad)]">{workspaceSlot}</div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-auto p-[var(--shell-pad)]">
      <EmptyState
        title={mode === "admin" ? "No inspector" : "No context yet"}
        description={
          mode === "admin"
            ? "Open Admin home to load the control-plane inspector."
            : "Calendar, mail snapshots, and inspectors render here when those modules are enabled."
        }
      />
    </div>
  );
}
