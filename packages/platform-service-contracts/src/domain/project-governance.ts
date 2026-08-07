/**
 * APZ Projects Organisation Governance Administration — W010 / P3.
 * Org Governance Profiles, Operational Policies, effective config, simulation.
 */

import type {
  GovernanceProfile,
  ProjectClassification,
  ProjectDeliveryModel,
} from "./project-lifecycle";

export const GOVERNANCE_PUBLISH_STATUSES = [
  "draft",
  "published",
  "deprecated",
] as const;
export type GovernancePublishStatus = (typeof GOVERNANCE_PUBLISH_STATUSES)[number];

export const OPERATIONAL_POLICY_AREAS = [
  "exception_tolerance",
  "review_cadence",
  "evidence",
  "escalation",
  "closure",
  "forecast_capacity",
  "communication",
] as const;
export type OperationalPolicyArea = (typeof OPERATIONAL_POLICY_AREAS)[number];

export const GOVERNANCE_COMPLIANCE_BANDS = [
  "Compliant",
  "Advisory",
  "Non-Compliant",
  "Critical",
] as const;
export type GovernanceComplianceBand = (typeof GOVERNANCE_COMPLIANCE_BANDS)[number];

export const GOVERNANCE_SCOPE_TYPES = [
  "platform",
  "organisation",
  "portfolio",
  "initiative",
  "programme",
  "project",
] as const;
export type GovernanceScopeType = (typeof GOVERNANCE_SCOPE_TYPES)[number];

/** Organisation-managed Governance Profile (extends system shape with publish lifecycle). */
export type OrgGovernanceProfile = GovernanceProfile & {
  readonly status: GovernancePublishStatus;
  readonly boundPolicyIds: readonly string[];
  readonly effectiveFrom?: string;
  readonly publishedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
};

export type CreateOrgGovernanceProfileInput = {
  readonly key: string;
  readonly name: string;
  readonly requiresHoldDecision?: boolean;
  readonly requiresClosureApproval?: boolean;
  readonly requiresEvidenceOnClose?: boolean;
  readonly initiationRequiresMilestone?: boolean;
  readonly milestoneDateToleranceDays?: number;
  readonly waitingBreachEscalationDays?: number;
  readonly allowedDeliveryModels?: readonly ProjectDeliveryModel[];
  readonly allowedClassifications?: readonly ProjectClassification[];
  readonly boundPolicyIds?: readonly string[];
  readonly effectiveFrom?: string;
};

export type UpdateOrgGovernanceProfileInput = {
  readonly name?: string;
  readonly requiresHoldDecision?: boolean;
  readonly requiresClosureApproval?: boolean;
  readonly requiresEvidenceOnClose?: boolean;
  readonly initiationRequiresMilestone?: boolean;
  readonly milestoneDateToleranceDays?: number;
  readonly waitingBreachEscalationDays?: number;
  readonly allowedDeliveryModels?: readonly ProjectDeliveryModel[];
  readonly allowedClassifications?: readonly ProjectClassification[];
  readonly boundPolicyIds?: readonly string[];
  readonly effectiveFrom?: string | null;
};

export type OperationalPolicy = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly version: number;
  readonly status: GovernancePublishStatus;
  readonly areas: readonly OperationalPolicyArea[];
  readonly rules: Readonly<Record<string, unknown>>;
  readonly boundProfileIds: readonly string[];
  readonly effectiveFrom?: string;
  readonly publishedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
};

export type CreateOperationalPolicyInput = {
  readonly key: string;
  readonly name: string;
  readonly areas: readonly OperationalPolicyArea[];
  readonly rules?: Readonly<Record<string, unknown>>;
  readonly boundProfileIds?: readonly string[];
  readonly effectiveFrom?: string;
};

export type UpdateOperationalPolicyInput = {
  readonly name?: string;
  readonly areas?: readonly OperationalPolicyArea[];
  readonly rules?: Readonly<Record<string, unknown>>;
  readonly boundProfileIds?: readonly string[];
  readonly effectiveFrom?: string | null;
};

export type EffectiveGovernanceLayer = {
  readonly scopeType: GovernanceScopeType;
  readonly scopeId: string;
  readonly profileId?: string;
  readonly profileName?: string;
  readonly policyIds: readonly string[];
};

export type EffectiveGovernanceConfig = {
  readonly scopeType: GovernanceScopeType;
  readonly scopeId: string;
  readonly profile: GovernanceProfile | null;
  readonly layers: readonly EffectiveGovernanceLayer[];
  readonly policyIds: readonly string[];
  readonly resolvedAt: string;
};

export type PolicySimulationResult = {
  readonly targetType: "profile" | "policy";
  readonly targetId: string;
  readonly affectedPortfolioCount: number;
  readonly affectedInitiativeCount: number;
  readonly affectedProjectCount: number;
  readonly affectedProgrammeCount: number;
  readonly sampleProjectIds: readonly string[];
  readonly sampleProgrammeIds: readonly string[];
  readonly conflicts: readonly {
    readonly code: string;
    readonly message: string;
  }[];
  readonly governanceChanges: readonly {
    readonly field: string;
    readonly from: string;
    readonly to: string;
  }[];
  readonly advisoryGateFailures: readonly string[];
  readonly nonRetroactive: true;
  readonly simulatedAt: string;
};

export type GovernanceCompliance = {
  readonly scopeType: "project" | "programme" | "initiative" | "portfolio";
  readonly scopeId: string;
  readonly band: GovernanceComplianceBand;
  readonly factors: readonly {
    readonly code: string;
    readonly label: string;
    readonly severity: "info" | "advisory" | "breach" | "critical";
  }[];
  readonly computedAt: string;
};

/** W010 / PX-07 — Delegation (time-bounded, scoped, audited). */
export const DELEGATION_STATUSES = ["active", "expired", "revoked"] as const;
export type DelegationStatus = (typeof DELEGATION_STATUSES)[number];

export type OperationalDelegation = {
  readonly id: string;
  readonly fromPrincipalId: string;
  readonly toPrincipalId: string;
  readonly scopeType: GovernanceScopeType;
  readonly scopeId: string;
  readonly permissionSet: readonly string[];
  readonly roleKeys: readonly string[];
  readonly validFrom: string;
  readonly validTo: string;
  readonly reason: string;
  readonly status: DelegationStatus;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly revokedAt?: string;
  readonly revokedBy?: string;
};

export type CreateOperationalDelegationInput = {
  readonly fromPrincipalId: string;
  readonly toPrincipalId: string;
  readonly scopeType: GovernanceScopeType;
  readonly scopeId: string;
  readonly permissionSet?: readonly string[];
  readonly roleKeys?: readonly string[];
  readonly validFrom: string;
  readonly validTo: string;
  readonly reason: string;
};

/** W010 — Retention & legal hold (Projects operational SoR). */
export type RetentionPolicy = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly classification: string;
  readonly retainYears: number;
  readonly archiveBehaviour: "archive" | "retain_online" | "purge_eligible";
  readonly status: GovernancePublishStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateRetentionPolicyInput = {
  readonly key: string;
  readonly name: string;
  readonly classification: string;
  readonly retainYears: number;
  readonly archiveBehaviour: RetentionPolicy["archiveBehaviour"];
};

export type LegalHold = {
  readonly id: string;
  readonly scopeType: GovernanceScopeType;
  readonly scopeId: string;
  readonly reason: string;
  readonly placedBy: string;
  readonly placedAt: string;
  readonly releasedAt?: string;
  readonly releasedBy?: string;
  readonly status: "active" | "released";
};

export type CreateLegalHoldInput = {
  readonly scopeType: GovernanceScopeType;
  readonly scopeId: string;
  readonly reason: string;
};

/** W010 SG-D9 — Governed enterprise searches (≠ personal SavedSearch). */
export type GovernedSearch = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly query: string;
  readonly facets: Record<string, string>;
  readonly status: GovernancePublishStatus;
  readonly audience: "organisation" | "portfolio" | "programme";
  readonly scopeId?: string;
  readonly publishedAt?: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateGovernedSearchInput = {
  readonly key: string;
  readonly name: string;
  readonly query: string;
  readonly facets?: Record<string, string>;
  readonly audience?: GovernedSearch["audience"];
  readonly scopeId?: string;
};

/** W010 — Operational Role catalogue (accountability keys, not IAM). */
export type OperationalRoleDefinition = {
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly accountabilityHint: string;
  readonly status: "active" | "deprecated";
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateOperationalRoleInput = {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  readonly accountabilityHint?: string;
};

/** W010 — Admin audit event (immutable append-only view). */
export type GovernanceAdminAuditEvent = {
  readonly id: string;
  readonly type: string;
  readonly actorPrincipalId: string;
  readonly summary: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId?: string;
  readonly at: string;
};

/** W010 SG-D14 — Delivery Governance Maturity (admin view). */
export const GOVERNANCE_MATURITY_BANDS = [
  "Initial",
  "Managed",
  "Defined",
  "Measured",
  "Optimising",
] as const;
export type GovernanceMaturityBand = (typeof GOVERNANCE_MATURITY_BANDS)[number];

export type GovernanceMaturityAssessment = {
  readonly scopeType: GovernanceScopeType;
  readonly scopeId: string;
  readonly band: GovernanceMaturityBand;
  readonly factors: readonly {
    readonly code: string;
    readonly label: string;
    readonly score: number;
  }[];
  readonly assessedAt: string;
};
