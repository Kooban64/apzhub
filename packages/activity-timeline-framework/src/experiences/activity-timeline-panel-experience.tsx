"use client";

import { DEFAULT_TIMELINE_SCOPE_ID } from "../constants";
import { ActivityTimelineExperienceView } from "./activity-timeline-experience-view";
import { useActivityTimelineExperienceDiagnostics } from "./use-activity-timeline-experience-diagnostics";
import type { ActivityTimelinePanelExperienceProps } from "./types";

/**
 * Panel Timeline Experience — chrome wrapper for contextual activity surfaces.
 */
export function ActivityTimelinePanelExperience({
  open = true,
  surface = "activity-timeline-panel",
  timelineScope = DEFAULT_TIMELINE_SCOPE_ID,
  limit = 50,
  now,
  locale,
  emptyState,
  onActionExecuted,
}: ActivityTimelinePanelExperienceProps) {
  const state = useActivityTimelineExperienceDiagnostics({
    surface,
    timelineScope,
    limit,
    now,
    locale,
    grouping: "date",
  });

  if (!open) {
    return null;
  }

  return (
    <section
      role="region"
      aria-label="Activity panel"
      data-testid="activity-timeline-panel-experience"
      className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <header className="border-b border-[var(--color-border)] px-3 py-2">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          Activity
        </h2>
      </header>
      <ActivityTimelineExperienceView
        state={state}
        emptyState={emptyState}
        onActionExecuted={onActionExecuted}
        testId="activity-timeline-panel-content"
      />
    </section>
  );
}
