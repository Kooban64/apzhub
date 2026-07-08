import {
  bootstrapEventRegistry,
  bootstrapNotificationRegistry,
  createDefaultNotificationRegistry,
  createEventNotificationContext,
  type EventCapabilityRecord,
  type EventNotificationContext,
} from "@apzhub/event-notification-framework";

import { registerAppNotificationRoutes } from "./register-app-notification-routes";
import { wireAppEventNotifications } from "./wire-app-event-notifications";

export interface CreateAppEventNotificationContextOptions {
  readonly capabilityRecords?: readonly EventCapabilityRecord[];
}

/**
 * Shared apps/web composition root for Event & Notification Framework.
 * Used by server hydration and client shell providers — one context per session surface.
 */
export function createAppEventNotificationContext(
  options: CreateAppEventNotificationContextOptions = {},
): EventNotificationContext {
  const notificationRegistry = createDefaultNotificationRegistry();

  bootstrapNotificationRegistry({
    registry: notificationRegistry,
    capabilityRecords: options.capabilityRecords,
  });
  registerAppNotificationRoutes(notificationRegistry);

  const context = createEventNotificationContext({ notificationRegistry });

  bootstrapEventRegistry({
    registry: context.eventRegistry,
    capabilityRecords: options.capabilityRecords,
  });

  wireAppEventNotifications(context);

  return context;
}
