/** Platform Quality Integration Layer domain models (APZTCMS-014). */

import type { AuditFields } from "./audit";
import type { CertificationRecord } from "./certification";
import type { QualitySummary, ReleaseReadinessAssessment } from "./quality";
import type { TraceabilityLink } from "./analytics";
import type {
  GovernedProductId,
  PlatformCrossProductLinkId,
  PlatformReleaseApprovalId,
  PlatformReleaseCandidateId,
  PlatformReleaseDecisionId,
  PlatformReleaseId,
  PlatformReleasePackageId,
  ProductDependencyId,
  ProductRegistryId,
} from "../identifiers";
import type {
  DependencyRelationKind,
  DependencyRequirementKind,
  PlatformGovernanceApprovalKind,
  PlatformProductKey,
  PlatformQualityStatus,
  PlatformReleaseLifecycleStatus,
  PlatformReleaseReadinessVerdict,
} from "../enums";

/** Canonical APZHUB product participating in quality governance. */
export interface GovernedProduct extends AuditFields {
  readonly id: GovernedProductId;
  readonly registryId: ProductRegistryId;
  readonly key: PlatformProductKey;
  readonly displayName: string;
  readonly owner: string;
  readonly version: string;
  readonly enabled: boolean;
  readonly qualityStatus: PlatformQualityStatus;
  readonly certificationStatus: string;
  readonly releaseReadiness: PlatformReleaseReadinessVerdict;
  readonly dependencyIds: readonly ProductDependencyId[];
  readonly healthSummary?: ProductHealthSummary;
  readonly organisationId?: string;
}

export interface ProductRegistry extends AuditFields {
  readonly id: ProductRegistryId;
  readonly tenantId: string;
  readonly name: string;
  readonly productIds: readonly GovernedProductId[];
  readonly organisationId?: string;
}

export interface ProductDependency extends AuditFields {
  readonly id: ProductDependencyId;
  readonly tenantId: string;
  readonly fromProductId: GovernedProductId;
  readonly toProductId: GovernedProductId;
  readonly relation: DependencyRelationKind;
  readonly requirement: DependencyRequirementKind;
  readonly blocked: boolean;
  readonly notes?: string;
  readonly organisationId?: string;
}

export interface DependencyValidationResult {
  readonly valid: boolean;
  readonly missingRequired: readonly ProductDependencyId[];
  readonly blockedDependencies: readonly ProductDependencyId[];
  readonly cycleDetected: boolean;
  readonly cycleProductIds: readonly GovernedProductId[];
  readonly messages: readonly string[];
  readonly computedAt: string;
}

export interface DependencyHealthSummary {
  readonly productId: GovernedProductId;
  readonly upstreamCount: number;
  readonly downstreamCount: number;
  readonly requiredCount: number;
  readonly optionalCount: number;
  readonly blockedCount: number;
  readonly readiness: PlatformReleaseReadinessVerdict;
  readonly computedAt: string;
}

export interface ProductHealthSummary {
  readonly productId: GovernedProductId;
  readonly qualityStatus: PlatformQualityStatus;
  readonly coverageLabel?: string;
  readonly testsLabel?: string;
  readonly approvalsLabel?: string;
  readonly certificationStatus: string;
  readonly knownRisks: readonly string[];
  readonly knownBlockers: readonly string[];
  readonly dependencyReadiness: PlatformReleaseReadinessVerdict;
  readonly computedAt: string;
  /** Governance only — not infrastructure monitoring. */
  readonly isInfrastructureHealth: false;
}

export interface PlatformReleaseScope {
  readonly productIds: readonly GovernedProductId[];
  readonly labels?: readonly string[];
}

export interface PlatformReleasePackage extends AuditFields {
  readonly id: PlatformReleasePackageId;
  readonly releaseId: PlatformReleaseId;
  readonly name: string;
  readonly productIds: readonly GovernedProductId[];
  readonly versionLabel: string;
}

export interface PlatformReleaseCandidate extends AuditFields {
  readonly id: PlatformReleaseCandidateId;
  readonly releaseId: PlatformReleaseId;
  readonly label: string;
  readonly scope: PlatformReleaseScope;
  readonly status: PlatformReleaseLifecycleStatus;
}

export interface PlatformReleaseWindow {
  readonly startsAt?: string;
  readonly endsAt?: string;
  readonly timezone?: string;
  readonly notes?: string;
}

export interface PlatformReleaseApproval extends AuditFields {
  readonly id: PlatformReleaseApprovalId;
  readonly releaseId: PlatformReleaseId;
  readonly kind: PlatformGovernanceApprovalKind;
  readonly status: "pending" | "approved" | "rejected" | "withdrawn";
  readonly decidedByUserId?: string;
  readonly decidedAt?: string;
  readonly comments?: string;
  readonly subjectScope?: string;
}

export interface PlatformReleaseDecision extends AuditFields {
  readonly id: PlatformReleaseDecisionId;
  readonly releaseId: PlatformReleaseId;
  readonly verdict: PlatformReleaseReadinessVerdict;
  readonly decidedByUserId: string;
  readonly decidedAt: string;
  readonly rationale: string;
  /** Human decision only — never system auto-release. */
  readonly isAutomatic: false;
}

export interface PlatformReleaseNote {
  readonly title: string;
  readonly body: string;
  readonly authoredAt: string;
  readonly authorUserId?: string;
}

export interface PlatformReleaseEvidenceRef {
  readonly kind: string;
  readonly refId: string;
  readonly summary?: string;
}

export interface PlatformReleaseManifest {
  readonly releaseId: PlatformReleaseId;
  readonly productKeys: readonly PlatformProductKey[];
  readonly packageIds: readonly PlatformReleasePackageId[];
  readonly dependencyIds: readonly ProductDependencyId[];
  readonly generatedAt: string;
}

export interface PlatformReleaseSummary {
  readonly releaseId: PlatformReleaseId;
  readonly readiness: PlatformReleaseReadinessAggregate;
  readonly certificationAggregate?: MultiProductCertificationAggregate;
  readonly approvalStatuses: Readonly<Record<PlatformGovernanceApprovalKind, string>>;
  readonly dependencyValidation: DependencyValidationResult;
  readonly recommendationCode:
    "recommend_release" | "recommend_hold" | "recommend_reject";
  readonly recommendationReasons: readonly string[];
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface PlatformRelease extends AuditFields {
  readonly id: PlatformReleaseId;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly status: PlatformReleaseLifecycleStatus;
  readonly scope: PlatformReleaseScope;
  readonly packageIds: readonly PlatformReleasePackageId[];
  readonly candidateIds: readonly PlatformReleaseCandidateId[];
  readonly window?: PlatformReleaseWindow;
  readonly approvalIds: readonly PlatformReleaseApprovalId[];
  readonly decisionIds: readonly PlatformReleaseDecisionId[];
  readonly notes: readonly PlatformReleaseNote[];
  readonly evidenceRefs: readonly PlatformReleaseEvidenceRef[];
  readonly dependencyIds: readonly ProductDependencyId[];
  readonly organisationId?: string;
}

export interface ProductQualityContribution {
  readonly productId: GovernedProductId;
  readonly productKey: PlatformProductKey;
  readonly qualityStatus: PlatformQualityStatus;
  readonly summary?: QualitySummary;
  readonly readiness?: ReleaseReadinessAssessment;
  readonly certificationRecordIds: readonly string[];
  readonly openIssueCount: number;
  readonly coveragePercent?: number;
  readonly riskLabels: readonly string[];
}

/**
 * Cross-product quality rollup — consumes existing product quality; no new formulas.
 */
export interface PlatformQualityAggregate {
  readonly tenantId: string;
  readonly productContributions: readonly ProductQualityContribution[];
  readonly overallQualityStatus: PlatformQualityStatus;
  readonly coverageLabels: readonly string[];
  readonly riskLabels: readonly string[];
  readonly approvalLabels: readonly string[];
  readonly defectLabels: readonly string[];
  readonly automationLabels: readonly string[];
  readonly manualExecutionLabels: readonly string[];
  readonly readinessVerdict: PlatformReleaseReadinessVerdict;
  readonly certificationLabels: readonly string[];
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface MultiProductCertificationAggregate {
  readonly scope: "single_product" | "multiple_products" | "entire_platform";
  readonly productIds: readonly GovernedProductId[];
  readonly records: readonly CertificationRecord[];
  readonly approvedCount: number;
  readonly pendingCount: number;
  readonly rejectedCount: number;
  readonly overallLabel: string;
  readonly computedAt: string;
  /** Aggregation only — does not evaluate gates. */
  readonly isNewCertificationEngine: false;
}

export interface PlatformReleaseReadinessAggregate {
  readonly releaseId?: PlatformReleaseId;
  readonly productReadiness: Readonly<
    Partial<Record<string, PlatformReleaseReadinessVerdict>>
  >;
  readonly dependencyReadiness: PlatformReleaseReadinessVerdict;
  readonly qualityStatus: PlatformQualityStatus;
  readonly riskLabels: readonly string[];
  readonly coverageLabels: readonly string[];
  readonly certificationLabel: string;
  readonly approvalCompletenessPercent: number;
  readonly openIssueCount: number;
  readonly verdict: PlatformReleaseReadinessVerdict;
  readonly blockingFactors: readonly string[];
  readonly warningFactors: readonly string[];
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface PlatformQualityDashboardSnapshot {
  readonly tenantId: string;
  readonly overallHealth: PlatformQualityStatus;
  readonly qualityScoreLabel: string;
  readonly certificationSummary: string;
  readonly releaseReadiness: PlatformReleaseReadinessVerdict;
  readonly riskOverview: readonly string[];
  readonly dependencyHealth: readonly DependencyHealthSummary[];
  readonly recentRegressions: readonly string[];
  readonly manualTestingLabel: string;
  readonly automationLabel: string;
  readonly defectsLabel: string;
  readonly coverageLabel: string;
  readonly computedAt: string;
  /** Domain snapshot only — no charts/UI. */
  readonly isChartPayload: false;
}

export interface PlatformCrossProductLink extends AuditFields {
  readonly id: PlatformCrossProductLinkId;
  readonly tenantId: string;
  readonly sourceProductKey: PlatformProductKey;
  readonly targetProductKey: PlatformProductKey;
  readonly linkKind:
    "requirement_mapping" | "evidence" | "certification" | "release" | "defect";
  readonly sourceRef: string;
  readonly targetRef: string;
  readonly summary?: string;
  readonly underlyingTraceabilityLink?: TraceabilityLink;
}
