export const QUALITY_LIFECYCLE_STATES = [
  "draft",
  "planned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
] as const;
export type QualityLifecycleState = (typeof QUALITY_LIFECYCLE_STATES)[number];

export const VERIFICATION_DISCIPLINES = [
  "functional_ux",
  "responsive",
  "usability",
  "accessibility",
  "visual",
] as const;
export type VerificationDiscipline = (typeof VERIFICATION_DISCIPLINES)[number];

export const DEVICE_CLASSES = ["desktop", "tablet", "mobile"] as const;
export type DeviceClass = (typeof DEVICE_CLASSES)[number];

export const FORBIDDEN_INFRASTRUCTURE_ALIASES = [
  "ci_pipeline",
  "managed_runner",
  "remote_host",
] as const;

export const CRITERION_RESULT_STATES = [
  "not_verified",
  "partially_verified",
  "verified",
] as const;
export type CriterionResultState = (typeof CRITERION_RESULT_STATES)[number];

export const ISSUE_STATUSES = [
  "open",
  "dismissed",
  "resolved",
  "linked",
  "promoted",
] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const ISSUE_PRIORITIES = ["low", "medium", "high"] as const;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export const QUALITY_HOST_KINDS = [
  "exploratory_session",
  "experience_verification",
] as const;
export type QualityHostKind = (typeof QUALITY_HOST_KINDS)[number];

export const EVIDENCE_TARGET_KINDS = [
  "exploratory_session",
  "experience_verification",
  "quality_observation",
  "quality_issue",
  "experience_criterion",
  "experience_context",
] as const;
export type EvidenceTargetKind = (typeof EVIDENCE_TARGET_KINDS)[number];

export const OPTIONAL_TRACE_KINDS = [
  "requirement",
  "user_story",
  "acceptance_criterion",
  "test_case",
  "suite",
  "test_plan",
  "evidence",
  "defect",
] as const;
export type OptionalTraceKind = (typeof OPTIONAL_TRACE_KINDS)[number];

export type QualityHistoryEntry = {
  readonly id: string;
  readonly eventType: string;
  readonly detail?: string;
  readonly actorId: string;
  readonly occurredAt: string;
};

export type ExploratoryArea = {
  readonly id: string;
  readonly prompt: string;
  readonly sequence: number;
  readonly explored: boolean;
  readonly exploredAt?: string;
};

export type ExploratorySessionRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly number: string;
  readonly name: string;
  readonly status: QualityLifecycleState;
  readonly testerId: string;
  readonly testerName?: string;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly mission: string;
  readonly scope: string;
  readonly sessionNotes?: string;
  readonly startedAt?: string;
  readonly pausedAt?: string;
  readonly completedAt?: string;
  readonly elapsedMs: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type ExperienceContextRecord = {
  readonly id: string;
  readonly planId: string;
  readonly label: string;
  readonly deviceClass: DeviceClass;
  readonly viewportWidth?: number;
  readonly viewportHeight?: number;
  readonly orientation?: string;
  readonly browser?: string;
  readonly browserVersion?: string;
  readonly operatingSystem?: string;
  readonly deviceProfile?: string;
  readonly sequence: number;
};

export type ExperienceCriterionRecord = {
  readonly id: string;
  readonly planId: string;
  readonly discipline: VerificationDiscipline;
  readonly statement: string;
  readonly sequence: number;
};

export type ExperiencePlanRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly number: string;
  readonly name: string;
  readonly status: QualityLifecycleState;
  readonly ownerId: string;
  readonly ownerName?: string;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly mission: string;
  readonly scope: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type ExperienceActivityRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly planId: string;
  readonly number: string;
  readonly status: QualityLifecycleState;
  readonly testerId: string;
  readonly testerName?: string;
  readonly currentContextId?: string;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly startedAt?: string;
  readonly pausedAt?: string;
  readonly completedAt?: string;
  readonly elapsedMs: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type CriterionResultRecord = {
  readonly id: string;
  readonly activityId: string;
  readonly criterionId: string;
  readonly contextId: string;
  readonly state: CriterionResultState;
  readonly concernFound: boolean;
  readonly note?: string;
  readonly recordedAt: string;
  readonly recordedBy: string;
};

export type ContextActivityRecord = {
  readonly id: string;
  readonly activityId: string;
  readonly contextId: string;
  readonly activatedAt: string;
  readonly completedAt?: string;
};

export type ObservationRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly hostKind: QualityHostKind;
  readonly hostId: string;
  readonly title: string;
  readonly body: string;
  readonly contextId?: string;
  readonly criterionId?: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type IssueRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly hostKind: QualityHostKind;
  readonly hostId: string;
  readonly observationId?: string;
  readonly title: string;
  readonly body: string;
  readonly priority: IssuePriority;
  readonly status: IssueStatus;
  readonly contextId?: string;
  readonly criterionId?: string;
  readonly defectId?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type NoteRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly hostKind: QualityHostKind;
  readonly hostId: string;
  readonly body: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type EvidenceLinkRecord = {
  readonly id: string;
  readonly evidenceId: string;
  readonly targetKind: EvidenceTargetKind;
  readonly targetId: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type TraceLinkRecord = {
  readonly id: string;
  readonly fromKind: string;
  readonly fromId: string;
  readonly toKind: OptionalTraceKind;
  readonly toId: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type WorkProgress = {
  readonly completed: number;
  readonly total: number;
  readonly percent?: number;
};

export type ViewportMatrixCell = {
  readonly contextId: string;
  readonly label: string;
  readonly deviceClass: DeviceClass;
  readonly status: "pending" | "in_progress" | "verified";
};

export type CaptureCounts = {
  readonly observations: number;
  readonly issues: number;
  readonly notes: number;
  readonly evidence: number;
};

export type PresentedExploratorySession = ExploratorySessionRecord & {
  readonly areas: readonly ExploratoryArea[];
  readonly progress: WorkProgress;
  readonly counts: CaptureCounts;
  readonly durationMs: number;
  readonly history: readonly QualityHistoryEntry[];
  readonly observations: readonly ObservationRecord[];
  readonly issues: readonly IssueRecord[];
  readonly notes: readonly NoteRecord[];
  readonly traces: readonly TraceLinkRecord[];
};

export type PresentedExperiencePlan = ExperiencePlanRecord & {
  readonly disciplines: readonly VerificationDiscipline[];
  readonly contexts: readonly ExperienceContextRecord[];
  readonly criteria: readonly ExperienceCriterionRecord[];
  readonly latestActivityId?: string;
  readonly counts: CaptureCounts;
  readonly progress: WorkProgress;
  readonly traces: readonly TraceLinkRecord[];
};

export type PresentedExperienceActivity = ExperienceActivityRecord & {
  readonly plan: PresentedExperiencePlan;
  readonly results: readonly CriterionResultRecord[];
  readonly contextActivity: readonly ContextActivityRecord[];
  readonly viewportMatrix: readonly ViewportMatrixCell[];
  readonly progress: WorkProgress;
  readonly counts: CaptureCounts;
  readonly durationMs: number;
  readonly history: readonly QualityHistoryEntry[];
  readonly observations: readonly ObservationRecord[];
  readonly issues: readonly IssueRecord[];
  readonly notes: readonly NoteRecord[];
};

export type CreateSessionInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly name: string;
  readonly mission: string;
  readonly scope: string;
  readonly testerId?: string;
  readonly testerName?: string;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly areas?: readonly string[];
  readonly sessionNotes?: string;
};

export type CreatePlanInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly name: string;
  readonly mission: string;
  readonly scope: string;
  readonly ownerId?: string;
  readonly ownerName?: string;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly disciplines?: readonly string[];
};

export type CreateContextInput = {
  readonly label: string;
  readonly deviceClass: string;
  readonly viewportWidth?: number;
  readonly viewportHeight?: number;
  readonly orientation?: string;
  readonly browser?: string;
  readonly browserVersion?: string;
  readonly operatingSystem?: string;
  readonly deviceProfile?: string;
};

export type CreateCriterionInput = {
  readonly discipline: string;
  readonly statement: string;
};
