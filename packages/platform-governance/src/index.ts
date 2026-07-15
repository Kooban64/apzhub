import { createInMemoryGovernanceRepositories } from "./repositories/in-memory-repositories";
import { PlatformGovernanceService } from "./platform-governance-service";
import { seedDefaultGovernanceCatalog } from "./governance-seed";

let sharedGovernanceService: PlatformGovernanceService | undefined;
let sharedRepositories: ReturnType<typeof createInMemoryGovernanceRepositories> | undefined;

export function createInMemoryGovernanceService(): {
  readonly service: PlatformGovernanceService;
  readonly repositories: ReturnType<typeof createInMemoryGovernanceRepositories>;
} {
  const repositories = createInMemoryGovernanceRepositories();
  const service = new PlatformGovernanceService({ repositories, storageBackend: "memory" });
  void seedDefaultGovernanceCatalog(service);
  return { service, repositories };
}

export function getSharedGovernanceService(): PlatformGovernanceService {
  if (!sharedGovernanceService) {
    const bundle = createInMemoryGovernanceService();
    sharedGovernanceService = bundle.service;
    sharedRepositories = bundle.repositories;
  }
  return sharedGovernanceService;
}

export function getSharedGovernanceRepositories(): ReturnType<
  typeof createInMemoryGovernanceRepositories
> {
  getSharedGovernanceService();
  return sharedRepositories!;
}

export function resetSharedGovernanceService(): void {
  sharedGovernanceService = undefined;
  sharedRepositories = undefined;
}

export {
  PlatformGovernanceService,
  GovernanceService,
} from "./platform-governance-service";

export { GovernanceEnablementService } from "./governance-service";
export { ProvisioningService } from "./provisioning-service";
export { FeatureFlagService } from "./feature-flag-service";
export { CapabilityService } from "./capability-service";
export {
  ModuleProvisioningService,
  ProductProvisioningService,
} from "./product-module-provisioning-service";
export { GovernanceDiagnosticsService } from "./governance-diagnostics";

export {
  seedDefaultGovernanceCatalog,
  provisionDefaultGovernanceForTenant,
  DEFAULT_PLATFORM_TENANT_ID,
} from "./governance-seed";

export type {
  CapabilityDiagnostics,
  CapabilityDependency,
  CapabilityType,
  FeatureFlagDefinition,
  FeatureFlagEvaluation,
  FeatureFlagEvaluationContext,
  FeatureFlagOverride,
  FeatureFlagScopeType,
  GovernanceDiagnostics,
  GovernanceEnablement,
  GovernanceScopeType,
  GovernanceTargetType,
  PlatformCapability,
  ProvisioningRecord,
  ProvisioningScopeType,
  ProvisioningStatus,
  RegisterCapabilityInput,
  RegisterFeatureFlagInput,
  SessionGovernanceSnapshot,
  SetFeatureFlagOverrideInput,
  StartProvisioningInput,
  UpsertEnablementInput,
} from "./governance-types";

export type { GovernanceRepositoryBundle } from "./repositories/repository-interfaces";

export {
  createInMemoryGovernanceRepositories,
  InMemoryFeatureFlagRepository,
  InMemoryGovernanceRepository,
  InMemoryProvisioningRepository,
} from "./repositories/in-memory-repositories";
