import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  Approval,
  ApprovalStageConfig,
  CertificationAuditEntry,
  CertificationEvidenceLinks,
  CertificationGateDefinition,
  CertificationGateEvaluation,
  CertificationHistoryEntry,
  CertificationRecommendation,
  CertificationRecord,
  CertificationRule,
  Signature,
  Witness,
} from "../domain";
import type {
  ApprovalId,
  CertificationAuditEntryId,
  CertificationGateDefinitionId,
  CertificationRecordId,
  CertificationRuleId,
} from "../identifiers";
import type {
  CertificationGateOutcome,
  CertificationRecommendationCode,
  CertificationStatus,
} from "../enums";

/** Certification record CRUD + transition helpers (APZTCMS-009). */
export interface CertificationEngineRecordService {
  listCertificationRecords(
    ctx: ServiceRequestContext,
  ): Promise<readonly CertificationRecord[]>;
  getCertificationRecord(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
  ): Promise<CertificationRecord>;
  createCertificationRecord(
    ctx: ServiceRequestContext,
    input: Omit<
      CertificationRecord,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "gateEvaluationIds"
      | "currentRecommendation"
      | "status"
    > & {
      readonly status?: CertificationStatus;
    },
  ): Promise<CertificationRecord>;
  updateCertificationRecord(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    patch: Partial<
      Pick<
        CertificationRecord,
        | "name"
        | "productLabel"
        | "releaseLabel"
        | "conditions"
        | "expiresAt"
        | "planId"
        | "evidenceLinks"
        | "ruleId"
      >
    >,
  ): Promise<CertificationRecord>;
  transitionCertificationState(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    nextStatus: CertificationStatus,
    reason?: string,
  ): Promise<CertificationRecord>;
}

/** Validated workflow transitions — humans authorize final approval. */
export interface CertificationWorkflowService {
  transition(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    nextStatus: CertificationStatus,
    reason?: string,
  ): Promise<CertificationRecord>;
  startReview(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  requestChanges(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason: string,
  ): Promise<CertificationRecord>;
  submitForApproval(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  approve(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  conditionallyApprove(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    conditions: string,
  ): Promise<CertificationRecord>;
  reject(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason: string,
  ): Promise<CertificationRecord>;
  expire(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  archive(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  restore(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    nextStatus?: "draft" | "preparing",
    reason?: string,
  ): Promise<CertificationRecord>;
}

/** Configure which gates apply to a cert / plan / product. */
export interface CertificationRuleService {
  listRules(ctx: ServiceRequestContext): Promise<readonly CertificationRule[]>;
  getRule(
    ctx: ServiceRequestContext,
    id: CertificationRuleId,
  ): Promise<CertificationRule>;
  configureRule(
    ctx: ServiceRequestContext,
    input: Omit<CertificationRule, "id" | "createdAt" | "updatedAt">,
  ): Promise<CertificationRule>;
  updateRule(
    ctx: ServiceRequestContext,
    id: CertificationRuleId,
    patch: Partial<
      Omit<CertificationRule, "id" | "tenantId" | "createdAt" | "updatedAt">
    >,
  ): Promise<CertificationRule>;
  listRulesForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationRule[]>;
}

/** Define and evaluate certification gates. */
export interface CertificationGateService {
  listGateDefinitions(
    ctx: ServiceRequestContext,
  ): Promise<readonly CertificationGateDefinition[]>;
  defineGate(
    ctx: ServiceRequestContext,
    input: Omit<CertificationGateDefinition, "id" | "createdAt" | "updatedAt">,
  ): Promise<CertificationGateDefinition>;
  updateGateDefinition(
    ctx: ServiceRequestContext,
    id: CertificationGateDefinitionId,
    patch: Partial<
      Omit<CertificationGateDefinition, "id" | "tenantId" | "createdAt" | "updatedAt">
    >,
  ): Promise<CertificationGateDefinition>;
  evaluateGate(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
    gateKey: string,
  ): Promise<CertificationGateEvaluation>;
  evaluateAll(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationGateEvaluation[]>;
  listEvaluations(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationGateEvaluation[]>;
}

/** Link cert to requirements/plans/suites/cases/executions/evidence/etc. */
export interface CertificationEvidenceService {
  getLinks(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<CertificationEvidenceLinks>;
  linkEvidence(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
    links: Partial<CertificationEvidenceLinks>,
  ): Promise<CertificationEvidenceLinks>;
  unlinkEvidence(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
    links: Partial<CertificationEvidenceLinks>,
  ): Promise<CertificationEvidenceLinks>;
}

/**
 * Cert-bound multi-stage approvals.
 * Final approve requires an authorised human — never automatic / AI.
 */
export interface CertificationApprovalService {
  requestApproval(
    ctx: ServiceRequestContext,
    input: {
      readonly certificationRecordId: CertificationRecordId;
      readonly stages?: readonly ApprovalStageConfig[];
      readonly requestedFromUserId?: string;
      readonly comments?: string;
    },
  ): Promise<Approval>;
  decideApproval(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    decision: Pick<Approval, "status" | "comments" | "conditions"> & {
      readonly stageKey?: string;
    },
  ): Promise<Approval>;
  delegateApproval(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    toUserId: string,
    role?: "reviewer" | "approver",
  ): Promise<Approval>;
  requestRework(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    comments: string,
  ): Promise<Approval>;
  attachSignaturePlaceholder(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    signature: Omit<Signature, "id" | "approvalId">,
  ): Promise<Approval>;
  attachWitnessPlaceholder(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    witness: Omit<Witness, "id" | "approvalId">,
  ): Promise<Approval>;
  listApprovals(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly Approval[]>;
}

/** Immutable append-only certification audit. */
export interface CertificationAuditService {
  append(
    ctx: ServiceRequestContext,
    input: {
      readonly certificationRecordId: CertificationRecordId;
      readonly action: string;
      readonly summary: string;
      readonly detailsJson?: Readonly<Record<string, unknown>>;
    },
  ): Promise<CertificationAuditEntry>;
  list(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationAuditEntry[]>;
  get(
    ctx: ServiceRequestContext,
    id: CertificationAuditEntryId,
  ): Promise<CertificationAuditEntry>;
}

/** List workflow transitions / history. */
export interface CertificationHistoryService {
  listTransitions(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationHistoryEntry[]>;
  appendTransition(
    ctx: ServiceRequestContext,
    input: {
      readonly certificationRecordId: CertificationRecordId;
      readonly fromStatus?: CertificationStatus;
      readonly toStatus: CertificationStatus;
      readonly reason?: string;
      readonly detailsJson?: Readonly<Record<string, unknown>>;
    },
  ): Promise<CertificationHistoryEntry>;
}

/** Validate required gates, approval order, transitions, permissions, tenant/org. */
export interface CertificationValidationService {
  assertTransitionAllowed(
    from: CertificationStatus,
    to: CertificationStatus,
  ): void;
  assertRequiredGatesSatisfied(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<void>;
  assertApprovalOrder(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<void>;
  assertPermission(
    ctx: ServiceRequestContext,
    permission: string,
  ): void;
  assertTenantOrganisation(
    ctx: ServiceRequestContext,
    record: { readonly tenantId: string; readonly organisationId?: string },
  ): void;
  validateTraceability(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<{ readonly ok: boolean; readonly gaps: readonly string[] }>;
}

/**
 * Deterministic advisory recommendation from gate outcomes + readiness inputs.
 * NEVER calls approve. NEVER sets approved status.
 */
export interface CertificationRecommendationService {
  recommend(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<CertificationRecommendation>;
  getLatest(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<CertificationRecommendation | undefined>;
  mapFromGateOutcomes(
    outcomes: readonly {
      readonly gateKey: string;
      readonly status: CertificationGateOutcome;
      readonly required?: boolean;
    }[],
  ): {
    readonly code: CertificationRecommendationCode;
    readonly reasons: readonly string[];
  };
}
