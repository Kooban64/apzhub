import {
  bootstrapEventRegistry,
  bootstrapNotificationRegistry,
  createDefaultNotificationRegistry,
  createEventNotificationContext,
  type EventCapabilityRecord,
  type EventNotificationContext,
} from "@apzhub/event-notification-framework";

import { registerAppNotificationRoutes } from "./register-app-notification-routes";
import { registerLawEvents } from "./register-law-events";
import { registerLawNotificationRoutes } from "./register-law-notification-routes";
import { wireAppEventNotifications } from "./wire-app-event-notifications";
import { wireLegalDomainNotifications } from "./wire-legal-domain-events";

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
  registerLawNotificationRoutes(notificationRegistry);

  const context = createEventNotificationContext({ notificationRegistry });

  bootstrapEventRegistry({
    registry: context.eventRegistry,
    capabilityRecords: options.capabilityRecords,
  });
  registerLawEvents(context.eventRegistry);

  wireAppEventNotifications(context);
  wireLegalDomainNotifications(context);

  return context;
}
