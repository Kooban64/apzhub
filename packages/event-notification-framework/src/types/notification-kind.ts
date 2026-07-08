/** Notification presentation kinds — ADR-0032. */
export type NotificationKind =
  "toast" | "banner" | "inbox" | "in-app" | "email" | "sms" | "push" | "webhook";

/** All notification kinds supported by the registry (EN-001 taxonomy). */
export const NOTIFICATION_KINDS = [
  "toast",
  "banner",
  "inbox",
  "in-app",
  "email",
  "sms",
  "push",
  "webhook",
] as const satisfies readonly NotificationKind[];

/** Delivery channels — orthogonal to event categories. */
export type DeliveryChannel = "in-app" | "email" | "sms" | "push" | "webhook";

export const DELIVERY_CHANNELS = [
  "in-app",
  "email",
  "sms",
  "push",
  "webhook",
] as const satisfies readonly DeliveryChannel[];

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
