import type { TimelineRegistry } from "../timeline/timeline-registry";
import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import { createDefaultTimelineRegistry } from "../timeline/default-timeline-registry";
import {
  registerPlatformTimelineCatalogue,
  type PlatformTimelineRegistrationResult,
} from "../catalogue/register-platform-timelines";
import { populateTimelineRegistryFromCapabilities } from "../extraction/populate-timeline-registry";
import type {
  ActivityCapabilityRecord,
  ManifestTimelineRegistryPopulationResult,
} from "../extraction/types";
import {
  buildTimelineRegistryHydrationDiagnostics,
  createEmptyTimelineRegistryHydrationDiagnostics,
  type TimelineRegistryHydrationDiagnostics,
} from "../server/timeline-registry-hydration-diagnostics";

export interface BootstrapTimelineRegistryFromCapabilitiesOptions {
  readonly activeOnly?: boolean;
  readonly registry?: TimelineRegistry;
}

export interface BootstrapTimelineRegistryFromCapabilitiesResult {
  readonly ok: boolean;
  readonly registry: TimelineRegistry;
  readonly diagnostics: TimelineRegistryHydrationDiagnostics;
  readonly population: ManifestTimelineRegistryPopulationResult;
  readonly errors: readonly TimelineRegistrationIssue[];
}

/**
 * Populate a timeline registry from capability manifests at bootstrap.
 * Platform catalogue must already be registered on the registry instance.
 */
export function bootstrapTimelineRegistryFromCapabilities(
  records: readonly ActivityCapabilityRecord[],
  options: BootstrapTimelineRegistryFromCapabilitiesOptions = {},
): BootstrapTimelineRegistryFromCapabilitiesResult {
  const registry = options.registry ?? createDefaultTimelineRegistry();
  const population = populateTimelineRegistryFromCapabilities(registry, records, {
    activeOnly: options.activeOnly,
  });

  if (!population.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyTimelineRegistryHydrationDiagnostics(),
      population,
      errors: population.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildTimelineRegistryHydrationDiagnostics(registry),
    population,
    errors: [],
  };
}

export interface BootstrapTimelineRegistryOptions {
  readonly platformVersion?: string;
  readonly capabilityRecords?: readonly ActivityCapabilityRecord[];
  readonly activeOnly?: boolean;
  readonly registry?: TimelineRegistry;
}

export interface BootstrapTimelineRegistryResult {
  readonly ok: boolean;
  readonly registry: TimelineRegistry;
  readonly diagnostics: TimelineRegistryHydrationDiagnostics;
  readonly platform: PlatformTimelineRegistrationResult;
  readonly capabilities: ManifestTimelineRegistryPopulationResult;
  readonly errors: readonly TimelineRegistrationIssue[];
}

/**
 * Complete Timeline Registry bootstrap — platform catalogue then capability manifests.
 * Both phases are atomic; capability registration is skipped when platform registration fails.
 */
export function bootstrapTimelineRegistry(
  options: BootstrapTimelineRegistryOptions = {},
): BootstrapTimelineRegistryResult {
  const registry = options.registry ?? createDefaultTimelineRegistry();
  const platform = registerPlatformTimelineCatalogue(registry, {
    platformVersion: options.platformVersion,
  });

  if (!platform.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyTimelineRegistryHydrationDiagnostics(),
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

  const capabilities = populateTimelineRegistryFromCapabilities(
    registry,
    options.capabilityRecords ?? [],
    { activeOnly: options.activeOnly },
  );

  if (!capabilities.ok) {
    return {
      ok: false,
      registry,
      diagnostics: buildTimelineRegistryHydrationDiagnostics(registry),
      platform,
      capabilities,
      errors: capabilities.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildTimelineRegistryHydrationDiagnostics(registry),
    platform,
    capabilities,
    errors: [],
  };
}
