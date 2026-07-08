import type { EventRegistry } from "../event/event-descriptor";
import { extractEventDescriptorsFromCapabilities } from "./extract-events";
import type {
  EventCapabilityRecord,
  ManifestEventRegistryPopulationResult,
} from "./types";

/**
 * Extract manifest events and register atomically.
 * When extraction or registration fails, the registry is unchanged.
 */
export function populateRegistryFromCapabilities(
  registry: EventRegistry,
  records: readonly EventCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ManifestEventRegistryPopulationResult {
  const extraction = extractEventDescriptorsFromCapabilities(records, options);

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
