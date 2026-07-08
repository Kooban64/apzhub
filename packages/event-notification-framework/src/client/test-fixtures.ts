import { PLATFORM_NOTIFICATION_CATALOGUE } from "../catalogue/platform-notification-catalogue";
import type { PlatformNotificationCatalogueEntry } from "../catalogue/platform-notification-catalogue";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "../server/notification-registry-dto-schema-version";
import type { NotificationRegistryDto } from "../server/map-notification-registry-dto";

export function sampleNotificationRegistryDto(
  overrides: Partial<NotificationRegistryDto> = {},
): NotificationRegistryDto {
  return {
    schemaVersion: NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "3.0.0",
    routes: PLATFORM_NOTIFICATION_CATALOGUE.map(
      (entry: PlatformNotificationCatalogueEntry) => ({
        routeId: entry.routeId,
        eventPattern: entry.eventPattern,
        notificationKind: entry.notificationKind,
        channel: entry.channel,
        templateRef: entry.templateRef,
        version: entry.version,
        schemaVersion: "3.0.0",
        visibility: "public" as const,
        stability: "stable" as const,
        tags: entry.tags ?? [],
        status: entry.status ?? "active",
        label: entry.label,
        sourceCapability: "platform-runtime",
        source: "builtin" as const,
      }),
    ),
    ...overrides,
  };
}
