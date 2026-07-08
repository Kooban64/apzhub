import type { ActivityTimelineFrameworkStatus } from "../../status";
import type { ActivityServiceDiagnostics } from "../../types/activity-diagnostics";
import type { ActivityTimelineHydrationDiagnostics } from "../activity-timeline-hydration-diagnostics";
import type { ClientActivityRegistryDiagnostics } from "../client-activity-registry-diagnostics";
import type { ClientTimelineRegistryDiagnostics } from "../client-timeline-registry-diagnostics";

export type ActivityTimelineServiceStatus = "ready" | "empty" | "unavailable";

/** Public client service observability — stable health and runtime fields (AT-010). */
export interface ActivityTimelineServiceDiagnostics {
  readonly frameworkStatus: ActivityTimelineFrameworkStatus;
  readonly serviceStatus: ActivityTimelineServiceStatus;
  readonly registryStatus?: ClientActivityRegistryDiagnostics["status"];
  readonly timelineRegistryStatus?: ClientTimelineRegistryDiagnostics["status"];
  readonly registryReady: boolean;
  readonly hydrationStatus?: ActivityTimelineHydrationDiagnostics["hydrationStatus"];
  readonly activityCount: number;
  readonly timelineDefinitionCount: number;
  readonly activityService: ActivityServiceDiagnostics;
  readonly message: string;
}
