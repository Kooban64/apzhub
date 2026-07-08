import type { ActivityCategory } from "./activity-category";
import type { ActivityStability, ActivityVisibility } from "./activity-descriptor";
import type { TimelineScopeId } from "./timeline-scope";

export type TimelineDefinitionSource = "builtin" | "manifest";

export type TimelineDefinitionStatus = "active" | "planned" | "inactive";

/**
 * Timeline definition — metadata describing a timeline scope, behaviour, and presentation.
 * Does not store activities or timeline history.
 */
export interface TimelineDefinition {
  readonly timelineId: string;
  readonly label: string;
  readonly description?: string;
  readonly scope: TimelineScopeId;
  readonly icon?: string;
  readonly order: number;
  readonly version: string;
  readonly visibility?: ActivityVisibility;
  readonly stability?: ActivityStability;
  readonly source?: TimelineDefinitionSource;
  readonly supportedActivityCategories?: readonly ActivityCategory[];
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly status?: TimelineDefinitionStatus;
}
