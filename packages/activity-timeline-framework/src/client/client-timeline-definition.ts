import type { ActivityCategory } from "../types/activity-category";
import type {
  ActivityStability,
  ActivityVisibility,
} from "../types/activity-descriptor";
import type {
  TimelineDefinitionSource,
  TimelineDefinitionStatus,
} from "../types/timeline-definition";
import type { TimelineScopeId } from "../types/timeline-scope";

/** Hydrated timeline definition visible to browser consumers. */
export interface ClientTimelineDefinition {
  readonly timelineId: string;
  readonly scope: TimelineScopeId;
  readonly label: string;
  readonly grouping: string;
  readonly sortOrder?: string;
  readonly activityTypeFilter?: readonly string[];
  readonly activityCategoryFilter?: readonly ActivityCategory[];
  readonly version: string;
  readonly status: TimelineDefinitionStatus;
  readonly experienceRef?: string;
  readonly iconRef?: string;
  readonly source: TimelineDefinitionSource;
  readonly permissionKeys?: readonly string[];
  readonly visibility: ActivityVisibility;
  readonly stability: ActivityStability;
  readonly description?: string;
}

export function freezeClientTimelineDefinition(
  definition: ClientTimelineDefinition,
): ClientTimelineDefinition {
  return Object.freeze({
    ...definition,
    activityTypeFilter: definition.activityTypeFilter
      ? Object.freeze([...definition.activityTypeFilter])
      : undefined,
    activityCategoryFilter: definition.activityCategoryFilter
      ? Object.freeze([...definition.activityCategoryFilter])
      : undefined,
    permissionKeys: definition.permissionKeys
      ? Object.freeze([...definition.permissionKeys])
      : undefined,
  });
}
