import { EVENT_NOTIFICATION_FRAMEWORK_STATUS } from "@apzhub/event-notification-framework";
import {
  buildEventRegistryHydrationDiagnostics,
  buildNotificationRegistryHydrationDiagnostics,
  filterEventRegistryDto,
  filterNotificationRegistryDto,
  mapEventRegistryDto,
  mapNotificationRegistryDto,
} from "@apzhub/event-notification-framework/server";
import type {
  EventFrameworkHealthSummary,
  NotificationFrameworkHealthSummary,
} from "@apzhub/types";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { loadSharedEventNotificationContext } from "./load-shared-event-notification-context";

function mapHydrationStatus(
  registeredCount: number,
  filteredCount: number,
): EventFrameworkHealthSummary["status"] {
  if (registeredCount === 0) {
    return "unhealthy";
  }

  if (filteredCount === 0 && registeredCount > 0) {
    return "degraded";
  }

  return "healthy";
}

/** Platform-wide Event Framework summary for `/api/health` (allow-all visibility). */
export async function loadEventFrameworkHealthSummary(): Promise<
  EventFrameworkHealthSummary | undefined
> {
  const context = await loadSharedEventNotificationContext();

  if (!context) {
    return undefined;
  }

  const permissionAdapter = createWorkbenchPermissionAdapter({ mode: "allow-all" });
  const eventDto = filterEventRegistryDto(
    mapEventRegistryDto(context.eventRegistry),
    permissionAdapter,
  );
  const eventDiagnostics = buildEventRegistryHydrationDiagnostics(
    context.eventRegistry,
    eventDto,
  );
  const eventBusDiagnostics = context.eventBus.getDiagnostics();
  const frameworkDiagnostics = context.getDiagnostics();

  return {
    status: mapHydrationStatus(
      eventDiagnostics.registeredCount,
      eventDiagnostics.filteredCount,
    ),
    frameworkStatus: frameworkDiagnostics.frameworkStatus,
    layerStatus: frameworkDiagnostics.eventRegistry.layerStatus,
    registeredCount: eventDiagnostics.registeredCount,
    filteredCount: eventDiagnostics.filteredCount,
    platformEventCount: eventDiagnostics.platformEventCount,
    capabilityEventCount: eventDiagnostics.capabilityEventCount,
    publishCount: eventBusDiagnostics.publishCount,
    lastPublishStatus: eventBusDiagnostics.lastPublishStatus,
    subscriberCount: eventBusDiagnostics.subscriberCount,
  };
}

/** Platform-wide Notification Framework summary for `/api/health` (allow-all visibility). */
export async function loadNotificationFrameworkHealthSummary(): Promise<
  NotificationFrameworkHealthSummary | undefined
> {
  const context = await loadSharedEventNotificationContext();

  if (!context) {
    return undefined;
  }

  const permissionAdapter = createWorkbenchPermissionAdapter({ mode: "allow-all" });
  const notificationDto = filterNotificationRegistryDto(
    mapNotificationRegistryDto(context.notificationRegistry),
    permissionAdapter,
  );
  const notificationDiagnostics = buildNotificationRegistryHydrationDiagnostics(
    context.notificationRegistry,
    notificationDto,
  );
  const mapperDiagnostics = context.notificationMapper.getDiagnostics();
  const serviceDiagnostics = context.notificationService.getDiagnostics();

  return {
    status: mapHydrationStatus(
      notificationDiagnostics.registeredCount,
      notificationDiagnostics.filteredCount,
    ),
    frameworkStatus: EVENT_NOTIFICATION_FRAMEWORK_STATUS,
    layerStatus: serviceDiagnostics.layerStatus,
    registeredRouteCount: notificationDiagnostics.registeredCount,
    filteredRouteCount: notificationDiagnostics.filteredCount,
    platformRouteCount: notificationDiagnostics.platformRouteCount,
    capabilityRouteCount: notificationDiagnostics.capabilityRouteCount,
    serviceStatus: serviceDiagnostics.status,
    storedCount: serviceDiagnostics.activeNotificationCount,
    unreadCount: serviceDiagnostics.unreadCount,
    mapperStatus: mapperDiagnostics.status,
    mappedCount: mapperDiagnostics.mappedCount,
  };
}
