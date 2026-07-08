import type { NotificationRegistry } from "../notification/notification-descriptor";
import type { NotificationRegistryDto } from "./map-notification-registry-dto";

/** Server hydration diagnostics — registered vs permission-filtered visibility. */
export interface NotificationRegistryHydrationDiagnostics {
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly platformRouteCount: number;
  readonly capabilityRouteCount: number;
  readonly filteredPlatformRouteCount: number;
  readonly filteredCapabilityRouteCount: number;
  readonly platformVersion?: string;
  readonly platformRouteIds: readonly string[];
  readonly capabilityRouteIds: readonly string[];
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities: readonly string[];
}

function countBySource(
  routes: readonly { readonly source?: "builtin" | "manifest" }[],
): { platform: number; capability: number } {
  let platform = 0;
  let capability = 0;

  for (const route of routes) {
    if (route.source === "builtin") {
      platform += 1;
    } else {
      capability += 1;
    }
  }

  return { platform, capability };
}

export function buildNotificationRegistryHydrationDiagnostics(
  registry: NotificationRegistry,
  visibleDto?: NotificationRegistryDto,
): NotificationRegistryHydrationDiagnostics {
  const registryDiagnostics = registry.getDiagnostics();
  const manifestCapabilities = registryDiagnostics.manifestCapabilities ?? [];
  const filteredRoutes = visibleDto?.routes;
  const filteredCounts = countBySource(filteredRoutes ?? []);

  return Object.freeze({
    registeredCount: registryDiagnostics.registeredRouteCount,
    filteredCount: filteredRoutes?.length ?? registryDiagnostics.registeredRouteCount,
    platformRouteCount: registryDiagnostics.platformRouteCount ?? 0,
    capabilityRouteCount: registryDiagnostics.capabilityRouteCount ?? 0,
    filteredPlatformRouteCount:
      filteredRoutes !== undefined
        ? filteredCounts.platform
        : (registryDiagnostics.platformRouteCount ?? 0),
    filteredCapabilityRouteCount:
      filteredRoutes !== undefined
        ? filteredCounts.capability
        : (registryDiagnostics.capabilityRouteCount ?? 0),
    platformVersion: registryDiagnostics.frameworkVersion,
    platformRouteIds: registryDiagnostics.platformRouteIds ?? [],
    capabilityRouteIds: registryDiagnostics.capabilityRouteIds ?? [],
    manifestCapabilityCount: manifestCapabilities.length,
    manifestCapabilities,
  });
}

export function createEmptyNotificationRegistryHydrationDiagnostics(): NotificationRegistryHydrationDiagnostics {
  return Object.freeze({
    registeredCount: 0,
    filteredCount: 0,
    platformRouteCount: 0,
    capabilityRouteCount: 0,
    filteredPlatformRouteCount: 0,
    filteredCapabilityRouteCount: 0,
    platformRouteIds: [],
    capabilityRouteIds: [],
    manifestCapabilityCount: 0,
    manifestCapabilities: [],
  });
}
