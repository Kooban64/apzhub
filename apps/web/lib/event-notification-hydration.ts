import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { isDevRegistrationAllowed } from "@apzhub/config";
import {
  buildEventRegistryHydrationDiagnostics,
  buildNotificationRegistryHydrationDiagnostics,
  createEmptyEventRegistryDto,
  createEmptyEventRegistryHydrationDiagnostics,
  createEmptyNotificationRegistryDto,
  createEmptyNotificationRegistryHydrationDiagnostics,
  filterEventRegistryDto,
  filterNotificationRegistryDto,
  mapEventRegistryDto,
  mapNotificationRegistryDto,
  type EventRegistryDto,
  type EventRegistryHydrationDiagnostics,
  type NotificationRegistryDto,
  type NotificationRegistryHydrationDiagnostics,
} from "@apzhub/event-notification-framework/server";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { createPlatformAuthPermissionContext } from "./session-permission-context";

import { loadSharedEventNotificationContext } from "./load-shared-event-notification-context";

export interface EventNotificationHydrationResult {
  readonly eventDto: EventRegistryDto;
  readonly notificationDto: NotificationRegistryDto;
  readonly eventDiagnostics: EventRegistryHydrationDiagnostics;
  readonly notificationDiagnostics: NotificationRegistryHydrationDiagnostics;
}

/** Permission-filtered Event & Notification hydration for platform layout. */
export async function loadEventNotificationHydration(): Promise<EventNotificationHydrationResult> {
  const context = await loadSharedEventNotificationContext();

  if (!context) {
    return {
      eventDto: createEmptyEventRegistryDto(),
      notificationDto: createEmptyNotificationRegistryDto(),
      eventDiagnostics: createEmptyEventRegistryHydrationDiagnostics(),
      notificationDiagnostics: createEmptyNotificationRegistryHydrationDiagnostics(),
    };
  }

  const unfilteredEventDto = mapEventRegistryDto(context.eventRegistry);
  const unfilteredNotificationDto = mapNotificationRegistryDto(
    context.notificationRegistry,
  );
  const session = await getValidatedSession(await headers());
  const authContext = await createPlatformAuthPermissionContext(session);
  const permissionAdapter = createWorkbenchPermissionAdapter({
    authContext,
    nodeEnv: process.env.NODE_ENV,
    allowDevRegistration: isDevRegistrationAllowed(),
  });

  const eventDto = filterEventRegistryDto(unfilteredEventDto, permissionAdapter);
  const notificationDto = filterNotificationRegistryDto(
    unfilteredNotificationDto,
    permissionAdapter,
  );

  return {
    eventDto,
    notificationDto,
    eventDiagnostics: buildEventRegistryHydrationDiagnostics(
      context.eventRegistry,
      eventDto,
    ),
    notificationDiagnostics: buildNotificationRegistryHydrationDiagnostics(
      context.notificationRegistry,
      notificationDto,
    ),
  };
}

export {
  loadEventFrameworkHealthSummary,
  loadNotificationFrameworkHealthSummary,
} from "./event-notification-health";
