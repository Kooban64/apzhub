import { Runtime } from "@apzhub/platform-runtime/server";
import { mapPlatformCapabilitiesToActivityRecords } from "@apzhub/activity-timeline-framework/server";

import {
  createAppActivityTimelineContext,
  type AppActivityTimelineContext,
} from "./create-app-activity-timeline-context";
import { loadSharedEventNotificationContext } from "./load-shared-event-notification-context";
import { ensurePlatformRuntimeReady } from "./runtime-init";

/** Server/runtime-backed ActivityTimelineContext for health and layout hydration. */
export async function loadSharedActivityTimelineContext(): Promise<AppActivityTimelineContext | null> {
  const [bootstrap, eventNotificationContext] = await Promise.all([
    ensurePlatformRuntimeReady(),
    loadSharedEventNotificationContext(),
  ]);

  if (!bootstrap.success || !eventNotificationContext) {
    return null;
  }

  const capabilityRecords = mapPlatformCapabilitiesToActivityRecords(
    Runtime.registry().findAll(),
  );

  return createAppActivityTimelineContext({
    eventBus: eventNotificationContext.eventBus,
    capabilityRecords,
  });
}
