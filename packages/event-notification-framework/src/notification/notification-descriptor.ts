import type { NotificationRegistryDiagnostics } from "../types/diagnostics";
import type { NotificationBatchRegistrationResult } from "./notification-batch-registration";
import type {
  NotificationMetadata,
  NotificationRegistryMetadata,
} from "./notification-metadata";
import type {
  DeliveryChannel,
  NotificationKind,
  NotificationPriority,
} from "../types/notification-kind";

export type NotificationRouteStatus = "active" | "planned" | "disabled";

export type NotificationVisibility = "public" | "internal" | "restricted";

export type NotificationStability = "stable" | "experimental" | "deprecated";

export type NotificationDescriptorSource = "builtin" | "manifest";

/** Notification route definition stored in NotificationRegistry — metadata only. */
export interface NotificationDescriptor {
  readonly routeId: string;
  readonly eventPattern: string;
  readonly notificationKind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly templateRef: string;
  readonly version: string;
  readonly priority?: NotificationPriority;
  readonly permission?: string;
  readonly status?: NotificationRouteStatus;
  readonly label?: string;
  readonly sourceCapability?: string;
  readonly schemaVersion?: string;
  readonly visibility?: NotificationVisibility;
  readonly stability?: NotificationStability;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly source?: NotificationDescriptorSource;
  readonly titleTemplate?: string;
  readonly bodyTemplate?: string;
}

export type NotificationRegistryFactory = () => NotificationRegistry;

/**
 * In-memory notification route registry.
 * Registration and validation only — no delivery, mappers, Event Bus, or persistence.
 */
export interface NotificationRegistry {
  register(descriptor: NotificationDescriptor): void;
  registerMany(descriptors: readonly NotificationDescriptor[]): void;
  registerManyAtomic(
    descriptors: readonly NotificationDescriptor[],
  ): NotificationBatchRegistrationResult;
  replace(descriptor: NotificationDescriptor): void;
  has(routeId: string): boolean;
  get(routeId: string): NotificationDescriptor | undefined;
  getMetadata(routeId: string): NotificationMetadata | undefined;
  list(): readonly NotificationDescriptor[];
  listMetadata(): readonly NotificationMetadata[];
  getRegistryMetadata(): NotificationRegistryMetadata;
  getDiagnostics(): NotificationRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  recordFrameworkVersion(version: string): void;
  clear(): void;
}

export type {
  NotificationEntryDiagnostics,
  NotificationMetadata,
  NotificationRegistryMetadata,
  NotificationRegistrationIssue,
  NotificationRegistrationIssueCode,
} from "./notification-metadata";

export type { NotificationBatchRegistrationResult } from "./notification-batch-registration";

export type { NotificationItem, NotificationActionRef } from "./notification-item";
