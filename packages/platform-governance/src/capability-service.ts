import type {
  CapabilityDependency,
  PlatformCapability,
  RegisterCapabilityInput,
} from "./governance-types";
import type { GovernanceRepository } from "./repositories/repository-interfaces";

export class CapabilityService {
  constructor(private readonly repository: GovernanceRepository) {}

  async listCapabilities(): Promise<readonly PlatformCapability[]> {
    return this.repository.listCapabilities();
  }

  async getCapability(capabilityKey: string): Promise<PlatformCapability | undefined> {
    return this.repository.getCapability(capabilityKey);
  }

  async registerCapability(
    input: RegisterCapabilityInput,
  ): Promise<PlatformCapability> {
    return this.repository.registerCapability(input);
  }

  async listDependencies(
    capabilityKey: string,
  ): Promise<readonly CapabilityDependency[]> {
    const capability = await this.repository.getCapability(capabilityKey);
    if (!capability) {
      return [];
    }
    return this.repository.listDependencies(capability.capabilityId);
  }

  async getRequiredCapabilities(capabilityKey: string): Promise<readonly string[]> {
    const dependencies = await this.listDependencies(capabilityKey);
    return dependencies
      .filter((dep) => dep.dependencyType === "required")
      .map((dep) => dep.dependsOnCapabilityKey);
  }

  async getOptionalCapabilities(capabilityKey: string): Promise<readonly string[]> {
    const dependencies = await this.listDependencies(capabilityKey);
    return dependencies
      .filter((dep) => dep.dependencyType === "optional")
      .map((dep) => dep.dependsOnCapabilityKey);
  }
}
