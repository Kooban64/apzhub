/**
 * Platform Notification enums (APZNOTIFY-001).
 * Metadata catalogue only — no delivery engine.
 */

export const NOTIFICATION_STATUSES = [
  "draft",
  "pending",
  "queued",
  "delivered",
  "read",
  "acknowledged",
  "dismissed",
  "expired",
  "archived",
] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export function isNotificationStatus(value: string): value is NotificationStatus {
  return (NOTIFICATION_STATUSES as readonly string[]).includes(value);
}

export const NOTIFICATION_PRIORITIES = [
  "critical",
  "high",
  "normal",
  "low",
  "informational",
] as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export function isNotificationPriority(
  value: string,
): value is NotificationPriority {
  return (NOTIFICATION_PRIORITIES as readonly string[]).includes(value);
}

export const NOTIFICATION_CHANNELS = [
  "email",
  "sms",
  "push",
  "in_app",
  "webhook",
  "microsoft_teams",
  "slack",
  "future",
] as const;

export type NotificationChannelKind = (typeof NOTIFICATION_CHANNELS)[number];

export function isNotificationChannelKind(
  value: string,
): value is NotificationChannelKind {
  return (NOTIFICATION_CHANNELS as readonly string[]).includes(value);
}

/** Product reference kinds — no cross-product business logic. */
export const NOTIFICATION_REFERENCE_KINDS = [
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "workflow",
  "search",
  "future",
] as const;

export type NotificationReferenceKind =
  (typeof NOTIFICATION_REFERENCE_KINDS)[number];

export function isNotificationReferenceKind(
  value: string,
): value is NotificationReferenceKind {
  return (NOTIFICATION_REFERENCE_KINDS as readonly string[]).includes(value);
}

export const NOTIFICATION_DELIVERY_ATTEMPT_STATUSES = [
  "recorded",
  "skipped",
  "failed_metadata",
] as const;

export type NotificationDeliveryAttemptStatus =
  (typeof NOTIFICATION_DELIVERY_ATTEMPT_STATUSES)[number];

export const NOTIFICATION_AUDIT_ACTIONS = [
  "created",
  "updated",
  "status_changed",
  "recipient_added",
  "recipient_updated",
  "acknowledged",
  "dismissed",
  "expired",
  "archived",
  "template_created",
  "template_updated",
  "preference_updated",
  "rule_created",
  "rule_updated",
] as const;

export type NotificationAuditAction =
  (typeof NOTIFICATION_AUDIT_ACTIONS)[number];
