/**
 * APZ Projects Release 3.0 — Operational Delivery (W004).
 * Platform-owned execution SoR. Plane tasks may back commitments; not delivery truth.
 */

export const COMMITMENT_STATUSES = [
  "proposed",
  "accepted",
  "in_progress",
  "waiting",
  "done",
  "cancelled",
] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

export const COMMITMENT_PRIORITIES = ["normal", "high"] as const;
export type CommitmentPriority = (typeof COMMITMENT_PRIORITIES)[number];

export const EVIDENCE_TYPES = [
  "document",
  "approval",
  "deliverable",
  "external_reference",
  "verification_note",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export interface CompletionEvidence {
  readonly type: EvidenceType;
  readonly label: string;
  readonly uri?: string;
  readonly documentId?: string;
  readonly recordedBy: string;
  readonly recordedAt: string;
}

export interface ProjectCommitment {
  readonly id: string;
  readonly projectId: string;
  readonly statement: string;
  readonly ownerUserId: string;
  readonly dueAt?: string;
  readonly status: CommitmentStatus;
  readonly waiters: readonly string[];
  readonly failureConsequence?: string;
  readonly milestoneId?: string;
  readonly waitingId?: string;
  readonly baselineVersionId?: string;
  readonly blockedByDependencyIds: readonly string[];
  readonly priority: CommitmentPriority;
  readonly completionEvidence: readonly CompletionEvidence[];
  readonly blocksGoLive: boolean;
  readonly cancelReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
}

export const WAITING_CATEGORIES = [
  "customer",
  "internal",
  "vendor",
  "governance",
  "external_dependency",
] as const;
export type WaitingCategory = (typeof WAITING_CATEGORIES)[number];

export const WAITING_STATUSES = ["active", "resolved", "cancelled"] as const;
export type WaitingStatus = (typeof WAITING_STATUSES)[number];

export interface ProjectWaiting {
  readonly id: string;
  readonly projectId: string;
  readonly subject: string;
  readonly category: WaitingCategory;
  readonly since: string;
  readonly chaseOwnerUserId: string;
  readonly status: WaitingStatus;
  readonly partyLabel?: string;
  readonly slaDays: number;
  readonly failureConsequence?: string;
  readonly linkedCommitmentId?: string;
  readonly linkedDecisionId?: string;
  readonly linkedMilestoneId?: string;
  readonly resolvedAt?: string;
  readonly resolveNote?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
}

export const DEPENDENCY_KINDS = [
  "finish_to_start",
  "start_to_start",
  "related",
  "external",
] as const;
export type DependencyKind = (typeof DEPENDENCY_KINDS)[number];

export const DEPENDENCY_STATUSES = ["active", "resolved", "broken"] as const;
export type DependencyStatus = (typeof DEPENDENCY_STATUSES)[number];

export const DEPENDENCY_REF_TYPES = [
  "commitment",
  "milestone",
  "decision",
  "external",
] as const;
export type DependencyRefType = (typeof DEPENDENCY_REF_TYPES)[number];

export interface DependencyRef {
  readonly type: DependencyRefType;
  readonly id?: string;
  readonly label?: string;
}

export interface ProjectDependency {
  readonly id: string;
  readonly projectId: string;
  readonly fromRef: DependencyRef;
  readonly toRef: DependencyRef;
  readonly kind: DependencyKind;
  readonly status: DependencyStatus;
  readonly failureConsequence?: string;
  readonly ownerUserId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
}

export const OPS_DECISION_STATUSES = [
  "pending",
  "decided",
  "deferred",
  "cancelled",
] as const;
export type OpsDecisionStatus = (typeof OPS_DECISION_STATUSES)[number];

export interface OpsDecisionLink {
  readonly type: "commitment" | "milestone" | "risk" | "checkpoint";
  readonly id: string;
}

export interface ProjectOpsDecision {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly status: OpsDecisionStatus;
  readonly decisionMakerUserId: string;
  readonly dueAt?: string;
  readonly context?: string;
  readonly outcome?: string;
  readonly failureConsequence?: string;
  readonly links: readonly OpsDecisionLink[];
  readonly deferReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
}

export const CHECKPOINT_STATUSES = [
  "not_started",
  "pending",
  "approved",
  "rejected",
  "waived",
] as const;
export type CheckpointStatus = (typeof CHECKPOINT_STATUSES)[number];

export interface ProjectCheckpoint {
  readonly id: string;
  readonly projectId: string;
  readonly key: string;
  readonly name: string;
  readonly status: CheckpointStatus;
  readonly requiredByProfile: boolean;
  readonly releaseClass: boolean;
  readonly workflowBinding?: string;
  readonly dueAt?: string;
  readonly anchorMilestoneId?: string;
  readonly decisionId?: string;
  readonly waiverActor?: string;
  readonly waiverReason?: string;
  readonly waivedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const EXCEPTION_TYPES = [
  "date_exception",
  "scope_exception",
  "dependency_break",
  "wait_breach",
  "checkpoint_rejected",
  "health_drop",
  "hold",
] as const;
export type ExceptionType = (typeof EXCEPTION_TYPES)[number];

export const EXCEPTION_SEVERITIES = ["advisory", "minor", "major", "critical"] as const;
export type ExceptionSeverity = (typeof EXCEPTION_SEVERITIES)[number];

export const EXCEPTION_STATUSES = ["open", "acknowledged", "concluded"] as const;
export type ExceptionStatus = (typeof EXCEPTION_STATUSES)[number];

export const EXCEPTION_OUTCOMES = [
  "resolved",
  "accepted",
  "waived",
  "re_baselined",
  "cancelled",
] as const;
export type ExceptionOutcome = (typeof EXCEPTION_OUTCOMES)[number];

export interface ProjectException {
  readonly id: string;
  readonly projectId: string;
  readonly type: ExceptionType;
  readonly severity: ExceptionSeverity;
  readonly status: ExceptionStatus;
  readonly outcome?: ExceptionOutcome;
  readonly subjectRef: { readonly type: string; readonly id: string };
  readonly detectedAt: string;
  readonly reason: string;
  readonly impactSummary: string;
  readonly failureConsequence?: string;
  readonly requiredDecisionId?: string;
  readonly escalationState: "none" | "notified" | "escalated";
  readonly resolutionNote?: string;
  readonly concludedAt?: string;
  readonly concludedBy?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OperationalHistoryEntry {
  readonly id: string;
  readonly projectId: string;
  readonly objectType: string;
  readonly objectId: string;
  readonly kind: string;
  readonly summary: string;
  readonly detail?: string;
  readonly actorUserId: string;
  readonly at: string;
}

export type DeliveryHealthLabel = "Healthy" | "Watch" | "Critical";
export type ConfidenceBand = "High" | "Medium" | "Low";

export interface DeliveryFactor {
  readonly code: string;
  readonly label: string;
  readonly weight: number;
  readonly detail: string;
  readonly count?: number;
}

export interface DeliveryHealthResult {
  readonly projectId: string;
  readonly status: DeliveryHealthLabel;
  readonly factors: readonly DeliveryFactor[];
  readonly computedAt: string;
}

export interface DeliveryConfidenceResult {
  readonly projectId: string;
  readonly score: number;
  readonly band: ConfidenceBand;
  readonly factors: readonly DeliveryFactor[];
  readonly computedAt: string;
}

export interface ProjectPulseResult {
  readonly projectId: string;
  readonly sentences: readonly string[];
  readonly text: string;
  readonly computedAt: string;
}

export interface ForecastRecommendedAction {
  readonly label: string;
  readonly targetRef?: { readonly type: string; readonly id: string };
  readonly rationale: string;
}

export interface DeliveryForecastResult {
  readonly projectId: string;
  readonly windowDays: 7 | 14 | 30;
  readonly predictedOutcome: "on_track" | "at_risk" | "off_track";
  readonly confidenceLevel: number;
  readonly confidenceBand: ConfidenceBand;
  readonly contributingFactors: readonly DeliveryFactor[];
  readonly recommendedActions: readonly ForecastRecommendedAction[];
  readonly commitmentsDue: {
    readonly total: number;
    readonly onTrack: number;
    readonly atRisk: number;
    readonly overdueProjected: number;
  };
  readonly milestonesInWindow: readonly {
    readonly id: string;
    readonly name: string;
    readonly dueAt?: string;
  }[];
  readonly waitsLikelyToAge: number;
  readonly decisionsDue: number;
  readonly checkpointsDue: number;
  readonly projectedConfidenceDelta: number;
  readonly narrative: string;
  readonly computedAt: string;
}

export interface CreateCommitmentInput {
  readonly statement: string;
  readonly ownerUserId: string;
  readonly dueAt?: string;
  readonly waiters?: readonly string[];
  readonly failureConsequence?: string;
  readonly milestoneId?: string;
  readonly priority?: CommitmentPriority;
  readonly blocksGoLive?: boolean;
}

export interface CommitmentTransitionInput {
  readonly to: CommitmentStatus;
  readonly waiting?: {
    readonly subject: string;
    readonly category: WaitingCategory;
    readonly chaseOwnerUserId: string;
    readonly partyLabel?: string;
    readonly slaDays?: number;
    readonly failureConsequence?: string;
  };
  readonly evidence?: readonly Omit<CompletionEvidence, "recordedBy" | "recordedAt">[];
  readonly cancelReason?: string;
  readonly evidenceOptional?: boolean;
}

export interface CreateWaitingInput {
  readonly subject: string;
  readonly category: WaitingCategory;
  readonly chaseOwnerUserId: string;
  readonly partyLabel?: string;
  readonly slaDays?: number;
  readonly failureConsequence?: string;
  readonly linkedCommitmentId?: string;
  readonly linkedDecisionId?: string;
  readonly linkedMilestoneId?: string;
  readonly since?: string;
}

export interface CreateDependencyInput {
  readonly fromRef: DependencyRef;
  readonly toRef: DependencyRef;
  readonly kind: DependencyKind;
  readonly failureConsequence?: string;
  readonly ownerUserId?: string;
}

export interface CreateOpsDecisionInput {
  readonly title: string;
  readonly decisionMakerUserId: string;
  readonly dueAt?: string;
  readonly context?: string;
  readonly failureConsequence?: string;
  readonly links?: readonly OpsDecisionLink[];
}

export interface OpsDecisionTransitionInput {
  readonly to: OpsDecisionStatus;
  readonly outcome?: string;
  readonly dueAt?: string;
  readonly deferReason?: string;
}

export interface CreateCheckpointInput {
  readonly key: string;
  readonly name: string;
  readonly requiredByProfile?: boolean;
  readonly releaseClass?: boolean;
  readonly dueAt?: string;
  readonly anchorMilestoneId?: string;
}

export interface CreateExceptionInput {
  readonly type: ExceptionType;
  readonly severity: ExceptionSeverity;
  readonly subjectRef: { readonly type: string; readonly id: string };
  readonly reason: string;
  readonly impactSummary: string;
  readonly failureConsequence?: string;
  readonly requiredDecisionId?: string;
}

export interface ConcludeExceptionInput {
  readonly outcome: ExceptionOutcome;
  readonly resolutionNote: string;
}
