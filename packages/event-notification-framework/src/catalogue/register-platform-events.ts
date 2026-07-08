import type { EventDescriptor } from "../event/event-descriptor";
import type { EventRegistrationIssue } from "../event/event-metadata";
import type { EventRegistry } from "../event/event-descriptor";
import {
  PLATFORM_EVENT_CATALOGUE,
  type PlatformEventCatalogueEntry,
} from "./platform-event-catalogue";
import {
  EVENT_NOTIFICATION_PLATFORM_VERSION,
  type EventNotificationPlatformVersion,
} from "./platform-version";

export interface PlatformEventRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly platformVersion: string;
  readonly errors: readonly EventRegistrationIssue[];
}

export function catalogueEntryToDescriptor(
  entry: PlatformEventCatalogueEntry,
  platformVersion: string,
): EventDescriptor {
  return {
    eventId: entry.eventId,
    version: entry.version,
    category: entry.category,
    publisher: entry.publisher,
    sourceCapability: entry.publisher,
    schemaVersion: platformVersion,
    label: entry.label,
    description: entry.description,
    tags: entry.tags,
    subscribers: entry.subscribers,
    status: entry.status ?? "active",
    source: "builtin",
  };
}

export function buildPlatformEventDescriptors(
  platformVersion: string = EVENT_NOTIFICATION_PLATFORM_VERSION,
): EventDescriptor[] {
  return PLATFORM_EVENT_CATALOGUE.map((entry) =>
    catalogueEntryToDescriptor(entry, platformVersion),
  );
}

/**
 * Atomically register the Platform Event Catalogue.
 * Registration is atomic — any validation error registers nothing.
 */
export function registerPlatformEventCatalogue(
  registry: EventRegistry,
  options: { platformVersion?: EventNotificationPlatformVersion | string } = {},
): PlatformEventRegistrationResult {
  const platformVersion =
    options.platformVersion ?? EVENT_NOTIFICATION_PLATFORM_VERSION;
  const descriptors = buildPlatformEventDescriptors(platformVersion);
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
