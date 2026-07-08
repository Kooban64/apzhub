import type { ActivityRegistryDiagnostics } from "../types/activity-diagnostics";
import type { ActivityDescriptor } from "../types/activity-descriptor";
import type {
  ActivityMetadata,
  ActivityRegistryMetadata,
} from "../types/activity-metadata";
import type { ActivityBatchRegistrationResult } from "./activity-batch-registration";
import type { ActivityRegistry } from "./activity-registry";

const PLACEHOLDER_DIAGNOSTICS: ActivityRegistryDiagnostics = {
  status: "scaffold",
  registeredActivityTypeCount: 0,
  activeCount: 0,
  platformCount: 0,
  manifestCount: 0,
  activityTypeIds: [],
  duplicateActivityTypeIds: [],
  validationIssueCount: 0,
  categoryCounts: {},
  scopeCounts: {},
  manifestCapabilityCount: 0,
  issues: [],
  message: "Placeholder registry — use DefaultActivityRegistry",
};

const PLACEHOLDER_REGISTRY_METADATA: ActivityRegistryMetadata = Object.freeze({
  manifestCapabilityCount: 0,
  activityMetadata: [],
});

function notImplementedBatch(): ActivityBatchRegistrationResult {
  return {
    ok: false,
    registeredCount: 0,
    errors: [
      {
        code: "VALIDATION",
        message: "Placeholder registry — use DefaultActivityRegistry",
      },
    ],
  };
}

/** No-op registry for test injection before bootstrap wiring. */
export class PlaceholderActivityRegistry implements ActivityRegistry {
  register(_descriptor: ActivityDescriptor): void {
    // Placeholder
  }

  registerMany(_descriptors: readonly ActivityDescriptor[]): void {
    // Placeholder
  }

  registerManyAtomic(
    _descriptors: readonly ActivityDescriptor[],
  ): ActivityBatchRegistrationResult {
    return notImplementedBatch();
  }

  replace(_descriptor: ActivityDescriptor): void {
    // Placeholder
  }

  has(_activityTypeId: string): boolean {
    return false;
  }

  get(_activityTypeId: string): ActivityDescriptor | undefined {
    return undefined;
  }

  list(): readonly ActivityDescriptor[] {
    return [];
  }

  clear(): void {
    // Placeholder
  }

  getMetadata(_activityTypeId: string): ActivityMetadata | undefined {
    return undefined;
  }

  listMetadata(): readonly ActivityMetadata[] {
    return [];
  }

  getRegistryMetadata(): ActivityRegistryMetadata {
    return PLACEHOLDER_REGISTRY_METADATA;
  }

  recordManifestCapabilities(_capabilityIds: readonly string[]): void {
    // Placeholder
  }

  recordPlatformCatalogue(_version: string): void {
    // Placeholder
  }

  recordFrameworkVersion(_version: string): void {
    // Placeholder
  }

  getDiagnostics(): ActivityRegistryDiagnostics {
    return PLACEHOLDER_DIAGNOSTICS;
  }
}

export function createPlaceholderActivityRegistry(): ActivityRegistry {
  return new PlaceholderActivityRegistry();
}
