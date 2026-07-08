import type { EventRegistry } from "../event/event-descriptor";
import type { EventRegistryDto } from "./map-event-registry-dto";

/** Server hydration diagnostics — registered vs permission-filtered visibility. */
export interface EventRegistryHydrationDiagnostics {
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly platformEventCount: number;
  readonly capabilityEventCount: number;
  readonly filteredPlatformEventCount: number;
  readonly filteredCapabilityEventCount: number;
  readonly platformVersion?: string;
  readonly platformEventIds: readonly string[];
  readonly capabilityEventIds: readonly string[];
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities: readonly string[];
}

function countBySource(
  events: readonly { readonly source: "builtin" | "manifest" }[],
): { platform: number; capability: number } {
  let platform = 0;
  let capability = 0;

  for (const event of events) {
    if (event.source === "builtin") {
      platform += 1;
    } else {
      capability += 1;
    }
  }

  return { platform, capability };
}

export function buildEventRegistryHydrationDiagnostics(
  registry: EventRegistry,
  visibleDto?: EventRegistryDto,
): EventRegistryHydrationDiagnostics {
  const registryDiagnostics = registry.getDiagnostics();
  const manifestCapabilities = registryDiagnostics.manifestCapabilities ?? [];
  const filteredEvents = visibleDto?.events;
  const filteredCounts = countBySource(filteredEvents ?? []);

  return Object.freeze({
    registeredCount: registryDiagnostics.registeredEventCount,
    filteredCount: filteredEvents?.length ?? registryDiagnostics.registeredEventCount,
    platformEventCount: registryDiagnostics.platformEventCount ?? 0,
    capabilityEventCount: registryDiagnostics.capabilityEventCount ?? 0,
    filteredPlatformEventCount:
      filteredEvents !== undefined
        ? filteredCounts.platform
        : (registryDiagnostics.platformEventCount ?? 0),
    filteredCapabilityEventCount:
      filteredEvents !== undefined
        ? filteredCounts.capability
        : (registryDiagnostics.capabilityEventCount ?? 0),
    platformVersion: registryDiagnostics.frameworkVersion,
    platformEventIds: registryDiagnostics.platformEventIds ?? [],
    capabilityEventIds: registryDiagnostics.capabilityEventIds ?? [],
    manifestCapabilityCount: manifestCapabilities.length,
    manifestCapabilities,
  });
}

export function createEmptyEventRegistryHydrationDiagnostics(): EventRegistryHydrationDiagnostics {
  return Object.freeze({
    registeredCount: 0,
    filteredCount: 0,
    platformEventCount: 0,
    capabilityEventCount: 0,
    filteredPlatformEventCount: 0,
    filteredCapabilityEventCount: 0,
    platformEventIds: [],
    capabilityEventIds: [],
    manifestCapabilityCount: 0,
    manifestCapabilities: [],
  });
}
