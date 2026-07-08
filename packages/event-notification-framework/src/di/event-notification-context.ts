import type { EventBus } from "../event/event-envelope";
import { createDefaultEventRegistry, createInProcessEventBus } from "../event";
import type { EventRegistry } from "../event/event-descriptor";
import type { NotificationMapper } from "../notification/notification-mapper";
import {
  createDefaultNotificationRegistry,
  createDefaultNotificationMapper,
  createDefaultNotificationService,
} from "../notification";
import type { NotificationRegistry } from "../notification/notification-descriptor";
import type { NotificationService } from "../notification/notification-service";
import type { EventNotificationFrameworkDiagnostics } from "../types/diagnostics";
import {
  EVENT_NOTIFICATION_FRAMEWORK_STATUS,
  type EventNotificationFrameworkStatus,
} from "../status";

/** Dependency injection root for Event & Notification Framework consumers. */
export interface EventNotificationContext {
  readonly status: EventNotificationFrameworkStatus;
  readonly eventRegistry: EventRegistry;
  readonly eventBus: EventBus;
  readonly notificationRegistry: NotificationRegistry;
  readonly notificationMapper: NotificationMapper;
  readonly notificationService: NotificationService;
  getDiagnostics(): EventNotificationFrameworkDiagnostics;
}

export interface CreateEventNotificationContextOptions {
  readonly eventRegistry?: EventRegistry;
  readonly eventBus?: EventBus;
  readonly notificationRegistry?: NotificationRegistry;
  readonly notificationMapper?: NotificationMapper;
  readonly notificationService?: NotificationService;
}

function buildFrameworkDiagnostics(
  context: Omit<EventNotificationContext, "getDiagnostics">,
): EventNotificationFrameworkDiagnostics {
  const registryStatus = context.eventRegistry.getDiagnostics().status;

  return {
    frameworkStatus: registryStatus === "ready" ? "ready" : "scaffold",
    eventRegistry: context.eventRegistry.getDiagnostics(),
    eventBus: context.eventBus.getDiagnostics(),
    notificationRegistry: context.notificationRegistry.getDiagnostics(),
    notificationMapper: context.notificationMapper.getDiagnostics(),
    notificationService: context.notificationService.getDiagnostics(),
  };
}

/** Composition root — DefaultEventRegistry + InProcessEventBus sharing registry reference. */
export function createEventNotificationContext(
  options: CreateEventNotificationContextOptions = {},
): EventNotificationContext {
  const eventRegistry = options.eventRegistry ?? createDefaultEventRegistry();
  const eventBus =
    options.eventBus ?? createInProcessEventBus({ registry: eventRegistry });
  const notificationRegistry =
    options.notificationRegistry ?? createDefaultNotificationRegistry();
  const notificationMapper =
    options.notificationMapper ??
    createDefaultNotificationMapper({ notificationRegistry });
  const notificationService =
    options.notificationService ?? createDefaultNotificationService();

  const base = {
    status: EVENT_NOTIFICATION_FRAMEWORK_STATUS,
    eventRegistry,
    eventBus,
    notificationRegistry,
    notificationMapper,
    notificationService,
  };

  return {
    ...base,
    getDiagnostics(): EventNotificationFrameworkDiagnostics {
      return buildFrameworkDiagnostics(base);
    },
  };
}
