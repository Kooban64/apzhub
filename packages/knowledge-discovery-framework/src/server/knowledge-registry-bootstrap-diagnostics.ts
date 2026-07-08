import type { KnowledgeDiagnostics } from "../types/knowledge-diagnostics";
import type { KnowledgeRegistry } from "../registry/knowledge-registry";
import type { KnowledgeRegistryMetadata } from "../types/knowledge-metadata";

function mapRegistryStatusToBootstrap(
  registryStatus: KnowledgeDiagnostics["status"],
): KnowledgeRegistryBootstrapDiagnostics["status"] {
  if (registryStatus === "scaffold") {
    return "empty";
  }
  return registryStatus;
}

export interface KnowledgeRegistryBootstrapDiagnostics {
  readonly status: "ready" | "empty" | "degraded" | "failed";
  readonly platformCatalogueRegistered: number;
  readonly manifestSourcesRegistered: number;
  readonly manifestCapabilitiesScanned: number;
  readonly registry: KnowledgeDiagnostics;
  readonly metadata: KnowledgeRegistryMetadata;
}

export function buildKnowledgeRegistryBootstrapDiagnostics(
  registry: KnowledgeRegistry,
  options: {
    readonly platformCatalogueRegistered: number;
    readonly manifestSourcesRegistered: number;
    readonly manifestCapabilitiesScanned: number;
    readonly bootstrapOk: boolean;
  },
): KnowledgeRegistryBootstrapDiagnostics {
  const registryDiagnostics = registry.getDiagnostics();
  const metadata = registry.getRegistryMetadata();

  let status: KnowledgeRegistryBootstrapDiagnostics["status"] =
    mapRegistryStatusToBootstrap(registryDiagnostics.status);
  if (!options.bootstrapOk) {
    status = "failed";
  }

  return {
    status,
    platformCatalogueRegistered: options.platformCatalogueRegistered,
    manifestSourcesRegistered: options.manifestSourcesRegistered,
    manifestCapabilitiesScanned: options.manifestCapabilitiesScanned,
    registry: registryDiagnostics,
    metadata,
  };
}

export function createEmptyKnowledgeRegistryBootstrapDiagnostics(): KnowledgeRegistryBootstrapDiagnostics {
  return {
    status: "failed",
    platformCatalogueRegistered: 0,
    manifestSourcesRegistered: 0,
    manifestCapabilitiesScanned: 0,
    registry: {
      status: "empty",
      registeredSourceCount: 0,
      registeredProviderCount: 0,
      sourceIds: [],
      validationIssueCount: 0,
      healthSummary: {
        healthy: 0,
        degraded: 0,
        planned: 0,
        disabled: 0,
        unknown: 0,
      },
      duplicateSourceIds: [],
      issues: [],
      manifestCapabilityCount: 0,
    },
    metadata: {
      manifestCapabilityCount: 0,
      sourceMetadata: [],
    },
  };
}
