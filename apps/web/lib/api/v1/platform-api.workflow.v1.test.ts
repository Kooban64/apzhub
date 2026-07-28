/**
 * Canonical Workflow HTTP API tests (APZHUB-PLATFORM-WORKFLOW-005).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  createPlatformServices,
  createWorkflowPlatformServicesForTest,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import { PlatformApiHttpError } from "./errors";
import {
  assertWorkflowHttpEnabled,
  handleCancelWorkflowRun,
  handleCreateWorkflowRun,
  handleCreateWorkflowSchedule,
  handleDeleteWorkflowSchedule,
  handleGetWorkflowCapabilities,
  handleGetWorkflowDefinition,
  handleGetWorkflowHealth,
  handleGetWorkflowReadiness,
  handleGetWorkflowRun,
  handleGetWorkflowTask,
  handleListWorkflowApprovals,
  handleListWorkflowDefinitions,
  handleListWorkflowNotifications,
  handleListWorkflowRuns,
  handleListWorkflowSchedules,
  handleListWorkflowTasks,
  handlePatchWorkflowApproval,
  handlePatchWorkflowSchedule,
  handlePatchWorkflowTask,
} from "./handlers/workflow";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "./gateway/bootstrap";
import { loadPlatformOpenApiSpecObject } from "./openapi";
import {
  createWorkflowRunBodySchema,
  createWorkflowScheduleBodySchema,
  patchWorkflowApprovalBodySchema,
  patchWorkflowScheduleBodySchema,
  patchWorkflowTaskBodySchema,
} from "./schemas/workflow";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  API_TEST_TENANT_A,
} from "./testing/fixtures";

function makeRequest(
  url: string,
  init?: { method?: string; body?: string; headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-workflow",
      correlationId: "corr-test-workflow",
      timestamp: "2026-07-19T00:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext({
      tenantId: API_TEST_TENANT_A,
      correlationId: "corr-test-workflow",
      permissions: ["workflow.*"],
    }),
  };
}

function installWorkflowGateway(options?: { providerExecuteSupported?: boolean }) {
  const workflow = createWorkflowPlatformServicesForTest({
    allowInMemoryPersistence: true,
    providerExecuteSupported: options?.providerExecuteSupported ?? true,
  });
  const { gateway } = createPlatformServices({
    workflow,
    authorizationMode: "allow-all",
  });
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, {
      workflowEnabled: true,
      workflowReadiness: workflow.readiness,
      authorizationMode: "allow-all",
    }),
  );
  return { gateway, workflow };
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZHUB-PLATFORM-WORKFLOW-005 Workflow HTTP API", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when Workflow HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        workflowEnabled: false,
      }),
    );
    await expect(assertWorkflowHttpEnabled()).rejects.toBeInstanceOf(
      PlatformApiHttpError,
    );
    await expect(assertWorkflowHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "WORKFLOW_SERVICE_UNAVAILABLE" },
    });
  });

  it("exposes health, readiness, and capabilities", async () => {
    installWorkflowGateway();
    const ctx = makeContext();

    const health = await handleGetWorkflowHealth(
      makeRequest("/api/v1/workflow/health"),
      ctx,
    );
    expect(health.status).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.data.status).toBe("healthy");
    expect(healthBody.meta.correlationId).toBe("corr-test-workflow");

    const readiness = await handleGetWorkflowReadiness(
      makeRequest("/api/v1/workflow/readiness"),
      ctx,
    );
    expect(readiness.status).toBe(200);
    const readinessBody = await readiness.json();
    expect(readinessBody.data.workflowEnabled).toBe(true);
    expect(readinessBody.data.runtimePlaneEnabled).toBe(true);

    const caps = await handleGetWorkflowCapabilities(
      makeRequest("/api/v1/workflow/capabilities"),
      ctx,
    );
    expect(caps.status).toBe(200);
    const capsBody = await caps.json();
    expect(capsBody.data.httpApiVersion).toBe("1.0.0");
    expect(capsBody.data.workbenchReady).toBe(true);
    expect(JSON.stringify(capsBody)).not.toMatch(/\bn8n\b|x-n8n-api-key/i);
  });

  it("lists definitions and supports runs lifecycle", async () => {
    const { gateway } = installWorkflowGateway({ providerExecuteSupported: true });
    const ctx = makeContext();

    const created = await gateway.workflow.workflows.create(ctx.serviceContext, {
      key: `wf_http_${Date.now()}`,
      name: "HTTP Workflow",
    });

    const definitions = await handleListWorkflowDefinitions(
      makeRequest("/api/v1/workflow/definitions"),
      ctx,
    );
    expect(definitions.status).toBe(200);
    const definitionsBody = await definitions.json();
    expect(definitionsBody.data.some((d: { id: string }) => d.id === created.id)).toBe(
      true,
    );

    const one = await handleGetWorkflowDefinition(
      makeRequest(`/api/v1/workflow/definitions/${created.id}`),
      ctx,
      { params: Promise.resolve({ definitionId: created.id }) },
    );
    expect(one.status).toBe(200);

    const runCreated = await handleCreateWorkflowRun(
      makeRequest("/api/v1/workflow/runs", {
        method: "POST",
        body: JSON.stringify({
          workflowId: created.id,
          input: { values: { x: 1 } },
        }),
      }),
      ctx,
    );
    expect(runCreated.status).toBe(201);
    const runBody = await runCreated.json();
    expect(runBody.data.status).toBe("running");
    const runId = runBody.data.id as string;

    const listed = await handleListWorkflowRuns(
      makeRequest(`/api/v1/workflow/runs?workflowId=${created.id}`),
      ctx,
    );
    expect(listed.status).toBe(200);

    const got = await handleGetWorkflowRun(
      makeRequest(`/api/v1/workflow/runs/${runId}`),
      ctx,
      { params: Promise.resolve({ runId }) },
    );
    expect(got.status).toBe(200);

    const cancelled = await handleCancelWorkflowRun(
      makeRequest(`/api/v1/workflow/runs/${runId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "stop" }),
      }),
      ctx,
      { params: Promise.resolve({ runId }) },
    );
    expect(cancelled.status).toBe(200);
    const cancelledBody = await cancelled.json();
    expect(cancelledBody.data.status).toBe("cancelled");
  });

  it("manages schedules, tasks, approvals, and notifications", async () => {
    const { gateway, workflow } = installWorkflowGateway({
      providerExecuteSupported: true,
    });
    const ctx = makeContext();
    const def = await gateway.workflow.workflows.create(ctx.serviceContext, {
      key: `wf_sched_${Date.now()}`,
      name: "Schedule Workflow",
    });

    const scheduleCreated = await handleCreateWorkflowSchedule(
      makeRequest("/api/v1/workflow/schedules", {
        method: "POST",
        body: JSON.stringify({
          workflowId: def.id,
          cron: "0 * * * *",
          timezone: "UTC",
        }),
      }),
      ctx,
    );
    expect(scheduleCreated.status).toBe(201);
    const scheduleBody = await scheduleCreated.json();
    const scheduleId = scheduleBody.data.id as string;

    const armed = await handlePatchWorkflowSchedule(
      makeRequest(`/api/v1/workflow/schedules/${scheduleId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "armed" }),
      }),
      ctx,
      { params: Promise.resolve({ scheduleId }) },
    );
    expect(armed.status).toBe(200);
    expect((await armed.json()).data.status).toBe("armed");

    const schedules = await handleListWorkflowSchedules(
      makeRequest(`/api/v1/workflow/schedules?workflowId=${def.id}`),
      ctx,
    );
    expect(schedules.status).toBe(200);

    const retired = await handleDeleteWorkflowSchedule(
      makeRequest(`/api/v1/workflow/schedules/${scheduleId}`, { method: "DELETE" }),
      ctx,
      { params: Promise.resolve({ scheduleId }) },
    );
    expect(retired.status).toBe(200);
    expect((await retired.json()).data.status).toBe("retired");

    const run = await gateway.workflow.runs.start(ctx.serviceContext, {
      workflowId: def.id,
    });
    const task = await workflow.runtime.tasks.seedTask(ctx.serviceContext, {
      runId: run.id,
      kind: "approval",
      title: "Approve HTTP",
    });

    const tasks = await handleListWorkflowTasks(
      makeRequest("/api/v1/workflow/tasks"),
      ctx,
    );
    expect(tasks.status).toBe(200);

    const claimed = await handlePatchWorkflowTask(
      makeRequest(`/api/v1/workflow/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "claim" }),
      }),
      ctx,
      { params: Promise.resolve({ taskId: task.id }) },
    );
    expect(claimed.status).toBe(200);

    const gotTask = await handleGetWorkflowTask(
      makeRequest(`/api/v1/workflow/tasks/${task.id}`),
      ctx,
      { params: Promise.resolve({ taskId: task.id }) },
    );
    expect(gotTask.status).toBe(200);

    const approvals = await handleListWorkflowApprovals(
      makeRequest("/api/v1/workflow/approvals"),
      ctx,
    );
    expect(approvals.status).toBe(200);

    const decided = await handlePatchWorkflowApproval(
      makeRequest(`/api/v1/workflow/approvals/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision: "approved" }),
      }),
      ctx,
      { params: Promise.resolve({ approvalId: task.id }) },
    );
    expect(decided.status).toBe(200);
    expect((await decided.json()).data.decision).toBe("approved");

    await gateway.workflow.notifications.publishIntent(ctx.serviceContext, {
      templateKey: "workflow.run.cancelled",
      runId: run.id,
    });
    const notifications = await handleListWorkflowNotifications(
      makeRequest("/api/v1/workflow/notifications"),
      ctx,
    );
    expect(notifications.status).toBe(200);
    const notificationsBody = await notifications.json();
    expect(notificationsBody.data.length).toBeGreaterThan(0);
  });

  it("denies runs list when authorization provider denies", async () => {
    const workflow = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const { gateway } = createPlatformServices({
      workflow,
      authorizationMode: "production",
      authorization: {
        authorize: async () => ({
          effect: "deny" as const,
          reason: "test-deny",
        }),
      },
    });
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(gateway, {
        workflowEnabled: true,
        workflowReadiness: workflow.readiness,
        authorizationMode: "production",
      }),
    );
    const ctx = makeContext();
    await expect(
      handleListWorkflowRuns(makeRequest("/api/v1/workflow/runs"), ctx),
    ).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
  });

  it("validates request bodies", () => {
    expect(createWorkflowRunBodySchema.safeParse({ workflowId: "wf_1" }).success).toBe(
      true,
    );
    expect(createWorkflowRunBodySchema.safeParse({}).success).toBe(false);
    expect(
      createWorkflowScheduleBodySchema.safeParse({
        workflowId: "wf_1",
        cron: "0 * * * *",
      }).success,
    ).toBe(true);
    expect(patchWorkflowScheduleBodySchema.safeParse({ status: "armed" }).success).toBe(
      true,
    );
    expect(patchWorkflowTaskBodySchema.safeParse({ action: "claim" }).success).toBe(
      true,
    );
    expect(
      patchWorkflowApprovalBodySchema.safeParse({ decision: "rejected" }).success,
    ).toBe(true);
  });

  it("registers Workflow routes with withPlatformApiAuth and OpenAPI paths", () => {
    const routes = walkRoutes(join(process.cwd(), "apps/web/app/api/v1/workflow"));
    expect(routes.length).toBe(15);
    for (const route of routes) {
      const content = readFileSync(route, "utf8");
      expect(content).toContain("withPlatformApiAuth");
      expect(content).not.toMatch(/@apzhub\/integration-n8n/);
    }

    const handler = readFileSync(
      join(process.cwd(), "apps/web/lib/api/v1/handlers/workflow.ts"),
      "utf8",
    );
    expect(handler).not.toMatch(/@apzhub\/integration-n8n/);
    expect(handler).toContain("gateway.workflow");

    const spec = loadPlatformOpenApiSpecObject() as {
      openapi: string;
      info: { version: string };
      paths: Record<string, unknown>;
    };
    expect(spec.openapi.startsWith("3.1")).toBe(true);
    expect(spec.info.version).toBe("1.14.0");
    for (const path of [
      "/workflow/health",
      "/workflow/readiness",
      "/workflow/capabilities",
      "/workflow/definitions",
      "/workflow/definitions/{definitionId}",
      "/workflow/runs",
      "/workflow/runs/{runId}",
      "/workflow/runs/{runId}/cancel",
      "/workflow/schedules",
      "/workflow/schedules/{scheduleId}",
      "/workflow/tasks",
      "/workflow/tasks/{taskId}",
      "/workflow/approvals",
      "/workflow/approvals/{approvalId}",
      "/workflow/notifications",
    ]) {
      expect(spec.paths[path]).toBeTruthy();
    }
  });
});
