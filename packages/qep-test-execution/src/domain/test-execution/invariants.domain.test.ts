import { describe, expect, it } from "vitest";

import {
  ExecutionConflictError,
  ExecutionPreconditionError,
} from "../../shared/errors";
import {
  acceptExecution,
  cancelExecution,
  completeExecution,
  createExecution,
  ingestExternalResult,
  prepareExecution,
  recordStepResult,
  rejectExecution,
  startExecution,
  submitForReview,
  supersedeExecution,
  assignExecutor,
  type CommandContext,
} from "./test-execution";

const NOW = "2026-07-29T10:00:00.000Z";
const LATER = "2026-07-29T11:00:00.000Z";
const ACTOR = "user_executor";
const REVIEWER = "user_reviewer";
const TENANT = "tenant_1";

function ctx(overrides: Partial<CommandContext> = {}): CommandContext {
  return { actorId: ACTOR, changedAt: LATER, ...overrides };
}

function manifestInput() {
  return {
    steps: [
      {
        order: 1,
        instruction: "Run check",
        expectedResult: "Check passes",
      },
    ],
  };
}

function readyExecution() {
  let execution = createExecution({
    id: "exec_inv_1",
    executionNumber: "TE-INV-1",
    tenantId: TENANT,
    projectId: "proj_1",
    workspaceId: "ws_1",
    ownerId: ACTOR,
    sourceRefs: {
      planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
    },
    createdAt: NOW,
    createdBy: ACTOR,
  });
  execution = prepareExecution(
    { ...execution, uncommittedEvents: [] },
    ctx({ changedAt: NOW }),
    {
      resolved: manifestInput(),
    },
  );
  execution = assignExecutor({ ...execution, uncommittedEvents: [] }, ctx(), {
    executorId: ACTOR,
  });
  return execution;
}

describe("TestExecution domain invariants", () => {
  it("requires sealed manifest before start", () => {
    const draft = createExecution({
      id: "exec_2",
      executionNumber: "TE-002",
      tenantId: TENANT,
      projectId: "proj_1",
      workspaceId: "ws_1",
      ownerId: ACTOR,
      sourceRefs: {
        specRef: { capability: "spec", id: "spec_1", versionLabel: "2.0.0" },
      },
      createdAt: NOW,
      createdBy: ACTOR,
    });
    const assignedWithoutSeal: typeof draft = {
      ...draft,
      status: "assigned",
      assignment: {
        ...draft.assignment,
        executorId: ACTOR,
      },
    };
    expect(() => startExecution(assignedWithoutSeal, ctx())).toThrow(
      ExecutionPreconditionError,
    );
  });

  it("requires actual result when passed and requireActualResult is true", () => {
    let execution = readyExecution();
    execution = startExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(() =>
      recordStepResult(execution, ctx(), {
        order: 1,
        outcome: "passed",
      }),
    ).toThrow(ExecutionPreconditionError);
  });

  it("forbids completion after cancel", () => {
    let execution = readyExecution();
    execution = startExecution({ ...execution, uncommittedEvents: [] }, ctx());
    execution = cancelExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(() => completeExecution(execution, ctx())).toThrow(
      ExecutionPreconditionError,
    );
  });

  it("sets bidirectional supersession lineage fields", () => {
    let execution = createExecution({
      id: "exec_old",
      executionNumber: "TE-OLD",
      tenantId: TENANT,
      projectId: "proj_1",
      workspaceId: "ws_1",
      ownerId: ACTOR,
      sourceRefs: {
        planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
      },
      createdAt: NOW,
      createdBy: ACTOR,
    });
    execution = prepareExecution(
      { ...execution, uncommittedEvents: [] },
      ctx({ changedAt: NOW }),
      {
        resolved: manifestInput(),
      },
    );
    execution = assignExecutor({ ...execution, uncommittedEvents: [] }, ctx(), {
      executorId: ACTOR,
      reviewerId: REVIEWER,
    });
    execution = startExecution({ ...execution, uncommittedEvents: [] }, ctx());
    execution = recordStepResult({ ...execution, uncommittedEvents: [] }, ctx(), {
      order: 1,
      outcome: "passed",
      actualResult: "OK",
    });
    execution = completeExecution({ ...execution, uncommittedEvents: [] }, ctx());
    execution = submitForReview({ ...execution, uncommittedEvents: [] }, ctx());
    execution = acceptExecution(
      { ...execution, uncommittedEvents: [] },
      { ...ctx(), actorId: REVIEWER },
    );

    execution = supersedeExecution({ ...execution, uncommittedEvents: [] }, ctx(), {
      successorExecutionId: "exec_new",
    });
    expect(execution.status).toBe("superseded");
    expect(execution.supersededById).toBe("exec_new");
  });

  it("rejects supersession when successor already recorded", () => {
    let execution = readyExecution();
    execution = startExecution({ ...execution, uncommittedEvents: [] }, ctx());
    execution = recordStepResult({ ...execution, uncommittedEvents: [] }, ctx(), {
      order: 1,
      outcome: "failed",
      actualResult: "Failed",
    });
    execution = completeExecution({ ...execution, uncommittedEvents: [] }, ctx());
    execution = submitForReview({ ...execution, uncommittedEvents: [] }, ctx());
    execution = rejectExecution(
      { ...execution, uncommittedEvents: [] },
      { ...ctx(), actorId: REVIEWER },
      { reason: "Needs rework" },
    );
    execution = supersedeExecution({ ...execution, uncommittedEvents: [] }, ctx(), {
      successorExecutionId: "exec_a",
    });
    expect(() =>
      supersedeExecution(execution, ctx(), { successorExecutionId: "exec_b" }),
    ).toThrow(ExecutionConflictError);
  });

  it("rejects ingestion after accepted", () => {
    let execution = createExecution({
      id: "exec_import",
      executionNumber: "TE-IMP",
      tenantId: TENANT,
      projectId: "proj_1",
      workspaceId: "ws_1",
      ownerId: ACTOR,
      mode: "imported",
      sourceRefs: {
        planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
      },
      createdAt: NOW,
      createdBy: ACTOR,
    });
    execution = ingestExternalResult(execution, ctx({ changedAt: NOW }), {
      submissionId: "sub_1",
      sourceSystemId: "ci_system",
      agentIdentity: "agent_ci",
      idempotencyKey: "key_1",
      payloadHash: "hash_1",
      isComplete: true,
      resolved: manifestInput(),
      stepResults: [{ order: 1, outcome: "passed", actualResult: "OK" }],
    });
    execution = acceptExecution(
      { ...execution, uncommittedEvents: [] },
      { ...ctx(), actorId: REVIEWER },
      {
        policy: {
          reviewRequired: false,
          fastPathAccept: true,
          reviewerMustDifferFromExecutor: false,
        },
      },
    );
    expect(execution.status).toBe("accepted");
    expect(() =>
      ingestExternalResult(execution, ctx(), {
        submissionId: "sub_2",
        sourceSystemId: "ci_system",
        agentIdentity: "agent_ci",
        idempotencyKey: "key_2",
        payloadHash: "hash_2",
        isComplete: false,
      }),
    ).toThrow(ExecutionPreconditionError);
  });

  it("derives failed outcome when any step failed", () => {
    let execution = readyExecution();
    execution = startExecution({ ...execution, uncommittedEvents: [] }, ctx());
    execution = recordStepResult({ ...execution, uncommittedEvents: [] }, ctx(), {
      order: 1,
      outcome: "failed",
      actualResult: "Check failed",
    });
    execution = completeExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.outcome).toBe("failed");
  });

  it("allows completion with not_executed steps and derives passed when others pass-like", () => {
    let execution = createExecution({
      id: "exec_mix",
      executionNumber: "TE-MIX",
      tenantId: TENANT,
      projectId: "proj_1",
      workspaceId: "ws_1",
      ownerId: ACTOR,
      sourceRefs: {
        planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
      },
      createdAt: NOW,
      createdBy: ACTOR,
    });
    execution = prepareExecution(
      { ...execution, uncommittedEvents: [] },
      ctx({ changedAt: NOW }),
      {
        resolved: {
          steps: [
            { order: 1, instruction: "A", expectedResult: "A ok" },
            { order: 2, instruction: "B", expectedResult: "B ok" },
          ],
        },
      },
    );
    execution = assignExecutor({ ...execution, uncommittedEvents: [] }, ctx(), {
      executorId: ACTOR,
    });
    execution = startExecution({ ...execution, uncommittedEvents: [] }, ctx());
    execution = recordStepResult({ ...execution, uncommittedEvents: [] }, ctx(), {
      order: 1,
      outcome: "passed",
      actualResult: "A ok",
    });
    execution = recordStepResult({ ...execution, uncommittedEvents: [] }, ctx(), {
      order: 2,
      outcome: "not_executed",
    });
    execution = completeExecution({ ...execution, uncommittedEvents: [] }, ctx());
    expect(execution.outcome).toBe("passed");
  });
});
