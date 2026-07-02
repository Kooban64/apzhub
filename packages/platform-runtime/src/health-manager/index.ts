export { RuntimeHealthManager, createRuntimeHealthManager } from "./api/health";
export { createDefaultHealthProviders } from "./defaults/default-providers";
export {
  aggregateHealthStatus,
  buildHealthSummary,
  mapHealthStatusToCapabilityHealth,
  mapHealthStatusToLifecycleTarget,
} from "./implementation/aggregate";
export {
  CONFIGURATION_HEALTH_PROVIDER_ID,
  createConfigurationHealthProvider,
} from "./implementation/providers/configuration-provider";
export {
  LIFECYCLE_HEALTH_PROVIDER_ID,
  createLifecycleHealthProvider,
} from "./implementation/providers/lifecycle-provider";
export {
  REGISTRY_HEALTH_PROVIDER_ID,
  createRegistryHealthProvider,
} from "./implementation/providers/registry-provider";
export {
  RUNTIME_HEALTH_PROVIDER_ID,
  createRuntimeHealthProvider,
} from "./implementation/providers/runtime-provider";
export type {
  HealthCheckResult,
  HealthDiagnostics,
  HealthExtensionPoints,
  HealthProvider,
  HealthProviderContext,
  HealthProviderResult,
  HealthSeverity,
  HealthSnapshot,
  HealthStatus,
} from "./interfaces/types";
export { HEALTH_EXTENSION_POINTS } from "./interfaces/types";
export {
  healthError,
  type HealthError,
  type HealthErrorCode,
} from "./validation/errors";

import { createRuntimeHealthManager } from "./api/health";

/** Singleton Runtime Health Manager API. */
export const Health = createRuntimeHealthManager();

export const HEALTH_MANAGER_STATUS = "active" as const;
