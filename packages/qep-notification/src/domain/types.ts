/**
 * Notification & Subscription Platform domain — APZQEP-120-S12.
 * Consumers subscribe to Domain Events or QKI projections.
 * MUST NOT invoke business services.
 */

import type { NotificationClassification } from "./classification";
import type { NotificationAudience } from "./classification";

export type SubscriptionScopeKind = NotificationAudience;

export type SubscriptionScope = {
  readonly kind: SubscriptionScopeKind;
  /** Subject id for user/role/team/project; omit for tenant/global where applicable. */
  readonly subjectId?: string;
  readonly tenantId?: string;
  readonly projectId?: string;
};

export type SubscriptionDefinition = {
  readonly subscriptionId: string;
  readonly name: string;
  /** Domain event types or projection event types this subscription matches. */
  readonly eventTypes: readonly string[];
  readonly scope: SubscriptionScope;
  readonly channels: readonly string[];
  readonly templateId: string;
  readonly enabled: boolean;
  readonly classificationDefaults: Omit<
    NotificationClassification,
    "correlationId" | "expiry"
  > & { readonly expiry?: string };
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type NotificationPreference = {
  readonly preferenceId: string;
  readonly tenantId: string;
  readonly subjectKind: "user" | "role" | "team" | "tenant";
  readonly subjectId: string;
  /** Channels the subject allows. Empty = inherit all. */
  readonly allowedChannels: readonly string[];
  /** Categories the subject suppresses. */
  readonly mutedCategories: readonly string[];
  /** Minimum severity to deliver (inclusive). */
  readonly minSeverity?: NotificationClassification["severity"];
  readonly enabled: boolean;
};

export type RenderedNotification = {
  readonly title: string;
  readonly body: string;
  readonly locale: string;
};

export type NotificationRecord = {
  readonly notificationId: string;
  readonly tenantId: string;
  readonly subscriptionId: string;
  readonly templateId: string;
  readonly eventType: string;
  readonly sourceEventId?: string;
  readonly recipient: SubscriptionScope;
  readonly channelId: string;
  readonly classification: NotificationClassification;
  readonly rendered: RenderedNotification;
  readonly createdAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export const DELIVERY_STATUSES = [
  "pending",
  "routed",
  "delivering",
  "delivered",
  "acknowledged",
  "failed",
  "retrying",
  "dead_letter",
  "expired",
  "suppressed",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export type DeliveryFailureClass =
  "transient" | "permanent" | "policy" | "expired" | "unknown";

export type DeliveryRecord = {
  readonly deliveryId: string;
  readonly notificationId: string;
  readonly tenantId: string;
  readonly channelId: string;
  readonly status: DeliveryStatus;
  readonly attempt: number;
  readonly failureClass?: DeliveryFailureClass;
  readonly lastError?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deliveredAt?: string;
  readonly acknowledgedAt?: string;
  readonly correlationId: string;
};

export type NotificationAuditEntry = {
  readonly auditId: string;
  readonly notificationId: string;
  readonly deliveryId?: string;
  readonly action: string;
  readonly detail: string;
  readonly at: string;
  readonly correlationId: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type InternalInboxMessage = {
  readonly messageId: string;
  readonly tenantId: string;
  readonly recipientSubjectId: string;
  readonly notificationId: string;
  readonly title: string;
  readonly body: string;
  readonly classification: NotificationClassification;
  readonly createdAt: string;
  readonly read: boolean;
};
