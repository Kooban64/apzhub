import type { ActivityBatchRegistrationResult } from "./activity-batch-registration";
import type { ActivityDescriptor } from "../types/activity-descriptor";
import type {
  ActivityMetadata,
  ActivityRegistryMetadata,
} from "../types/activity-metadata";
import type { ActivityRegistryDiagnostics } from "../types/activity-diagnostics";

/** Authoritative in-memory metadata registry for activity type definitions. */
export interface ActivityRegistry {
  register(descriptor: ActivityDescriptor): void;
  registerMany(descriptors: readonly ActivityDescriptor[]): void;
  registerManyAtomic(
    descriptors: readonly ActivityDescriptor[],
  ): ActivityBatchRegistrationResult;
  replace(descriptor: ActivityDescriptor): void;
  has(activityTypeId: string): boolean;
  get(activityTypeId: string): ActivityDescriptor | undefined;
  list(): readonly ActivityDescriptor[];
  clear(): void;
  getMetadata(activityTypeId: string): ActivityMetadata | undefined;
  listMetadata(): readonly ActivityMetadata[];
  getRegistryMetadata(): ActivityRegistryMetadata;
  getDiagnostics(): ActivityRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  recordFrameworkVersion(version: string): void;
}
