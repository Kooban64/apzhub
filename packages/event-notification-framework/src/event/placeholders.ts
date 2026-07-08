import { EVENT_LAYER_STATUS } from "../status";
import type {
  EventBusDiagnostics,
  EventRegistryDiagnostics,
} from "../types/diagnostics";
import type { EventBatchRegistrationResult } from "./event-batch-registration";
import type { EventDescriptor, EventRegistry } from "./event-descriptor";
import type { EventMetadata, EventRegistryMetadata } from "./event-metadata";
import type {
  EventBus,
  EventBusPublishResult,
  EventBusSubscribeOptions,
  EventEnvelope,
} from "./event-envelope";

const PLACEHOLDER_REGISTRY_DIAGNOSTICS: EventRegistryDiagnostics = Object.freeze({
  status: "scaffold",
  layerStatus: EVENT_LAYER_STATUS,
  registeredEventCount: 0,
  eventIds: [],
  duplicateEventIds: [],
  validationIssueCount: 0,
  categoryCounts: Object.freeze({}),
  manifestCapabilityCount: 0,
  issues: [],
  message: "Placeholder EventRegistry — use DefaultEventRegistry",
});

const PLACEHOLDER_BUS_DIAGNOSTICS: EventBusDiagnostics = Object.freeze({
  status: "scaffold",
  layerStatus: EVENT_LAYER_STATUS,
  subscriberCount: 0,
  subscriptionCount: 0,
  publishCount: 0,
  failedPublishCount: 0,
  subscriberFailureCount: 0,
  lastPublishStatus: "not_implemented",
  message: "Placeholder EventBus — use InProcessEventBus",
});

const EMPTY_REGISTRY_METADATA: EventRegistryMetadata = Object.freeze({
  manifestCapabilityCount: 0,
  eventMetadata: [],
});

function notImplementedBatch(): EventBatchRegistrationResult {
  return {
    ok: false,
    registeredCount: 0,
    errors: [
      {
        code: "VALIDATION",
        message: "Placeholder EventRegistry — use DefaultEventRegistry",
      },
    ],
  };
}

/** No-op EventRegistry for tests overriding composition root before bootstrap wiring. */
export class PlaceholderEventRegistry implements EventRegistry {
  register(_descriptor: EventDescriptor): void {
    // Placeholder
  }

  registerMany(_descriptors: readonly EventDescriptor[]): void {
    // Placeholder
  }

  registerManyAtomic(
    _descriptors: readonly EventDescriptor[],
  ): EventBatchRegistrationResult {
    return notImplementedBatch();
  }

  replace(_descriptor: EventDescriptor): void {
    // Placeholder
  }

  has(_eventId: string): boolean {
    return false;
  }

  get(_eventId: string): EventDescriptor | undefined {
    return undefined;
  }

  getMetadata(_eventId: string): EventMetadata | undefined {
    return undefined;
  }

  list(): readonly EventDescriptor[] {
    return [];
  }

  listMetadata(): readonly EventMetadata[] {
    return [];
  }

  getRegistryMetadata(): EventRegistryMetadata {
    return EMPTY_REGISTRY_METADATA;
  }

  recordManifestCapabilities(_capabilityIds: readonly string[]): void {
    // Placeholder
  }

  recordPlatformCatalogue(_version: string): void {
    // Placeholder
  }

  recordFrameworkVersion(_version: string): void {
    // Placeholder
  }

  clear(): void {
    // Placeholder
  }

  getDiagnostics(): EventRegistryDiagnostics {
    return PLACEHOLDER_REGISTRY_DIAGNOSTICS;
  }
}

/** No-op EventBus scaffold — EN-004 replaces with InProcessEventBus. */
export class PlaceholderEventBus implements EventBus {
  publish(_envelope: EventEnvelope): EventBusPublishResult {
    return { ok: false, errorCode: "NOT_IMPLEMENTED" };
  }

  subscribe(_options: EventBusSubscribeOptions): string {
    return "placeholder-subscription";
  }

  unsubscribe(_subscriptionId: string): boolean {
    return false;
  }

  getDiagnostics(): EventBusDiagnostics {
    return PLACEHOLDER_BUS_DIAGNOSTICS;
  }
}

export function createPlaceholderEventRegistry(): EventRegistry {
  return new PlaceholderEventRegistry();
}

export function createPlaceholderEventBus(): EventBus {
  return new PlaceholderEventBus();
}
