import type { ActivityCategory } from "../types/activity-category";
import type { TimelineScopeId } from "../types/timeline-scope";
import {
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_SYSTEM,
} from "../types/timeline-scope";

/** Declarative metadata for a built-in platform activity type (pre-registration). */
export interface PlatformActivityCatalogueEntry {
  readonly activityTypeId: string;
  readonly version: string;
  readonly sourceEventPattern: string;
  readonly category: ActivityCategory;
  readonly timelineScopes: readonly TimelineScopeId[];
  readonly templateRef: string;
  readonly label: string;
  readonly description: string;
  readonly status?: "active" | "planned" | "disabled";
}

/**
 * Foundational Platform Activity Type Catalogue — registered at bootstrap without manifest files.
 *
 * Definitions only — no mapping, Event Bus subscription, or ActivityDocument generation.
 */
export const PLATFORM_ACTIVITY_CATALOGUE = Object.freeze([
  {
    activityTypeId: "platform.lifecycle.started",
    version: "1.0.0",
    sourceEventPattern: "platform.lifecycle.started",
    category: "system",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL, TIMELINE_SCOPE_SYSTEM],
    templateRef: "activity.platform.lifecycle.started",
    label: "Platform lifecycle started",
    description: "Platform runtime lifecycle started",
    status: "active",
  },
  {
    activityTypeId: "platform.action.executed",
    version: "1.0.0",
    sourceEventPattern: "capability.action.executed",
    category: "capability",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL, TIMELINE_SCOPE_ORGANIZATION],
    templateRef: "activity.platform.action.executed",
    label: "Action executed",
    description: "Platform action executed via Action Framework audit hook",
    status: "active",
  },
  {
    activityTypeId: "platform.knowledge.query.completed",
    version: "1.0.0",
    sourceEventPattern: "capability.knowledge.query.completed",
    category: "capability",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL],
    templateRef: "activity.platform.knowledge.query.completed",
    label: "Knowledge query completed",
    description: "Knowledge & Discovery query completed",
    status: "active",
  },
  {
    activityTypeId: "platform.notification.generated",
    version: "1.0.0",
    sourceEventPattern: "capability.notification.generated",
    category: "system",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL],
    templateRef: "activity.platform.notification.generated",
    label: "Notification generated",
    description: "Notification artefact generated from platform event",
    status: "active",
  },
] satisfies readonly PlatformActivityCatalogueEntry[]);
