import { describe, expect, it } from "vitest";

import { createExecution } from "../../domain/test-execution/test-execution";
import {
  mapExecutionAggregate,
  rowToAssignment,
  rowToSourceRefs,
  toExecutionRowValues,
  toStoredTestExecution,
  type ExecutionRow,
} from "./execution-mapper";

const TENANT = "tenant_mapper";
const ACTOR = "user_mapper";
const NOW = "2026-07-29T12:00:00.000Z";

function makeExecution() {
  return createExecution({
    id: "exec_mapper_1",
    executionNumber: "TE-MAP-001",
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
}

function baseRow(overrides: Partial<ExecutionRow> = {}): ExecutionRow {
  const execution = makeExecution();
  return {
    id: execution.id,
    tenantId: execution.tenantId,
    executionNumber: execution.executionNumber,
    projectId: execution.projectId,
    workspaceId: execution.workspaceId,
    status: execution.status,
    mode: execution.mode,
    outcome: null,
    preReviewDerivedOutcome: null,
    planRefCapability: "plan",
    planRefId: "plan_1",
    planRefVersionLabel: "1.0.0",
    specRefCapability: null,
    specRefId: null,
    specRefVersionLabel: null,
    planItemId: null,
    contextJson: {},
    ownerId: execution.assignment.ownerId,
    executorId: null,
    reviewerId: null,
    agentIdentity: null,
    assignmentUpdatedAt: new Date(NOW),
    assignmentUpdatedBy: ACTOR,
    blockReason: null,
    cancelReason: null,
    supersedesId: null,
    supersededById: null,
    revision: execution.revision,
    createdAt: new Date(NOW),
    createdBy: ACTOR,
    updatedAt: new Date(NOW),
    updatedBy: ACTOR,
    correlationId: null,
    ...overrides,
  } as ExecutionRow;
}

describe("execution-mapper", () => {
  it("strips uncommitted events when converting to stored form", () => {
    const execution = makeExecution();
    const stored = toStoredTestExecution(execution);
    expect(stored.uncommittedEvents).toEqual([]);
    expect(stored.id).toBe(execution.id);
  });

  it("maps source refs from flattened row columns", () => {
    const row = baseRow({
      specRefId: "spec_1",
      specRefCapability: "specification",
      specRefVersionLabel: "2.0",
    });
    const refs = rowToSourceRefs(row);
    expect(refs.planRef).toEqual({
      capability: "plan",
      id: "plan_1",
      versionLabel: "1.0.0",
    });
    expect(refs.specRef).toEqual({
      capability: "specification",
      id: "spec_1",
      versionLabel: "2.0",
    });
  });

  it("maps assignment fields including optional executor and reviewer", () => {
    const row = baseRow({ executorId: "user_exec", reviewerId: "user_rev" });
    const assignment = rowToAssignment(row);
    expect(assignment.ownerId).toBe(ACTOR);
    expect(assignment.executorId).toBe("user_exec");
    expect(assignment.reviewerId).toBe("user_rev");
  });

  it("reconstructs the full aggregate from row groups", () => {
    const row = baseRow();
    const stored = mapExecutionAggregate({
      row,
      manifest: null,
      steps: [],
      observations: [],
      evidence: [],
      reviews: [],
      submissions: [],
      history: [],
    });
    expect(stored.id).toBe(row.id);
    expect(stored.status).toBe("draft");
    expect(stored.manifest).toBeNull();
    expect(stored.review).toBeNull();
    expect(stored.uncommittedEvents).toEqual([]);
  });

  it("selects the most recently decided review when multiple exist", () => {
    const row = baseRow();
    const stored = mapExecutionAggregate({
      row,
      manifest: null,
      steps: [],
      observations: [],
      evidence: [],
      reviews: [
        {
          id: "rev_1",
          tenantId: TENANT,
          executionId: row.id,
          reviewerId: "user_rev",
          decision: "rejected",
          reason: "needs work",
          decidedAt: new Date("2026-07-29T10:00:00.000Z"),
          preReviewDerivedOutcome: "failed",
          outcomeOverride: null,
          createdAt: new Date("2026-07-29T10:00:00.000Z"),
        },
        {
          id: "rev_2",
          tenantId: TENANT,
          executionId: row.id,
          reviewerId: "user_rev",
          decision: "accepted",
          reason: null,
          decidedAt: new Date("2026-07-29T11:00:00.000Z"),
          preReviewDerivedOutcome: "passed",
          outcomeOverride: null,
          createdAt: new Date("2026-07-29T11:00:00.000Z"),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      submissions: [],
      history: [],
    });
    expect(stored.review?.decision).toBe("accepted");
  });

  it("round-trips row values for persistence writes", () => {
    const execution = makeExecution();
    const values = toExecutionRowValues(execution);
    expect(values.id).toBe(execution.id);
    expect(values.tenantId).toBe(execution.tenantId);
    expect(values.planRefId).toBe("plan_1");
    expect(values.ownerId).toBe(ACTOR);
    expect(values.revision).toBe(execution.revision);
  });
});
