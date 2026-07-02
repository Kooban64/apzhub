export type { ActionPermissionAdapter } from "./di";

export {
  buildActionRegistryHydrationDiagnostics,
  createEmptyActionRegistryHydrationDiagnostics,
  type ActionRegistryHydrationDiagnostics,
} from "./server/action-registry-hydration-diagnostics";

export {
  bootstrapActionRegistryFromCapabilities,
  type BootstrapActionRegistryOptions,
  type BootstrapActionRegistryResult,
} from "./server/bootstrap-action-registry";

export {
  bootstrapActionRegistry,
  type BootstrapActionRegistryOptions as FullBootstrapActionRegistryOptions,
  type BootstrapActionRegistryResult as FullBootstrapActionRegistryResult,
} from "./catalogue/bootstrap-action-registry";

export {
  extractToolbarRegionsFromCapabilities,
  type ToolbarExtractionDiagnostics,
  type ToolbarExtractionResult,
  type ToolbarExtractionWarning,
} from "./extraction";

export { filterActionRegistryDto } from "./server/filter-action-registry-dto";

export {
  createEmptyActionRegistryDto,
  mapActionRegistryDto,
  type ActionRegistryDto,
  type ActionToolbarItemDto,
  type ActionToolbarRegionDto,
} from "./server/map-action-registry-dto";

export {
  mapPlatformCapabilitiesToActionRecords,
  type PlatformCapabilitySnapshot,
} from "./server/map-capability-records";

export const COMMAND_FRAMEWORK_SERVER_STATUS = "filter" as const;
