/**
 * Enterprise Test Execution Planning domain — APZQEP-140-B.
 * Plans intent and readiness. Does not perform test execution.
 */

export const EXECUTION_PLAN_LIFECYCLE_STATES = [
  "draft",
  "in_review",
  "approved",
  "ready",
  "scheduled",
  "handed_off",
  "cancelled",
  "archived",
  "retired",
] as const;
export type ExecutionPlanLifecycleState =
  (typeof EXECUTION_PLAN_LIFECYCLE_STATES)[number];

export const EXECUTION_PLAN_PRIORITIES = ["low", "normal", "high", "critical"] as const;
export type ExecutionPlanPriority = (typeof EXECUTION_PLAN_PRIORITIES)[number];

export const READINESS_STATES = [
  "not_evaluated",
  "not_ready",
  "ready_with_warnings",
  "ready",
] as const;
export type ReadinessState = (typeof READINESS_STATES)[number];

export type PlanScopeMode =
  "complete_suite" | "selected_sections" | "selected_children" | "filtered";

export type ExecutionPlanScope = {
  readonly mode: PlanScopeMode;
  readonly sectionIds: readonly string[];
  readonly childSuiteIds: readonly string[];
  readonly includeTags: readonly string[];
  readonly excludeTags: readonly string[];
  readonly priorities: readonly string[];
  readonly riskLevels: readonly string[];
  readonly notes?: string;
};

export type EnvironmentReference = {
  readonly referenceId: string;
  readonly label: string;
  readonly kind?: string;
};

export type ConfigurationReference = {
  readonly referenceId: string;
  readonly label: string;
  readonly kind?: string;
  readonly value?: string;
};

export type PlanPrerequisite = {
  readonly prerequisiteId: string;
  readonly kind: string;
  readonly description: string;
  readonly required: boolean;
  readonly satisfied: boolean;
};

export type ReadinessFinding = {
  readonly code: string;
  readonly severity: "blocking" | "warning" | "info";
  readonly message: string;
};

export type ReadinessSnapshot = {
  readonly readinessState: ReadinessState;
  readonly findings: readonly ReadinessFinding[];
  readonly blockingFindings: readonly ReadinessFinding[];
  readonly warnings: readonly ReadinessFinding[];
  readonly evaluatedAt: string;
};

export type PlanAssignments = {
  readonly testLeadId?: string;
  readonly testerIds: readonly string[];
  readonly reviewerIds: readonly string[];
  readonly approverIds: readonly string[];
  readonly responsibleTeamId?: string;
  readonly observerIds: readonly string[];
};

export type PlanSchedule = {
  readonly plannedStartAt?: string;
  readonly plannedEndAt?: string;
  readonly timezone: string;
  readonly deadlineAt?: string;
  readonly executionWindowNotes?: string;
  readonly schedulingConstraints?: string;
  readonly scheduleStatus: "unset" | "planned" | "confirmed";
};

/** Immutable Suite binding at plan time — Cap A remains authoritative for Suite data. */
export type SuitePlanReference = {
  readonly suiteId: string;
  readonly suiteVersion: number;
  readonly suiteName: string;
  readonly suiteStatusAtBind: string;
};

export type ExecutionPlanHandoff = {
  readonly handoffId: string;
  readonly handedOffAt: string;
  readonly handedOffBy: string;
  readonly correlationId: string;
};

export type ExecutionPlanNode = {
  readonly planId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly name: string;
  readonly description: string;
  readonly ownerId: string;
  readonly suiteRef: SuitePlanReference;
  readonly scope: ExecutionPlanScope;
  readonly status: ExecutionPlanLifecycleState;
  readonly priority: ExecutionPlanPriority;
  readonly risk?: string;
  readonly releaseReference?: string;
  readonly milestoneReference?: string;
  readonly iterationReference?: string;
  readonly environmentReferences: readonly EnvironmentReference[];
  readonly configurationReferences: readonly ConfigurationReference[];
  readonly schedule: PlanSchedule;
  readonly assignments: PlanAssignments;
  readonly prerequisites: readonly PlanPrerequisite[];
  readonly readiness: ReadinessSnapshot;
  readonly tags: readonly string[];
  readonly version: number;
  readonly revision: number;
  readonly handoff?: ExecutionPlanHandoff;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly publishedAt?: string;
  readonly approvedAt?: string;
  readonly archivedAt?: string;
  readonly cancelledAt?: string;
  readonly customMetadata: Readonly<Record<string, unknown>>;
};

export type ExecutionPlanHistoryEntry = {
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly fromStatus?: ExecutionPlanLifecycleState;
  readonly toStatus?: ExecutionPlanLifecycleState;
  readonly detail?: string;
};

export type ExecutionPlanAggregate = {
  readonly plan: ExecutionPlanNode;
  readonly history: readonly ExecutionPlanHistoryEntry[];
};

export function defaultScope(
  mode: PlanScopeMode = "complete_suite",
): ExecutionPlanScope {
  return {
    mode,
    sectionIds: [],
    childSuiteIds: [],
    includeTags: [],
    excludeTags: [],
    priorities: [],
    riskLevels: [],
  };
}

export function defaultAssignments(): PlanAssignments {
  return {
    testerIds: [],
    reviewerIds: [],
    approverIds: [],
    observerIds: [],
  };
}

export function defaultSchedule(timezone = "UTC"): PlanSchedule {
  return { timezone, scheduleStatus: "unset" };
}

export function emptyReadiness(now: string): ReadinessSnapshot {
  return {
    readinessState: "not_evaluated",
    findings: [],
    blockingFindings: [],
    warnings: [],
    evaluatedAt: now,
  };
}
