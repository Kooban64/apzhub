import { getKnowledgeProviderSourceId } from "../provider/knowledge-provider";
import type { KnowledgeProvider } from "../provider/knowledge-provider";
import type {
  KnowledgeDiagnostics,
  KnowledgeRegistrationIssue,
} from "../types/knowledge-diagnostics";
import type {
  KnowledgeRegistryMetadata,
  KnowledgeSourceMetadata,
} from "../types/knowledge-metadata";
import type { KnowledgeSource } from "../types/knowledge-source";
import {
  buildKnowledgeSourceMetadata,
  summariseHealthStatus,
} from "./build-source-metadata";
import { freezeKnowledgeSource } from "./freeze";
import type { KnowledgeBatchRegistrationResult } from "./knowledge-batch-registration";
import type { KnowledgeRegistry } from "./knowledge-registry";
import {
  KnowledgeRegistryDuplicateError,
  KnowledgeRegistryNotFoundError,
} from "./registry-errors";
import {
  collectDuplicateProviderIssues,
  collectDuplicateSourceIssues,
  collectProviderValidationIssues,
  collectSourceValidationIssues,
  validateKnowledgeProvider,
  validateKnowledgeSource,
} from "./validate-knowledge-source";

function duplicateIssuesFromIds(
  duplicateSourceIds: readonly string[],
): KnowledgeRegistrationIssue[] {
  return duplicateSourceIds.map((sourceId) => ({
    code: "DUPLICATE_ID" as const,
    sourceId,
    message: `Duplicate knowledge source id: ${sourceId}`,
  }));
}

/**
 * Default in-memory Knowledge Registry — registration, validation, diagnostics only.
 * Does not search, index, persist, or invoke provider.query().
 */
export class DefaultKnowledgeRegistry implements KnowledgeRegistry {
  private readonly sources = new Map<string, KnowledgeSource>();
  private readonly providers = new Map<string, KnowledgeProvider>();
  private manifestCapabilities: readonly string[] = [];
  private frameworkVersion: string | undefined;

  registerSource(source: KnowledgeSource): void {
    validateKnowledgeSource(source);

    if (this.sources.has(source.id)) {
      throw new KnowledgeRegistryDuplicateError(source.id);
    }

    this.sources.set(source.id, freezeKnowledgeSource(source));
  }

  registerManySources(sources: readonly KnowledgeSource[]): void {
    for (const source of sources) {
      validateKnowledgeSource(source);
    }

    const duplicateIssues = collectDuplicateSourceIssues(
      sources,
      new Set(this.sources.keys()),
    );
    if (duplicateIssues.length > 0) {
      throw new KnowledgeRegistryDuplicateError(duplicateIssues[0]!.sourceId!);
    }

    for (const source of sources) {
      this.sources.set(source.id, freezeKnowledgeSource(source));
    }
  }

  registerManySourcesAtomic(
    sources: readonly KnowledgeSource[],
  ): KnowledgeBatchRegistrationResult {
    const validationIssues = collectSourceValidationIssues(sources);
    if (validationIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...validationIssues]),
      };
    }

    const duplicateIssues = collectDuplicateSourceIssues(
      sources,
      new Set(this.sources.keys()),
    );
    if (duplicateIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...duplicateIssues]),
      };
    }

    for (const source of sources) {
      this.sources.set(source.id, freezeKnowledgeSource(source));
    }

    return {
      ok: true,
      registeredCount: sources.length,
      errors: [],
    };
  }

  registerProvider(provider: KnowledgeProvider): void {
    validateKnowledgeProvider(provider);

    const sourceId = getKnowledgeProviderSourceId(provider);
    if (this.providers.has(sourceId)) {
      throw new KnowledgeRegistryDuplicateError(sourceId);
    }

    if (!this.sources.has(sourceId)) {
      this.sources.set(sourceId, freezeKnowledgeSource(provider.source));
    } else if (this.sources.get(sourceId)?.id !== provider.source.id) {
      throw new KnowledgeRegistryDuplicateError(sourceId);
    }

    this.providers.set(sourceId, provider);
  }

  registerManyProviders(providers: readonly KnowledgeProvider[]): void {
    for (const provider of providers) {
      validateKnowledgeProvider(provider);
    }

    const duplicateIssues = collectDuplicateProviderIssues(
      providers,
      new Set(this.providers.keys()),
    );
    if (duplicateIssues.length > 0) {
      throw new KnowledgeRegistryDuplicateError(duplicateIssues[0]!.sourceId!);
    }

    for (const provider of providers) {
      const sourceId = getKnowledgeProviderSourceId(provider);
      if (!this.sources.has(sourceId)) {
        this.sources.set(sourceId, freezeKnowledgeSource(provider.source));
      }
      this.providers.set(sourceId, provider);
    }
  }

  registerManyProvidersAtomic(
    providers: readonly KnowledgeProvider[],
  ): KnowledgeBatchRegistrationResult {
    const validationIssues = collectProviderValidationIssues(providers);
    if (validationIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...validationIssues]),
      };
    }

    const duplicateIssues = collectDuplicateProviderIssues(
      providers,
      new Set(this.providers.keys()),
    );
    if (duplicateIssues.length > 0) {
      return {
        ok: false,
        registeredCount: 0,
        errors: Object.freeze([...duplicateIssues]),
      };
    }

    for (const provider of providers) {
      const sourceId = getKnowledgeProviderSourceId(provider);
      if (!this.sources.has(sourceId)) {
        this.sources.set(sourceId, freezeKnowledgeSource(provider.source));
      }
      this.providers.set(sourceId, provider);
    }

    return {
      ok: true,
      registeredCount: providers.length,
      errors: [],
    };
  }

  replaceSource(source: KnowledgeSource): void {
    validateKnowledgeSource(source);

    if (!this.sources.has(source.id)) {
      throw new KnowledgeRegistryNotFoundError(source.id);
    }

    this.sources.set(source.id, freezeKnowledgeSource(source));
  }

  hasSource(sourceId: string): boolean {
    return this.sources.has(sourceId);
  }

  hasProvider(sourceId: string): boolean {
    return this.providers.has(sourceId);
  }

  getSource(sourceId: string): KnowledgeSource | undefined {
    return this.sources.get(sourceId);
  }

  getProvider(sourceId: string): KnowledgeProvider | undefined {
    return this.providers.get(sourceId);
  }

  getMetadata(sourceId: string): KnowledgeSourceMetadata | undefined {
    const source = this.sources.get(sourceId);
    if (!source) {
      return undefined;
    }

    return buildKnowledgeSourceMetadata(source, this.providers.get(sourceId));
  }

  listSources(): readonly KnowledgeSource[] {
    return Object.freeze(
      [...this.sources.values()].sort((left, right) => left.priority - right.priority),
    );
  }

  listProviders(): readonly KnowledgeProvider[] {
    return Object.freeze(
      [...this.providers.values()].sort(
        (left, right) => left.source.priority - right.source.priority,
      ),
    );
  }

  listMetadata(): readonly KnowledgeSourceMetadata[] {
    return Object.freeze(
      this.listSources().map((source) =>
        buildKnowledgeSourceMetadata(source, this.providers.get(source.id)),
      ),
    );
  }

  recordManifestCapabilities(capabilityIds: readonly string[]): void {
    this.manifestCapabilities = Object.freeze([...capabilityIds].sort());
  }

  recordFrameworkVersion(version: string): void {
    this.frameworkVersion = version;
  }

  clear(): void {
    this.sources.clear();
    this.providers.clear();
    this.manifestCapabilities = [];
    this.frameworkVersion = undefined;
  }

  getRegistryMetadata(): KnowledgeRegistryMetadata {
    const sourceMetadata = this.listMetadata();

    return Object.freeze({
      frameworkVersion: this.frameworkVersion,
      manifestCapabilityCount: this.manifestCapabilities.length,
      manifestCapabilities:
        this.manifestCapabilities.length > 0 ? this.manifestCapabilities : undefined,
      sourceMetadata,
    });
  }

  getDiagnostics(): KnowledgeDiagnostics {
    const sourceIds = Object.freeze([...this.sources.keys()].sort());
    const metadata = this.listMetadata();
    const healthSummary = summariseHealthStatus(metadata);
    const duplicateSourceIds = Object.freeze([] as string[]);
    const issues = duplicateIssuesFromIds(duplicateSourceIds);

    let status: KnowledgeDiagnostics["status"] = "ready";
    if (sourceIds.length === 0) {
      status = "empty";
    } else if (healthSummary.degraded > 0) {
      status = "degraded";
    }

    return {
      status,
      registeredSourceCount: this.sources.size,
      registeredProviderCount: this.providers.size,
      sourceIds,
      validationIssueCount: 0,
      healthSummary,
      duplicateSourceIds,
      issues,
      frameworkVersion: this.frameworkVersion,
      manifestCapabilityCount: this.manifestCapabilities.length,
      message:
        healthSummary.degraded > 0
          ? "One or more sources registered without providers"
          : undefined,
    };
  }
}

export function createDefaultKnowledgeRegistry(): KnowledgeRegistry {
  return new DefaultKnowledgeRegistry();
}

export const defaultKnowledgeRegistryFactory = createDefaultKnowledgeRegistry;
