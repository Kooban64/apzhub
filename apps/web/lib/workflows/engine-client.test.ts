/**
 * APZWORKFLOW-008 — Workflow Engine typed client + mock + query keys.
 */

import { describe, expect, it, vi, afterEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";

import {
  createHttpWorkflowEngineClient,
} from "./engine-client";
import {
  WorkflowEngineClientError,
  toWorkflowEngineUserMessage,
} from "./engine-errors";
import {
  clearWorkflowEngineQueries,
  workflowEngineQueryKeys,
} from "./engine-query-keys";
import {
  createMockWorkflowEngineClient,
  MOCK_ENGINE_WORKFLOW,
} from "./mock-engine-client";
import {
  assertWorkflowEngineApiPath,
  isWorkflowEngineApiPath,
  WORKFLOW_ENGINE_API_BASE,
} from "./routes";
import {
  getWorkflowEngineClient,
  resetWorkflowEngineClient,
  setWorkflowEngineClient,
} from "./engine-api";

afterEach(() => {
  vi.unstubAllGlobals();
  resetWorkflowEngineClient();
});

describe("APZWORKFLOW-008 workflow engine client", () => {
  it("exposes engine API base under /api/v1/workflows/engine", () => {
    expect(WORKFLOW_ENGINE_API_BASE).toBe("/api/v1/workflows/engine");
    expect(isWorkflowEngineApiPath("/api/v1/workflows/engine/workflows")).toBe(
      true,
    );
    expect(isWorkflowEngineApiPath("/api/v1/workflows/workflows")).toBe(false);
    expect(() =>
      assertWorkflowEngineApiPath("/api/v1/workflows/engine/n8n"),
    ).toThrow(/Forbidden/);
  });

  it("mock client returns metadata-only fixtures", async () => {
    const client = createMockWorkflowEngineClient();
    const listed = await client.listWorkflows();
    expect(listed.items[0]?.id).toBe(MOCK_ENGINE_WORKFLOW.id);
    expect(listed.items[0]).not.toHaveProperty("nodes");
    const diagnosticsJson = JSON.stringify(await client.diagnostics());
    expect(diagnosticsJson).not.toMatch(/secret:\/\/|password|Bearer /i);
    expect(diagnosticsJson).not.toContain("sk-");
    const capabilities = await client.capabilities();
    expect(capabilities.unsupportedOperations).toContain("execute");
    await expect(client.validate()).resolves.toMatchObject({ ok: true });
  });

  it("runtime accessor uses mock in test env", async () => {
    const listed = await getWorkflowEngineClient().listWorkflows();
    expect(listed.items.length).toBeGreaterThan(0);
    const custom = createMockWorkflowEngineClient({
      async listWorkflows() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    setWorkflowEngineClient(custom);
    expect((await getWorkflowEngineClient().listWorkflows()).items).toEqual([]);
  });

  it("HTTP client maps collection + errors without provider leakage", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const raw =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const path = new URL(raw, "http://localhost").pathname;
      if (path === "/api/v1/workflows/engine/workflows") {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "1",
                name: "Flow",
                active: true,
                tagNames: [],
                nodeCount: 1,
                connectionCount: 0,
                engine: "workflow_engine",
              },
            ],
            page: { limit: 1, hasMore: false },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/workflows/1")) {
        return new Response(
          JSON.stringify({
            data: {
              id: "1",
              name: "Flow",
              active: true,
              tagNames: ["ops"],
              nodeCount: 2,
              connectionCount: 1,
              engine: "workflow_engine",
            },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/capabilities")) {
        return new Response(
          JSON.stringify({
            data: { services: [], unsupportedOperations: ["execute"] },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/health")) {
        return new Response(
          JSON.stringify({
            data: { level: "healthy", reasons: [], sdkStatus: "healthy" },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/diagnostics")) {
        return new Response(
          JSON.stringify({
            data: {
              adapterVersion: "0.1.0",
              healthLevel: "healthy",
              reasons: [],
              apiStatus: "reachable",
              authenticationStatus: "valid",
              authMode: "api_key",
              coreServiceCount: 1,
              compatibilityStatus: "compatible",
            },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/compatibility")) {
        return new Response(
          JSON.stringify({
            data: {
              compatibilityStatus: "compatible",
              supportedApi: "v1",
              adapterVersion: "0.1.0",
              unsupportedOperations: ["execute"],
              notes: [],
            },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/validate")) {
        return new Response(
          JSON.stringify({ data: { ok: true, message: "ok" } }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/templates")) {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "1",
                name: "T",
                tagNames: [],
                engine: "workflow_engine",
                support: "partial",
              },
            ],
            page: { limit: 1, hasMore: false },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/templates/1")) {
        return new Response(
          JSON.stringify({
            data: {
              id: "1",
              name: "T",
              tagNames: [],
              engine: "workflow_engine",
              support: "partial",
            },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/tags")) {
        return new Response(
          JSON.stringify({
            data: [{ id: "t1", name: "ops", engine: "workflow_engine" }],
            page: { limit: 1, hasMore: false },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/users")) {
        return new Response(
          JSON.stringify({
            data: [{ id: "u1", engine: "workflow_engine" }],
            page: { limit: 1, hasMore: false },
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/engine/projects")) {
        return new Response(
          JSON.stringify({
            data: [{ id: "p1", name: "Default", engine: "workflow_engine" }],
            page: { limit: 1, hasMore: false },
          }),
          { status: 200 },
        );
      }
      if (path.includes("/engine/workflows/missing")) {
        return new Response(
          JSON.stringify({
            error: { code: "FORBIDDEN", message: "denied" },
            meta: { correlationId: "corr_1" },
          }),
          { status: 403 },
        );
      }
      return new Response(
        JSON.stringify({
          error: { code: "NOT_FOUND", message: "not found" },
          meta: { correlationId: "corr_1" },
        }),
        { status: 404 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpWorkflowEngineClient();
    expect((await client.listWorkflows({ limit: 10 })).items[0]?.name).toBe(
      "Flow",
    );
    expect((await client.getWorkflow("1")).tagNames).toContain("ops");
    expect((await client.listTemplates()).items).toHaveLength(1);
    expect((await client.getTemplate("1")).id).toBe("1");
    expect((await client.listTags()).items[0]?.name).toBe("ops");
    expect((await client.listUsers()).items).toHaveLength(1);
    expect((await client.listProjects()).items[0]?.id).toBe("p1");
    expect((await client.capabilities()).unsupportedOperations).toContain(
      "execute",
    );
    expect((await client.health()).level).toBe("healthy");
    expect((await client.diagnostics()).adapterVersion).toBe("0.1.0");
    expect((await client.compatibility()).compatibilityStatus).toBe(
      "compatible",
    );
    expect((await client.validate()).ok).toBe(true);

    await expect(client.getWorkflow("missing")).rejects.toBeInstanceOf(
      WorkflowEngineClientError,
    );
    try {
      await client.getWorkflow("missing");
    } catch (error) {
      expect(toWorkflowEngineUserMessage(error)).toMatch(/permission/i);
      expect(JSON.stringify(error)).not.toMatch(/stack|password|secret:\/\//i);
    }
  });

  it("defines read-only query keys", () => {
    expect(workflowEngineQueryKeys.workflows.list()).toEqual([
      "workflows",
      "engine",
      "workflows",
      "list",
      "",
    ]);
    expect(workflowEngineQueryKeys.workflow("1")).toEqual([
      "workflows",
      "engine",
      "workflow",
      "1",
    ]);
    expect(workflowEngineQueryKeys.template("t1")).toEqual([
      "workflows",
      "engine",
      "template",
      "t1",
    ]);
    expect(workflowEngineQueryKeys.tags()).toContain("tags");
    expect(workflowEngineQueryKeys.users()).toContain("users");
    expect(workflowEngineQueryKeys.projects()).toContain("projects");
    expect(workflowEngineQueryKeys.capabilities()).toContain("capabilities");
    expect(workflowEngineQueryKeys.diagnostics()).toContain("diagnostics");
    expect(workflowEngineQueryKeys.health()).toContain("health");
    expect(workflowEngineQueryKeys.compatibility()).toContain("compatibility");
    const qc = new QueryClient();
    clearWorkflowEngineQueries(qc);
  });
});
