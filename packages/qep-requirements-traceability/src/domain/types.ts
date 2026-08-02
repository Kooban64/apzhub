/**
 * Enterprise Requirements & Traceability domain — APZQEP-140-E.
 * Requirements are expectations. Traceability and coverage are derived.
 */

export const REQUIREMENT_CATEGORIES = [
  "business",
  "functional",
  "non_functional",
  "compliance",
  "security",
  "performance",
  "operational",
  "custom",
] as const;
export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];

export const REQUIREMENT_LIFECYCLE_STATES = [
  "draft",
  "under_review",
  "approved",
  "active",
  "deprecated",
  "archived",
  "retired",
] as const;
export type RequirementLifecycleState = (typeof REQUIREMENT_LIFECYCLE_STATES)[number];

export const REQUIREMENT_PRIORITIES = ["p0", "p1", "p2", "p3", "p4"] as const;
export type RequirementPriority = (typeof REQUIREMENT_PRIORITIES)[number];

export const REQUIREMENT_CRITICALITIES = ["critical", "high", "medium", "low"] as const;
export type RequirementCriticality = (typeof REQUIREMENT_CRITICALITIES)[number];

export const REQUIREMENT_RISKS = ["critical", "high", "medium", "low"] as const;
export type RequirementRisk = (typeof REQUIREMENT_RISKS)[number];

/** Explicit user-governed link — Requirements ↔ Suites (entry to derivation chain). */
export type RequirementSuiteLink = {
  readonly linkId: string;
  readonly suiteId: string;
  readonly suiteName?: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type TraceArtefactKind =
  | "requirement"
  | "suite"
  | "execution_plan"
  | "execution_session"
  | "execution_result"
  | "evidence"
  | "defect"
  | "verification";

export type TraceLink = {
  readonly linkId: string;
  readonly fromKind: TraceArtefactKind;
  readonly fromId: string;
  readonly toKind: TraceArtefactKind;
  readonly toId: string;
  readonly label?: string;
  /** explicit = user link; derived = Traceability Engine */
  readonly origin: "explicit" | "derived";
  readonly bidirectional: boolean;
};

export type VerificationStatus =
  "not_started" | "in_progress" | "passed" | "failed" | "blocked" | "partial";

/** Derived — never manually edited. */
export type CoverageSnapshot = {
  readonly requirementId: string;
  readonly calculatedAt: string;
  readonly suiteLinked: boolean;
  readonly suiteCount: number;
  readonly planCount: number;
  readonly sessionCount: number;
  readonly completedSessionCount: number;
  readonly evidenceCount: number;
  readonly defectCount: number;
  readonly openDefectCount: number;
  readonly suiteCoverage: number;
  readonly executionCoverage: number;
  readonly evidenceCoverage: number;
  readonly defectCoverage: number;
  readonly overallCoverage: number;
  readonly verificationStatus: VerificationStatus;
  readonly uncovered: boolean;
  readonly highRiskGap: boolean;
};

export type RequirementNode = {
  readonly requirementId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly title: string;
  readonly description: string;
  readonly category: RequirementCategory;
  readonly status: RequirementLifecycleState;
  readonly priority: RequirementPriority;
  readonly criticality: RequirementCriticality;
  readonly risk: RequirementRisk;
  readonly ownerId: string;
  readonly version: number;
  readonly releaseReference?: string;
  readonly component?: string;
  readonly application?: string;
  readonly tags: readonly string[];
  readonly suiteLinks: readonly RequirementSuiteLink[];
  readonly approvedAt?: string;
  readonly approvedBy?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
  readonly revision: number;
  readonly customMetadata: Readonly<Record<string, unknown>>;
};

export type RequirementHistoryEntry = {
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly fromStatus?: RequirementLifecycleState;
  readonly toStatus?: RequirementLifecycleState;
  readonly detail?: string;
};

export type RequirementAggregate = {
  readonly requirement: RequirementNode;
  readonly history: readonly RequirementHistoryEntry[];
};

export type TraceabilityMatrixRow = {
  readonly requirementId: string;
  readonly title: string;
  readonly status: RequirementLifecycleState;
  readonly priority: RequirementPriority;
  readonly risk: RequirementRisk;
  readonly suiteIds: readonly string[];
  readonly planIds: readonly string[];
  readonly sessionIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly defectIds: readonly string[];
  readonly coverage: CoverageSnapshot;
};
