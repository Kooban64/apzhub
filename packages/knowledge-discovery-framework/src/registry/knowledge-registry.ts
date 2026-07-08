import type { KnowledgeDiagnostics } from "../types/knowledge-diagnostics";
import type {
  KnowledgeRegistryMetadata,
  KnowledgeSourceMetadata,
} from "../types/knowledge-metadata";
import type { KnowledgeSource } from "../types/knowledge-source";
import type { KnowledgeProvider } from "../provider/knowledge-provider";
import type { KnowledgeBatchRegistrationResult } from "./knowledge-batch-registration";

/**
 * In-memory knowledge source and provider registry.
 * Registration and validation only — no search, indexing, persistence, or query execution.
 */
export interface KnowledgeRegistry {
  registerSource(source: KnowledgeSource): void;
  registerManySources(sources: readonly KnowledgeSource[]): void;
  registerManySourcesAtomic(
    sources: readonly KnowledgeSource[],
  ): KnowledgeBatchRegistrationResult;
  registerProvider(provider: KnowledgeProvider): void;
  registerManyProviders(providers: readonly KnowledgeProvider[]): void;
  registerManyProvidersAtomic(
    providers: readonly KnowledgeProvider[],
  ): KnowledgeBatchRegistrationResult;
  replaceSource(source: KnowledgeSource): void;
  hasSource(sourceId: string): boolean;
  hasProvider(sourceId: string): boolean;
  getSource(sourceId: string): KnowledgeSource | undefined;
  getProvider(sourceId: string): KnowledgeProvider | undefined;
  getMetadata(sourceId: string): KnowledgeSourceMetadata | undefined;
  listSources(): readonly KnowledgeSource[];
  listProviders(): readonly KnowledgeProvider[];
  listMetadata(): readonly KnowledgeSourceMetadata[];
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordFrameworkVersion(version: string): void;
  clear(): void;
  getDiagnostics(): KnowledgeDiagnostics;
  getRegistryMetadata(): KnowledgeRegistryMetadata;
}

export type KnowledgeRegistryFactory = () => KnowledgeRegistry;
