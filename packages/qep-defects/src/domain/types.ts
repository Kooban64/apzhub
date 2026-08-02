/**
 * Enterprise Defect Management domain — APZQEP-140-D.
 * Investigation records. Not evidence. Not execution facts.
 */

export const DEFECT_LIFECYCLE_STATES = [
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "fixed",
  "ready_for_retest",
  "verified",
  "rejected",
  "duplicate",
  "wont_fix",
  "closed",
  "archived",
] as const;
export type DefectLifecycleState = (typeof DEFECT_LIFECYCLE_STATES)[number];

export const DEFECT_SEVERITIES = ["critical", "major", "minor", "trivial"] as const;
export type DefectSeverity = (typeof DEFECT_SEVERITIES)[number];

export const DEFECT_PRIORITIES = ["p0", "p1", "p2", "p3", "p4"] as const;
export type DefectPriority = (typeof DEFECT_PRIORITIES)[number];

export type DefectRelationshipKind =
  | "execution_session"
  | "execution_step"
  | "evidence"
  | "suite"
  | "execution_plan"
  | "defect"
  | "release"
  | "environment"
  | "requirement_future";

export type DefectRelationship = {
  readonly relationshipId: string;
  readonly kind: DefectRelationshipKind;
  readonly targetId: string;
  readonly label?: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

/** Immutable factual context copied at raise-time — Cap C remains SoR. */
export type ExecutionOrigin = {
  readonly sessionId: string;
  readonly stepId?: string;
  readonly stepTitle?: string;
  readonly stepOutcome?: string;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly suiteName?: string;
  readonly failureNotes?: string;
};

export type DefectEvidenceRef = {
  readonly evidenceId: string;
  readonly attachedAt: string;
  readonly attachedBy: string;
  readonly note?: string;
};

export type DefectNode = {
  readonly defectId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly title: string;
  readonly description: string;
  readonly status: DefectLifecycleState;
  readonly severity: DefectSeverity;
  readonly priority: DefectPriority;
  readonly category?: string;
  readonly environment?: string;
  readonly component?: string;
  readonly applicationVersion?: string;
  readonly releaseReference?: string;
  readonly reporterId: string;
  readonly assigneeId?: string;
  readonly reviewerId?: string;
  readonly resolution?: string;
  readonly rootCause?: string;
  readonly verificationNotes?: string;
  readonly duplicateOfDefectId?: string;
  readonly executionOrigin?: ExecutionOrigin;
  readonly evidenceRefs: readonly DefectEvidenceRef[];
  readonly relationships: readonly DefectRelationship[];
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly closedAt?: string;
  readonly archivedAt?: string;
  readonly revision: number;
  readonly customMetadata: Readonly<Record<string, unknown>>;
};

export type DefectHistoryEntry = {
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly fromStatus?: DefectLifecycleState;
  readonly toStatus?: DefectLifecycleState;
  readonly detail?: string;
};

export type DefectAggregate = {
  readonly defect: DefectNode;
  readonly history: readonly DefectHistoryEntry[];
};
