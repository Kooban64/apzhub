/**
 * QEP Test Execution HTTP handler coverage (APZQEP-ENG-100D).
 */

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PlatformServiceGateway } from "@apzhub/platform-services";

import {
  handleAssociateQepExecutionEvidence,
  handleCreateQepExecution,
  handleGetQepExecution,
  handleGetQepExecutionHistory,
  handleGetQepExecutionSteps,
  handleListQepExecutions,
  handlePerformQepExecutionAction,
  handleRecordQepExecutionStepResult,
} from "./qep-test-execution";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import { buildMockSession, buildTestServiceContext } from "../testing/fixtures";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-qep-executions",
      correlationId: "corr-test-qep-executions",
      timestamp: "2026-07-29T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function routeContext(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}

const SAMPLE_EXECUTION = {
  id: "exec_1",
  tenantId: "tenant_1",
  executionNumber: "TE-001",
  status: "draft",
  revision: 1,
  steps: [
    {
      order: 1,
      instruction: "Do it",
      expectedResult: "Works",
      evidenceIds: [],
      attemptCount: 0,
    },
  ],
  availableActions: ["prepareExecution"],
};

function bootstrap(overrides: Record<string, unknown>) {
  const gateway = {
    qep: {
      executions: overrides,
    },
  } as unknown as PlatformServiceGateway;
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, { qepEnabled: true }),
  );
  return gateway;
}

describe("APZQEP-ENG-100D qep test execution handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("throws a 503 error when qep HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap({} as PlatformServiceGateway, {
        qepEnabled: false,
      }),
    );
    await expect(
      handleListQepExecutions(makeRequest("/api/v1/qep/executions"), makeContext()),
    ).rejects.toMatchObject({
      status: 503,
      body: { code: "QEP_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists and creates test executions with standard envelopes", async () => {
    const gateway = bootstrap({
      list: vi.fn(async () => [SAMPLE_EXECUTION]),
      createExecution: vi.fn(async () => SAMPLE_EXECUTION),
    });
    const ctx = makeContext();

    const list = await handleListQepExecutions(
      makeRequest("/api/v1/qep/executions?limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data).toHaveLength(1);
    expect(listBody.meta.requestId).toBe("req-test-qep-executions");

    const created = await handleCreateQepExecution(
      makeRequest("/api/v1/qep/executions", {
        method: "POST",
        body: JSON.stringify({
          projectId: "proj_1",
          workspaceId: "ws_1",
          sourceRefs: {
            planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
          },
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
    expect(gateway.qep.executions.createExecution).toHaveBeenCalledOnce();
  });

  it("gets a test execution by id and returns 404 when missing", async () => {
    bootstrap({
      get: vi.fn(async (_ctx: unknown, id: string) =>
        id === "exec_1" ? SAMPLE_EXECUTION : null,
      ),
    });
    const ctx = makeContext();

    const found = await handleGetQepExecution(
      makeRequest("/api/v1/qep/executions/exec_1"),
      ctx,
      routeContext({ executionId: "exec_1" }),
    );
    expect(found.status).toBe(200);

    await expect(
      handleGetQepExecution(
        makeRequest("/api/v1/qep/executions/exec_missing"),
        ctx,
        routeContext({ executionId: "exec_missing" }),
      ),
    ).rejects.toMatchObject({ status: 404, body: { code: "NOT_FOUND" } });
  });

  it("projects steps from getExecution() without a dedicated query", async () => {
    bootstrap({
      getSteps: vi.fn(async () => SAMPLE_EXECUTION.steps),
    });
    const ctx = makeContext();

    const steps = await handleGetQepExecutionSteps(
      makeRequest("/api/v1/qep/executions/exec_1/steps"),
      ctx,
      routeContext({ executionId: "exec_1" }),
    );
    expect(steps.status).toBe(200);
    const body = await steps.json();
    expect(body.data).toEqual(SAMPLE_EXECUTION.steps);
  });

  it("dispatches lifecycle actions through performQepTestExecutionAction", async () => {
    const gateway = bootstrap({
      prepareExecution: vi.fn(async () => ({
        ...SAMPLE_EXECUTION,
        status: "ready",
        revision: 2,
      })),
      assignExecutor: vi.fn(async () => ({
        ...SAMPLE_EXECUTION,
        status: "ready",
        revision: 3,
      })),
    });
    const ctx = makeContext();

    const prepared = await handlePerformQepExecutionAction(
      makeRequest("/api/v1/qep/executions/exec_1/actions/prepare", {
        method: "POST",
        body: JSON.stringify({ expectedRevision: 1 }),
      }),
      ctx,
      routeContext({ executionId: "exec_1", action: "prepare" }),
    );
    expect(prepared.status).toBe(200);
    expect(gateway.qep.executions.prepareExecution).toHaveBeenCalledWith(
      ctx.serviceContext,
      "exec_1",
      expect.objectContaining({ expectedRevision: 1 }),
    );

    const assigned = await handlePerformQepExecutionAction(
      makeRequest("/api/v1/qep/executions/exec_1/actions/assign", {
        method: "POST",
        body: JSON.stringify({ expectedRevision: 2, executorId: "user_2" }),
      }),
      ctx,
      routeContext({ executionId: "exec_1", action: "assign" }),
    );
    expect(assigned.status).toBe(200);
    expect(gateway.qep.executions.assignExecutor).toHaveBeenCalledWith(
      ctx.serviceContext,
      "exec_1",
      expect.objectContaining({ expectedRevision: 2, executorId: "user_2" }),
    );
  });

  it("records a step result using the path step order", async () => {
    const gateway = bootstrap({
      recordStepResult: vi.fn(async () => ({ ...SAMPLE_EXECUTION, revision: 4 })),
    });
    const ctx = makeContext();

    const updated = await handleRecordQepExecutionStepResult(
      makeRequest("/api/v1/qep/executions/exec_1/steps/1/results", {
        method: "POST",
        body: JSON.stringify({
          expectedRevision: 3,
          outcome: "passed",
          actualResult: "Loaded successfully",
        }),
      }),
      ctx,
      routeContext({ executionId: "exec_1", stepId: "1" }),
    );
    expect(updated.status).toBe(200);
    expect(gateway.qep.executions.recordStepResult).toHaveBeenCalledWith(
      ctx.serviceContext,
      "exec_1",
      expect.objectContaining({ order: 1, outcome: "passed" }),
    );
  });

  it("associates evidence and returns 201", async () => {
    const gateway = bootstrap({
      associateEvidence: vi.fn(async () => ({ ...SAMPLE_EXECUTION, revision: 5 })),
    });
    const ctx = makeContext();

    const result = await handleAssociateQepExecutionEvidence(
      makeRequest("/api/v1/qep/executions/exec_1/evidence-references", {
        method: "POST",
        body: JSON.stringify({
          expectedRevision: 4,
          uri: "s3://bucket/evidence.png",
        }),
      }),
      ctx,
      routeContext({ executionId: "exec_1" }),
    );
    expect(result.status).toBe(201);
    expect(gateway.qep.executions.associateEvidence).toHaveBeenCalledOnce();
  });

  it("returns execution history", async () => {
    bootstrap({
      getHistory: vi.fn(async () => ({
        executionId: "exec_1",
        entries: [
          {
            sequence: 1,
            at: "2026-07-29T10:00:00.000Z",
            actorId: "user_1",
            action: "createExecution",
            summary: "Created",
          },
        ],
      })),
    });
    const ctx = makeContext();

    const history = await handleGetQepExecutionHistory(
      makeRequest("/api/v1/qep/executions/exec_1/history"),
      ctx,
      routeContext({ executionId: "exec_1" }),
    );
    expect(history.status).toBe(200);
    const body = await history.json();
    expect(body.data.entries).toHaveLength(1);
  });
});
