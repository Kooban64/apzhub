import type { ActivityRegistry } from "../registry/activity-registry";
import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import { createDefaultActivityRegistry } from "../registry/default-activity-registry";
import {
  registerPlatformActivityCatalogue,
  type PlatformActivityRegistrationResult,
} from "../catalogue/register-platform-activities";
import { populateActivityRegistryFromCapabilities } from "../extraction/populate-activity-registry";
import type {
  ActivityCapabilityRecord,
  ManifestActivityRegistryPopulationResult,
} from "../extraction/types";
import {
  buildActivityRegistryHydrationDiagnostics,
  createEmptyActivityRegistryHydrationDiagnostics,
  type ActivityRegistryHydrationDiagnostics,
} from "../server/activity-registry-hydration-diagnostics";

export interface BootstrapActivityRegistryFromCapabilitiesOptions {
  readonly activeOnly?: boolean;
  readonly registry?: ActivityRegistry;
}

export interface BootstrapActivityRegistryFromCapabilitiesResult {
  readonly ok: boolean;
  readonly registry: ActivityRegistry;
  readonly diagnostics: ActivityRegistryHydrationDiagnostics;
  readonly population: ManifestActivityRegistryPopulationResult;
  readonly errors: readonly ActivityRegistrationIssue[];
}

/**
 * Populate an activity registry from capability manifests at bootstrap.
 * Platform catalogue must already be registered on the registry instance.
 */
export function bootstrapActivityRegistryFromCapabilities(
  records: readonly ActivityCapabilityRecord[],
  options: BootstrapActivityRegistryFromCapabilitiesOptions = {},
): BootstrapActivityRegistryFromCapabilitiesResult {
  const registry = options.registry ?? createDefaultActivityRegistry();
  const population = populateActivityRegistryFromCapabilities(registry, records, {
    activeOnly: options.activeOnly,
  });

  if (!population.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyActivityRegistryHydrationDiagnostics(),
      population,
      errors: population.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildActivityRegistryHydrationDiagnostics(registry),
    population,
    errors: [],
  };
}

export interface BootstrapActivityRegistryOptions {
  readonly platformVersion?: string;
  readonly capabilityRecords?: readonly ActivityCapabilityRecord[];
  readonly activeOnly?: boolean;
  readonly registry?: ActivityRegistry;
}

export interface BootstrapActivityRegistryResult {
  readonly ok: boolean;
  readonly registry: ActivityRegistry;
  readonly diagnostics: ActivityRegistryHydrationDiagnostics;
  readonly platform: PlatformActivityRegistrationResult;
  readonly capabilities: ManifestActivityRegistryPopulationResult;
  readonly errors: readonly ActivityRegistrationIssue[];
}

/**
 * Complete Activity Registry bootstrap — platform catalogue then capability manifests.
 * Both phases are atomic; capability registration is skipped when platform registration fails.
 */
export function bootstrapActivityRegistry(
  options: BootstrapActivityRegistryOptions = {},
): BootstrapActivityRegistryResult {
  const registry = options.registry ?? createDefaultActivityRegistry();
  const platform = registerPlatformActivityCatalogue(registry, {
    platformVersion: options.platformVersion,
  });

  if (!platform.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyActivityRegistryHydrationDiagnostics(),
      platform,
      capabilities: {
        ok: false,
        extractionOk: false,
        extractedCount: 0,
        scannedCapabilities: 0,
        registeredCount: 0,
        errors: [],
      },
      errors: platform.errors,
    };
  }

  const capabilities = populateActivityRegistryFromCapabilities(
    registry,
    options.capabilityRecords ?? [],
    { activeOnly: options.activeOnly },
  );

  if (!capabilities.ok) {
    return {
      ok: false,
      registry,
      diagnostics: buildActivityRegistryHydrationDiagnostics(registry),
      platform,
      capabilities,
      errors: capabilities.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildActivityRegistryHydrationDiagnostics(registry),
    platform,
    capabilities,
    errors: [],
  };
}
