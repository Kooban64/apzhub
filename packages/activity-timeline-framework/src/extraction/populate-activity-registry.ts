import type { ActivityRegistry } from "../registry/activity-registry";
import { extractActivityDescriptorsFromCapabilities } from "./extract-activities";
import type {
  ActivityCapabilityRecord,
  ManifestActivityRegistryPopulationResult,
} from "./types";

/**
 * Extract manifest activity types and register atomically.
 * When extraction or registration fails, the registry is unchanged.
 */
export function populateActivityRegistryFromCapabilities(
  registry: ActivityRegistry,
  records: readonly ActivityCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ManifestActivityRegistryPopulationResult {
  const extraction = extractActivityDescriptorsFromCapabilities(records, options);

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

  if (extraction.descriptors.length === 0) {
    registry.recordManifestCapabilities(extraction.diagnostics.capabilityIds);
    return {
      ok: true,
      extractionOk: true,
      extractedCount: 0,
      scannedCapabilities: extraction.diagnostics.scannedCapabilities,
      registeredCount: 0,
      errors: [],
    };
  }

  const registration = registry.registerManyAtomic(extraction.descriptors);

  if (registration.ok) {
    registry.recordManifestCapabilities(extraction.diagnostics.capabilityIds);
  }

  return {
    ...registration,
    extractionOk: true,
    extractedCount: extraction.descriptors.length,
    scannedCapabilities: extraction.diagnostics.scannedCapabilities,
  };
}
