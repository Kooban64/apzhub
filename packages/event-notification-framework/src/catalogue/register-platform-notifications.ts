import type {
  NotificationDescriptor,
  NotificationRegistry,
} from "../notification/notification-descriptor";
import type { NotificationRegistrationIssue } from "../notification/notification-metadata";
import {
  PLATFORM_NOTIFICATION_CATALOGUE,
  type PlatformNotificationCatalogueEntry,
} from "./platform-notification-catalogue";
import {
  EVENT_NOTIFICATION_PLATFORM_VERSION,
  type EventNotificationPlatformVersion,
} from "./platform-version";

export interface PlatformNotificationRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly platformVersion: string;
  readonly errors: readonly NotificationRegistrationIssue[];
}

export function catalogueEntryToNotificationDescriptor(
  entry: PlatformNotificationCatalogueEntry,
  platformVersion: string,
): NotificationDescriptor {
  return {
    routeId: entry.routeId,
    eventPattern: entry.eventPattern,
    notificationKind: entry.notificationKind,
    channel: entry.channel,
    templateRef: entry.templateRef,
    version: entry.version,
    sourceCapability: "platform-runtime",
    schemaVersion: platformVersion,
    label: entry.label,
    description: entry.description,
    tags: entry.tags,
    status: entry.status ?? "active",
    priority: entry.priority,
    permission: entry.permission,
    source: "builtin",
    titleTemplate: entry.titleTemplate,
    bodyTemplate: entry.bodyTemplate,
  };
}

export function buildPlatformNotificationDescriptors(
  platformVersion: string = EVENT_NOTIFICATION_PLATFORM_VERSION,
): NotificationDescriptor[] {
  return PLATFORM_NOTIFICATION_CATALOGUE.map((entry) =>
    catalogueEntryToNotificationDescriptor(entry, platformVersion),
  );
}

/**
 * Atomically register the Platform Notification Catalogue.
 * Registration is atomic — any validation error registers nothing.
 */
export function registerPlatformNotificationCatalogue(
  registry: NotificationRegistry,
  options: { platformVersion?: EventNotificationPlatformVersion | string } = {},
): PlatformNotificationRegistrationResult {
  const platformVersion =
    options.platformVersion ?? EVENT_NOTIFICATION_PLATFORM_VERSION;
  const descriptors = buildPlatformNotificationDescriptors(platformVersion);
  const registration = registry.registerManyAtomic(descriptors);

  if (registration.ok) {
    registry.recordPlatformCatalogue(platformVersion);
  }

  return {
    ok: registration.ok,
    registeredCount: registration.registeredCount,
    platformVersion,
    errors: registration.errors,
  };
}
