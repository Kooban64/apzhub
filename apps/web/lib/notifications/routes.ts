/** Platform Notification route helpers — HTTP (APZNOTIFY-003) + workspace (APZNOTIFY-004). */

export const NOTIFICATIONS_API_BASE = "/api/v1/notifications";

/** Workspace base path for the Notification Workbench (metadata UI only). */
export const NOTIFICATIONS_WORKSPACE_BASE = "/workspace/notifications";

export const NOTIFICATIONS_SECTIONS = [
  "overview",
  "notifications",
  "templates",
  "preferences",
  "categories",
  "channels",
  "recipients",
  "references",
  "audit",
  "diagnostics",
] as const;

export type NotificationsSection = (typeof NOTIFICATIONS_SECTIONS)[number];

/** Forbidden HTTP segments — never shipped under /api/v1/notifications. */
export const NOTIFICATION_FORBIDDEN_HTTP_SEGMENTS = [
  "send",
  "resend",
  "deliver",
  "dispatch",
  "retry",
  "schedule",
  "cancel-delivery",
  "providers",
  "smtp",
  "sms",
  "push",
  "teams",
  "slack",
  "webhooks",
  "workers",
  "queues",
  "events",
  "stream",
  "subscribe",
  "realtime",
] as const;

export function isNotificationApiPath(pathname: string): boolean {
  return (
    pathname === NOTIFICATIONS_API_BASE ||
    pathname.startsWith(`${NOTIFICATIONS_API_BASE}/`)
  );
}

export function assertNotificationApiPath(pathname: string): void {
  if (!isNotificationApiPath(pathname)) {
    throw new Error("Notification client may only call /api/v1/notifications");
  }
  for (const segment of NOTIFICATION_FORBIDDEN_HTTP_SEGMENTS) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`)) {
      throw new Error(`Forbidden notification HTTP segment: ${segment}`);
    }
  }
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isNotificationsRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === NOTIFICATIONS_WORKSPACE_BASE ||
    normalized.startsWith(`${NOTIFICATIONS_WORKSPACE_BASE}/`)
  );
}

export function resolveNotificationsSection(pathname: string): NotificationsSection {
  const normalized = normalizePath(pathname);
  if (normalized === NOTIFICATIONS_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(NOTIFICATIONS_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (NOTIFICATIONS_SECTIONS.includes(section as NotificationsSection)) {
    return section as NotificationsSection;
  }
  return "overview";
}

export function notificationsSectionPath(section?: NotificationsSection): string {
  if (!section || section === "overview") {
    return `${NOTIFICATIONS_WORKSPACE_BASE}/overview`;
  }
  return `${NOTIFICATIONS_WORKSPACE_BASE}/${section}`;
}
