import type { ActivityDescriptor } from "../types/activity-descriptor";
import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import type { TimelineDefinition } from "../types/timeline-definition";
import type { TimelineRegistrationIssue } from "../types/timeline-metadata";

/** Minimal capability record for manifest extraction — avoids Runtime coupling. */
export interface ActivityCapabilityRecord {
  readonly id: string;
  readonly kind: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
  readonly version?: string;
}

export interface ActivityExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly extractedCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutActivities: number;
  readonly capabilityIds: readonly string[];
}

export interface ActivityExtractionResult {
  readonly ok: boolean;
  readonly descriptors: readonly ActivityDescriptor[];
  readonly diagnostics: ActivityExtractionDiagnostics;
  readonly errors: readonly ActivityRegistrationIssue[];
}

export interface ManifestActivityRegistryPopulationResult {
  readonly ok: boolean;
  readonly extractionOk: boolean;
  readonly extractedCount: number;
  readonly scannedCapabilities: number;
  readonly registeredCount: number;
  readonly errors: readonly ActivityRegistrationIssue[];
}

export interface TimelineExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly extractedCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutTimelines: number;
  readonly capabilityIds: readonly string[];
}

export interface TimelineExtractionResult {
  readonly ok: boolean;
  readonly definitions: readonly TimelineDefinition[];
  readonly diagnostics: TimelineExtractionDiagnostics;
  readonly errors: readonly TimelineRegistrationIssue[];
}

export interface ManifestTimelineRegistryPopulationResult {
  readonly ok: boolean;
  readonly extractionOk: boolean;
  readonly extractedCount: number;
  readonly scannedCapabilities: number;
  readonly registeredCount: number;
  readonly errors: readonly TimelineRegistrationIssue[];
}
