import type { ActivityStability, ActivityVisibility } from "./activity-descriptor";
import type {
  TimelineDefinitionSource,
  TimelineDefinitionStatus,
} from "./timeline-definition";
import type { TimelineScopeId } from "./timeline-scope";

export type TimelineRegistrationIssueCode = "VALIDATION" | "DUPLICATE_ID";

export interface TimelineRegistrationIssue {
  readonly code: TimelineRegistrationIssueCode;
  readonly timelineId?: string;
  readonly message: string;
  readonly field?: string;
}

/** Per-timeline registry metadata including derived diagnostics. */
export interface TimelineEntryDiagnostics {
  readonly validationIssueCount: number;
  readonly supportedCategoryCount: number;
  readonly message?: string;
}

export interface TimelineMetadata {
  readonly timelineId: string;
  readonly scope: TimelineScopeId;
  readonly label: string;
  readonly version: string;
  readonly visibility: ActivityVisibility;
  readonly stability: ActivityStability;
  readonly status: TimelineDefinitionStatus;
  readonly source: TimelineDefinitionSource;
  readonly order: number;
  readonly description?: string;
  readonly icon?: string;
  readonly supportedActivityCategories: readonly string[];
  readonly diagnostics: TimelineEntryDiagnostics;
}

export interface TimelineRegistryMetadata {
  readonly manifestCapabilityCount: number;
  readonly frameworkVersion?: string;
  readonly platformCatalogueVersion?: string;
  readonly timelineMetadata: readonly TimelineMetadata[];
}
