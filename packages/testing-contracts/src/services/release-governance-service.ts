import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  Release,
  ReleaseApproval,
  ReleaseAuditEntry,
  ReleaseCandidate,
  ReleaseDecision,
  ReleaseDependency,
  ReleaseEvidence,
  ReleaseManifest,
  ReleaseNote,
  ReleasePackage,
  ReleaseReadinessSnapshot,
  ReleaseRiskAssessment,
  ReleaseScope,
  ReleaseSummary,
  ReleaseWindow,
} from "../domain/release-governance";
import type {
  ReleaseApprovalId,
  ReleaseDependencyId,
  ReleaseEvidenceId,
  ReleaseId,
  ReleaseScopeId,
} from "../identifiers";
import type {
  ReleaseApprovalStageKind,
  ReleaseGovernanceStatus,
  ReleaseScopeKind,
} from "../enums";

export interface ReleaseCreateInput {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly window?: ReleaseWindow;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly organisationId?: string;
  readonly status?: Extract<ReleaseGovernanceStatus, "draft" | "planning">;
}

export interface ReleaseMetadataUpdateInput {
  readonly name?: string;
  readonly description?: string;
  readonly window?: ReleaseWindow;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface ReleaseScopeAddInput {
  readonly kind: ReleaseScopeKind;
  readonly refId: string;
  readonly label?: string;
}

export interface ReleaseEvidenceAttachInput {
  readonly kind: string;
  readonly refId: string;
  readonly summary?: string;
}

export interface ReleasePackageCreateInput {
  readonly name: string;
  readonly versionLabel: string;
  readonly description?: string;
}

export interface ReleaseCandidateCreateInput {
  readonly label: string;
  readonly notes?: string;
}

export interface ReleaseNoteCreateInput {
  readonly title: string;
  readonly body: string;
}

export interface ReleaseDependencyCreateInput {
  readonly dependsOnReleaseId?: ReleaseId;
  readonly kind: string;
  readonly required?: boolean;
  readonly notes?: string;
  readonly blocked?: boolean;
}

export interface ReleaseApprovalRequestInput {
  readonly stageKind: ReleaseApprovalStageKind;
  readonly requestedFromUserId?: string;
  readonly comments?: string;
}

export interface ReleaseApprovalDecideInput {
  readonly status: "approved" | "rejected" | "withdrawn" | "conditional";
  readonly comments?: string;
  readonly conditions?: string;
}

/**
 * TCMS-only Release & Quality Governance service (APZTCMS-014).
 * Advisory evaluate/generate methods always return isDecision: false.
 */
export interface ReleaseGovernanceService {
  createRelease(
    ctx: ServiceRequestContext,
    input: ReleaseCreateInput,
  ): Promise<Release>;
  getRelease(ctx: ServiceRequestContext, id: ReleaseId): Promise<Release>;
  listReleases(ctx: ServiceRequestContext): Promise<readonly Release[]>;
  updateReleaseMetadata(
    ctx: ServiceRequestContext,
    id: ReleaseId,
    input: ReleaseMetadataUpdateInput,
  ): Promise<Release>;

  addScope(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    input: ReleaseScopeAddInput,
  ): Promise<ReleaseScope>;
  removeScope(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    scopeId: ReleaseScopeId,
  ): Promise<void>;

  attachEvidence(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    input: ReleaseEvidenceAttachInput,
  ): Promise<ReleaseEvidence>;
  removeEvidence(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    evidenceId: ReleaseEvidenceId,
  ): Promise<void>;

  addPackage(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    input: ReleasePackageCreateInput,
  ): Promise<ReleasePackage>;
  addCandidate(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    input: ReleaseCandidateCreateInput,
  ): Promise<ReleaseCandidate>;
  addNote(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    input: ReleaseNoteCreateInput,
  ): Promise<ReleaseNote>;
  addDependency(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    input: ReleaseDependencyCreateInput,
  ): Promise<ReleaseDependency>;
  removeDependency(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    dependencyId: ReleaseDependencyId,
  ): Promise<void>;

  evaluateReadiness(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<ReleaseReadinessSnapshot>;
  evaluateRisk(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<ReleaseRiskAssessment>;
  evaluateCertification(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<ReleaseReadinessSnapshot>;
  evaluateApprovals(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<ReleaseReadinessSnapshot>;

  generateReleaseSummary(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<ReleaseSummary>;

  submitForReview(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    reason?: string,
  ): Promise<Release>;
  submitForApproval(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    reason?: string,
  ): Promise<Release>;
  approveRelease(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    rationale: string,
  ): Promise<{ readonly release: Release; readonly decision: ReleaseDecision }>;
  conditionallyApproveRelease(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    rationale: string,
    conditions?: string,
  ): Promise<{ readonly release: Release; readonly decision: ReleaseDecision }>;
  rejectRelease(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    rationale: string,
  ): Promise<{ readonly release: Release; readonly decision: ReleaseDecision }>;
  withdrawRelease(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    reason?: string,
  ): Promise<Release>;
  archiveRelease(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    reason?: string,
  ): Promise<Release>;
  restoreRelease(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    reason?: string,
  ): Promise<Release>;

  requestApproval(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
    input: ReleaseApprovalRequestInput,
  ): Promise<ReleaseApproval>;
  decideApproval(
    ctx: ServiceRequestContext,
    approvalId: ReleaseApprovalId,
    input: ReleaseApprovalDecideInput,
  ): Promise<ReleaseApproval>;

  listAudit(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleaseAuditEntry[]>;
  getManifest(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<ReleaseManifest>;

  listPackages(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleasePackage[]>;
  listCandidates(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleaseCandidate[]>;
  listScope(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleaseScope[]>;
  listEvidence(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleaseEvidence[]>;
  listNotes(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleaseNote[]>;
  listDependencies(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleaseDependency[]>;
  listApprovals(
    ctx: ServiceRequestContext,
    releaseId: ReleaseId,
  ): Promise<readonly ReleaseApproval[]>;
}
