import type { ActionRegistry } from "../registry/action-registry";
import type { ActionBatchRegistrationResult } from "../registry/action-batch-registration";
import { extractActionDescriptorsFromCapabilities } from "./extract-actions";
import type { ActionCapabilityRecord } from "./types";

export interface ManifestRegistryPopulationResult extends ActionBatchRegistrationResult {
  readonly extractionOk: boolean;
  readonly extractedCount: number;
  readonly scannedCapabilities: number;
}

/**
 * Extract manifest actions and register atomically.
 * When extraction or registration fails, the registry is unchanged.
 */
export function populateRegistryFromCapabilities(
  registry: ActionRegistry,
  records: readonly ActionCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ManifestRegistryPopulationResult {
  const extraction = extractActionDescriptorsFromCapabilities(records, options);

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

  const registration = registry.registerManyAtomic(extraction.descriptors);

  if (registration.ok) {
    registry.recordManifestSource(extraction.diagnostics.capabilityIds);
  }

  return {
    ...registration,
    extractionOk: true,
    extractedCount: extraction.descriptors.length,
    scannedCapabilities: extraction.diagnostics.scannedCapabilities,
  };
}
