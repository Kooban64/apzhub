import {
  registerPlatformKnowledgeSourceCatalogue,
  type RegisterPlatformKnowledgeSourcesResult,
} from "../catalogue/register-platform-knowledge-sources";
import {
  populateKnowledgeRegistryFromCapabilities,
  type ManifestKnowledgePopulationResult,
} from "../extraction/populate-knowledge-registry";
import type { KnowledgeCapabilityRecord } from "../extraction/types";
import { createDefaultKnowledgeRegistry } from "../registry/default-knowledge-registry";
import type { KnowledgeRegistry } from "../registry/knowledge-registry";
import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import {
  buildKnowledgeRegistryBootstrapDiagnostics,
  createEmptyKnowledgeRegistryBootstrapDiagnostics,
  type KnowledgeRegistryBootstrapDiagnostics,
} from "./knowledge-registry-bootstrap-diagnostics";

export interface BootstrapKnowledgeRegistryOptions {
  readonly frameworkVersion?: string;
  readonly capabilityRecords?: readonly KnowledgeCapabilityRecord[];
  readonly activeOnly?: boolean;
  readonly registry?: KnowledgeRegistry;
}

export interface BootstrapKnowledgeRegistryResult {
  readonly ok: boolean;
  readonly registry: KnowledgeRegistry;
  readonly diagnostics: KnowledgeRegistryBootstrapDiagnostics;
  readonly platform: RegisterPlatformKnowledgeSourcesResult;
  readonly capabilities: ManifestKnowledgePopulationResult;
  readonly errors: readonly KnowledgeRegistrationIssue[];
}

/**
 * Complete Knowledge Registry bootstrap:
 * Platform catalogue (T0 references) → manifest `knowledge.sources` extraction → atomic registration.
 * No provider execution. No orchestration.
 */
export function bootstrapKnowledgeRegistry(
  options: BootstrapKnowledgeRegistryOptions = {},
): BootstrapKnowledgeRegistryResult {
  const registry = options.registry ?? createDefaultKnowledgeRegistry();
  const platform = registerPlatformKnowledgeSourceCatalogue(registry, {
    frameworkVersion: options.frameworkVersion,
  });

  if (!platform.ok) {
    return {
      ok: false,
      registry,
      diagnostics: createEmptyKnowledgeRegistryBootstrapDiagnostics(),
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

  const capabilities = populateKnowledgeRegistryFromCapabilities(
    registry,
    options.capabilityRecords ?? [],
    { activeOnly: options.activeOnly },
  );

  if (!capabilities.ok) {
    return {
      ok: false,
      registry,
      diagnostics: buildKnowledgeRegistryBootstrapDiagnostics(registry, {
        platformCatalogueRegistered: platform.registeredCount,
        manifestSourcesRegistered: 0,
        manifestCapabilitiesScanned: capabilities.scannedCapabilities,
        bootstrapOk: false,
      }),
      platform,
      capabilities,
      errors: capabilities.errors,
    };
  }

  const diagnostics = buildKnowledgeRegistryBootstrapDiagnostics(registry, {
    platformCatalogueRegistered: platform.registeredCount,
    manifestSourcesRegistered: capabilities.registeredCount,
    manifestCapabilitiesScanned: capabilities.scannedCapabilities,
    bootstrapOk: true,
  });

  return {
    ok: true,
    registry,
    diagnostics,
    platform,
    capabilities,
    errors: [],
  };
}

export {
  populateKnowledgeRegistryFromCapabilities,
  type ManifestKnowledgePopulationResult,
} from "../extraction/populate-knowledge-registry";

export type { KnowledgeCapabilityRecord } from "../extraction/types";
