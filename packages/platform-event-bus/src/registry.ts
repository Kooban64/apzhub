import {
  createDefaultEventRegistry,
  type EventDescriptor,
  type EventRegistry,
} from "@apzhub/event-notification-framework";

import {
  PLATFORM_EVENT_BUS_PUBLISHER,
  PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
  PLATFORM_INTEGRATION_SOURCE_EVENT_VERSION,
} from "./constants";

/** Canonical descriptors owned by the Platform Event Bus. */
export function platformEventBusDescriptors(): readonly EventDescriptor[] {
  return [
    {
      eventId: PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
      version: PLATFORM_INTEGRATION_SOURCE_EVENT_VERSION,
      category: "integration",
      publisher: PLATFORM_EVENT_BUS_PUBLISHER,
      sourceCapability: PLATFORM_EVENT_BUS_PUBLISHER,
      label: "Integration source event received",
      description:
        "Canonical platform event published when a validated IntegrationSourceEvent is accepted via webhook ingress or outbox relay.",
      visibility: "internal",
      stability: "stable",
      status: "active",
      source: "builtin",
      tags: ["integration", "webhook", "ingress"],
    },
  ];
}

/**
 * Ensure platform event-bus descriptors are registered.
 * Idempotent — skips eventIds already present.
 */
export function ensurePlatformEventBusRegistry(
  registry: EventRegistry = createDefaultEventRegistry(),
): EventRegistry {
  for (const descriptor of platformEventBusDescriptors()) {
    if (!registry.has(descriptor.eventId)) {
      registry.register(descriptor);
    }
  }
  return registry;
}
