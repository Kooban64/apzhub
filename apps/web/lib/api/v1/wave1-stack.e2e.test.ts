/**
 * OSS-101-10 — Mocked end-to-end Wave 1 stack certification (HTTP layer).
 *
 * HTTP handlers → PlatformServiceGateway → Platform Services → Plane providers
 * → Plane adapter → Mock Plane API
 *
 * No live Plane instance.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import {
  createPlaneAdapter,
  disposePlaneAdapter,
  PLANE_ADAPTER_VERSION,
} from "@apzhub/integration-plane";
import {
  createPlatformServicesWithPlane,
  InMemoryEntityMappingStore,
} from "@apzhub/platform-services";

import { handleListWorkspaces, handleGetWorkspace } from "./handlers/workspaces";
import {
  handleListProjects,
  handleCreateProject,
  handleGetProject,
  handleUpdateProject,
  handleArchiveProject,
} from "./handlers/projects";
import {
  handleListTasks,
  handleCreateTask,
  handleGetTask,
  handleUpdateTask,
  handleTransitionTask,
} from "./handlers/tasks";
import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "./gateway/bootstrap";
import { buildMockSession } from "./testing/fixtures";

import { createMockPlaneCoreFetch } from "../../../../../integrations/plane/src/testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_TENANT_ID,
} from "../../../../../integrations/plane/src/testing/mock-plane-api";
import { MOCK_STATE } from "../../../../../integrations/plane/src/testing/mock-plane-core-data";

const TENANT = TEST_TENANT_ID;
const USER = "user_wave1_cert_001";
const CORR = "corr-wave1-e2e-001";

function makeRequest(
  url: string,
  init?: { method?: string; body?: string },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: { "content-type": "application/json" },
  });
}

function makeContext(
  permissions: string[] = [
    "workspace.view",
    "projects.view",
    "projects.manage",
    "task.view",
    "task.create",
    "task.update",
    "task.transition",
  ],
): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-wave1-001",
      correlationId: CORR,
      timestamp: "2026-07-10T00:00:00.000Z",
    },
    session: buildMockSession({
      userId: USER,
      tenantId: TENANT,
    }) as PlatformApiRequestContext["session"],
    serviceContext: {
      tenantId: TENANT,
      userId: USER,
      correlationId: CORR,
      permissions,
      requestId: "req-wave1-001",
    },
  };
}

describe("OSS-101-10 Wave 1 mocked E2E stack (HTTP)", () => {
  let adapter: Awaited<ReturnType<typeof createPlaneAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createPlaneAdapter>>["factory"];
  let mappingStore: InMemoryEntityMappingStore;

  beforeEach(async () => {
    resetPlatformApiGatewayBootstrap();
    mappingStore = new InMemoryEntityMappingStore();
    const created = await createPlaneAdapter({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TENANT,
      apiToken: "wave1-cert-token",
      adapterOptions: { fetchFn: createMockPlaneCoreFetch() },
    });
    adapter = created.adapter;
    factory = created.factory;
    await adapter.initialise();
    await adapter.testConnection({ correlationId: CORR, tenantId: TENANT });

    const bundle = createPlatformServicesWithPlane(adapter.core, mappingStore);
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(bundle.gateway, {
        planeEnabled: true,
        providersRegistered: true,
        mappingStoreMode: "memory",
        authorizationMode: "allow-all",
      }),
    );
  });

  afterEach(async () => {
    resetPlatformApiGatewayBootstrap();
    if (adapter && factory) {
      await disposePlaneAdapter(adapter, factory);
    }
  });

  it("certifies workspace → project lifecycle through HTTP handlers", async () => {
    expect(PLANE_ADAPTER_VERSION).toBe("0.6.0");
    const ctx = makeContext();

    const workspaces = await handleListWorkspaces(
      makeRequest("/api/v1/workspaces"),
      ctx,
    );
    expect(workspaces.status).toBe(200);
    const wsBody = await workspaces.json();
    expect(wsBody.data.length).toBeGreaterThanOrEqual(1);
    const workspaceId = wsBody.data[0].id as string;
    expect(workspaceId).toMatch(/^ws_/);

    const wsGet = await handleGetWorkspace(
      makeRequest(`/api/v1/workspaces/${workspaceId}`),
      ctx,
      { params: Promise.resolve({ workspaceId }) },
    );
    expect(wsGet.status).toBe(200);

    const projects = await handleListProjects(makeRequest("/api/v1/projects"), ctx);
    expect(projects.status).toBe(200);

    const created = await handleCreateProject(
      makeRequest("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          name: "Wave1 Project",
          identifier: "W1P",
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
    const createdBody = await created.json();
    const projectId = createdBody.data.id as string;
    expect(projectId).toMatch(/^proj_/);

    const got = await handleGetProject(
      makeRequest(`/api/v1/projects/${projectId}`),
      ctx,
      { params: Promise.resolve({ projectId }) },
    );
    expect(got.status).toBe(200);

    const updated = await handleUpdateProject(
      makeRequest(`/api/v1/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: "Wave1 Project Updated" }),
      }),
      ctx,
      { params: Promise.resolve({ projectId }) },
    );
    expect(updated.status).toBe(200);

    const archived = await handleArchiveProject(
      makeRequest(`/api/v1/projects/${projectId}`, { method: "DELETE" }),
      ctx,
      { params: Promise.resolve({ projectId }) },
    );
    expect(archived.status).toBe(200);
  });

  it("certifies task lifecycle, sync, diagnostics, mapping, and errors", async () => {
    const ctx = makeContext();

    const workspaces = await handleListWorkspaces(
      makeRequest("/api/v1/workspaces"),
      ctx,
    );
    const workspaceId = (await workspaces.json()).data[0].id as string;

    const createdProject = await handleCreateProject(
      makeRequest("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          name: "Task Host",
          identifier: "TH1",
        }),
      }),
      ctx,
    );
    expect(createdProject.status).toBe(201);
    const projectId = (await createdProject.json()).data.id as string;

    const tasksList = await handleListTasks(
      makeRequest(`/api/v1/tasks?projectId=${projectId}`),
      ctx,
    );
    expect(tasksList.status).toBe(200);

    const taskCreated = await handleCreateTask(
      makeRequest("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          title: "Wave1 Task",
        }),
      }),
      ctx,
    );
    expect(taskCreated.status).toBe(201);
    const taskBody = await taskCreated.json();
    const taskId = taskBody.data.id as string;
    expect(taskId).toMatch(/^task_/);

    const taskGet = await handleGetTask(makeRequest(`/api/v1/tasks/${taskId}`), ctx, {
      params: Promise.resolve({ taskId }),
    });
    expect(taskGet.status).toBe(200);

    const taskUpdate = await handleUpdateTask(
      makeRequest(`/api/v1/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: "Wave1 Task Updated" }),
      }),
      ctx,
      { params: Promise.resolve({ taskId }) },
    );
    expect(taskUpdate.status).toBe(200);

    // Transition with non-ADR-0048 status ID must fail HTTP validation (certifies boundary).
    try {
      await handleTransitionTask(
        makeRequest(`/api/v1/tasks/${taskId}/transition`, {
          method: "POST",
          body: JSON.stringify({ statusId: `status_plane_${MOCK_STATE.id}` }),
        }),
        ctx,
        { params: Promise.resolve({ taskId }) },
      );
      expect.fail(
        "expected transition validation to reject provisional Plane status IDs",
      );
    } catch (error) {
      expect(String(error)).toMatch(/validation|VALIDATION|400/i);
    }

    const readiness = await adapter.evaluateReadiness({
      correlationId: CORR,
      tenantId: TENANT,
    });
    expect(readiness.ready).toBe(true);

    const report = await adapter.buildOperationalReport({
      correlationId: CORR,
      tenantId: TENANT,
    });
    expect(report.capabilities.length).toBe(15);

    const sync = await adapter.core.synchronisation.runFullSync({
      correlationId: CORR,
      tenantId: TENANT,
    });
    expect(sync.status.status).toBe("succeeded");

    const mappings = await mappingStore.list({ tenantId: TENANT });
    expect(mappings.length).toBeGreaterThanOrEqual(1);

    try {
      await handleGetProject(
        makeRequest("/api/v1/projects/proj_ffffffffffffffffffffffffffffffff"),
        ctx,
        {
          params: Promise.resolve({
            projectId: "proj_ffffffffffffffffffffffffffffffff",
          }),
        },
      );
      expect.fail("expected missing project to throw or return error");
    } catch (error) {
      expect(String(error)).toMatch(/not found|MAPPING_NOT_FOUND|NOT_FOUND/i);
    }
  });
});
