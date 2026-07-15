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

export interface GovernanceRepository {
  listCapabilities(): Promise<readonly PlatformCapability[]>;
  getCapability(capabilityKey: string): Promise<PlatformCapability | undefined>;
  registerCapability(input: RegisterCapabilityInput): Promise<PlatformCapability>;
  listDependencies(capabilityId: string): Promise<readonly CapabilityDependency[]>;
  listEnablements(filter?: {
    scopeType?: string;
    scopeKey?: string;
    targetType?: string;
  }): Promise<readonly GovernanceEnablement[]>;
  upsertEnablement(input: UpsertEnablementInput): Promise<GovernanceEnablement>;
  countEnablements(): Promise<number>;
  countCapabilities(): Promise<number>;
}

export interface ProvisioningRepository {
  listRecords(filter?: {
    scopeType?: string;
    scopeKey?: string;
    status?: string;
  }): Promise<readonly ProvisioningRecord[]>;
  getRecord(provisioningId: string): Promise<ProvisioningRecord | undefined>;
  createRecord(input: StartProvisioningInput): Promise<ProvisioningRecord>;
  updateRecordStatus(
    provisioningId: string,
    status: ProvisioningRecord["status"],
    message?: string,
  ): Promise<ProvisioningRecord | undefined>;
  countRecords(): Promise<number>;
}

export interface FeatureFlagRepository {
  listFlags(): Promise<readonly FeatureFlagDefinition[]>;
  getFlag(flagKey: string): Promise<FeatureFlagDefinition | undefined>;
  registerFlag(input: RegisterFeatureFlagInput): Promise<FeatureFlagDefinition>;
  listOverrides(flagKey?: string): Promise<readonly FeatureFlagOverride[]>;
  setOverride(input: SetFeatureFlagOverrideInput): Promise<FeatureFlagOverride>;
  removeOverride(overrideId: string): Promise<boolean>;
  countFlags(): Promise<number>;
  countOverrides(): Promise<number>;
}

export interface GovernanceRepositoryBundle {
  readonly governance: GovernanceRepository;
  readonly provisioning: ProvisioningRepository;
  readonly featureFlags: FeatureFlagRepository;
}
