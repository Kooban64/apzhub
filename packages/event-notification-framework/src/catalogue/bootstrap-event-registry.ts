import { createDefaultEventRegistry } from "../event/default-event-registry";
import type { EventRegistry } from "../event/event-descriptor";
import type { EventRegistrationIssue } from "../event/event-metadata";
import {
  registerPlatformEventCatalogue,
  type PlatformEventRegistrationResult,
} from "../catalogue/register-platform-events";
import { populateRegistryFromCapabilities } from "../extraction/populate-registry";
import type {
  EventCapabilityRecord,
  ManifestEventRegistryPopulationResult,
} from "../extraction/types";
import {
  buildEventRegistryHydrationDiagnostics,
  createEmptyEventRegistryHydrationDiagnostics,
  type EventRegistryHydrationDiagnostics,
} from "../server/event-registry-hydration-diagnostics";

export interface BootstrapEventRegistryFromCapabilitiesOptions {
  readonly activeOnly?: boolean;
  readonly registry?: EventRegistry;
}

export interface BootstrapEventRegistryFromCapabilitiesResult {
  readonly ok: boolean;
  readonly registry: EventRegistry;
  readonly diagnostics: EventRegistryHydrationDiagnostics;
  readonly population: ManifestEventRegistryPopulationResult;
  readonly errors: readonly EventRegistrationIssue[];
}

/**
 * Populate an event registry from capability manifests at bootstrap.
 * Platform catalogue must already be registered on the registry instance.
 */
export function bootstrapEventRegistryFromCapabilities(
  records: readonly EventCapabilityRecord[],
  options: BootstrapEventRegistryFromCapabilitiesOptions = {},
): BootstrapEventRegistryFromCapabilitiesResult {
  const registry = options.registry ?? createDefaultEventRegistry();
  const population = populateRegistryFromCapabilities(registry, records, {
    activeOnly: options.activeOnly,
  });

  if (!population.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyEventRegistryHydrationDiagnostics(),
      population,
      errors: population.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildEventRegistryHydrationDiagnostics(registry),
    population,
    errors: [],
  };
}

export interface BootstrapEventRegistryOptions {
  readonly platformVersion?: string;
  readonly capabilityRecords?: readonly EventCapabilityRecord[];
  readonly activeOnly?: boolean;
  readonly registry?: EventRegistry;
}

export interface BootstrapEventRegistryResult {
  readonly ok: boolean;
  readonly registry: EventRegistry;
  readonly diagnostics: EventRegistryHydrationDiagnostics;
  readonly platform: PlatformEventRegistrationResult;
  readonly capabilities: ManifestEventRegistryPopulationResult;
  readonly errors: readonly EventRegistrationIssue[];
}

/**
 * Complete Event Registry bootstrap — platform catalogue then capability manifests.
 * Both phases are atomic; capability registration is skipped when platform registration fails.
 */
export function bootstrapEventRegistry(
  options: BootstrapEventRegistryOptions = {},
): BootstrapEventRegistryResult {
  const registry = options.registry ?? createDefaultEventRegistry();
  const platform = registerPlatformEventCatalogue(registry, {
    platformVersion: options.platformVersion,
  });

  if (!platform.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyEventRegistryHydrationDiagnostics(),
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

  const capabilities = populateRegistryFromCapabilities(
    registry,
    options.capabilityRecords ?? [],
    { activeOnly: options.activeOnly },
  );

  if (!capabilities.ok) {
    return {
      ok: false,
      registry,
      diagnostics: buildEventRegistryHydrationDiagnostics(registry),
      platform,
      capabilities,
      errors: capabilities.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildEventRegistryHydrationDiagnostics(registry),
    platform,
    capabilities,
    errors: [],
  };
}
