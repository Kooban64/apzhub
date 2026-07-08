"use client";

import {
  useNotificationRegistry,
  useNotificationService,
} from "@apzhub/event-notification-framework/react";
import type {
  EventRegistryHydrationDiagnostics,
  NotificationRegistryHydrationDiagnostics,
} from "@apzhub/event-notification-framework/server";

export interface EventNotificationDiagnosticsProps {
  readonly eventDiagnostics: EventRegistryHydrationDiagnostics;
  readonly notificationDiagnostics: NotificationRegistryHydrationDiagnostics;
}

/** Developer diagnostics for Event & Notification Framework integration (EN-015). */
export function EventNotificationDiagnostics({
  eventDiagnostics,
  notificationDiagnostics,
}: EventNotificationDiagnosticsProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const { diagnostics: registryDiagnostics } = useNotificationRegistry();
  const { diagnostics: serviceDiagnostics } = useNotificationService();

  return (
    <aside
      hidden
      data-testid="event-notification-diagnostics"
      data-event-registered-count={eventDiagnostics.registeredCount}
      data-event-filtered-count={eventDiagnostics.filteredCount}
      data-notification-registered-count={notificationDiagnostics.registeredCount}
      data-notification-filtered-count={notificationDiagnostics.filteredCount}
      data-notification-registry-status={registryDiagnostics.status}
      data-notification-service-status={serviceDiagnostics.status}
      data-notification-service-health={serviceDiagnostics.health}
      data-notification-unread-count={serviceDiagnostics.unreadCount}
    />
  );
}
