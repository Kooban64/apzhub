import type { ActionRegistry } from "../registry";
import type { ActionRegistryDto } from "./map-action-registry-dto";

/** Server hydration diagnostics — registered vs permission-filtered visibility. */
export interface ActionRegistryHydrationDiagnostics {
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly platformActionCount: number;
  readonly capabilityActionCount: number;
  readonly platformVersion?: string;
  readonly platformActionIds: readonly string[];
  readonly capabilityActionIds: readonly string[];
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities: readonly string[];
  readonly toolbarRegionCount: number;
  readonly toolbarItemCount: number;
  readonly registeredShortcutCount: number;
}

export function buildActionRegistryHydrationDiagnostics(
  registry: ActionRegistry,
  visibleDto: ActionRegistryDto,
): ActionRegistryHydrationDiagnostics {
  const registryDiagnostics = registry.getDiagnostics();
  const manifestCapabilities = registryDiagnostics.manifestCapabilities ?? [];

  return {
    registeredCount: registryDiagnostics.registeredCount,
    filteredCount: visibleDto.actions.length,
    platformActionCount: registryDiagnostics.platformActionCount ?? 0,
    capabilityActionCount: registryDiagnostics.capabilityActionCount ?? 0,
    platformVersion: registryDiagnostics.platformVersion,
    platformActionIds: registryDiagnostics.platformActionIds ?? [],
    capabilityActionIds: registryDiagnostics.capabilityActionIds ?? [],
    manifestCapabilityCount: manifestCapabilities.length,
    manifestCapabilities,
    toolbarRegionCount: visibleDto.toolbar.length,
    toolbarItemCount: visibleDto.toolbar.reduce(
      (total, region) => total + region.items.length,
      0,
    ),
    registeredShortcutCount: registry
      .list()
      .filter((action) => action.shortcut !== undefined && action.shortcut.length > 0)
      .length,
  };
}

export function createEmptyActionRegistryHydrationDiagnostics(): ActionRegistryHydrationDiagnostics {
  return {
    registeredCount: 0,
    filteredCount: 0,
    platformActionCount: 0,
    capabilityActionCount: 0,
    platformActionIds: [],
    capabilityActionIds: [],
    manifestCapabilityCount: 0,
    manifestCapabilities: [],
    toolbarRegionCount: 0,
    toolbarItemCount: 0,
    registeredShortcutCount: 0,
  };
}
