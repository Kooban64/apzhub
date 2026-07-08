import type { DeliveryChannel, NotificationKind } from "../types/notification-kind";

/** Declarative metadata for a built-in platform notification route (pre-registration). */
export interface PlatformNotificationCatalogueEntry {
  readonly routeId: string;
  readonly version: string;
  readonly eventPattern: string;
  readonly notificationKind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly templateRef: string;
  readonly label: string;
  readonly description: string;
  readonly tags?: readonly string[];
  readonly status?: "active" | "planned" | "disabled";
  readonly priority?: "low" | "normal" | "high" | "urgent";
  readonly permission?: string;
  readonly titleTemplate?: string;
  readonly bodyTemplate?: string;
}

/**
 * Foundational Platform Notification Catalogue — registered at bootstrap without manifest files.
 *
 * Definitions only — no delivery, Event Bus subscription, or mapper execution.
 */
export const PLATFORM_NOTIFICATION_CATALOGUE = Object.freeze([
  {
    routeId: "platform.toast.default",
    version: "1.0.0",
    eventPattern: "system.platform.bootstrap.completed",
    notificationKind: "toast",
    channel: "in-app",
    templateRef: "platform-toast-default",
    label: "Default Platform Toast",
    description: "Default toast route for foundational platform lifecycle events",
    tags: ["platform", "toast", "lifecycle"],
    titleTemplate: "Platform bootstrap completed",
    bodyTemplate: "{{event.id}} at {{event.timestamp}}",
  },
  {
    routeId: "platform.banner.warning",
    version: "1.0.0",
    eventPattern: "system.platform.health.changed",
    notificationKind: "banner",
    channel: "in-app",
    templateRef: "platform-banner-warning",
    label: "Platform Warning Banner",
    description: "Warning banner route for platform health status changes",
    tags: ["platform", "banner", "health"],
    titleTemplate: "Platform health changed",
    bodyTemplate: "Health update for {{event.category}} at {{event.timestamp}}",
  },
  {
    routeId: "platform.inbox.system",
    version: "1.0.0",
    eventPattern: "system.platform.bootstrap.completed",
    notificationKind: "inbox",
    channel: "in-app",
    templateRef: "platform-inbox-system",
    label: "System Inbox",
    description: "Inbox route for platform system notifications",
    tags: ["platform", "inbox", "system"],
    titleTemplate: "System notification",
    bodyTemplate: "{{event.id}} completed",
  },
  {
    routeId: "platform.inapp.system",
    version: "1.0.0",
    eventPattern: "system.platform.health.changed",
    notificationKind: "in-app",
    channel: "in-app",
    templateRef: "platform-inapp-system",
    label: "System In-App Notification",
    description: "In-app route for platform health and system attention signals",
    tags: ["platform", "in-app", "system"],
    titleTemplate: "System attention",
    bodyTemplate: "{{payload.status}} reported at {{event.timestamp}}",
  },
] satisfies readonly PlatformNotificationCatalogueEntry[]);
