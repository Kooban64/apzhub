import { createDefaultActionRegistry } from "../registry";
import type { ActionRegistry } from "../registry";
import {
  extractToolbarRegionsFromCapabilities,
  populateRegistryFromCapabilities,
  type ManifestRegistryPopulationResult,
} from "../extraction";
import type { ActionCapabilityRecord } from "../extraction/types";
import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import {
  buildActionRegistryHydrationDiagnostics,
  createEmptyActionRegistryHydrationDiagnostics,
  type ActionRegistryHydrationDiagnostics,
} from "./action-registry-hydration-diagnostics";
import {
  createEmptyActionRegistryDto,
  mapActionRegistryDto,
  type ActionRegistryDto,
  type ActionToolbarRegionDto,
} from "./map-action-registry-dto";

export interface BootstrapActionRegistryOptions {
  readonly activeOnly?: boolean;
  readonly registry?: ActionRegistry;
  /** Manual toolbar override — defaults to manifest extraction (AF-019). */
  readonly toolbar?: readonly ActionToolbarRegionDto[];
}

export interface BootstrapActionRegistryResult {
  readonly ok: boolean;
  readonly registry: ActionRegistry;
  readonly dto: ActionRegistryDto;
  readonly diagnostics: ActionRegistryHydrationDiagnostics;
  readonly population: ManifestRegistryPopulationResult;
  readonly errors: readonly ActionRegistrationIssue[];
}

function resolveToolbarRegions(
  records: readonly ActionCapabilityRecord[],
  registry: ActionRegistry,
  options: BootstrapActionRegistryOptions,
): readonly ActionToolbarRegionDto[] {
  if (options.toolbar) {
    return options.toolbar;
  }

  return extractToolbarRegionsFromCapabilities(records, {
    activeOnly: options.activeOnly,
    knownActionIds: new Set(registry.list().map((action) => action.id)),
  }).regions;
}

/**
 * Populate an action registry from capability manifests at bootstrap.
 * Returns an unfiltered DTO — apply {@link filterActionRegistryDto} before client hydration.
 */
export function bootstrapActionRegistryFromCapabilities(
  records: readonly ActionCapabilityRecord[],
  options: BootstrapActionRegistryOptions = {},
): BootstrapActionRegistryResult {
  const registry = options.registry ?? createDefaultActionRegistry();
  const population = populateRegistryFromCapabilities(registry, records, {
    activeOnly: options.activeOnly,
  });

  if (!population.ok) {
    return {
      ok: false,
      registry,
      dto: createEmptyActionRegistryDto(),
      diagnostics: createEmptyActionRegistryHydrationDiagnostics(),
      population,
      errors: population.errors,
    };
  }

  const toolbar = resolveToolbarRegions(records, registry, options);
  const dto = mapActionRegistryDto(registry, toolbar);
  const diagnostics = buildActionRegistryHydrationDiagnostics(registry, dto);

  return {
    ok: true,
    registry,
    dto,
    diagnostics,
    population,
    errors: [],
  };
}
