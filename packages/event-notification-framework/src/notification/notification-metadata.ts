import type {
  DeliveryChannel,
  NotificationKind,
  NotificationPriority,
} from "../types/notification-kind";
import type {
  NotificationDescriptorSource,
  NotificationRouteStatus,
  NotificationStability,
  NotificationVisibility,
} from "./notification-descriptor";

export type NotificationRegistrationIssueCode = "VALIDATION" | "DUPLICATE_ID";

export interface NotificationRegistrationIssue {
  readonly code: NotificationRegistrationIssueCode;
  readonly routeId?: string;
  readonly message: string;
  readonly field?: string;
}

/** Per-route registry metadata including derived diagnostics. */
export interface NotificationEntryDiagnostics {
  readonly validationIssueCount: number;
  readonly message?: string;
}

export interface NotificationMetadata {
  readonly routeId: string;
  readonly notificationKind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly source: NotificationDescriptorSource;
  readonly version: string;
  readonly schemaVersion: string;
  readonly visibility: NotificationVisibility;
  readonly stability: NotificationStability;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly eventPattern: string;
  readonly templateRef: string;
  readonly status: NotificationRouteStatus;
  readonly label?: string;
  readonly permission?: string;
  readonly priority?: NotificationPriority;
  readonly sourceCapability?: string;
  readonly diagnostics: NotificationEntryDiagnostics;
}

export interface NotificationRegistryMetadata {
  readonly manifestCapabilityCount: number;
  readonly frameworkVersion?: string;
  readonly routeMetadata: readonly NotificationMetadata[];
}
