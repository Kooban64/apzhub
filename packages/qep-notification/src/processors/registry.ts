import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";

import type { NotificationDeliveryEngine } from "../delivery/engine";
import { QEP_NOTIFICATION_VERSION } from "../version";
import { createNotificationEvidenceProcessors } from "./evidence-processors";

export const NOTIFICATION_BUNDLE_ID = "qep-notification" as const;

export type NotificationProcessorBundle = {
  readonly bundleId: typeof NOTIFICATION_BUNDLE_ID;
  readonly product: string;
  readonly version: string;
  readonly processors: readonly EventProcessor[];
  registerOnto(platformRegistry: ProcessorRegistry): void;
};

export function createNotificationProcessorBundle(
  engine: NotificationDeliveryEngine,
): NotificationProcessorBundle {
  const processors = createNotificationEvidenceProcessors(engine);
  return {
    bundleId: NOTIFICATION_BUNDLE_ID,
    product: "APZQEP Notification & Subscription Platform",
    version: QEP_NOTIFICATION_VERSION,
    processors,
    registerOnto(platformRegistry) {
      for (const processor of processors) {
        platformRegistry.register(processor);
      }
    },
  };
}
