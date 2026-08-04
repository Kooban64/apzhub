/**
 * Capability Registry catalogue model (QO-002).
 *
 * The registry is a catalogue — not a service locator, not a DI container,
 * and not an execution engine. It answers discovery questions only.
 */

export type CapabilityHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export type CapabilityRegistrationLifecycle =
  "declared" | "registered" | "active" | "deprecated" | "retired";

/**
 * Quality Flow stages a capability may participate in.
 * Stage participation metadata only — flow execution is QO-004+.
 */
export const QUALITY_FLOW_STAGES = [
  "impact_correlation",
  "test_selection",
  "capability_coordination",
  "evidence_collection",
  "quality_intelligence",
  "quality_gates",
  "human_approval",
  "release_recommendation",
  "release_decision",
] as const;

export type QualityFlowStage = (typeof QUALITY_FLOW_STAGES)[number];

/** Provider-neutral trigger type labels (catalogue metadata). */
export type CapabilityTriggerType = string;

export interface CapabilityFeatureFlags {
  readonly [flag: string]: boolean;
}

/**
 * Full catalogue metadata required for every capability registration.
 */
export interface CapabilityCatalogueRecord {
  readonly capabilityId: string;
  readonly name: string;
  readonly version: string;
  /** Owning provider or platform package id (e.g. platform-automation). */
  readonly provider: string;
  /** Orchestration / capability contract versions supported. */
  readonly supportedContractVersions: readonly string[];
  /** Trigger types this capability can respond to (metadata only). */
  readonly triggerTypes: readonly CapabilityTriggerType[];
  /** Quality Flow stages this capability may participate in. */
  readonly supportedQualityFlowStages: readonly QualityFlowStage[];
  /** Latest reported health — registry stores status; does not probe. */
  readonly healthStatus: CapabilityHealthStatus;
  /** Permissions required to use/register/invoke later (evaluation later). */
  readonly requiredPermissions: readonly string[];
  /** Other capabilityIds or platform dependency ids. */
  readonly dependencies: readonly string[];
  readonly featureFlags: CapabilityFeatureFlags;
  readonly lifecycle: CapabilityRegistrationLifecycle;
  /** Documentation reference path or URI. */
  readonly documentationRef: string;
  /** Contract ids this capability exposes to orchestration. */
  readonly contractIds: readonly string[];
  readonly registeredAt: string;
  readonly updatedAt: string;
  /** Optional free-form labels (non-authoritative). */
  readonly labels?: Readonly<Record<string, string>>;
}

export interface CapabilityRegistrationInput {
  readonly capabilityId: string;
  readonly name: string;
  readonly version: string;
  readonly provider: string;
  readonly supportedContractVersions: readonly string[];
  readonly triggerTypes?: readonly CapabilityTriggerType[];
  readonly supportedQualityFlowStages?: readonly QualityFlowStage[];
  readonly healthStatus?: CapabilityHealthStatus;
  readonly requiredPermissions?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly featureFlags?: CapabilityFeatureFlags;
  readonly lifecycle?: CapabilityRegistrationLifecycle;
  readonly documentationRef: string;
  readonly contractIds?: readonly string[];
  readonly labels?: Readonly<Record<string, string>>;
}

export interface CapabilityCatalogueQuery {
  readonly lifecycle?: CapabilityRegistrationLifecycle;
  readonly provider?: string;
  readonly triggerType?: CapabilityTriggerType;
  readonly qualityFlowStage?: QualityFlowStage;
  readonly contractId?: string;
  readonly healthStatus?: CapabilityHealthStatus;
  readonly supportsContractVersion?: string;
}

/**
 * @deprecated Prefer CapabilityCatalogueRecord (QO-002). Kept for kernel bootstrap compatibility.
 */
export type CapabilityRegistrationRecord = CapabilityCatalogueRecord;
