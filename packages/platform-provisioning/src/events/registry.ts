import {
  createDefaultEventRegistry,
  type EventDescriptor,
  type EventRegistry,
} from "@apzhub/event-notification-framework";
import { ensurePlatformEventBusRegistry } from "@apzhub/platform-event-bus";

import {
  PLATFORM_PROVISIONING_PUBLISHER,
  PROVISIONING_EVENT_COMPLETED,
  PROVISIONING_EVENT_FAILED,
  PROVISIONING_EVENT_STARTED,
  PROVISIONING_EVENT_STEP_COMPLETED,
  PROVISIONING_EVENT_VERSION,
} from "../constants";

export function platformProvisioningDescriptors(): readonly EventDescriptor[] {
  const base = {
    version: PROVISIONING_EVENT_VERSION,
    category: "system" as const,
    publisher: PLATFORM_PROVISIONING_PUBLISHER,
    sourceCapability: PLATFORM_PROVISIONING_PUBLISHER,
    visibility: "internal" as const,
    stability: "stable" as const,
    status: "active" as const,
    source: "builtin" as const,
    tags: ["provisioning", "governance"],
  };

  return [
    {
      ...base,
      eventId: PROVISIONING_EVENT_STARTED,
      label: "Provisioning flow started",
      description: "Emitted when a product provisioning flow begins.",
    },
    {
      ...base,
      eventId: PROVISIONING_EVENT_STEP_COMPLETED,
      label: "Provisioning step completed",
      description: "Emitted when a provisioning workflow step completes.",
    },
    {
      ...base,
      eventId: PROVISIONING_EVENT_COMPLETED,
      label: "Provisioning flow completed",
      description: "Emitted when a product provisioning flow completes successfully.",
    },
    {
      ...base,
      eventId: PROVISIONING_EVENT_FAILED,
      label: "Provisioning flow failed",
      description: "Emitted when a product provisioning flow fails.",
    },
  ];
}

/**
 * Register provisioning + Event Bus descriptors on a shared registry.
 * Idempotent.
 */
export function ensureProvisioningEventRegistry(
  registry: EventRegistry = createDefaultEventRegistry(),
): EventRegistry {
  ensurePlatformEventBusRegistry(registry);
  for (const descriptor of platformProvisioningDescriptors()) {
    if (!registry.has(descriptor.eventId)) {
      registry.register(descriptor);
    }
  }
  return registry;
}
