export { registryError, type RegistryError, type RegistryErrorCode } from "./errors";
export { RegistryOperationGuard } from "./guard";
export { CapabilityRegistry, createCapabilityRegistry } from "./registry";
export {
  createPlatformRegistry,
  PlatformRegistry,
  type CapabilityFilter,
  type RegistryHealthSummary,
  type RegistryStateSummary,
} from "./platform-registry";
export {
  contributionFromManifest,
  extractNavigationContribution,
  extractWorkbenchNavigationContributions,
  type WorkbenchNavigationContribution,
  type WorkbenchNavigationExtractionDiagnostics,
  type WorkbenchNavigationExtractionResult,
} from "./workbench-navigation";
export {
  descriptorFromManifest,
  extractViewDescriptor,
  extractWorkbenchViewDescriptors,
  type WorkbenchViewDescriptor,
  type WorkbenchViewExtractionDiagnostics,
  type WorkbenchViewExtractionResult,
} from "./workbench-view";
export { CapabilityRegistryStore } from "./store";
export type {
  CapabilityRegistryExtensionPoints,
  RegisteredCapabilityRecord,
  RegistrationOptions,
  RegistrationFailure,
  RegistrationResult,
  RegistrationSuccess,
  RegistrySnapshot,
  RuntimeStatus,
} from "./types";

export const CAPABILITY_REGISTRY_STATUS = "active" as const;
