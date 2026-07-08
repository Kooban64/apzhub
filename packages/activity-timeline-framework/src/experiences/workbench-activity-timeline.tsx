"use client";

import { ActivityTimelineExperience } from "./activity-timeline-experience";
import { ActivityTimelinePanelExperience } from "./activity-timeline-panel-experience";
import type { WorkbenchActivityTimelineProps } from "./types";

/**
 * Workbench composer for Timeline Experiences — inline or panel variant.
 * No DesktopShell wiring — experiences only.
 */
export function WorkbenchActivityTimeline({
  variant = "inline",
  panelOpen = true,
  ...props
}: WorkbenchActivityTimelineProps) {
  if (variant === "panel") {
    return (
      <ActivityTimelinePanelExperience
        {...props}
        open={panelOpen}
        surface="workbench-activity-timeline"
      />
    );
  }

  return (
    <ActivityTimelineExperience {...props} surface="workbench-activity-timeline" />
  );
}
