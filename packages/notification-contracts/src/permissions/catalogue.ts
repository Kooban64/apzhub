/**
 * Platform Notification permissions (APZNOTIFY-001).
 * No UI — catalogue for later Gateway / Authorization wiring.
 */

export const PLATFORM_NOTIFICATION_PERMISSIONS = [
  "notification.*",
  "notification.read",
  "notification.manage",
  "notification.template",
  "notification.preference",
  "notification.audit",
  "notification.delivery",
  /** ENG-004 Phase A — delivery-plane permissions (repository naming). */
  "notifications.read",
  "notifications.manage",
  "notifications.preferences",
  "notifications.send",
  "notifications.retry",
  "notifications.diagnostics",
  "notifications.health",
  "notifications.providers",
  "notifications.templates",
  "notifications.policies",
  /** ENG-001B-P4 — durable delivery administration */
  "notifications.admin",
  "notifications.replay",
] as const;

export type PlatformNotificationPermission =
  (typeof PLATFORM_NOTIFICATION_PERMISSIONS)[number];

export const PLATFORM_NOTIFICATION_PERMISSION_WILDCARD = "notification.*" as const;

export function isPlatformNotificationPermission(value: string): boolean {
  return (PLATFORM_NOTIFICATION_PERMISSIONS as readonly string[]).includes(value);
}

export type NotificationPermissionOp =
  "read" | "manage" | "template" | "preference" | "audit" | "delivery";

export function hasNotificationPermission(
  permissions: readonly string[],
  op: NotificationPermissionOp,
): boolean {
  if (permissions.includes("notification.*")) return true;
  return permissions.includes(`notification.${op}`);
}

/** ENG-004 delivery-plane permission helpers. */
export function hasNotificationsDeliveryPermission(
  permissions: readonly string[],
  op:
    | "read"
    | "manage"
    | "preferences"
    | "send"
    | "retry"
    | "diagnostics"
    | "health"
    | "providers"
    | "templates"
    | "policies"
    | "admin"
    | "replay",
): boolean {
  if (
    permissions.includes("notification.*") ||
    permissions.includes("notifications.manage")
  ) {
    return true;
  }
  if (op === "read" && permissions.includes("notification.read")) return true;
  if (op === "send" && permissions.includes("notification.delivery")) return true;
  // admin / replay: explicit privileged permissions only (deny by default)
  return permissions.includes(`notifications.${op}`);
}
