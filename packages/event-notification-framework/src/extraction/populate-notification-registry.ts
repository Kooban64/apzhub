import type { NotificationRegistry } from "../notification/notification-descriptor";
import { extractNotificationDescriptorsFromCapabilities } from "./extract-notifications";
import type {
  EventCapabilityRecord,
  ManifestNotificationRegistryPopulationResult,
} from "./types";

/**
 * Extract manifest notification routes and register atomically.
 * When extraction or registration fails, the registry is unchanged.
 */
export function populateNotificationRegistryFromCapabilities(
  registry: NotificationRegistry,
  records: readonly EventCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ManifestNotificationRegistryPopulationResult {
  const extraction = extractNotificationDescriptorsFromCapabilities(records, options);

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
