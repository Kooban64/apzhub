import type { ActivityCategory } from "../types/activity-category";
import type {
  ActivityDescriptorSource,
  ActivityDescriptorStatus,
  ActivitySeverity,
  ActivityStability,
  ActivityVisibility,
} from "../types/activity-descriptor";
import type { TimelineScopeId } from "../types/timeline-scope";

/** Hydrated activity type visible to browser consumers. */
export interface ClientActivityType {
  readonly activityTypeId: string;
  readonly sourceEventPattern: string;
  readonly category: ActivityCategory;
  readonly timelineScopes: readonly TimelineScopeId[];
  readonly templateRef: string;
  readonly version: string;
  readonly schemaVersion: string;
  readonly severity?: ActivitySeverity;
  readonly iconRef?: string;
  readonly permissionKeys?: readonly string[];
  readonly visibility: ActivityVisibility;
  readonly stability: ActivityStability;
  readonly status: ActivityDescriptorStatus;
  readonly source: ActivityDescriptorSource;
  readonly label?: string;
  readonly description?: string;
  readonly tags: readonly string[];
}

export function freezeClientActivityType(type: ClientActivityType): ClientActivityType {
  return Object.freeze({
    ...type,
    timelineScopes: Object.freeze([...type.timelineScopes]),
    permissionKeys: type.permissionKeys
      ? Object.freeze([...type.permissionKeys])
      : undefined,
    tags: Object.freeze([...type.tags]),
  });
}
