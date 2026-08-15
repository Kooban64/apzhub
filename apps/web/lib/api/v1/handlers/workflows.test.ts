/**
 * Platform Workflow HTTP handler coverage (APZWORKFLOW-003).
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  handleArchiveWorkflow,
  handleCreateWorkflow,
  handleCreateWorkflowCategory,
  handleCreateWorkflowFolder,
  handleCreateWorkflowTemplate,
  handleCreateWorkflowVersion,
  handleDeleteWorkflow,
  handleDeleteWorkflowTemplate,
  handleGetWorkflow,
  handleGetWorkflowCapabilities,
  handleGetWorkflowCategory,
  handleGetWorkflowDiagnostics,
  handleGetWorkflowFolder,
  handleGetWorkflowHealth,
  handleGetWorkflowReadiness,
  handleGetWorkflowTemplate,
  handleGetWorkflowVersion,
  handleListWorkflowAudit,
  handleListWorkflowCategories,
  handleListWorkflowFolders,
  handleListWorkflows,
  handleListWorkflowTemplates,
  handleListWorkflowVersions,
  handlePublishWorkflow,
  handleRestoreWorkflow,
  handleTransitionWorkflow,
  handleUpdateWorkflow,
  handleUpdateWorkflowTemplate,
  handleValidateWorkflow,
} from "./workflows";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  installMockGateway,
} from "../testing/fixtures";
import { loadPlatformOpenApiSpecObject } from "../openapi";
import { PlatformApiHttpError } from "../errors";

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
      requestId: "req-test-workflows",
      correlationId: "corr-test-workflows",
      timestamp: "2026-07-15T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

const EMPTY_GRAPH = { nodes: [], connections: [] };

describe("APZWORKFLOW-003 workflow handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("lists and creates workflows via gateway only", async () => {
    installMockGateway();
    const list = await handleListWorkflows(
      makeRequest("http://localhost/api/v1/workflows"),
      makeContext(),
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);

    const created = await handleCreateWorkflow(
      makeRequest("http://localhost/api/v1/workflows", {
        method: "POST",
        body: JSON.stringify({ key: "intake", name: "Intake" }),
      }),
      makeContext(),
    );
    expect(created.status).toBe(200);
    expect((await created.json()).data.key).toBe("intake");
  });

  it("covers get/update/delete/publish/archive/restore/transition", async () => {
    installMockGateway();
    const ctx = makeContext();
    const route = { params: Promise.resolve({ workflowId: "wf_1" }) };

    expect(
      (await handleGetWorkflow(makeRequest("/api/v1/workflows/wf_1"), ctx, route))
        .status,
    ).toBe(200);

    expect(
      (
        await handleUpdateWorkflow(
          makeRequest("/api/v1/workflows/wf_1", {
            method: "PATCH",
            body: JSON.stringify({ name: "Updated" }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleDeleteWorkflow(
          makeRequest("/api/v1/workflows/wf_1", { method: "DELETE" }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handlePublishWorkflow(
          makeRequest("/api/v1/workflows/wf_1/publish", { method: "POST" }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleArchiveWorkflow(
          makeRequest("/api/v1/workflows/wf_1/archive", { method: "POST" }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleRestoreWorkflow(
          makeRequest("/api/v1/workflows/wf_1/restore", { method: "POST" }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    const transitioned = await handleTransitionWorkflow(
      makeRequest("/api/v1/workflows/wf_1/transition", {
        method: "POST",
        body: JSON.stringify({ to: "inactive", reason: "pause" }),
      }),
      ctx,
      route,
    );
    expect(transitioned.status).toBe(200);
    expect((await transitioned.json()).data.lifecycle).toBe("inactive");
  });

  it("covers versions, audit, templates, categories, folders, validation, stubs", async () => {
    installMockGateway();
    const ctx = makeContext();
    const route = {
      params: Promise.resolve({
        workflowId: "wf_1",
        versionId: "wfv_1",
        templateId: "wft_1",
        categoryId: "wfc_1",
        folderId: "wff_1",
      }),
    };

    expect(
      (
        await handleListWorkflowVersions(
          makeRequest("/api/v1/workflows/wf_1/versions"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleCreateWorkflowVersion(
          makeRequest("/api/v1/workflows/wf_1/versions", {
            method: "POST",
            body: JSON.stringify({ graph: EMPTY_GRAPH }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetWorkflowVersion(
          makeRequest("/api/v1/workflows/wf_1/versions/wfv_1"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListWorkflowAudit(
          makeRequest("/api/v1/workflows/wf_1/audit"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListWorkflowTemplates(
          makeRequest("/api/v1/workflows/templates"),
          ctx,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleCreateWorkflowTemplate(
          makeRequest("/api/v1/workflows/templates", {
            method: "POST",
            body: JSON.stringify({
              key: "tmpl",
              name: "Template",
              graph: EMPTY_GRAPH,
            }),
          }),
          ctx,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetWorkflowTemplate(
          makeRequest("/api/v1/workflows/templates/wft_1"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleUpdateWorkflowTemplate(
          makeRequest("/api/v1/workflows/templates/wft_1", {
            method: "PATCH",
            body: JSON.stringify({ name: "Renamed" }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleDeleteWorkflowTemplate(
          makeRequest("/api/v1/workflows/templates/wft_1", { method: "DELETE" }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListWorkflowCategories(
          makeRequest("/api/v1/workflows/categories"),
          ctx,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleCreateWorkflowCategory(
          makeRequest("/api/v1/workflows/categories", {
            method: "POST",
            body: JSON.stringify({ name: "Ops" }),
          }),
          ctx,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetWorkflowCategory(
          makeRequest("/api/v1/workflows/categories/wfc_1"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (await handleListWorkflowFolders(makeRequest("/api/v1/workflows/folders"), ctx))
        .status,
    ).toBe(200);

    expect(
      (
        await handleCreateWorkflowFolder(
          makeRequest("/api/v1/workflows/folders", {
            method: "POST",
            body: JSON.stringify({ name: "Root", path: "/" }),
          }),
          ctx,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetWorkflowFolder(
          makeRequest("/api/v1/workflows/folders/wff_1"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleValidateWorkflow(
          makeRequest("/api/v1/workflows/validation", {
            method: "POST",
            body: JSON.stringify({ workflowId: "wf_1" }),
          }),
          ctx,
        )
      ).status,
    ).toBe(200);

    const caps = await handleGetWorkflowCapabilities(
      makeRequest("/api/v1/workflows/capabilities"),
      ctx,
    );
    const capsBody = await caps.json();
    expect(caps.status).toBe(200);
    expect(capsBody.data.executionEnabled).toBe(false);
    expect(capsBody.data.engineConfigured).toBe(false);
    expect(capsBody.data.capabilities.n8n).toBe(false);

    // Honesty: when bootstrap readiness says n8n engine is on, surface it
    // without unlocking execute.
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        workflowEnabled: true,
        workflowReadiness: {
          workflowEnabled: true,
          persistenceMode: "postgres",
          executionEnabled: false,
          runtimePlaneEnabled: true,
          providerExecuteSupported: false,
          opsProviderId: "n8n",
          engineEnabled: true,
          engineProvider: "n8n",
        },
      }),
    );
    const capsLive = await handleGetWorkflowCapabilities(
      makeRequest("/api/v1/workflows/capabilities"),
      ctx,
    );
    const capsLiveBody = await capsLive.json();
    expect(capsLive.status).toBe(200);
    expect(capsLiveBody.data.executionEnabled).toBe(false);
    expect(capsLiveBody.data.engineConfigured).toBe(true);
    expect(capsLiveBody.data.capabilities.n8n).toBe(true);
    expect(capsLiveBody.data.capabilities.execution).toBe(false);

    expect(
      (await handleGetWorkflowHealth(makeRequest("/api/v1/workflows/health"), ctx))
        .status,
    ).toBe(200);
    expect(
      (
        await handleGetWorkflowReadiness(
          makeRequest("/api/v1/workflows/readiness"),
          ctx,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handleGetWorkflowDiagnostics(
          makeRequest("/api/v1/workflows/diagnostics"),
          ctx,
        )
      ).status,
    ).toBe(200);
  });

  it("returns 404 when category/folder missing or version ownership mismatches", async () => {
    installMockGateway({
      workflow: {
        categories: {
          get: async () => null,
        },
        folders: {
          get: async () => null,
        },
        versions: {
          get: async () => ({
            id: "wfv_1",
            workflowId: "wf_other",
            versionNumber: 1,
            status: "draft",
            lifecycle: "draft",
            graph: { nodes: [], connections: [] },
            variables: [],
            parameters: [],
            triggers: [],
            actions: [],
            conditions: [],
            connections: [],
            createdAt: "2026-07-15T12:00:00.000Z",
            createdBy: "user_1",
            tenantId: "tenant_a",
          }),
        },
      },
    });
    const ctx = makeContext();
    const route = {
      params: Promise.resolve({
        workflowId: "wf_1",
        versionId: "wfv_1",
        categoryId: "wfc_1",
        folderId: "wff_1",
      }),
    };

    await expect(
      handleGetWorkflowCategory(
        makeRequest("/api/v1/workflows/categories/wfc_1"),
        ctx,
        route,
      ),
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      handleGetWorkflowFolder(
        makeRequest("/api/v1/workflows/folders/wff_1"),
        ctx,
        route,
      ),
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      handleGetWorkflowVersion(
        makeRequest("/api/v1/workflows/wf_1/versions/wfv_1"),
        ctx,
        route,
      ),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("maps nullable category/folder on update and validate optionals", async () => {
    installMockGateway();
    const ctx = makeContext();
    const route = { params: Promise.resolve({ workflowId: "wf_1" }) };

    expect(
      (
        await handleUpdateWorkflow(
          makeRequest("/api/v1/workflows/wf_1", {
            method: "PATCH",
            body: JSON.stringify({
              categoryId: null,
              folderId: null,
              description: "cleared",
            }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleUpdateWorkflow(
          makeRequest("/api/v1/workflows/wf_1", {
            method: "PATCH",
            body: JSON.stringify({
              categoryId: "wfc_1",
              folderId: "wff_1",
            }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleValidateWorkflow(
          makeRequest("/api/v1/workflows/validation", {
            method: "POST",
            body: JSON.stringify({
              workflowId: "wf_1",
              versionId: "wfv_1",
              lifecycle: "draft",
              graph: EMPTY_GRAPH,
              categoryId: "wfc_1",
              folderId: "wff_1",
              templateId: "wft_1",
            }),
          }),
          ctx,
        )
      ).status,
    ).toBe(200);
  });

  it("returns controlled 503 when workflow is disabled", async () => {
    const gateway = createMockPlatformGateway();
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(gateway, {
        workflowEnabled: false,
      }),
    );
    await expect(
      handleListWorkflows(makeRequest("/api/v1/workflows"), makeContext()),
    ).rejects.toBeInstanceOf(PlatformApiHttpError);

    try {
      await handleGetWorkflowCapabilities(
        makeRequest("/api/v1/workflows/capabilities"),
        makeContext(),
      );
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect((error as PlatformApiHttpError).status).toBe(503);
    }
  });

  it("documents Platform Workflow management paths in OpenAPI without execution surfaces", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      paths: Record<string, unknown>;
      info: { version: string };
      tags?: Array<{ name?: string }>;
    };
    expect([
      "1.5.0",
      "1.6.0",
      "1.7.0",
      "1.8.0",
      "1.9.0",
      "1.10.0",
      "1.11.0",
      "1.12.0",
      "1.13.0",
      "1.14.0",
    ]).toContain(spec.info.version);
    expect(spec.tags?.some((tag) => tag.name === "Platform Workflow")).toBe(true);
    for (const path of [
      "/workflows",
      "/workflows/{workflowId}",
      "/workflows/{workflowId}/versions",
      "/workflows/validation",
      "/workflows/capabilities",
      "/workflows/health",
    ]) {
      expect(spec.paths[path], path).toBeTruthy();
    }
    for (const path of [
      "/workflows/execute",
      "/workflows/runs",
      "/workflows/n8n",
      "/workflows/schedules",
    ]) {
      expect(spec.paths[path], path).toBeUndefined();
    }
  });

  it("does not ship execute/runs/n8n/schedules/activate HTTP routes", () => {
    const routesRoot = join(__dirname, "../../../../app/api/v1/workflows");
    const forbidden = [
      "execute",
      "execution",
      "runs",
      "run",
      "n8n",
      "schedules",
      "schedule",
      "activate",
      "deactivate",
    ];
    function walk(dir: string, out: string[] = []): string[] {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
      }
      return out;
    }
    const files = walk(routesRoot).map(
      (f) => f.replace(/\\/g, "/").split("/api/v1/workflows/")[1] ?? "",
    );
    for (const segment of forbidden) {
      expect(
        files.some((f) => f.includes(`/${segment}/`) || f.startsWith(`${segment}/`)),
      ).toBe(false);
    }
  });
});
