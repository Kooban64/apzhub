import type { EventRegistrationIssue } from "../event/event-metadata";
import type { EventDescriptor } from "../event/event-descriptor";

/** Minimal capability record for manifest extraction — avoids Runtime coupling. */
export interface EventCapabilityRecord {
  readonly id: string;
  readonly kind: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
  /** Capability manifest version — stamped on extracted events when present. */
  readonly version?: string;
}

export interface EventExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly extractedCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutEvents: number;
  readonly capabilityIds: readonly string[];
}

export interface EventExtractionResult {
  readonly ok: boolean;
  readonly descriptors: readonly EventDescriptor[];
  readonly diagnostics: EventExtractionDiagnostics;
  readonly errors: readonly EventRegistrationIssue[];
}

export interface ManifestEventRegistryPopulationResult {
  readonly ok: boolean;
  readonly extractionOk: boolean;
  readonly extractedCount: number;
  readonly scannedCapabilities: number;
  readonly registeredCount: number;
  readonly errors: readonly EventRegistrationIssue[];
}

export interface NotificationExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly extractedCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutNotifications: number;
  readonly capabilityIds: readonly string[];
}

export interface NotificationExtractionResult {
  readonly ok: boolean;
  readonly descriptors: readonly import("../notification/notification-descriptor").NotificationDescriptor[];
  readonly diagnostics: NotificationExtractionDiagnostics;
  readonly errors: readonly import("../notification/notification-metadata").NotificationRegistrationIssue[];
}

export interface ManifestNotificationRegistryPopulationResult {
  readonly ok: boolean;
  readonly extractionOk: boolean;
  readonly extractedCount: number;
  readonly scannedCapabilities: number;
  readonly registeredCount: number;
  readonly errors: readonly import("../notification/notification-metadata").NotificationRegistrationIssue[];
}
