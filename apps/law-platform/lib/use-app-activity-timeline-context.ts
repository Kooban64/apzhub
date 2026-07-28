"use client";

import { useMemo } from "react";

import type { EventNotificationContext } from "@apzhub/event-notification-framework";

import {
  createAppActivityTimelineContext,
  type AppActivityTimelineContext,
} from "./create-app-activity-timeline-context";

export interface UseAppActivityTimelineContextOptions {
  readonly userId?: string;
  readonly tenantId?: string;
}

/** Client session ActivityTimelineContext — durable store when user/tenant scoped (OBS-LAW-02). */
export function useAppActivityTimelineContext(
  eventNotificationContext: EventNotificationContext,
  options: UseAppActivityTimelineContextOptions = {},
): AppActivityTimelineContext {
  const { userId, tenantId } = options;
  return useMemo(
    () =>
      createAppActivityTimelineContext({
        eventBus: eventNotificationContext.eventBus,
        persistenceScope: userId || tenantId ? { userId, tenantId } : undefined,
      }),
    [eventNotificationContext.eventBus, userId, tenantId],
  );
}
