import type { NotificationRouteDescriptorDto } from "../server/map-notification-registry-dto";
import {
  freezeClientNotificationRoute,
  type ClientNotificationRoute,
} from "./client-notification-route";

export function mapNotificationRouteDescriptorDtoToRoute(
  descriptor: NotificationRouteDescriptorDto,
): ClientNotificationRoute {
  return freezeClientNotificationRoute({
    routeId: descriptor.routeId,
    eventPattern: descriptor.eventPattern,
    notificationKind: descriptor.notificationKind,
    channel: descriptor.channel,
    templateRef: descriptor.templateRef,
    version: descriptor.version,
    schemaVersion: descriptor.schemaVersion,
    visibility: descriptor.visibility,
    stability: descriptor.stability,
    description: descriptor.description,
    tags: descriptor.tags,
    status: descriptor.status,
    label: descriptor.label,
    permission: descriptor.permission,
    priority: descriptor.priority,
    sourceCapability: descriptor.sourceCapability,
    source: descriptor.source,
  });
}

export function mapNotificationRegistryDtoToRoutes(
  routes: readonly NotificationRouteDescriptorDto[],
): readonly ClientNotificationRoute[] {
  return Object.freeze(
    [...routes]
      .map(mapNotificationRouteDescriptorDtoToRoute)
      .sort((left, right) => left.routeId.localeCompare(right.routeId)),
  );
}
