import { createDefaultActionRegistry } from "../registry";
import type { ActionRegistry } from "../registry";
import type { ActionCapabilityRecord } from "../extraction/types";
import type { ManifestRegistryPopulationResult } from "../extraction/populate-registry";
import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import { bootstrapActionRegistryFromCapabilities } from "../server/bootstrap-action-registry";
import {
  buildActionRegistryHydrationDiagnostics,
  createEmptyActionRegistryHydrationDiagnostics,
  type ActionRegistryHydrationDiagnostics,
} from "../server/action-registry-hydration-diagnostics";
import {
  createEmptyActionRegistryDto,
  type ActionRegistryDto,
  type ActionToolbarRegionDto,
} from "../server/map-action-registry-dto";
import {
  registerPlatformActionCatalogue,
  type PlatformActionRegistrationResult,
} from "./register-platform-actions";
import type { ActionFrameworkPlatformVersion } from "./platform-version";
import {
  bootstrapShortcutRegistry,
  type BootstrapShortcutRegistryResult,
} from "../shortcuts";

export interface BootstrapActionRegistryOptions {
  readonly platformVersion?: ActionFrameworkPlatformVersion | string;
  readonly capabilityRecords?: readonly ActionCapabilityRecord[];
  readonly activeOnly?: boolean;
  readonly registry?: ActionRegistry;
  readonly toolbar?: readonly ActionToolbarRegionDto[];
}

export interface BootstrapActionRegistryResult {
  readonly ok: boolean;
  readonly registry: ActionRegistry;
  readonly shortcuts: BootstrapShortcutRegistryResult;
  readonly dto: ActionRegistryDto;
  readonly diagnostics: ActionRegistryHydrationDiagnostics;
  readonly platform: PlatformActionRegistrationResult;
  readonly capabilities: ManifestRegistryPopulationResult;
  readonly errors: readonly ActionRegistrationIssue[];
}

/**
 * Complete Action Framework bootstrap — platform catalogue then capability manifests.
 * Both phases are atomic; capability registration is skipped when platform registration fails.
 */
export function bootstrapActionRegistry(
  options: BootstrapActionRegistryOptions = {},
): BootstrapActionRegistryResult {
  const registry = options.registry ?? createDefaultActionRegistry();
  const platform = registerPlatformActionCatalogue(registry, {
    platformVersion: options.platformVersion,
  });

  if (!platform.ok) {
    return {
      ok: false,
      registry,
      shortcuts: bootstrapShortcutRegistry([]),
      dto: createEmptyActionRegistryDto(),
      diagnostics: createEmptyActionRegistryHydrationDiagnostics(),
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

  const capabilities = bootstrapActionRegistryFromCapabilities(
    options.capabilityRecords ?? [],
    {
      registry,
      activeOnly: options.activeOnly,
      toolbar: options.toolbar,
    },
  );

  if (!capabilities.ok) {
    return {
      ok: false,
      registry,
      shortcuts: bootstrapShortcutRegistry(registry.list()),
      dto: createEmptyActionRegistryDto(),
      diagnostics: createEmptyActionRegistryHydrationDiagnostics(),
      platform,
      capabilities: capabilities.population,
      errors: capabilities.errors,
    };
  }

  const dto = capabilities.dto;
  const diagnostics = buildActionRegistryHydrationDiagnostics(registry, dto);
  const shortcuts = bootstrapShortcutRegistry(registry.list());

  return {
    ok: true,
    registry,
    shortcuts,
    dto,
    diagnostics,
    platform,
    capabilities: capabilities.population,
    errors: [],
  };
}
