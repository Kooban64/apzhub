import { CapabilityService } from "./capability-service";
import type { CapabilityDiagnostics } from "./governance-types";
import { FeatureFlagService } from "./feature-flag-service";
import { GovernanceDiagnosticsService } from "./governance-diagnostics";
import { GovernanceEnablementService } from "./governance-service";
import {
  ModuleProvisioningService,
  ProductProvisioningService,
} from "./product-module-provisioning-service";
import { ProvisioningService } from "./provisioning-service";
import type { GovernanceRepositoryBundle } from "./repositories/repository-interfaces";

export interface PlatformGovernanceServiceOptions {
  readonly repositories: GovernanceRepositoryBundle;
  readonly storageBackend?: "memory" | "postgres" | "hybrid";
}

export class PlatformGovernanceService {
  readonly governance: GovernanceEnablementService;
  readonly provisioning: ProvisioningService;
  readonly featureFlags: FeatureFlagService;
  readonly capabilities: CapabilityService;
  readonly productProvisioning: ProductProvisioningService;
  readonly moduleProvisioning: ModuleProvisioningService;
  readonly diagnostics: GovernanceDiagnosticsService;
  private readonly repositories: GovernanceRepositoryBundle;

  constructor(options: PlatformGovernanceServiceOptions) {
    this.repositories = options.repositories;
    this.governance = new GovernanceEnablementService(options.repositories.governance);
    this.provisioning = new ProvisioningService(options.repositories.provisioning);
    this.featureFlags = new FeatureFlagService(options.repositories.featureFlags);
    this.capabilities = new CapabilityService(options.repositories.governance);
    this.productProvisioning = new ProductProvisioningService(this.provisioning);
    this.moduleProvisioning = new ModuleProvisioningService(this.provisioning);
    this.diagnostics = new GovernanceDiagnosticsService(
      options.repositories,
      options.storageBackend ?? "memory",
    );
  }

  async getDiagnostics() {
    return this.diagnostics.getDiagnostics();
  }

  async getCapabilityDiagnostics(): Promise<CapabilityDiagnostics> {
    const capabilities = await this.repositories.governance.listCapabilities();
    const dependencies = (
      await Promise.all(
        capabilities.map((cap) =>
          this.repositories.governance.listDependencies(cap.capabilityId),
        ),
      )
    ).flat();
    const enablements = await this.repositories.governance.listEnablements();

    return {
      capabilities,
      dependencies,
      enablements,
      consumedCapabilities: capabilities.map((cap) => cap.capabilityKey),
    };
  }
}

/** Alias for spec naming. */
export const GovernanceService = PlatformGovernanceService;
