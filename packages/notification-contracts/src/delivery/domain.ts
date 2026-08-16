/**
 * Notification Delivery domain models (ADR-0071 / ENG-004 Phase A).
 * Additive delivery plane — does not replace APZNOTIFY metadata SoR.
 */

import type {
  NotificationFailureClass,
  NotificationIntentStatus,
  NotificationDeliveryStatus,
  NotificationReceiptLevel,
} from "./lifecycle";
import type { NotificationChannelKind, NotificationPriority } from "../enums/catalogue";

export type NotificationIntentId = string & {
  readonly __brand: "NotificationIntentId";
};
export type NotificationDeliveryId = string & {
  readonly __brand: "NotificationDeliveryId";
};
export type NotificationDeliveryTryId = string & {
  readonly __brand: "NotificationDeliveryTryId";
};

export function asNotificationIntentId(value: string): NotificationIntentId {
  return value as NotificationIntentId;
}
export function asNotificationDeliveryId(value: string): NotificationDeliveryId {
  return value as NotificationDeliveryId;
}
export function asNotificationDeliveryTryId(value: string): NotificationDeliveryTryId {
  return value as NotificationDeliveryTryId;
}

export type NotificationSourceProduct =
  | "observe"
  | "support"
  | "platform"
  | "administration"
  | "time"
  | "projects"
  | "workflow"
  | "unknown";

export type NotificationIntent = {
  readonly id: NotificationIntentId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly sourceProduct: NotificationSourceProduct;
  readonly sourceEvent?: string;
  readonly category: string;
  readonly priority: NotificationPriority;
  readonly subject: string;
  readonly summary?: string;
  /** Safe structured payload — no secrets, no full source events. */
  readonly payload: Readonly<Record<string, unknown>>;
  readonly recipientHints: readonly NotificationRecipientHint[];
  readonly mandatory: boolean;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly requestedBy: string;
  readonly expiresAt?: string;
  readonly templateId?: string;
  readonly templateVersion?: number;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly status: NotificationIntentStatus;
  readonly suppressionReason?: string;
  readonly policyRef?: string;
  readonly updatedAt: string;
};

export type NotificationRecipientHint = {
  readonly userId?: string;
  readonly email?: string;
  readonly roleId?: string;
  readonly teamId?: string;
  readonly organisationId?: string;
  readonly operationalGroupId?: string;
};

export type ResolvedNotificationRecipient = {
  readonly userId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly recipientType: "user";
  readonly locale?: string;
  readonly resolutionSource: "identity" | "hint_user";
  readonly snapshotAt: string;
  /** Channel endpoints without secrets — in-app uses userId only. */
  readonly channelEndpoints: Readonly<Record<string, string>>;
};

export type NotificationDeliveryRecord = {
  readonly id: NotificationDeliveryId;
  readonly intentId: NotificationIntentId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly channel: "in_app" | "email";
  readonly providerId: "in_app" | "smtp";
  readonly status: NotificationDeliveryStatus;
  readonly receiptLevel: NotificationReceiptLevel;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly nextAttemptAt?: string;
  readonly lastFailureClass?: NotificationFailureClass;
  readonly lastFailureCode?: string;
  readonly inAppNotificationId?: string;
  readonly terminalAt?: string;
  readonly deadLetter: boolean;
  /** ADR-0073 / ENG-001B-P0 — optional lease fencing (null until durable claim phases). */
  readonly claimedBy?: string;
  readonly claimedAt?: string;
  readonly leaseExpiresAt?: string;
  readonly requeueReason?: string;
  /** Manual replay lineage (new delivery row); unused until admin phases. */
  readonly replayOfDeliveryId?: NotificationDeliveryId;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationDeliveryTry = {
  readonly id: NotificationDeliveryTryId;
  readonly deliveryId: NotificationDeliveryId;
  readonly attemptNumber: number;
  readonly providerId: "in_app" | "smtp";
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly receiptLevel: NotificationReceiptLevel;
  readonly failureClass?: NotificationFailureClass;
  readonly failureCode?: string;
  readonly note?: string;
  /** ADR-0073 / ENG-001B-P0 — optional provider / worker attribution. */
  readonly providerReference?: string;
  readonly workerId?: string;
};

/** Lease field snapshot for future claim/reclaim phases (compile-safe). */
export type NotificationDeliveryLeaseFields = {
  readonly claimedBy?: string;
  readonly claimedAt?: string;
  readonly leaseExpiresAt?: string;
  readonly requeueReason?: string;
};

/** Compile-safe durable runtime mode descriptor — no behaviour in Phase 0. */
export type NotificationDurableRuntimeMode = "process_local" | "postgresql_durable";

export type NotificationDeliveryPreferenceDecision = {
  readonly category: string;
  readonly channel: NotificationChannelKind;
  readonly enabled: boolean;
  readonly mandatoryOverride: boolean;
  readonly quietHoursActive: boolean;
  readonly source:
    "platform_default" | "tenant_default" | "user_preference" | "mandatory_override";
};

export type NotificationDeliveryPolicyDecision = {
  readonly permitted: boolean;
  readonly mandatory: boolean;
  readonly category: string;
  readonly priority: NotificationPriority;
  readonly permittedChannels: readonly NotificationChannelKind[];
  readonly channelOrder: readonly NotificationChannelKind[];
  readonly maxAttempts: number;
  readonly retryBaseDelayMs: number;
  readonly policyRef: string;
  readonly failClosedReason?: string;
};

export type NotificationProviderDescriptor = {
  readonly providerId: "in_app" | "smtp";
  readonly channel: "in_app" | "email";
  readonly displayName: string;
  readonly enabled: boolean;
  readonly health: "healthy" | "degraded" | "unhealthy" | "disabled";
  readonly capabilities: readonly string[];
};

export type CreateNotificationIntentCommand = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly sourceProduct: NotificationSourceProduct;
  readonly sourceEvent?: string;
  readonly category: string;
  readonly priority?: NotificationPriority;
  readonly subject: string;
  readonly summary?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly recipientHints: readonly NotificationRecipientHint[];
  readonly mandatory?: boolean;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly requestedBy: string;
  readonly expiresAt?: string;
  readonly templateId?: string;
  readonly templateVersion?: number;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type NotificationInAppItem = {
  readonly id: string;
  readonly deliveryId: NotificationDeliveryId;
  readonly intentId: NotificationIntentId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly category: string;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly summary?: string;
  readonly body?: string;
  readonly sourceProduct: NotificationSourceProduct;
  readonly sourceObjectRef?: string;
  readonly readAt?: string;
  readonly createdAt: string;
  readonly expiresAt?: string;
};
