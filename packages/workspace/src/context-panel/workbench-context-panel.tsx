"use client";

import { Button } from "@apzhub/ui";

import { WorkbenchContextPanelActivityTab } from "./workbench-context-panel-activity-tab";
import { useContextPanelState } from "./use-context-panel-state";

export interface WorkbenchContextPanelProps {
  readonly enableActivityTab?: boolean;
  readonly panelOpen?: boolean;
  readonly onPanelOpenChange?: (open: boolean) => void;
  readonly onActivityActionExecuted?: (actionId: string) => void;
  readonly activityTimelineRenderKey?: number;
}

/**
 * Workbench Context Panel — Activity tab registration surface (AT-013).
 *
 * Requires ActivityTimelineProvider, ActivityTimelineServiceProvider, and
 * CommandRegistryProvider ancestors.
 */
export function WorkbenchContextPanel({
  enableActivityTab = true,
  panelOpen,
  onPanelOpenChange,
  onActivityActionExecuted,
  activityTimelineRenderKey,
}: WorkbenchContextPanelProps) {
  const panelState = useContextPanelState({
    open: panelOpen,
    onOpenChange: onPanelOpenChange,
  });

  if (!enableActivityTab) {
    return null;
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)]"
      data-testid="workbench-context-panel"
      aria-label="Context panel"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-current="page"
            data-testid="context-panel-tab-activity"
          >
            Activity
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={panelState.togglePanel}
          aria-expanded={panelState.open}
          data-testid="context-panel-toggle"
        >
          {panelState.open ? "Hide" : "Show"}
        </Button>
      </div>
      {panelState.open ? (
        <div
          className="min-h-0 flex-1 overflow-auto p-3"
          key={activityTimelineRenderKey}
        >
          <WorkbenchContextPanelActivityTab
            open={panelState.open}
            onActionExecuted={onActivityActionExecuted}
          />
        </div>
      ) : null}
    </aside>
  );
}

/** Context Panel shell region — Workbench Surface (AT-013). */
export const CONTEXT_PANEL_SURFACE = Object.freeze({
  id: "workbench-context-panel",
  label: "Context Panel",
  status: "implemented",
  consumes: "activity-timeline-experiences",
  description: "Right-side context panel with Activity timeline tab.",
} as const);
