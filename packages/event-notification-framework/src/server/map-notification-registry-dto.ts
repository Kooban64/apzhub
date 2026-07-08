import type { NotificationRegistry } from "../notification/notification-descriptor";
import type {
  NotificationDescriptorSource,
  NotificationRouteStatus,
  NotificationStability,
  NotificationVisibility,
} from "../notification/notification-descriptor";
import type { NotificationMetadata } from "../notification/notification-metadata";
import type {
  DeliveryChannel,
  NotificationKind,
  NotificationPriority,
} from "../types/notification-kind";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "./notification-registry-dto-schema-version";

/** Client-safe notification route descriptor — read-only registry projection (EN-010). */
export interface NotificationRouteDescriptorDto {
  readonly routeId: string;
  readonly eventPattern: string;
  readonly notificationKind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly templateRef: string;
  readonly version: string;
  readonly schemaVersion: string;
  readonly visibility: NotificationVisibility;
  readonly stability: NotificationStability;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly status: NotificationRouteStatus;
  readonly label?: string;
  readonly permission?: string;
  readonly priority?: NotificationPriority;
  readonly sourceCapability?: string;
  readonly source: NotificationDescriptorSource;
}

/** Server-authoritative, versioned Notification Registry projection (EN-010). */
export interface NotificationRegistryDto {
  readonly schemaVersion: typeof NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION;
  readonly frameworkVersion?: string;
  readonly routes: readonly NotificationRouteDescriptorDto[];
}

export function createEmptyNotificationRegistryDto(): NotificationRegistryDto {
  return {
    schemaVersion: NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
    routes: [],
  };
}

export function mapNotificationMetadataToRouteDto(
  metadata: NotificationMetadata,
): NotificationRouteDescriptorDto {
  return Object.freeze({
    routeId: metadata.routeId,
    eventPattern: metadata.eventPattern,
    notificationKind: metadata.notificationKind,
    channel: metadata.channel,
    templateRef: metadata.templateRef,
    version: metadata.version,
    schemaVersion: metadata.schemaVersion,
    visibility: metadata.visibility,
    stability: metadata.stability,
    description: metadata.description,
    tags: metadata.tags,
    status: metadata.status,
    label: metadata.label,
    permission: metadata.permission,
    priority: metadata.priority,
    sourceCapability: metadata.sourceCapability,
    source: metadata.source,
  });
}

/** Map in-memory registry snapshot to a serialisable DTO (pre-permission filter). */
export function mapNotificationRegistryDto(
  registry: NotificationRegistry,
): NotificationRegistryDto {
  const metadata = registry.getRegistryMetadata();

  return Object.freeze({
    schemaVersion: NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: metadata.frameworkVersion,
    routes: Object.freeze(
      metadata.routeMetadata
        .map(mapNotificationMetadataToRouteDto)
        .sort((left, right) => left.routeId.localeCompare(right.routeId)),
    ),
  });
}
