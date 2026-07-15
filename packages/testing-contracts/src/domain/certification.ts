import type { AuditFields } from "./audit";
import type {
  ApprovalId,
  AuditEventId,
  CertificationAuditEntryId,
  CertificationGateDefinitionId,
  CertificationGateEvaluationId,
  CertificationHistoryEntryId,
  CertificationRecordId,
  CertificationRecommendationId,
  CertificationRuleId,
  QualityGateId,
  ReleaseReadinessId,
  SignatureId,
  TestPlanId,
  WitnessId,
} from "../identifiers";
import type {
  ApprovalRole,
  ApprovalStatus,
  CertificationGateOutcome,
  CertificationRecommendationCode,
  CertificationStatus,
  QualityGateStatus,
  ReleaseReadinessStatus,
  RiskLevel,
} from "../enums";

export interface QualityGate extends AuditFields {
  readonly id: QualityGateId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: QualityGateStatus;
  readonly certificationRecordId?: CertificationRecordId;
  readonly ruleSummary?: string;
  readonly evaluatedAt?: string;
  readonly waiverReason?: string;
}

export interface Signature {
  readonly id: SignatureId;
  readonly approvalId: ApprovalId;
  readonly signerUserId: string;
  readonly signedAt: string;
  readonly method: "digital" | "attested" | "system";
  readonly statement?: string;
  /** Placeholder for future digital signature payload — never a real crypto blob here. */
  readonly signaturePlaceholderRef?: string;
}

export interface Witness {
  readonly id: WitnessId;
  readonly approvalId: ApprovalId;
  readonly witnessUserId: string;
  readonly witnessedAt: string;
  readonly statement?: string;
}

export interface ApprovalHistoryEntry {
  readonly at: string;
  readonly actorUserId?: string;
  readonly fromStatus?: ApprovalStatus;
  readonly toStatus: ApprovalStatus;
  readonly role?: ApprovalRole;
  readonly comments?: string;
  readonly stageKey?: string;
}

/** Multi-stage approval configuration entry. */
export interface ApprovalStageConfig {
  readonly stageKey: string;
  readonly requiredRole: ApprovalRole | string;
  readonly ordinal: number;
}

export interface ApprovalStageDecision {
  readonly stageKey: string;
  readonly status: ApprovalStatus;
  readonly decidedByUserId?: string;
  readonly decidedAt?: string;
  readonly comments?: string;
}

export interface Approval extends AuditFields {
  readonly id: ApprovalId;
  readonly certificationRecordId: CertificationRecordId;
  readonly gateId?: QualityGateId;
  readonly status: ApprovalStatus;
  readonly requestedFromUserId?: string;
  readonly decidedByUserId?: string;
  readonly decidedAt?: string;
  readonly comments?: string;
  readonly conditions?: string;
  readonly signature?: Signature;
  readonly witnesses?: readonly Witness[];
  readonly authorUserId?: string;
  readonly reviewerUserId?: string;
  readonly approverUserId?: string;
  readonly history?: readonly ApprovalHistoryEntry[];
  readonly subjectKind?: string;
  readonly subjectId?: string;
  readonly stages?: readonly ApprovalStageConfig[];
  readonly currentStageOrdinal?: number;
  readonly stageDecisions?: readonly ApprovalStageDecision[];
}

/** Configurable certification gate definition (per tenant / template). */
export interface CertificationGateDefinition extends AuditFields {
  readonly id: CertificationGateDefinitionId;
  readonly gateKey: string;
  readonly name: string;
  readonly description?: string;
  readonly kind: string;
  readonly required: boolean;
  readonly configJson?: Readonly<Record<string, unknown>>;
  readonly templateKey?: string;
  readonly ordinal?: number;
  readonly enabled: boolean;
}

/** Immutable-ish gate evaluation result (revision allowed). */
export interface CertificationGateEvaluation extends AuditFields {
  readonly id: CertificationGateEvaluationId;
  readonly certificationRecordId: CertificationRecordId;
  readonly gateDefinitionId?: CertificationGateDefinitionId;
  readonly gateKey: string;
  readonly status: CertificationGateOutcome;
  readonly reason: string;
  readonly supportingEvidence: readonly string[];
  readonly evaluatedAt: string;
  readonly evaluatorUserId?: string;
  readonly traceabilityRefs: readonly string[];
  readonly detailsJson?: Readonly<Record<string, unknown>>;
}

/** Advisory recommendation — never authorizes approval. */
export interface CertificationRecommendation {
  readonly id: CertificationRecommendationId;
  readonly certificationRecordId: CertificationRecordId;
  readonly code: CertificationRecommendationCode;
  readonly reasons: readonly string[];
  readonly gateEvaluationIds: readonly CertificationGateEvaluationId[];
  readonly computedAt: string;
  readonly advisoryOnly: true;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
}

/** Which gates apply to a certification / plan / product scope. */
export interface CertificationRule extends AuditFields {
  readonly id: CertificationRuleId;
  readonly key: string;
  readonly name: string;
  readonly certificationRecordId?: CertificationRecordId;
  readonly planId?: TestPlanId;
  readonly productLabel?: string;
  readonly requiredGateKeys: readonly string[];
  readonly optionalGateKeys: readonly string[];
  readonly approvalStages?: readonly ApprovalStageConfig[];
  readonly enabled: boolean;
  readonly configJson?: Readonly<Record<string, unknown>>;
}

/** Append-only certification audit entry. */
export interface CertificationAuditEntry {
  readonly id: CertificationAuditEntryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly certificationRecordId: CertificationRecordId;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly summary: string;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
}

/** Append-only certification workflow history / transition entry. */
export interface CertificationHistoryEntry {
  readonly id: CertificationHistoryEntryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly certificationRecordId: CertificationRecordId;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly fromStatus?: CertificationStatus;
  readonly toStatus: CertificationStatus;
  readonly reason?: string;
  readonly correlationId?: string;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
}

/** Evidence / artifact linkage bag for a certification record. */
export interface CertificationEvidenceLinks {
  readonly requirementIds: readonly string[];
  readonly planIds: readonly string[];
  readonly suiteIds: readonly string[];
  readonly caseIds: readonly string[];
  readonly executionIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly coverageIds: readonly string[];
  readonly defectIds: readonly string[];
  readonly riskIds: readonly string[];
  readonly readinessSummaryIds: readonly string[];
  readonly qualitySummaryIds: readonly string[];
}

export interface CertificationRecord extends AuditFields {
  readonly id: CertificationRecordId;
  readonly key: string;
  readonly name: string;
  /** Workflow status — prefer canonical lifecycle values. */
  readonly status: CertificationStatus;
  readonly planId?: TestPlanId;
  readonly productLabel?: string;
  readonly releaseLabel?: string;
  readonly gateIds: readonly QualityGateId[];
  readonly approvalIds: readonly ApprovalId[];
  readonly conditions?: string;
  readonly certifiedAt?: string;
  readonly expiresAt?: string;
  readonly gateEvaluationIds?: readonly CertificationGateEvaluationId[];
  readonly currentRecommendation?: CertificationRecommendationCode;
  readonly recommendationJson?: Readonly<Record<string, unknown>>;
  readonly evidenceLinks?: CertificationEvidenceLinks;
  readonly ruleId?: CertificationRuleId;
}

export interface ReleaseReadiness extends AuditFields {
  readonly id: ReleaseReadinessId;
  readonly certificationRecordId: CertificationRecordId;
  readonly status: ReleaseReadinessStatus;
  readonly summary: string;
  readonly blockingGateIds: readonly QualityGateId[];
  readonly assessedAt: string;
}

export interface AuditEvent {
  readonly id: AuditEventId;
  readonly tenantId: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly entityKind: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly summary: string;
  readonly details?: Readonly<Record<string, string>>;
}

/** Readiness inputs for certification preparation — not a certification engine result. */
export interface CertificationPreparationSummary {
  readonly planId?: TestPlanId;
  readonly certificationRecordId?: CertificationRecordId;
  readonly coverageGaps: readonly string[];
  readonly missingEvidenceIds: readonly string[];
  readonly missingEvidenceCount: number;
  readonly approvalCompletenessPercent: number;
  readonly pendingApprovalIds: readonly ApprovalId[];
  readonly executionCompletenessPercent: number;
  readonly incompleteExecutionIds: readonly string[];
  readonly riskSummary: {
    readonly totalRisks: number;
    readonly highOrCriticalCount: number;
    readonly highestLevel?: RiskLevel;
  };
  readonly computedAt: string;
}

/** Release readiness calculation inputs — never an authoritative release decision. */
export interface ReleaseReadinessInputs {
  readonly certificationRecordId?: CertificationRecordId;
  readonly planId?: TestPlanId;
  readonly preparation: CertificationPreparationSummary;
  readonly blockingFactors: readonly string[];
  readonly suggestedStatus: ReleaseReadinessStatus;
  readonly computedAt: string;
  /** Explicit reminder: callers must not treat this as a release decision. */
  readonly isDecision: false;
  readonly passPercent?: number;
  readonly failCount?: number;
  readonly blockedCount?: number;
  readonly missingEvidenceCount?: number;
  readonly missingApprovalCount?: number;
  readonly completionPercent?: number;
}
