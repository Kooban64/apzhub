/**
 * Enterprise Automation Coordination contracts (QO-011).
 * Primary output: Automation Coordination Package.
 *
 * Consumes Decision Packages; produces provider-neutral coordination intent.
 * Never executes automation. Never invokes providers.
 */

/** Provider-neutral logical automation intents — not providers. */
export const AUTOMATION_INTENT_TYPES = [
  "functional_automation",
  "api_automation",
  "performance_automation",
  "accessibility_automation",
  "visual_automation",
  "security_automation",
  "smoke_verification",
  "regression_verification",
  "custom_registered_activity",
] as const;

export type AutomationIntentType = (typeof AUTOMATION_INTENT_TYPES)[number];

export const AUTOMATION_PRIORITIES = ["low", "normal", "high", "critical"] as const;

export type AutomationPriority = (typeof AUTOMATION_PRIORITIES)[number];

export const COORDINATION_STATUSES = [
  "coordinated",
  "not_required",
  "deferred",
  "superseded",
  "cancelled",
] as const;

export type CoordinationStatus = (typeof COORDINATION_STATUSES)[number];

/** Logical provider eligibility — capability ids only, never product names. */
export interface ProviderEligibility {
  readonly intentType: AutomationIntentType;
  /** Catalogue capability ids eligible for this intent (logical). */
  readonly eligibleCapabilityIds: readonly string[];
  readonly note: string;
}

export interface ExecutionConstraints {
  readonly maxParallelActivities?: number;
  readonly requireDecisionGo: boolean;
  readonly allowConditionalGo: boolean;
  readonly timeoutHintMinutes?: number;
  readonly environmentHint?: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface AutomationIntent {
  readonly intentId: string;
  readonly intentType: AutomationIntentType;
  readonly priority: AutomationPriority;
  readonly rationale: string;
  /** Opaque activity labels from upstream selection / outstanding items. */
  readonly sourceActivityRefs: readonly string[];
  readonly eligibility: ProviderEligibility;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface CoordinationAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

/** Authoritative SoR for automation coordination (not execution). */
export interface AutomationCoordinationPackage {
  readonly coordinationPackageId: string;
  readonly decisionPackageRef: string;
  readonly qualityFlowRef: string;
  readonly requiredActivities: readonly AutomationIntent[];
  readonly automationPriority: AutomationPriority;
  readonly executionConstraints: ExecutionConstraints;
  readonly providerEligibility: readonly ProviderEligibility[];
  readonly coordinationStatus: CoordinationStatus;
  readonly platformConclusion: string;
  readonly createdAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly supersedesPackageId?: string;
  readonly auditHistory: readonly CoordinationAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit: coordination only — not an execution request. */
  readonly advisory: true;
  readonly execution: false;
}

export interface CreateAutomationCoordinationInput {
  /**
   * Immutable Decision Package snapshot — never re-evaluated.
   * Coordinator reads conclusion / outstanding items / refs only.
   */
  readonly decisionPackage: {
    readonly decisionPackageId: string;
    readonly qualityFlowRef: string;
    readonly platformConclusion: string;
    readonly decisionProfileId?: string;
    readonly outstandingItems?: readonly string[];
    readonly residualRiskLevel?: string;
    readonly tenantId: string;
    readonly projectId?: string;
  };
  /** Optional explicit intents (still provider-neutral). */
  readonly additionalIntents?: readonly AutomationIntentType[];
  readonly priority?: AutomationPriority;
  readonly executionConstraints?: Partial<ExecutionConstraints>;
  /** Prior coordination package this supersedes (immutable replacement). */
  readonly supersedesPackageId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface AutomationCoordinationDiagnostics {
  readonly packageCount: number;
  readonly intentCount: number;
  readonly intentDistribution: Readonly<Record<string, number>>;
  readonly activityDistribution: Readonly<Record<string, number>>;
  readonly statusDistribution: Readonly<Record<string, number>>;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
