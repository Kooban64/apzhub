/**
 * Notification Classification — standard metadata for every notification.
 * Channels consume this model; providers MUST NOT invent private conventions.
 */

export const NOTIFICATION_SEVERITIES = [
  "info",
  "warning",
  "error",
  "critical",
] as const;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export const NOTIFICATION_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_CATEGORIES = [
  "evidence",
  "suite",
  "run",
  "defect",
  "security",
  "platform",
  "execution",
  "execution_plan",
  "requirement",
  "reporting",
  "audit",
  "other",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_AUDIENCES = [
  "user",
  "role",
  "team",
  "project",
  "tenant",
  "global",
] as const;
export type NotificationAudience = (typeof NOTIFICATION_AUDIENCES)[number];

/** Standard classification metadata carried by every notification. */
export type NotificationClassification = {
  readonly severity: NotificationSeverity;
  readonly priority: NotificationPriority;
  readonly category: NotificationCategory;
  readonly audience: NotificationAudience;
  /** Optional ISO-8601 expiry; after this, delivery SHOULD be suppressed. */
  readonly expiry?: string;
  /** Correlation ID linking back to the originating domain event. */
  readonly correlationId: string;
};
