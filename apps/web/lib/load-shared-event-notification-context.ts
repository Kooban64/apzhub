import { Runtime } from "@apzhub/platform-runtime/server";
import { mapPlatformCapabilitiesToEventRecords } from "@apzhub/event-notification-framework/server";
import type { EventNotificationContext } from "@apzhub/event-notification-framework";

import { createAppEventNotificationContext } from "./create-app-event-notification-context";
import { ensurePlatformRuntimeReady } from "./runtime-init";

/** Server/runtime-backed EventNotificationContext for health and layout hydration. */
export async function loadSharedEventNotificationContext(): Promise<EventNotificationContext | null> {
  const bootstrap = await ensurePlatformRuntimeReady();

  if (!bootstrap.success) {
    return null;
  }

  const capabilityRecords = mapPlatformCapabilitiesToEventRecords(
    Runtime.registry().findAll(),
  );

  return createAppEventNotificationContext({ capabilityRecords });
}
