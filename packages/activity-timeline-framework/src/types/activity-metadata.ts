import type { ActivityCategory } from "./activity-category";
import type {
  ActivityDescriptorSource,
  ActivityDescriptorStatus,
  ActivityStability,
  ActivityVisibility,
} from "./activity-descriptor";
import type { TimelineScopeId } from "./timeline-scope";

export type ActivityRegistrationIssueCode = "VALIDATION" | "DUPLICATE_ID";

export interface ActivityRegistrationIssue {
  readonly code: ActivityRegistrationIssueCode;
  readonly activityTypeId?: string;
  readonly message: string;
  readonly field?: string;
}

/** Per-activity-type registry metadata including derived diagnostics. */
export interface ActivityEntryDiagnostics {
  readonly validationIssueCount: number;
  readonly timelineScopeCount: number;
  readonly message?: string;
}

export interface ActivityMetadata {
  readonly activityTypeId: string;
  readonly version: string;
  readonly category: ActivityCategory;
  readonly sourceEventPattern: string;
  readonly timelineScopes: readonly TimelineScopeId[];
  readonly templateRef: string;
  readonly sourceCapability?: string;
  readonly schemaVersion: string;
  readonly visibility: ActivityVisibility;
  readonly stability: ActivityStability;
  readonly status: ActivityDescriptorStatus;
  readonly source: ActivityDescriptorSource;
  readonly label?: string;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly diagnostics: ActivityEntryDiagnostics;
}

export interface ActivityRegistryMetadata {
  readonly manifestCapabilityCount: number;
  readonly frameworkVersion?: string;
  readonly platformCatalogueVersion?: string;
  readonly activityMetadata: readonly ActivityMetadata[];
}
