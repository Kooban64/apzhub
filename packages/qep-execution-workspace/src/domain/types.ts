/**
 * Enterprise Test Execution Workspace domain — APZQEP-140-C.
 * Performs execution from Cap B handoffs. Results immutable after completion.
 */

export const EXECUTION_SESSION_STATES = [
  "not_started",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "cancelled",
  "archived",
] as const;
export type ExecutionSessionState = (typeof EXECUTION_SESSION_STATES)[number];

export const STEP_OUTCOMES = [
  "pass",
  "fail",
  "block",
  "skip",
  "not_applicable",
  "deferred",
  "not_executed",
] as const;
export type StepOutcome = (typeof STEP_OUTCOMES)[number];

export type PlanningSnapshot = {
  readonly planId: string;
  readonly handoffId: string;
  readonly planName: string;
  readonly suiteId: string;
  readonly suiteVersion: number;
  readonly suiteName: string;
  readonly projectId?: string;
  readonly environmentLabels: readonly string[];
  readonly configurationLabels: readonly string[];
  readonly assigneeIds: readonly string[];
  readonly plannedStartAt?: string;
  readonly plannedEndAt?: string;
  readonly handedOffAt: string;
  readonly correlationId: string;
};

export type EvidenceReference = {
  readonly evidenceId: string;
  readonly attachedAt: string;
  readonly attachedBy: string;
  readonly stepId?: string;
  readonly note?: string;
};

export type StepResult = {
  readonly stepId: string;
  readonly order: number;
  readonly title: string;
  readonly outcome: StepOutcome;
  readonly comment?: string;
  readonly failureNotes?: string;
  readonly executedBy?: string;
  readonly executedAt?: string;
  readonly durationMs?: number;
  readonly evidenceIds: readonly string[];
  /** Result revision — increments on amendment after completion. */
  readonly resultRevision: number;
};

export type ResultAmendment = {
  readonly amendmentId: string;
  readonly at: string;
  readonly actorId: string;
  readonly stepId: string;
  readonly previousOutcome: StepOutcome;
  readonly newOutcome: StepOutcome;
  readonly reason: string;
};

export type SessionProgress = {
  readonly totalSteps: number;
  readonly executedSteps: number;
  readonly passed: number;
  readonly failed: number;
  readonly blocked: number;
  readonly skipped: number;
  readonly notApplicable: number;
  readonly deferred: number;
  readonly percentComplete: number;
};

export type ExecutionSessionNode = {
  readonly sessionId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly name: string;
  readonly ownerId: string;
  readonly assigneeIds: readonly string[];
  readonly status: ExecutionSessionState;
  readonly planning: PlanningSnapshot;
  readonly steps: readonly StepResult[];
  readonly evidenceRefs: readonly EvidenceReference[];
  readonly amendments: readonly ResultAmendment[];
  readonly progress: SessionProgress;
  readonly startedAt?: string;
  readonly pausedAt?: string;
  readonly completedAt?: string;
  readonly cancelledAt?: string;
  readonly archivedAt?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly revision: number;
  readonly customMetadata: Readonly<Record<string, unknown>>;
};

export type ExecutionSessionHistoryEntry = {
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly fromStatus?: ExecutionSessionState;
  readonly toStatus?: ExecutionSessionState;
  readonly detail?: string;
};

export type ExecutionSessionAggregate = {
  readonly session: ExecutionSessionNode;
  readonly history: readonly ExecutionSessionHistoryEntry[];
};

export function computeProgress(steps: readonly StepResult[]): SessionProgress {
  const totalSteps = steps.length;
  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let skipped = 0;
  let notApplicable = 0;
  let deferred = 0;
  let executedSteps = 0;
  for (const step of steps) {
    if (step.outcome === "not_executed") continue;
    executedSteps += 1;
    if (step.outcome === "pass") passed += 1;
    else if (step.outcome === "fail") failed += 1;
    else if (step.outcome === "block") blocked += 1;
    else if (step.outcome === "skip") skipped += 1;
    else if (step.outcome === "not_applicable") notApplicable += 1;
    else if (step.outcome === "deferred") deferred += 1;
  }
  return {
    totalSteps,
    executedSteps,
    passed,
    failed,
    blocked,
    skipped,
    notApplicable,
    deferred,
    percentComplete:
      totalSteps === 0 ? 0 : Math.round((executedSteps / totalSteps) * 100),
  };
}

export function defaultStepsFromPlan(planName: string): StepResult[] {
  // Cap C defines executable steps for the workspace; Cap B owns scope intent only.
  // Seed a practical checklist derived from the plan name until Cap A cases ship.
  return [1, 2, 3, 4, 5].map((order) => ({
    stepId: `step-${order}`,
    order,
    title: `${planName} — Step ${order}`,
    outcome: "not_executed" as const,
    evidenceIds: [],
    resultRevision: 0,
  }));
}
