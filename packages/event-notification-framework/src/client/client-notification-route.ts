import type {
  NotificationDescriptorSource,
  NotificationRouteStatus,
  NotificationStability,
  NotificationVisibility,
} from "../notification/notification-descriptor";
import type {
  DeliveryChannel,
  NotificationKind,
  NotificationPriority,
} from "../types/notification-kind";

/** Hydrated notification route visible to browser consumers. */
export interface ClientNotificationRoute {
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

export function freezeClientNotificationRoute(
  route: ClientNotificationRoute,
): ClientNotificationRoute {
  return Object.freeze({
    ...route,
    tags: Object.freeze([...route.tags]),
  });
}
