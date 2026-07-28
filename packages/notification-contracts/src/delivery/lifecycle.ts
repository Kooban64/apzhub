/**
 * Canonical Notification Delivery lifecycle (ADR-0071 / ENG-004 Phase A).
 */

export const NOTIFICATION_INTENT_STATUSES = [
  "requested",
  "validated",
  "suppressed",
  "queued",
  "processing",
  "delivered",
  "retry_scheduled",
  "permanent_failure",
  "cancelled",
  "expired",
  "partially_delivered",
] as const;

export type NotificationIntentStatus = (typeof NOTIFICATION_INTENT_STATUSES)[number];

export function isNotificationIntentStatus(
  value: string,
): value is NotificationIntentStatus {
  return (NOTIFICATION_INTENT_STATUSES as readonly string[]).includes(value);
}

/** Legal transitions for intent / multi-recipient aggregate status. */
export const NOTIFICATION_INTENT_TRANSITIONS: Readonly<
  Record<NotificationIntentStatus, readonly NotificationIntentStatus[]>
> = {
  requested: ["validated", "suppressed", "cancelled", "expired"],
  validated: ["queued", "suppressed", "cancelled", "expired"],
  suppressed: [],
  queued: ["processing", "cancelled", "expired"],
  processing: [
    "delivered",
    "partially_delivered",
    "retry_scheduled",
    "permanent_failure",
    "cancelled",
    "expired",
  ],
  delivered: [],
  retry_scheduled: [
    "queued",
    "processing",
    "cancelled",
    "expired",
    "permanent_failure",
  ],
  permanent_failure: [],
  cancelled: [],
  expired: [],
  partially_delivered: [
    "delivered",
    "retry_scheduled",
    "permanent_failure",
    "cancelled",
    "expired",
  ],
};

export function assertNotificationIntentTransition(
  from: NotificationIntentStatus,
  to: NotificationIntentStatus,
): void {
  if (from === to) return;
  const allowed = NOTIFICATION_INTENT_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(`Illegal notification intent transition: ${from} → ${to}`);
  }
}

export const NOTIFICATION_DELIVERY_STATUSES = [
  "requested",
  "queued",
  "processing",
  "delivered",
  "retry_scheduled",
  "permanent_failure",
  "cancelled",
  "expired",
  "suppressed",
] as const;

export type NotificationDeliveryStatus =
  (typeof NOTIFICATION_DELIVERY_STATUSES)[number];

export function isNotificationDeliveryStatus(
  value: string,
): value is NotificationDeliveryStatus {
  return (NOTIFICATION_DELIVERY_STATUSES as readonly string[]).includes(value);
}

export const NOTIFICATION_DELIVERY_TRANSITIONS: Readonly<
  Record<NotificationDeliveryStatus, readonly NotificationDeliveryStatus[]>
> = {
  requested: ["queued", "suppressed", "cancelled", "expired"],
  queued: ["processing", "cancelled", "expired"],
  processing: [
    "delivered",
    "retry_scheduled",
    "permanent_failure",
    "cancelled",
    "expired",
  ],
  delivered: [],
  retry_scheduled: [
    "queued",
    "processing",
    "cancelled",
    "expired",
    "permanent_failure",
  ],
  permanent_failure: [],
  cancelled: [],
  expired: [],
  suppressed: [],
};

export function assertNotificationDeliveryTransition(
  from: NotificationDeliveryStatus,
  to: NotificationDeliveryStatus,
): void {
  if (from === to) return;
  const allowed = NOTIFICATION_DELIVERY_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(`Illegal notification delivery transition: ${from} → ${to}`);
  }
}

export const NOTIFICATION_RECEIPT_LEVELS = [
  "requested",
  "accepted_by_adapter",
  "accepted_by_provider",
  "queued_by_provider",
  "sent",
  "delivered",
  "rejected",
  "bounced",
  "expired",
  "failed",
  "unknown",
] as const;

export type NotificationReceiptLevel = (typeof NOTIFICATION_RECEIPT_LEVELS)[number];

export const NOTIFICATION_FAILURE_CLASSES = [
  "validation",
  "authorisation",
  "configuration",
  "transient_provider",
  "permanent_provider",
  "rate_limit",
  "recipient_failure",
  "template_failure",
  "internal_processing",
  "unknown",
] as const;

export type NotificationFailureClass = (typeof NOTIFICATION_FAILURE_CLASSES)[number];

export function isTransientFailureClass(
  failureClass: NotificationFailureClass,
): boolean {
  return failureClass === "transient_provider" || failureClass === "rate_limit";
}
