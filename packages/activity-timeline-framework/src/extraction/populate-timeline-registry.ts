import type { TimelineRegistry } from "../timeline/timeline-registry";
import { extractTimelineDefinitionsFromCapabilities } from "./extract-timelines";
import type {
  ActivityCapabilityRecord,
  ManifestTimelineRegistryPopulationResult,
} from "./types";

/**
 * Extract manifest timeline definitions and register atomically.
 * When extraction or registration fails, the registry is unchanged.
 */
export function populateTimelineRegistryFromCapabilities(
  registry: TimelineRegistry,
  records: readonly ActivityCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ManifestTimelineRegistryPopulationResult {
  const extraction = extractTimelineDefinitionsFromCapabilities(records, options);

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

  if (extraction.definitions.length === 0) {
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

  const registration = registry.registerManyAtomic(extraction.definitions);

  if (registration.ok) {
    registry.recordManifestCapabilities(extraction.diagnostics.capabilityIds);
  }

  return {
    ...registration,
    extractionOk: true,
    extractedCount: extraction.definitions.length,
    scannedCapabilities: extraction.diagnostics.scannedCapabilities,
  };
}
