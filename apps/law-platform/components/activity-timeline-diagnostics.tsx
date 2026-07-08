"use client";

import {
  useActivityTimelineContext,
  useActivityService,
} from "@apzhub/activity-timeline-framework/react";
import type {
  ActivityRegistryHydrationDiagnostics,
  TimelineRegistryHydrationDiagnostics,
} from "@apzhub/activity-timeline-framework/server";

export interface ActivityTimelineDiagnosticsProps {
  readonly activityDiagnostics: ActivityRegistryHydrationDiagnostics;
  readonly timelineDiagnostics: TimelineRegistryHydrationDiagnostics;
}

/** Developer diagnostics for Activity & Timeline Framework integration (AT-013). */
export function ActivityTimelineDiagnostics({
  activityDiagnostics,
  timelineDiagnostics,
}: ActivityTimelineDiagnosticsProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const clientContext = useActivityTimelineContext();
  const { diagnostics: serviceDiagnostics } = useActivityService();

  return (
    <aside
      hidden
      data-testid="activity-timeline-diagnostics"
      data-activity-registered-count={activityDiagnostics.registeredCount}
      data-activity-filtered-count={activityDiagnostics.filteredCount}
      data-timeline-registered-count={timelineDiagnostics.registeredCount}
      data-timeline-filtered-count={timelineDiagnostics.filteredCount}
      data-activity-registry-status={clientContext.activityRegistryDiagnostics.status}
      data-timeline-registry-status={clientContext.timelineRegistryDiagnostics.status}
      data-hydration-status={clientContext.diagnostics.hydrationStatus}
      data-service-status={serviceDiagnostics.serviceStatus}
      data-service-stored-count={serviceDiagnostics.activityCount}
    />
  );
}
