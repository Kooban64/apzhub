"use client";

import { DEFAULT_TIMELINE_SCOPE_ID } from "../constants";
import { ActivityTimelineExperienceView } from "./activity-timeline-experience-view";
import { useActivityTimelineExperienceDiagnostics } from "./use-activity-timeline-experience-diagnostics";
import type { ActivityTimelineExperienceProps } from "./types";

/**
 * Primary Timeline Experience — renders date-grouped activity view models.
 * Consumes presentation layer via {@link useActivityTimelineExperienceDiagnostics} only.
 */
export function ActivityTimelineExperience({
  surface = "activity-timeline",
  timelineScope = DEFAULT_TIMELINE_SCOPE_ID,
  limit = 50,
  now,
  locale,
  emptyState,
  onActionExecuted,
}: ActivityTimelineExperienceProps) {
  const state = useActivityTimelineExperienceDiagnostics({
    surface,
    timelineScope,
    limit,
    now,
    locale,
    grouping: "date",
  });

  return (
    <section role="region" aria-label="Activity timeline">
      <ActivityTimelineExperienceView
        state={state}
        emptyState={emptyState}
        onActionExecuted={onActionExecuted}
      />
    </section>
  );
}
