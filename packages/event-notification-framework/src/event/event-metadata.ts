import type { EventCategory } from "../types/event-category";
import type {
  EventDescriptorStatus,
  EventDescriptorSource,
  EventStability,
  EventVisibility,
} from "./event-descriptor";

export type EventRegistrationIssueCode = "VALIDATION" | "DUPLICATE_ID";

export interface EventRegistrationIssue {
  readonly code: EventRegistrationIssueCode;
  readonly eventId?: string;
  readonly message: string;
  readonly field?: string;
}

/** Per-event registry metadata including derived diagnostics. */
export interface EventEntryDiagnostics {
  readonly validationIssueCount: number;
  readonly subscriberCount: number;
  readonly message?: string;
}

export interface EventMetadata {
  readonly eventId: string;
  readonly category: EventCategory;
  readonly version: string;
  readonly sourceCapability: string;
  readonly schemaVersion: string;
  readonly visibility: EventVisibility;
  readonly stability: EventStability;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly status: EventDescriptorStatus;
  readonly label?: string;
  readonly permission?: string;
  readonly subscribers: readonly string[];
  readonly source: EventDescriptorSource;
  readonly diagnostics: EventEntryDiagnostics;
}

export interface EventRegistryMetadata {
  readonly manifestCapabilityCount: number;
  readonly frameworkVersion?: string;
  readonly eventMetadata: readonly EventMetadata[];
}
