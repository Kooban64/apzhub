"use client";

import { WorkbenchActivityTimeline } from "@apzhub/activity-timeline-framework/react";

export interface WorkbenchContextPanelActivityTabProps {
  readonly open?: boolean;
  readonly onActionExecuted?: (actionId: string) => void;
}

/**
 * Context Panel Activity tab — consumes WorkbenchActivityTimeline panel variant only.
 */
export function WorkbenchContextPanelActivityTab({
  open = true,
  onActionExecuted,
}: WorkbenchContextPanelActivityTabProps) {
  return (
    <WorkbenchActivityTimeline
      variant="panel"
      panelOpen={open}
      onActionExecuted={onActionExecuted}
    />
  );
}

/** Context Panel Activity tab — Workbench Surface (AT-013). */
export const CONTEXT_PANEL_ACTIVITY_SURFACE = Object.freeze({
  id: "context-panel-activity",
  label: "Context Panel Activity",
  status: "implemented",
  consumes: "activity-timeline-experiences",
  description: "Personal timeline tab in the Workbench Context Panel.",
} as const);
