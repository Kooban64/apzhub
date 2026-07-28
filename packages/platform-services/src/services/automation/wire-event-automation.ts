import type { AutomationFoundation } from "./automation-foundation";
import type { AutomationEventBus } from "./types";

/**
 * Subscribe the Event Bus to the Automation Foundation.
 * Uses a broad prefix pattern so new registrations are matched without re-wire.
 * (APZHUB-1.1-004)
 */
export function wireEventAutomation(
  bus: AutomationEventBus,
  foundation: AutomationFoundation,
  eventPatterns: readonly string[] = ["support.*", "projects.*", "platform.*"],
): string[] {
  return eventPatterns.map((eventPattern) =>
    bus.subscribe({
      eventPattern,
      handler: (envelope) => {
        void foundation.handleDomainEvent(envelope);
      },
    }),
  );
}
