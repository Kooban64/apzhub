export {
  bootstrapEventRegistry,
  bootstrapEventRegistryFromCapabilities,
  type BootstrapEventRegistryOptions,
  type BootstrapEventRegistryResult,
  type BootstrapEventRegistryFromCapabilitiesOptions,
  type BootstrapEventRegistryFromCapabilitiesResult,
} from "../../catalogue/bootstrap-event-registry";

export {
  buildEventRegistryHydrationDiagnostics,
  createEmptyEventRegistryHydrationDiagnostics,
  type EventRegistryHydrationDiagnostics,
} from "../event-registry-hydration-diagnostics";

export {
  mapPlatformCapabilitiesToEventRecords,
  type EventCapabilitySnapshot,
} from "../map-capability-records";
