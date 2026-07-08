import type { KnowledgeProvider } from "../provider/knowledge-provider";
import type { KnowledgeDiagnostics } from "../types/knowledge-diagnostics";
import type {
  KnowledgeRegistryMetadata,
  KnowledgeSourceMetadata,
} from "../types/knowledge-metadata";
import type { KnowledgeSource } from "../types/knowledge-source";
import type { KnowledgeBatchRegistrationResult } from "./knowledge-batch-registration";
import type { KnowledgeRegistry } from "./knowledge-registry";

const EMPTY_HEALTH_SUMMARY = Object.freeze({
  healthy: 0,
  degraded: 0,
  planned: 0,
  disabled: 0,
  unknown: 0,
});

const PLACEHOLDER_DIAGNOSTICS: KnowledgeDiagnostics = {
  status: "scaffold",
  registeredSourceCount: 0,
  registeredProviderCount: 0,
  sourceIds: [],
  validationIssueCount: 0,
  healthSummary: EMPTY_HEALTH_SUMMARY,
  duplicateSourceIds: [],
  issues: [],
  manifestCapabilityCount: 0,
  message: "Placeholder registry — use DefaultKnowledgeRegistry",
};

const PLACEHOLDER_REGISTRY_METADATA: KnowledgeRegistryMetadata = Object.freeze({
  manifestCapabilityCount: 0,
  sourceMetadata: [],
});

function notImplementedBatch(): KnowledgeBatchRegistrationResult {
  return {
    ok: false,
    registeredCount: 0,
    errors: [
      {
        code: "VALIDATION",
        message: "Placeholder registry — use DefaultKnowledgeRegistry",
      },
    ],
  };
}

/** No-op registry for composition roots before bootstrap wiring. */
export class PlaceholderKnowledgeRegistry implements KnowledgeRegistry {
  registerSource(_source: KnowledgeSource): void {
    // Placeholder
  }

  registerManySources(_sources: readonly KnowledgeSource[]): void {
    // Placeholder
  }

  registerManySourcesAtomic(
    _sources: readonly KnowledgeSource[],
  ): KnowledgeBatchRegistrationResult {
    return notImplementedBatch();
  }

  registerProvider(_provider: KnowledgeProvider): void {
    // Placeholder
  }

  registerManyProviders(_providers: readonly KnowledgeProvider[]): void {
    // Placeholder
  }

  registerManyProvidersAtomic(
    _providers: readonly KnowledgeProvider[],
  ): KnowledgeBatchRegistrationResult {
    return notImplementedBatch();
  }

  replaceSource(_source: KnowledgeSource): void {
    // Placeholder
  }

  hasSource(_sourceId: string): boolean {
    return false;
  }

  hasProvider(_sourceId: string): boolean {
    return false;
  }

  getSource(_sourceId: string): KnowledgeSource | undefined {
    return undefined;
  }

  getProvider(_sourceId: string): KnowledgeProvider | undefined {
    return undefined;
  }

  getMetadata(_sourceId: string): KnowledgeSourceMetadata | undefined {
    return undefined;
  }

  listSources(): readonly KnowledgeSource[] {
    return [];
  }

  listProviders(): readonly KnowledgeProvider[] {
    return [];
  }

  listMetadata(): readonly KnowledgeSourceMetadata[] {
    return [];
  }

  recordManifestCapabilities(_capabilityIds: readonly string[]): void {
    // Placeholder
  }

  recordFrameworkVersion(_version: string): void {
    // Placeholder
  }

  clear(): void {
    // Placeholder
  }

  getDiagnostics(): KnowledgeDiagnostics {
    return PLACEHOLDER_DIAGNOSTICS;
  }

  getRegistryMetadata(): KnowledgeRegistryMetadata {
    return PLACEHOLDER_REGISTRY_METADATA;
  }
}

export function createPlaceholderKnowledgeRegistry(): KnowledgeRegistry {
  return new PlaceholderKnowledgeRegistry();
}
