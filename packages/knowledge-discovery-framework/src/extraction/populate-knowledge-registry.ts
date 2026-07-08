import type { KnowledgeRegistry } from "../registry/knowledge-registry";
import type { KnowledgeBatchRegistrationResult } from "../registry/knowledge-batch-registration";
import { extractKnowledgeSourcesFromCapabilities } from "./extract-knowledge-sources";
import type { KnowledgeCapabilityRecord } from "./types";

export interface ManifestKnowledgePopulationResult extends KnowledgeBatchRegistrationResult {
  readonly extractionOk: boolean;
  readonly extractedCount: number;
  readonly scannedCapabilities: number;
}

/**
 * Extract manifest knowledge sources and register atomically.
 * When extraction or registration fails, the registry is unchanged.
 */
export function populateKnowledgeRegistryFromCapabilities(
  registry: KnowledgeRegistry,
  records: readonly KnowledgeCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ManifestKnowledgePopulationResult {
  const extraction = extractKnowledgeSourcesFromCapabilities(records, options);

  if (!extraction.ok) {
    return {
      ok: false,
      extractionOk: false,
      extractedCount: 0,
      scannedCapabilities: extraction.diagnostics.scannedCapabilities,
      registeredCount: 0,
      errors: extraction.errors,
    };
  }

  const registration = registry.registerManySourcesAtomic(extraction.sources);

  if (registration.ok) {
    registry.recordManifestCapabilities(extraction.diagnostics.capabilityIds);
  }

  return {
    ...registration,
    extractionOk: true,
    extractedCount: extraction.sources.length,
    scannedCapabilities: extraction.diagnostics.scannedCapabilities,
  };
}
