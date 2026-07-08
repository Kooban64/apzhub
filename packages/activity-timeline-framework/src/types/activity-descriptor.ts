import type { ActivityCategory } from "./activity-category";
import type { TimelineScopeId } from "./timeline-scope";

export type ActivityDescriptorStatus = "active" | "planned" | "disabled";

export type ActivityDescriptorSource = "builtin" | "manifest";

export type ActivityVisibility = "public" | "internal" | "restricted";

export type ActivityStability = "stable" | "experimental" | "deprecated";

export type ActivitySeverity = "info" | "success" | "warning" | "error";

export type ActivityRetentionHint = "session" | "short" | "standard" | "extended";

/** Immutable activity type descriptor — frozen on registration. */
export interface ActivityDescriptor {
  readonly activityTypeId: string;
  readonly version: string;
  readonly category: ActivityCategory;
  readonly sourceEventPattern: string;
  readonly timelineScopes: readonly TimelineScopeId[];
  readonly templateRef: string;
  readonly severity?: ActivitySeverity;
  readonly iconRef?: string;
  readonly permissionKeys?: readonly string[];
  readonly retentionHint?: ActivityRetentionHint;
  readonly status?: ActivityDescriptorStatus;
  readonly label?: string;
  readonly sourceCapability?: string;
  readonly schemaVersion?: string;
  readonly visibility?: ActivityVisibility;
  readonly stability?: ActivityStability;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly source?: ActivityDescriptorSource;
}
