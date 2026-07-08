import type { TimelineBatchRegistrationResult } from "./timeline-batch-registration";
import type { TimelineDefinition } from "../types/timeline-definition";
import type {
  TimelineMetadata,
  TimelineRegistryMetadata,
} from "../types/timeline-metadata";
import type { TimelineRegistryDiagnostics } from "../types/timeline-diagnostics";

/** Authoritative metadata registry for timeline definitions — not timeline entries or history. */
export interface TimelineRegistry {
  register(definition: TimelineDefinition): void;
  registerMany(definitions: readonly TimelineDefinition[]): void;
  registerManyAtomic(
    definitions: readonly TimelineDefinition[],
  ): TimelineBatchRegistrationResult;
  replace(definition: TimelineDefinition): void;
  has(timelineId: string): boolean;
  get(timelineId: string): TimelineDefinition | undefined;
  list(): readonly TimelineDefinition[];
  clear(): void;
  getMetadata(timelineId: string): TimelineMetadata | undefined;
  listMetadata(): readonly TimelineMetadata[];
  getRegistryMetadata(): TimelineRegistryMetadata;
  getDiagnostics(): TimelineRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  recordFrameworkVersion(version: string): void;
}
