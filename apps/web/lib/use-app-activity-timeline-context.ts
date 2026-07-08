"use client";

import { useMemo } from "react";

import type { EventNotificationContext } from "@apzhub/event-notification-framework";

import {
  createAppActivityTimelineContext,
  type AppActivityTimelineContext,
} from "./create-app-activity-timeline-context";

/** Client session ActivityTimelineContext — shares Event Bus with EventNotificationContext. */
export function useAppActivityTimelineContext(
  eventNotificationContext: EventNotificationContext,
): AppActivityTimelineContext {
  return useMemo(
    () =>
      createAppActivityTimelineContext({
        eventBus: eventNotificationContext.eventBus,
      }),
    [eventNotificationContext.eventBus],
  );
}
