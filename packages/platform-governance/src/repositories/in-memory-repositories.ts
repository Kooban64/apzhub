import type {
  CapabilityDependency,
  FeatureFlagDefinition,
  FeatureFlagOverride,
  GovernanceEnablement,
  PlatformCapability,
  ProvisioningRecord,
  RegisterCapabilityInput,
  RegisterFeatureFlagInput,
  SetFeatureFlagOverrideInput,
  StartProvisioningInput,
  UpsertEnablementInput,
} from "../governance-types";
import type {
  FeatureFlagRepository,
  GovernanceRepository,
  GovernanceRepositoryBundle,
  ProvisioningRepository,
} from "./repository-interfaces";

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export class InMemoryGovernanceRepository implements GovernanceRepository {
  private readonly capabilities = new Map<string, PlatformCapability>();
  private readonly dependencies = new Map<string, CapabilityDependency>();
  private readonly enablements = new Map<string, GovernanceEnablement>();

  async listCapabilities(): Promise<readonly PlatformCapability[]> {
    return [...this.capabilities.values()];
  }

  async getCapability(capabilityKey: string): Promise<PlatformCapability | undefined> {
    return [...this.capabilities.values()].find(
      (item) => item.capabilityKey === capabilityKey,
    );
  }

  async registerCapability(
    input: RegisterCapabilityInput,
  ): Promise<PlatformCapability> {
    const existing = await this.getCapability(input.capabilityKey);
    const timestamp = nowIso();
    const capability: PlatformCapability = {
      capabilityId: existing?.capabilityId ?? randomId("cap"),
      capabilityKey: input.capabilityKey,
      capabilityType: input.capabilityType,
      name: input.name,
      description: input.description,
      version: input.version,
      status: "active",
      metadata: input.metadata ?? {},
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.capabilities.set(capability.capabilityId, capability);

    for (const dependency of input.dependencies ?? []) {
      const dependencyId = `${capability.capabilityId}:${dependency.dependsOnCapabilityKey}`;
      this.dependencies.set(dependencyId, {
        dependencyId: randomId("dep"),
        capabilityId: capability.capabilityId,
        dependsOnCapabilityKey: dependency.dependsOnCapabilityKey,
        dependencyType: dependency.dependencyType ?? "required",
        createdAt: timestamp,
      });
    }

    return capability;
  }

  async listDependencies(
    capabilityId: string,
  ): Promise<readonly CapabilityDependency[]> {
    return [...this.dependencies.values()].filter(
      (item) => item.capabilityId === capabilityId,
    );
  }

  async listEnablements(filter?: {
    scopeType?: string;
    scopeKey?: string;
    targetType?: string;
  }): Promise<readonly GovernanceEnablement[]> {
    return [...this.enablements.values()].filter((item) => {
      if (filter?.scopeType && item.scopeType !== filter.scopeType) return false;
      if (filter?.scopeKey !== undefined && item.scopeKey !== filter.scopeKey)
        return false;
      if (filter?.targetType && item.targetType !== filter.targetType) return false;
      return true;
    });
  }

  async upsertEnablement(input: UpsertEnablementInput): Promise<GovernanceEnablement> {
    const scopeKey = input.scopeKey ?? "";
    const existing = [...this.enablements.values()].find(
      (item) =>
        item.scopeType === input.scopeType &&
        item.scopeKey === scopeKey &&
        item.targetType === input.targetType &&
        item.targetKey === input.targetKey,
    );
    const timestamp = nowIso();
    const enablement: GovernanceEnablement = {
      enablementId: existing?.enablementId ?? randomId("en"),
      scopeType: input.scopeType,
      scopeKey,
      targetType: input.targetType,
      targetKey: input.targetKey,
      enabled: input.enabled,
      metadata: input.metadata ?? {},
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.enablements.set(enablement.enablementId, enablement);
    return enablement;
  }

  async countEnablements(): Promise<number> {
    return this.enablements.size;
  }

  async countCapabilities(): Promise<number> {
    return this.capabilities.size;
  }
}

export class InMemoryProvisioningRepository implements ProvisioningRepository {
  private readonly records = new Map<string, ProvisioningRecord>();

  async listRecords(filter?: {
    scopeType?: string;
    scopeKey?: string;
    status?: string;
  }): Promise<readonly ProvisioningRecord[]> {
    return [...this.records.values()].filter((item) => {
      if (filter?.scopeType && item.scopeType !== filter.scopeType) return false;
      if (filter?.scopeKey && item.scopeKey !== filter.scopeKey) return false;
      if (filter?.status && item.status !== filter.status) return false;
      return true;
    });
  }

  async getRecord(provisioningId: string): Promise<ProvisioningRecord | undefined> {
    return this.records.get(provisioningId);
  }

  async createRecord(input: StartProvisioningInput): Promise<ProvisioningRecord> {
    const record: ProvisioningRecord = {
      provisioningId: randomId("prov"),
      scopeType: input.scopeType,
      scopeKey: input.scopeKey,
      targetType: input.targetType,
      targetKey: input.targetKey,
      status: "in_progress",
      metadata: input.metadata ?? {},
      startedAt: nowIso(),
    };
    this.records.set(record.provisioningId, record);
    return record;
  }

  async updateRecordStatus(
    provisioningId: string,
    status: ProvisioningRecord["status"],
    message?: string,
  ): Promise<ProvisioningRecord | undefined> {
    const existing = this.records.get(provisioningId);
    if (!existing) return undefined;
    const updated: ProvisioningRecord = {
      ...existing,
      status,
      message,
      completedAt:
        status === "completed" || status === "failed" ? nowIso() : existing.completedAt,
    };
    this.records.set(provisioningId, updated);
    return updated;
  }

  async countRecords(): Promise<number> {
    return this.records.size;
  }
}

export class InMemoryFeatureFlagRepository implements FeatureFlagRepository {
  private readonly flags = new Map<string, FeatureFlagDefinition>();
  private readonly overrides = new Map<string, FeatureFlagOverride>();

  async listFlags(): Promise<readonly FeatureFlagDefinition[]> {
    return [...this.flags.values()];
  }

  async getFlag(flagKey: string): Promise<FeatureFlagDefinition | undefined> {
    return this.flags.get(flagKey);
  }

  async registerFlag(input: RegisterFeatureFlagInput): Promise<FeatureFlagDefinition> {
    const existing = this.flags.get(input.flagKey);
    const timestamp = nowIso();
    const flag: FeatureFlagDefinition = {
      flagKey: input.flagKey,
      name: input.name,
      description: input.description,
      defaultEnabled: input.defaultEnabled ?? false,
      metadata: input.metadata ?? {},
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.flags.set(flag.flagKey, flag);
    return flag;
  }

  async listOverrides(flagKey?: string): Promise<readonly FeatureFlagOverride[]> {
    return [...this.overrides.values()].filter(
      (item) => !flagKey || item.flagKey === flagKey,
    );
  }

  async setOverride(input: SetFeatureFlagOverrideInput): Promise<FeatureFlagOverride> {
    const scopeKey = input.scopeKey ?? "";
    const existing = [...this.overrides.values()].find(
      (item) =>
        item.flagKey === input.flagKey &&
        item.scopeType === input.scopeType &&
        item.scopeKey === scopeKey,
    );
    const timestamp = nowIso();
    const override: FeatureFlagOverride = {
      overrideId: existing?.overrideId ?? randomId("ffo"),
      flagKey: input.flagKey,
      scopeType: input.scopeType,
      scopeKey,
      enabled: input.enabled,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.overrides.set(override.overrideId, override);
    return override;
  }

  async removeOverride(overrideId: string): Promise<boolean> {
    return this.overrides.delete(overrideId);
  }

  async countFlags(): Promise<number> {
    return this.flags.size;
  }

  async countOverrides(): Promise<number> {
    return this.overrides.size;
  }
}

export function createInMemoryGovernanceRepositories(): GovernanceRepositoryBundle {
  return {
    governance: new InMemoryGovernanceRepository(),
    provisioning: new InMemoryProvisioningRepository(),
    featureFlags: new InMemoryFeatureFlagRepository(),
  };
}
