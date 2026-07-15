/** APZ TCMS Release & Quality Governance domain models (APZTCMS-014) — TCMS-only. */

import type { AuditFields } from "./audit";
import type {
  ReleaseApprovalId,
  ReleaseAuditEntryId,
  ReleaseCandidateId,
  ReleaseDecisionId,
  ReleaseDependencyId,
  ReleaseEvidenceId,
  ReleaseId,
  ReleaseNoteId,
  ReleasePackageId,
  ReleaseReadinessSnapshotId,
  ReleaseRiskAssessmentId,
  ReleaseScopeId,
  ReleaseSummarySnapshotId,
} from "../identifiers";
import type {
  ReleaseAdvisoryVerdict,
  ReleaseApprovalStageKind,
  ReleaseGovernanceStatus,
  ReleaseScopeKind,
} from "../enums";

/** Planned release window (metadata only — not a deployment schedule engine). */
export interface ReleaseWindow {
  readonly startsAt?: string;
  readonly endsAt?: string;
  readonly timezone?: string;
  readonly notes?: string;
}

/** Scope item linking a release to TCMS artefacts. */
export interface ReleaseScope extends AuditFields {
  readonly id: ReleaseScopeId;
  readonly releaseId: ReleaseId;
  readonly kind: ReleaseScopeKind;
  readonly refId: string;
  readonly label?: string;
}

export interface ReleasePackage extends AuditFields {
  readonly id: ReleasePackageId;
  readonly releaseId: ReleaseId;
  readonly name: string;
  readonly versionLabel: string;
  readonly description?: string;
}

export interface ReleaseCandidate extends AuditFields {
  readonly id: ReleaseCandidateId;
  readonly releaseId: ReleaseId;
  readonly label: string;
  readonly status: ReleaseGovernanceStatus;
  readonly notes?: string;
}

export interface ReleaseApproval extends AuditFields {
  readonly id: ReleaseApprovalId;
  readonly releaseId: ReleaseId;
  readonly stageKind: ReleaseApprovalStageKind;
  readonly status: "pending" | "approved" | "rejected" | "withdrawn" | "conditional";
  readonly requestedFromUserId?: string;
  readonly decidedByUserId?: string;
  readonly decidedAt?: string;
  readonly comments?: string;
  readonly conditions?: string;
}

export interface ReleaseDecision extends AuditFields {
  readonly id: ReleaseDecisionId;
  readonly releaseId: ReleaseId;
  readonly verdict: "approved" | "conditionally_approved" | "rejected";
  readonly decidedByUserId: string;
  readonly decidedAt: string;
  readonly rationale: string;
  /** Human decision only — never system auto-release. */
  readonly isAutomatic: false;
}

export interface ReleaseEvidence extends AuditFields {
  readonly id: ReleaseEvidenceId;
  readonly releaseId: ReleaseId;
  readonly kind: string;
  readonly refId: string;
  readonly summary?: string;
}

export interface ReleaseDependency extends AuditFields {
  readonly id: ReleaseDependencyId;
  readonly releaseId: ReleaseId;
  readonly dependsOnReleaseId?: ReleaseId;
  readonly kind: string;
  readonly required: boolean;
  readonly notes?: string;
  readonly blocked: boolean;
}

export interface ReleaseNote extends AuditFields {
  readonly id: ReleaseNoteId;
  readonly releaseId: ReleaseId;
  readonly title: string;
  readonly body: string;
  readonly authoredAt: string;
  readonly authorUserId?: string;
}

/** Generated manifest of release contents — advisory assembly, not a deploy artefact. */
export interface ReleaseManifest {
  readonly releaseId: ReleaseId;
  readonly packageIds: readonly ReleasePackageId[];
  readonly candidateIds: readonly ReleaseCandidateId[];
  readonly scopeRefs: readonly { readonly kind: ReleaseScopeKind; readonly refId: string }[];
  readonly evidenceRefs: readonly { readonly kind: string; readonly refId: string }[];
  readonly dependencyIds: readonly ReleaseDependencyId[];
  readonly generatedAt: string;
  readonly isDecision: false;
}

/** Immutable advisory risk assessment snapshot. */
export interface ReleaseRiskAssessment {
  readonly id: ReleaseRiskAssessmentId;
  readonly releaseId: ReleaseId;
  readonly openDefectLabels: readonly string[];
  readonly coverageGapLabels: readonly string[];
  readonly failedExecutionLabels: readonly string[];
  readonly failedAutomationLabels: readonly string[];
  readonly missingApprovalLabels: readonly string[];
  readonly missingEvidenceLabels: readonly string[];
  readonly expiredCertificationLabels: readonly string[];
  readonly manualOverrideLabels: readonly string[];
  readonly overallLabel: string;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly isDecision: false;
}

/** Immutable advisory readiness snapshot. */
export interface ReleaseReadinessSnapshot {
  readonly id: ReleaseReadinessSnapshotId;
  readonly releaseId: ReleaseId;
  readonly verdict: ReleaseAdvisoryVerdict;
  readonly certificationLabels: readonly string[];
  readonly coverageLabels: readonly string[];
  readonly defectLabels: readonly string[];
  readonly evidenceLabels: readonly string[];
  readonly executionLabels: readonly string[];
  readonly approvalLabels: readonly string[];
  readonly blockingFactors: readonly string[];
  readonly warningFactors: readonly string[];
  readonly detailsJson?: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly isDecision: false;
}

/** Immutable advisory release summary. */
export interface ReleaseSummary {
  readonly id: ReleaseSummarySnapshotId;
  readonly releaseId: ReleaseId;
  readonly readiness?: ReleaseReadinessSnapshot;
  readonly risk?: ReleaseRiskAssessment;
  readonly approvalStatuses: Readonly<Partial<Record<ReleaseApprovalStageKind, string>>>;
  readonly recommendationCode: "recommend_release" | "recommend_hold" | "recommend_reject";
  readonly recommendationReasons: readonly string[];
  readonly computedAt: string;
  readonly isDecision: false;
}

/** Append-only release governance audit entry. */
export interface ReleaseAuditEntry {
  readonly id: ReleaseAuditEntryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly releaseId: ReleaseId;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly summary: string;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
}

/** Core release aggregate (TCMS release governance — not platform multi-product). */
export interface Release extends AuditFields {
  readonly id: ReleaseId;
  readonly key: string;
  readonly name: string;
  readonly status: ReleaseGovernanceStatus;
  readonly description?: string;
  readonly window?: ReleaseWindow;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly organisationId?: string;
}
