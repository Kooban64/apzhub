import { describe, expect, it } from "vitest";

import {
  ExecutionConcurrencyError,
  ExecutionPreconditionError,
  ExecutionValidationError,
} from "../../shared/errors";
import { EXECUTION_DOMAIN_EVENT_TYPES } from "./events";
import {
  acceptExecution,
  assignExecutor,
  blockExecution,
  cancelExecution,
  completeExecution,
  createExecution,
  pauseExecution,
  prepareExecution,
  recordStepResult,
  rejectExecution,
  resumeExecution,
  startExecution,
  submitForReview,
  type CommandContext,
  type TestExecution,
} from "./test-execution";

const NOW = "2026-07-29T10:00:00.000Z";
const LATER = "2026-07-29T11:00:00.000Z";
const ACTOR = "user_executor";
const REVIEWER = "user_reviewer";
const TENANT = "tenant_1";

function ctx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    actorId: ACTOR,
    changedAt: LATER,
    ...overrides,
  };
}

function baseExecution(
  overrides: Partial<Parameters<typeof createExecution>[0]> = {},
): TestExecution {
  return createExecution({
    id: "exec_1",
    executionNumber: "TE-001",
    tenantId: TENANT,
    projectId: "proj_1",
    workspaceId: "ws_1",
    ownerId: ACTOR,
    sourceRefs: {
      planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
    },
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: "corr_1",
    ...overrides,
  });
}

function resolvedManifest() {
  return {
    steps: [
      {
        order: 1,
        instruction: "Open application",
        expectedResult: "Application loads",
      },
      {
        order: 2,
        instruction: "Verify dashboard",
        expectedResult: "Dashboard visible",
      },
    ],
  };
}

function prepared(plan: TestExecution): TestExecution {
  const cleared = { ...plan, uncommittedEvents: [] };
  return prepareExecution(cleared, ctx({ changedAt: NOW }), {
    resolved: resolvedManifest(),
  });
}

function assigned(plan: TestExecution): TestExecution {
  const cleared = { ...prepared(plan), uncommittedEvents: [] };
  return assignExecutor(cleared, ctx(), { executorId: ACTOR, reviewerId: REVIEWER });
}

function inProgress(plan: TestExecution): TestExecution {
  const cleared = { ...assigned(plan), uncommittedEvents: [] };
  return startExecution(cleared, ctx());
}

function withStepResults(plan: TestExecution): TestExecution {
  let current = inProgress(plan);
  current = recordStepResult(current, ctx(), {
    order: 1,
    outcome: "passed",
    actualResult: "Loaded successfully",
  });
  current = recordStepResult({ ...current, uncommittedEvents: [] }, ctx(), {
    order: 2,
    outcome: "passed",
    actualResult: "Dashboard visible",
  });
  return current;
}

function completed(plan: TestExecution): TestExecution {
  const cleared = { ...withStepResults(plan), uncommittedEvents: [] };
  return completeExecution(cleared, ctx());
}

describe("TestExecution domain — create", () => {
  it("creates a draft execution with initial revision and event", () => {
    const execution = baseExecution();
    expect(execution.status).toBe("draft");
    expect(execution.revision).toBe(1);
    expect(execution.manifest).toBeNull();
    expect(execution.uncommittedEvents).toHaveLength(1);
    expect(execution.uncommittedEvents[0]?.type).toBe("test_execution.created");
    expect(execution.history.entries).toHaveLength(1);
  });

  it("rejects invalid execution number charset", () => {
    expect(() =>
      createExecution({
        id: "exec_x",
        executionNumber: "bad number!",
        tenantId: TENANT,
        projectId: "proj_1",
        workspaceId: "ws_1",
        ownerId: ACTOR,
        sourceRefs: {
          planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
        },
        createdAt: NOW,
        createdBy: ACTOR,
      }),
    ).toThrow(ExecutionValidationError);
  });
});

describe("TestExecution domain — lifecycle happy path", () => {
  it("runs draft → ready → assigned → in_progress → completed → submitted → accepted", () => {
    let execution = baseExecution();
    execution = prepared(execution);
    expect(execution.status).toBe("ready");
    expect(execution.manifest?.contentHash).toBeTruthy();

    execution = assignExecutor({ ...execution, uncommittedEvents: [] }, ctx(), {
      executorId: ACTOR,
      reviewerId: REVIEWER,
    });
    expect(execution.status).toBe("assigned");

    execution = startExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.status).toBe("in_progress");

    execution = recordStepResult({ ...execution, uncommittedEvents: [] }, ctx(), {
      order: 1,
      outcome: "passed",
      actualResult: "Loaded successfully",
    });
    execution = recordStepResult({ ...execution, uncommittedEvents: [] }, ctx(), {
      order: 2,
      outcome: "passed",
      actualResult: "Dashboard visible",
    });

    execution = completeExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.status).toBe("completed");
    expect(execution.outcome).toBe("passed");
    expect(execution.preReviewDerivedOutcome).toBe("passed");

    execution = submitForReview({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.status).toBe("submitted_for_review");

    execution = acceptExecution(
      { ...execution, uncommittedEvents: [] },
      { ...ctx(), actorId: REVIEWER },
    );
    expect(execution.status).toBe("accepted");
    expect(execution.outcome).toBe("passed");
    expect(execution.review?.preReviewDerivedOutcome).toBe("passed");
    expect(execution.uncommittedEvents[0]?.type).toBe("test_execution.accepted");
  });

  it("supports fast-path accept from completed when policy permits", () => {
    let execution = completed(baseExecution());
    execution = acceptExecution(
      { ...execution, uncommittedEvents: [] },
      { ...ctx(), actorId: REVIEWER },
      {
        policy: {
          reviewRequired: true,
          fastPathAccept: true,
          reviewerMustDifferFromExecutor: true,
        },
      },
    );
    expect(execution.status).toBe("accepted");
    expect(execution.history.entries.at(-1)?.action).toBe("acceptExecution");
  });

  it("supports pause and resume", () => {
    let execution = inProgress(baseExecution());
    execution = pauseExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.status).toBe("paused");
    execution = resumeExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.status).toBe("in_progress");
  });

  it("supports block and resume", () => {
    let execution = inProgress(baseExecution());
    execution = blockExecution({ ...execution, uncommittedEvents: [] }, ctx(), {
      reason: "Environment unavailable",
    });
    expect(execution.status).toBe("blocked");
    execution = resumeExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.status).toBe("in_progress");
  });

  it("rejects review with retained pre-review derived outcome", () => {
    let execution = completed(baseExecution());
    execution = submitForReview({ ...execution, uncommittedEvents: [] }, ctx());
    execution = rejectExecution(
      { ...execution, uncommittedEvents: [] },
      { ...ctx(), actorId: REVIEWER },
      { reason: "Evidence insufficient" },
    );
    expect(execution.status).toBe("rejected");
    expect(execution.preReviewDerivedOutcome).toBe("passed");
    expect(execution.review?.preReviewDerivedOutcome).toBe("passed");
    expect(execution.review?.reason).toBe("Evidence insufficient");
  });

  it("cancels from in_progress", () => {
    const execution = cancelExecution(inProgress(baseExecution()), ctx(), {
      reason: "No longer required",
    });
    expect(execution.status).toBe("cancelled");
  });
});

describe("TestExecution domain — illegal transitions", () => {
  it("forbids start before manifest seal", () => {
    const execution = {
      ...baseExecution(),
      status: "assigned" as const,
      assignment: {
        ...baseExecution().assignment,
        executorId: ACTOR,
      },
      manifest: null,
    };
    expect(() => startExecution(execution, ctx())).toThrow(ExecutionPreconditionError);
  });

  it("forbids complete without step outcomes", () => {
    expect(() => completeExecution(inProgress(baseExecution()), ctx())).toThrow(
      ExecutionPreconditionError,
    );
  });

  it("forbids accept from completed without fast-path policy", () => {
    expect(() =>
      acceptExecution(completed(baseExecution()), { ...ctx(), actorId: REVIEWER }),
    ).toThrow(ExecutionPreconditionError);
  });

  it("forbids cancel when accepted", () => {
    let execution = completed(baseExecution());
    execution = submitForReview({ ...execution, uncommittedEvents: [] }, ctx());
    execution = acceptExecution(
      { ...execution, uncommittedEvents: [] },
      { ...ctx(), actorId: REVIEWER },
    );
    expect(() => cancelExecution(execution, ctx())).toThrow(ExecutionPreconditionError);
  });

  it("forbids reject without sufficient reason", () => {
    let execution = completed(baseExecution());
    execution = submitForReview({ ...execution, uncommittedEvents: [] }, ctx());
    expect(() =>
      rejectExecution(execution, { ...ctx(), actorId: REVIEWER }, { reason: "no" }),
    ).toThrow(ExecutionValidationError);
  });
});

describe("TestExecution domain — stale revision", () => {
  it("throws concurrency error when expectedRevision mismatches", () => {
    const execution = prepared(baseExecution());
    expect(() =>
      assignExecutor(execution, ctx({ expectedRevision: 999 }), {
        executorId: ACTOR,
      }),
    ).toThrow(ExecutionConcurrencyError);
  });
});

describe("TestExecution domain — event catalogue", () => {
  it("registers all execution domain event types", () => {
    expect(EXECUTION_DOMAIN_EVENT_TYPES).toContain("test_execution.created");
    expect(EXECUTION_DOMAIN_EVENT_TYPES).toContain(
      "test_execution.external_result_received",
    );
    expect(EXECUTION_DOMAIN_EVENT_TYPES.length).toBeGreaterThanOrEqual(17);
  });
});
