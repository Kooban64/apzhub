import { describe, expect, it } from "vitest";

import { ExecutionForbiddenError, ExecutionNotFoundError } from "../../shared/errors";
import type { ExecutionRequestContext } from "../context";
import { EXECUTION_PERMISSIONS } from "../permissions";
import { createTestExecutionApplicationServices } from "./create-application-services";
import {
  createFixedClockPort,
  createInMemoryAuditPort,
  createInMemoryHistoryStore,
  createInMemoryOutboxPort,
  createInMemoryTestExecutionRepository,
  createNoopSearchPort,
  createPermissionPort,
  createSequenceIdPort,
  createStaticSourceResolutionPort,
} from "../testing/in-memory-ports";

const TENANT = "tenant_1";
const EXECUTOR = "user_executor";
const REVIEWER = "user_reviewer";

function fullCtx(
  userId = EXECUTOR,
  permissions?: readonly string[],
): ExecutionRequestContext {
  return {
    tenantId: TENANT,
    userId,
    correlationId: "corr_app_1",
    ...(permissions ? { permissions } : {}),
  };
}

function createHarness() {
  const executions = createInMemoryTestExecutionRepository();
  const history = createInMemoryHistoryStore();
  const audit = createInMemoryAuditPort();
  const outbox = createInMemoryOutboxPort();
  const services = createTestExecutionApplicationServices({
    executions,
    history,
    sources: createStaticSourceResolutionPort(),
    permissions: createPermissionPort(),
    audit,
    outbox,
    search: createNoopSearchPort(),
    clock: createFixedClockPort(),
    ids: createSequenceIdPort(),
    allocateNumber: () => "TE-APP-001",
  });
  return { services, executions, audit, outbox };
}

async function happyPathToSubmitted() {
  const harness = createHarness();
  const { commands } = harness.services;
  let dto = await commands.createExecution(fullCtx(), {
    projectId: "proj_1",
    workspaceId: "ws_1",
    sourceRefs: {
      planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
    },
  });
  dto = await commands.prepareExecution(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
  });
  dto = await commands.assignExecutor(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
    executorId: EXECUTOR,
    reviewerId: REVIEWER,
  });
  dto = await commands.startExecution(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
  });
  dto = await commands.recordStepResult(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
    order: 1,
    outcome: "passed",
    actualResult: "Loaded successfully",
  });
  dto = await commands.recordStepResult(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
    order: 2,
    outcome: "passed",
    actualResult: "Dashboard visible",
  });
  dto = await commands.completeExecution(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
  });
  dto = await commands.submitForReview(fullCtx(), dto.id, {
    expectedRevision: dto.revision,
  });
  return { ...harness, dto };
}

describe("Execution application services", () => {
  it("orchestrates create → accept and emits audit + outbox events", async () => {
    const { services, audit, outbox, dto: submitted } = await happyPathToSubmitted();
    const accepted = await services.commands.acceptExecution(
      fullCtx(REVIEWER),
      submitted.id,
      { expectedRevision: submitted.revision },
    );

    expect(accepted.status).toBe("accepted");
    expect(accepted.availableActions.map((a) => a.action)).toContain(
      "supersedeExecution",
    );
    expect(audit.entries.some((e) => e.action === "acceptExecution")).toBe(true);
    expect(outbox.events.some((e) => e.type === "test_execution.accepted")).toBe(true);
  });

  it("returns DTOs with availableActions from Application sole computer", async () => {
    const { services } = createHarness();
    const created = await services.commands.createExecution(fullCtx(), {
      projectId: "proj_1",
      workspaceId: "ws_1",
      sourceRefs: {
        planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
      },
    });
    expect(created.availableActions.map((a) => a.action)).toContain("prepareExecution");
    const actions = await services.queries.getAvailableActions(fullCtx(), created.id);
    expect(actions.map((a) => a.action)).toEqual(
      created.availableActions.map((a) => a.action),
    );
  });

  it("enforces permission checks", async () => {
    const { services } = createHarness();
    await expect(
      services.commands.createExecution(
        fullCtx(EXECUTOR, [EXECUTION_PERMISSIONS.READ]),
        {
          projectId: "proj_1",
          workspaceId: "ws_1",
          sourceRefs: {
            planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
          },
        },
      ),
    ).rejects.toBeInstanceOf(ExecutionForbiddenError);
  });

  it("returns not found for missing executions on mutate", async () => {
    const { services } = createHarness();
    await expect(
      services.commands.prepareExecution(fullCtx(), "missing", {
        expectedRevision: 1,
      }),
    ).rejects.toBeInstanceOf(ExecutionNotFoundError);
  });

  it("lists assigned and review queue", async () => {
    const { services, dto } = await happyPathToSubmitted();
    const assigned = await services.queries.listAssigned(fullCtx(EXECUTOR));
    expect(assigned.some((item) => item.id === dto.id)).toBe(true);

    const queue = await services.queries.listReviewQueue(
      fullCtx(REVIEWER, [EXECUTION_PERMISSIONS.REVIEW]),
    );
    expect(queue.some((item) => item.id === dto.id)).toBe(true);
  });

  it("computes plan execution progress", async () => {
    const { services, dto } = await happyPathToSubmitted();
    const progress = await services.queries.getPlanExecutionProgress(
      fullCtx(),
      "plan_1",
    );
    expect(progress.total).toBeGreaterThanOrEqual(1);
    expect(progress.byStatus[dto.status]).toBeGreaterThanOrEqual(1);
  });

  it("ingests external results through the trust-boundary service", async () => {
    const { services, outbox } = createHarness();
    const dto = await services.ingestion.ingestExternalResult(fullCtx("agent_1"), {
      sourceSystemId: "ci_system",
      agentIdentity: "agent_1",
      idempotencyKey: "run-42",
      payloadHash: "hash_abc",
      isComplete: true,
      stepResults: [
        { order: 1, outcome: "passed", actualResult: "ok" },
        { order: 2, outcome: "passed", actualResult: "ok" },
      ],
      create: {
        projectId: "proj_1",
        workspaceId: "ws_1",
        sourceRefs: {
          planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
        },
      },
    });

    expect(dto.mode).toBe("imported");
    expect(dto.status).toBe("completed");
    expect(
      outbox.events.some((e) => e.type === "test_execution.external_result_received"),
    ).toBe(true);

    const replay = await services.ingestion.ingestExternalResult(fullCtx("agent_1"), {
      sourceSystemId: "ci_system",
      agentIdentity: "agent_1",
      idempotencyKey: "run-42",
      payloadHash: "hash_abc",
      isComplete: true,
      create: {
        projectId: "proj_1",
        workspaceId: "ws_1",
        sourceRefs: {
          planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
        },
      },
    });
    expect(replay.id).toBe(dto.id);
    expect(replay.revision).toBe(dto.revision);
  });
});
