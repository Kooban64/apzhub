import type { EventRegistryDiagnostics } from "../types/diagnostics";
import type { EventBatchRegistrationResult } from "./event-batch-registration";
import type { EventMetadata, EventRegistryMetadata } from "./event-metadata";
import type { EventCategory } from "../types/event-category";

export type EventDescriptorStatus = "active" | "planned" | "deprecated";

export type EventDescriptorSource = "builtin" | "manifest";

export type EventVisibility = "public" | "internal" | "restricted";

export type EventStability = "stable" | "experimental" | "deprecated";

/** Registered event definition stored in EventRegistry — metadata only, not a publish instance. */
export interface EventDescriptor {
  readonly eventId: string;
  readonly version: string;
  readonly category: EventCategory;
  readonly publisher: string;
  readonly label?: string;
  readonly sourceCapability?: string;
  readonly schemaVersion?: string;
  readonly visibility?: EventVisibility;
  readonly stability?: EventStability;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly subscribers?: readonly string[];
  readonly status?: EventDescriptorStatus;
  readonly permission?: string;
  /** Registration origin — platform catalogue or capability manifest. */
  readonly source?: EventDescriptorSource;
}

export type EventRegistryFactory = () => EventRegistry;

/**
 * In-memory event definition registry.
 * Registration and validation only — no publish, subscribe, persistence, or handlers.
 */
export interface EventRegistry {
  register(descriptor: EventDescriptor): void;
  registerMany(descriptors: readonly EventDescriptor[]): void;
  registerManyAtomic(
    descriptors: readonly EventDescriptor[],
  ): EventBatchRegistrationResult;
  replace(descriptor: EventDescriptor): void;
  has(eventId: string): boolean;
  get(eventId: string): EventDescriptor | undefined;
  getMetadata(eventId: string): EventMetadata | undefined;
  list(): readonly EventDescriptor[];
  listMetadata(): readonly EventMetadata[];
  getRegistryMetadata(): EventRegistryMetadata;
  getDiagnostics(): EventRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  recordFrameworkVersion(version: string): void;
  clear(): void;
}

export type {
  EventEntryDiagnostics,
  EventMetadata,
  EventRegistryMetadata,
  EventRegistrationIssue,
  EventRegistrationIssueCode,
} from "./event-metadata";

export type { EventBatchRegistrationResult } from "./event-batch-registration";
