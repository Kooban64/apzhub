/**
 * Platform Task HTTP API v1 tests (OSS-110-09).
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import { mapPlatformErrorToHttpStatus } from "./errors";
import { resetPlatformApiGatewayBootstrap } from "./gateway/bootstrap";
import {
  handleAddTaskLabels,
  handleArchiveTask,
  handleAssignTask,
  handleClearTaskModule,
  handleClearTaskParent,
  handleClearTaskSprint,
  handleCreateTask,
  handleGetTask,
  handleListTasks,
  handleRemoveTaskLabel,
  handleSetTaskModule,
  handleSetTaskParent,
  handleSetTaskSprint,
  handleTransitionTask,
  handleUnassignTaskAssignee,
  handleUpdateTask,
} from "./handlers/tasks";
import { loadPlatformOpenApiSpecObject } from "./openapi";
import { parseQuery } from "./schemas/common";
import { taskListQuerySchema, createTaskBodySchema } from "./schemas/task";
import { parseJsonBody } from "./schemas/common";
import {
  API_TEST_ASSIGNEE_ID,
  API_TEST_LABEL_ID,
  API_TEST_MODULE_ID,
  API_TEST_PARENT_TASK_ID,
  API_TEST_PROJ_ID,
  API_TEST_SPRINT_ID,
  API_TEST_STATUS_ID,
  API_TEST_TASK_ID,
  API_TEST_TENANT_B,
  buildMockSession,
  buildTestServiceContext,
  buildTestTask,
  installMockGateway,
} from "./testing/fixtures";

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: vi.fn(),
}));

import { getValidatedSession } from "@apzhub/auth/server";

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

function makeContext(
  overrides: Partial<PlatformApiRequestContext["serviceContext"]> = {},
): PlatformApiRequestContext {
  const session = buildMockSession() as unknown as PlatformApiRequestContext["session"];
  const tracing = {
    requestId: "req-test-0001",
    correlationId: "corr-test-0001",
    timestamp: "2026-07-10T00:00:00.000Z",
  };
  return {
    tracing,
    session,
    serviceContext: buildTestServiceContext(overrides),
  };
}

describe("OSS-110-09 Task HTTP API", () => {
  beforeEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.mocked(getValidatedSession).mockResolvedValue(buildMockSession() as never);
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.clearAllMocks();
  });

  describe("CRUD and relationships", () => {
    it("lists tasks via gateway with filters", async () => {
      const calls: string[] = [];
      let capturedFilter: unknown;
      installMockGateway({
        onCall: (s, o) => calls.push(`${s}.${o}`),
        tasks: {
          listTasks: async (ctx, projectId, query) => {
            calls.push("task.listTasks");
            capturedFilter = query?.filter;
            expect(projectId).toBe(API_TEST_PROJ_ID);
            return {
              items: [buildTestTask()],
              totalCount: 1,
              page: 1,
              perPage: 20,
              hasNextPage: false,
            };
          },
        },
      });

      const response = await handleListTasks(
        makeRequest(
          `/api/v1/tasks?projectId=${API_TEST_PROJ_ID}&stateId=${API_TEST_STATUS_ID}&priority=high&search=api&sort=title&order=desc`,
        ),
        makeContext(),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data[0].id).toBe(API_TEST_TASK_ID);
      expect(body.data[0].id.startsWith("task_")).toBe(true);
      expect(calls).toContain("task.listTasks");
      expect(capturedFilter).toMatchObject({
        statusId: API_TEST_STATUS_ID,
        priority: "high",
        search: "api",
      });
    });

    it("creates, reads, updates, and archives a task", async () => {
      installMockGateway();
      const created = await handleCreateTask(
        makeRequest("/api/v1/tasks", {
          method: "POST",
          body: JSON.stringify({ projectId: API_TEST_PROJ_ID, title: "New task" }),
        }),
        makeContext(),
      );
      expect(created.status).toBe(201);
      const createdBody = await created.json();
      expect(createdBody.data.title).toBe("New task");

      const got = await handleGetTask(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}`),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect(got.status).toBe(200);

      const updated = await handleUpdateTask(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}`, {
          method: "PATCH",
          body: JSON.stringify({ title: "Renamed" }),
        }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect(updated.status).toBe(200);
      expect((await updated.json()).data.title).toBe("Renamed");

      const archived = await handleArchiveTask(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}`, { method: "DELETE" }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect(archived.status).toBe(200);
      expect((await archived.json()).data.archivedAt).toBeTruthy();
    });

    it("transitions status", async () => {
      installMockGateway();
      const response = await handleTransitionTask(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/transition`, {
          method: "POST",
          body: JSON.stringify({ stateId: API_TEST_STATUS_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data.statusId).toBe(API_TEST_STATUS_ID);
    });

    it("assigns and unassigns", async () => {
      installMockGateway({
        tasks: {
          getTask: async () =>
            buildTestTask({
              assigneeId: API_TEST_ASSIGNEE_ID,
              assigneeIds: [API_TEST_ASSIGNEE_ID],
            }),
        },
      });

      const assigned = await handleAssignTask(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/assignees`, {
          method: "POST",
          body: JSON.stringify({ assigneeId: API_TEST_ASSIGNEE_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect(assigned.status).toBe(200);

      const unassigned = await handleUnassignTaskAssignee(
        makeRequest(
          `/api/v1/tasks/${API_TEST_TASK_ID}/assignees/${API_TEST_ASSIGNEE_ID}`,
          { method: "DELETE" },
        ),
        makeContext(),
        {
          params: Promise.resolve({
            taskId: API_TEST_TASK_ID,
            assigneeId: API_TEST_ASSIGNEE_ID,
          }),
        },
      );
      expect(unassigned.status).toBe(200);
      expect((await unassigned.json()).data.assigneeId).toBeUndefined();
    });

    it("adds and removes labels via updateTask composition", async () => {
      const calls: string[] = [];
      installMockGateway({
        onCall: (s, o) => calls.push(`${s}.${o}`),
        tasks: {
          getTask: async () => buildTestTask({ labelIds: [] }),
        },
      });

      const added = await handleAddTaskLabels(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/labels`, {
          method: "POST",
          body: JSON.stringify({ labelId: API_TEST_LABEL_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect(added.status).toBe(200);
      expect(calls).toContain("task.updateTask");

      installMockGateway({
        tasks: {
          getTask: async () => buildTestTask({ labelIds: [API_TEST_LABEL_ID] }),
        },
      });
      const removed = await handleRemoveTaskLabel(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/labels/${API_TEST_LABEL_ID}`, {
          method: "DELETE",
        }),
        makeContext(),
        {
          params: Promise.resolve({ taskId: API_TEST_TASK_ID, labelId: API_TEST_LABEL_ID }),
        },
      );
      expect(removed.status).toBe(200);
      expect((await removed.json()).data.labelIds).toEqual([]);
    });

    it("sets and clears sprint, module, and parent", async () => {
      installMockGateway();

      const sprint = await handleSetTaskSprint(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/sprint`, {
          method: "POST",
          body: JSON.stringify({ sprintId: API_TEST_SPRINT_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect((await sprint.json()).data.sprintId).toBe(API_TEST_SPRINT_ID);

      const clearSprint = await handleClearTaskSprint(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/sprint`, { method: "DELETE" }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect((await clearSprint.json()).data.sprintId).toBeUndefined();

      const mod = await handleSetTaskModule(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/module`, {
          method: "POST",
          body: JSON.stringify({ moduleId: API_TEST_MODULE_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect((await mod.json()).data.projectModuleId).toBe(API_TEST_MODULE_ID);

      await handleClearTaskModule(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/module`, { method: "DELETE" }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );

      const parent = await handleSetTaskParent(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/parent`, {
          method: "POST",
          body: JSON.stringify({ parentTaskId: API_TEST_PARENT_TASK_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
      expect((await parent.json()).data.parentTaskId).toBe(API_TEST_PARENT_TASK_ID);

      await handleClearTaskParent(
        makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}/parent`, { method: "DELETE" }),
        makeContext(),
        { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
      );
    });
  });

  describe("validation", () => {
    it("requires projectId for list and rejects unknown query keys", () => {
      expect(() => parseQuery(taskListQuerySchema, new URLSearchParams())).toThrow();
      expect(() =>
        parseQuery(
          taskListQuerySchema,
          new URLSearchParams({ projectId: API_TEST_PROJ_ID, planeIssueId: "x" }),
        ),
      ).toThrow();
    });

    it("rejects invalid task path IDs and create bodies", async () => {
      installMockGateway();
      await expect(
        handleGetTask(makeRequest("/api/v1/tasks/not-a-task"), makeContext(), {
          params: Promise.resolve({ taskId: "not-a-task" }),
        }),
      ).rejects.toMatchObject({ status: 400 });

      await expect(
        parseJsonBody(
          makeRequest("/api/v1/tasks", {
            method: "POST",
            body: JSON.stringify({ title: "missing project" }),
          }),
          createTaskBodySchema,
          64_000,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("authorization and tenancy errors", () => {
    it("surfaces permission denial from gateway", async () => {
      installMockGateway({
        tasks: {
          getTask: async (ctx) => {
            throw new PlatformServiceError({
              category: "authorization",
              code: "PERMISSION_DENIED",
              message: "Missing task.read",
              correlationId: ctx.correlationId,
              retryable: false,
            });
          },
        },
      });
      await expect(
        handleGetTask(makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}`), makeContext(), {
          params: Promise.resolve({ taskId: API_TEST_TASK_ID }),
        }),
      ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
    });

    it("denies cross-tenant access via mapping not found", async () => {
      installMockGateway();
      await expect(
        handleGetTask(
          makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}`),
          makeContext({ tenantId: API_TEST_TENANT_B }),
          { params: Promise.resolve({ taskId: API_TEST_TASK_ID }) },
        ),
      ).rejects.toMatchObject({ code: "MAPPING_NOT_FOUND" });
    });

    it("returns 404 for unknown task IDs", async () => {
      installMockGateway();
      const unknown = "task_99999999999999999999999999999999";
      await expect(
        handleGetTask(makeRequest(`/api/v1/tasks/${unknown}`), makeContext(), {
          params: Promise.resolve({ taskId: unknown }),
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("provider and reconciliation failures", () => {
    it("maps reconciliation required to 409", () => {
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "conflict",
            code: "RECONCILIATION_REQUIRED",
            message: "reconcile",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(409);
    });

    it("surfaces provider unavailable", async () => {
      installMockGateway({
        tasks: {
          listTasks: async (ctx) => {
            throw new PlatformServiceError({
              category: "integration",
              code: "PROVIDER_UNAVAILABLE",
              message: "Plane down",
              correlationId: ctx.correlationId,
              retryable: true,
            });
          },
        },
      });
      await expect(
        handleListTasks(
          makeRequest(`/api/v1/tasks?projectId=${API_TEST_PROJ_ID}`),
          makeContext(),
        ),
      ).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "integration",
            code: "PROVIDER_UNAVAILABLE",
            message: "Plane down",
            correlationId: "c",
            retryable: true,
          }),
        ),
      ).toBe(503);
    });

    it("surfaces unexpected failures", async () => {
      installMockGateway({
        tasks: {
          getTask: async (ctx) => {
            throw new PlatformServiceError({
              category: "system",
              code: "INTERNAL_ERROR",
              message: "boom",
              correlationId: ctx.correlationId,
              retryable: false,
            });
          },
        },
      });
      await expect(
        handleGetTask(makeRequest(`/api/v1/tasks/${API_TEST_TASK_ID}`), makeContext(), {
          params: Promise.resolve({ taskId: API_TEST_TASK_ID }),
        }),
      ).rejects.toMatchObject({ code: "INTERNAL_ERROR" });
    });
  });

  describe("OpenAPI and architecture", () => {
    it("documents all task paths with APZHUB IDs only", () => {
      const spec = loadPlatformOpenApiSpecObject() as {
        paths: Record<string, unknown>;
        components: { schemas: Record<string, unknown> };
      };
      expect(spec.paths["/tasks"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/transition"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/assignees"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/assignees/{assigneeId}"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/labels"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/labels/{labelId}"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/sprint"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/module"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}/parent"]).toBeTruthy();
      expect(spec.paths["/issues"]).toBeUndefined();
      expect(spec.components.schemas.Task).toBeTruthy();

      const yaml = readFileSync(
        path.resolve(process.cwd(), "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
        "utf8",
      );
      // Forbid Plane vendor / issue-id leakage — not the substring "plane" in "execution-plane".
      expect(yaml).not.toMatch(
        /\bintegration-plane\b|plane\.so|plane-adapter|\/plane\/|\bPlane\b/,
      );
      expect(yaml.includes("issue_id")).toBe(false);
    });

    it("handlers do not import Plane or adapters", () => {
      const source = readFileSync(
        path.resolve(process.cwd(), "apps/web/lib/api/v1/handlers/tasks.ts"),
        "utf8",
      );
      expect(source.includes("@apzhub/integration-plane")).toBe(false);
      expect(source.includes("EntityMappingStore")).toBe(false);
      expect(source.includes("drizzle-orm")).toBe(false);
    });
  });
});
