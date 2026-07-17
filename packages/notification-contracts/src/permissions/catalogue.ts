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
] as const;

export type PlatformNotificationPermission =
  (typeof PLATFORM_NOTIFICATION_PERMISSIONS)[number];

export const PLATFORM_NOTIFICATION_PERMISSION_WILDCARD =
  "notification.*" as const;

export function isPlatformNotificationPermission(value: string): boolean {
  return (PLATFORM_NOTIFICATION_PERMISSIONS as readonly string[]).includes(
    value,
  );
}

export type NotificationPermissionOp =
  | "read"
  | "manage"
  | "template"
  | "preference"
  | "audit"
  | "delivery";

export function hasNotificationPermission(
  permissions: readonly string[],
  op: NotificationPermissionOp,
): boolean {
  if (permissions.includes("notification.*")) return true;
  return permissions.includes(`notification.${op}`);
}
