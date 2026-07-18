import type { GovernanceDiagnostics } from "./governance-types";
import type { GovernanceRepositoryBundle } from "./repositories/repository-interfaces";

export class GovernanceDiagnosticsService {
  constructor(
    private readonly repositories: GovernanceRepositoryBundle,
    private readonly storageBackend: GovernanceDiagnostics["storageBackend"] = "memory",
  ) {}

  async getDiagnostics(): Promise<GovernanceDiagnostics> {
    const [
      capabilityCount,
      enablementCount,
      provisioningCount,
      featureFlagCount,
      overrideCount,
    ] = await Promise.all([
      this.repositories.governance.countCapabilities(),
      this.repositories.governance.countEnablements(),
      this.repositories.provisioning.countRecords(),
      this.repositories.featureFlags.countFlags(),
      this.repositories.featureFlags.countOverrides(),
    ]);

    return {
      capabilityCount,
      enablementCount,
      provisioningCount,
      featureFlagCount,
      overrideCount,
      storageBackend: this.storageBackend,
    };
  }
}
