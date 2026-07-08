import { createDefaultNotificationRegistry } from "../notification/default-notification-registry";
import type { NotificationRegistry } from "../notification/notification-descriptor";
import type { NotificationRegistrationIssue } from "../notification/notification-metadata";
import {
  registerPlatformNotificationCatalogue,
  type PlatformNotificationRegistrationResult,
} from "../catalogue/register-platform-notifications";
import { populateNotificationRegistryFromCapabilities } from "../extraction/populate-notification-registry";
import type {
  EventCapabilityRecord,
  ManifestNotificationRegistryPopulationResult,
} from "../extraction/types";
import {
  buildNotificationRegistryHydrationDiagnostics,
  createEmptyNotificationRegistryHydrationDiagnostics,
  type NotificationRegistryHydrationDiagnostics,
} from "../server/notification-registry-hydration-diagnostics";

export interface BootstrapNotificationRegistryFromCapabilitiesOptions {
  readonly activeOnly?: boolean;
  readonly registry?: NotificationRegistry;
}

export interface BootstrapNotificationRegistryFromCapabilitiesResult {
  readonly ok: boolean;
  readonly registry: NotificationRegistry;
  readonly diagnostics: NotificationRegistryHydrationDiagnostics;
  readonly population: ManifestNotificationRegistryPopulationResult;
  readonly errors: readonly NotificationRegistrationIssue[];
}

/**
 * Populate a notification registry from capability manifests at bootstrap.
 * Platform catalogue must already be registered on the registry instance.
 */
export function bootstrapNotificationRegistryFromCapabilities(
  records: readonly EventCapabilityRecord[],
  options: BootstrapNotificationRegistryFromCapabilitiesOptions = {},
): BootstrapNotificationRegistryFromCapabilitiesResult {
  const registry = options.registry ?? createDefaultNotificationRegistry();
  const population = populateNotificationRegistryFromCapabilities(registry, records, {
    activeOnly: options.activeOnly,
  });

  if (!population.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyNotificationRegistryHydrationDiagnostics(),
      population,
      errors: population.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildNotificationRegistryHydrationDiagnostics(registry),
    population,
    errors: [],
  };
}

export interface BootstrapNotificationRegistryOptions {
  readonly platformVersion?: string;
  readonly capabilityRecords?: readonly EventCapabilityRecord[];
  readonly activeOnly?: boolean;
  readonly registry?: NotificationRegistry;
}

export interface BootstrapNotificationRegistryResult {
  readonly ok: boolean;
  readonly registry: NotificationRegistry;
  readonly diagnostics: NotificationRegistryHydrationDiagnostics;
  readonly platform: PlatformNotificationRegistrationResult;
  readonly capabilities: ManifestNotificationRegistryPopulationResult;
  readonly errors: readonly NotificationRegistrationIssue[];
}

/**
 * Complete Notification Registry bootstrap — platform catalogue then capability manifests.
 * Both phases are atomic; capability registration is skipped when platform registration fails.
 */
export function bootstrapNotificationRegistry(
  options: BootstrapNotificationRegistryOptions = {},
): BootstrapNotificationRegistryResult {
  const registry = options.registry ?? createDefaultNotificationRegistry();
  const platform = registerPlatformNotificationCatalogue(registry, {
    platformVersion: options.platformVersion,
  });

  if (!platform.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyNotificationRegistryHydrationDiagnostics(),
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

  const capabilities = populateNotificationRegistryFromCapabilities(
    registry,
    options.capabilityRecords ?? [],
    { activeOnly: options.activeOnly },
  );

  if (!capabilities.ok) {
    return {
      ok: false,
      registry,
      diagnostics: buildNotificationRegistryHydrationDiagnostics(registry),
      platform,
      capabilities,
      errors: capabilities.errors,
    };
  }

  return {
    ok: true,
    registry,
    diagnostics: buildNotificationRegistryHydrationDiagnostics(registry),
    platform,
    capabilities,
    errors: [],
  };
}
