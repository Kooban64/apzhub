import type { TimelineRegistryDiagnostics } from "../types/timeline-diagnostics";
import type { TimelineDefinition } from "../types/timeline-definition";
import type {
  TimelineMetadata,
  TimelineRegistryMetadata,
} from "../types/timeline-metadata";
import type { TimelineBatchRegistrationResult } from "./timeline-batch-registration";
import type { TimelineRegistry } from "./timeline-registry";

const PLACEHOLDER_DIAGNOSTICS: TimelineRegistryDiagnostics = {
  status: "scaffold",
  registeredTimelineCount: 0,
  activeCount: 0,
  platformCount: 0,
  manifestCount: 0,
  timelineIds: [],
  duplicateTimelineIds: [],
  validationIssueCount: 0,
  scopeCounts: {},
  manifestCapabilityCount: 0,
  issues: [],
  message: "Placeholder timeline registry — use DefaultTimelineRegistry",
};

const PLACEHOLDER_REGISTRY_METADATA: TimelineRegistryMetadata = Object.freeze({
  manifestCapabilityCount: 0,
  timelineMetadata: [],
});

function notImplementedBatch(): TimelineBatchRegistrationResult {
  return {
    ok: false,
    registeredCount: 0,
    errors: [
      {
        code: "VALIDATION",
        message: "Placeholder timeline registry — use DefaultTimelineRegistry",
      },
    ],
  };
}

/** No-op timeline registry for test injection. */
export class PlaceholderTimelineRegistry implements TimelineRegistry {
  register(_definition: TimelineDefinition): void {
    // Placeholder
  }

  registerMany(_definitions: readonly TimelineDefinition[]): void {
    // Placeholder
  }

  registerManyAtomic(
    _definitions: readonly TimelineDefinition[],
  ): TimelineBatchRegistrationResult {
    return notImplementedBatch();
  }

  replace(_definition: TimelineDefinition): void {
    // Placeholder
  }

  has(_timelineId: string): boolean {
    return false;
  }

  get(_timelineId: string): TimelineDefinition | undefined {
    return undefined;
  }

  list(): readonly TimelineDefinition[] {
    return [];
  }

  clear(): void {
    // Placeholder
  }

  getMetadata(_timelineId: string): TimelineMetadata | undefined {
    return undefined;
  }

  listMetadata(): readonly TimelineMetadata[] {
    return [];
  }

  getRegistryMetadata(): TimelineRegistryMetadata {
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

  getDiagnostics(): TimelineRegistryDiagnostics {
    return PLACEHOLDER_DIAGNOSTICS;
  }
}

export function createPlaceholderTimelineRegistry(): TimelineRegistry {
  return new PlaceholderTimelineRegistry();
}
