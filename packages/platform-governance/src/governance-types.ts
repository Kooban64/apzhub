export const GOVERNANCE_SCOPE_TYPES = [
  "platform",
  "tenant",
  "product",
  "module",
  "user",
] as const;

export type GovernanceScopeType = (typeof GOVERNANCE_SCOPE_TYPES)[number];

export const GOVERNANCE_TARGET_TYPES = [
  "platform",
  "product",
  "module",
  "service",
  "capability",
] as const;

export type GovernanceTargetType = (typeof GOVERNANCE_TARGET_TYPES)[number];

export const CAPABILITY_TYPES = ["platform", "product", "module", "service"] as const;

export type CapabilityType = (typeof CAPABILITY_TYPES)[number];

export const PROVISIONING_SCOPE_TYPES = ["tenant", "product", "module", "service", "user"] as const;

export type ProvisioningScopeType = (typeof PROVISIONING_SCOPE_TYPES)[number];

export const PROVISIONING_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "failed",
] as const;

export type ProvisioningStatus = (typeof PROVISIONING_STATUSES)[number];

export const FEATURE_FLAG_SCOPE_TYPES = [
  "global",
  "tenant",
  "product",
  "module",
  "user",
] as const;

export type FeatureFlagScopeType = (typeof FEATURE_FLAG_SCOPE_TYPES)[number];

export interface PlatformCapability {
  readonly capabilityId: string;
  readonly capabilityKey: string;
  readonly capabilityType: CapabilityType;
  readonly name: string;
  readonly description?: string;
  readonly version?: string;
  readonly status: "active" | "disabled" | "deprecated";
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CapabilityDependency {
  readonly dependencyId: string;
  readonly capabilityId: string;
  readonly dependsOnCapabilityKey: string;
  readonly dependencyType: "required" | "optional";
  readonly createdAt: string;
}

export interface GovernanceEnablement {
  readonly enablementId: string;
  readonly scopeType: GovernanceScopeType;
  readonly scopeKey: string;
  readonly targetType: GovernanceTargetType;
  readonly targetKey: string;
  readonly enabled: boolean;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProvisioningRecord {
  readonly provisioningId: string;
  readonly scopeType: ProvisioningScopeType;
  readonly scopeKey: string;
  readonly targetType: GovernanceTargetType;
  readonly targetKey: string;
  readonly status: ProvisioningStatus;
  readonly message?: string;
  readonly metadata: Record<string, unknown>;
  readonly startedAt: string;
  readonly completedAt?: string;
}

export interface FeatureFlagDefinition {
  readonly flagKey: string;
  readonly name: string;
  readonly description?: string;
  readonly defaultEnabled: boolean;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FeatureFlagOverride {
  readonly overrideId: string;
  readonly flagKey: string;
  readonly scopeType: FeatureFlagScopeType;
  readonly scopeKey: string;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FeatureFlagEvaluationContext {
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly moduleId?: string;
  readonly userId?: string;
}

export interface FeatureFlagEvaluation {
  readonly flagKey: string;
  readonly enabled: boolean;
  readonly source: FeatureFlagScopeType | "default";
}

export interface GovernanceDiagnostics {
  readonly capabilityCount: number;
  readonly enablementCount: number;
  readonly provisioningCount: number;
  readonly featureFlagCount: number;
  readonly overrideCount: number;
  readonly storageBackend: "memory" | "postgres" | "hybrid";
}

export interface CapabilityDiagnostics {
  readonly capabilities: readonly PlatformCapability[];
  readonly dependencies: readonly CapabilityDependency[];
  readonly enablements: readonly GovernanceEnablement[];
  readonly consumedCapabilities: readonly string[];
}

export interface SessionGovernanceSnapshot {
  readonly enabledProducts: readonly string[];
  readonly enabledModules: readonly string[];
  readonly enabledCapabilities: readonly string[];
  readonly featureFlags: Readonly<Record<string, boolean>>;
}

export interface UpsertEnablementInput {
  readonly scopeType: GovernanceScopeType;
  readonly scopeKey?: string;
  readonly targetType: GovernanceTargetType;
  readonly targetKey: string;
  readonly enabled: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface StartProvisioningInput {
  readonly scopeType: ProvisioningScopeType;
  readonly scopeKey: string;
  readonly targetType: GovernanceTargetType;
  readonly targetKey: string;
  readonly metadata?: Record<string, unknown>;
}

export interface RegisterCapabilityInput {
  readonly capabilityKey: string;
  readonly capabilityType: CapabilityType;
  readonly name: string;
  readonly description?: string;
  readonly version?: string;
  readonly metadata?: Record<string, unknown>;
  readonly dependencies?: readonly {
    readonly dependsOnCapabilityKey: string;
    readonly dependencyType?: "required" | "optional";
  }[];
}

export interface RegisterFeatureFlagInput {
  readonly flagKey: string;
  readonly name: string;
  readonly description?: string;
  readonly defaultEnabled?: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface SetFeatureFlagOverrideInput {
  readonly flagKey: string;
  readonly scopeType: FeatureFlagScopeType;
  readonly scopeKey?: string;
  readonly enabled: boolean;
}
