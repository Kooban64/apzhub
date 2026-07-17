/**
 * Typed Workflow client tests (APZWORKFLOW-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpWorkflowClient } from "./workflow-client";
import { createMockWorkflowClient } from "./mock-workflow-client";
import { WorkflowClientError, toWorkflowUserMessage } from "./workflow-errors";
import { assertWorkflowApiPath, WORKFLOW_FORBIDDEN_HTTP_SEGMENTS } from "./routes";
import { workflowQueryKeys } from "./query-keys";
import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  resetWorkflowClient,
  setWorkflowClient,
} from "./workflow-api";

describe("createHttpWorkflowClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetWorkflowClient();
  });

  it("calls only /api/v1/workflows endpoints", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url.startsWith("/api/v1/workflows")).toBe(true);
      return new Response(
        JSON.stringify({
          data: [
            {
              id: "wf_1",
              key: "a",
              name: "A",
              lifecycle: "draft",
              updatedAt: "2026-07-15T12:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpWorkflowClient();
    const result = await client.listWorkflows({ query: "A" });
    expect(result.items[0]?.id).toBe("wf_1");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("maps HTTP errors to WorkflowClientError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: { message: "forbidden", code: "FORBIDDEN" },
            meta: { correlationId: "c1" },
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    const client = createHttpWorkflowClient();
    await expect(client.getWorkflow("wf_1")).rejects.toBeInstanceOf(
      WorkflowClientError,
    );
    expect(toWorkflowUserMessage(new WorkflowClientError({ message: "x", status: 404 }))).toContain(
      "not found",
    );
  });

  it("covers lifecycle + catalogue HTTP helpers", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push(`${init?.method ?? "GET"} ${url}`);
        const path = url.split("?")[0] ?? url;
        if (
          path.endsWith("/versions") ||
          path.endsWith("/audit") ||
          path.endsWith("/templates") ||
          path.endsWith("/categories") ||
          path.endsWith("/folders") ||
          path === "/api/v1/workflows"
        ) {
          if ((init?.method ?? "GET") === "GET") {
            return new Response(
              JSON.stringify({ data: [], page: { limit: 0, hasMore: false } }),
              { status: 200 },
            );
          }
        }
        return new Response(
          JSON.stringify({
            data: {
              id: "wf_1",
              key: "k",
              name: "N",
              lifecycle: "active",
              createdAt: "2026-07-15T12:00:00.000Z",
              updatedAt: "2026-07-15T12:00:00.000Z",
              createdBy: "u",
              updatedBy: "u",
              valid: true,
              issues: [],
              workflowEnabled: true,
              executionEnabled: false,
              engineConfigured: false,
              persistenceMode: "postgres",
              capabilities: {
                metadataCrud: true,
                lifecycle: true,
                validation: true,
                templates: true,
                categories: true,
                folders: true,
                audit: true,
                execution: false,
                schedules: false,
                n8n: false,
              },
              deleted: true,
              workflowId: "wf_1",
              templateId: "wft_1",
              versionNumber: 1,
              status: "draft",
              workflowIdOwned: "wf_1",
            },
          }),
          { status: 200 },
        );
      }),
    );

    const client = createHttpWorkflowClient();
    await client.createWorkflow({ key: "k", name: "N" });
    await client.updateWorkflow("wf_1", { name: "N2" });
    await client.publishWorkflow("wf_1");
    await client.archiveWorkflow("wf_1");
    await client.restoreWorkflow("wf_1");
    await client.transitionWorkflow("wf_1", { to: "inactive" });
    await client.deleteWorkflow("wf_1");
    await client.listVersions("wf_1");
    await client.createVersion("wf_1", { graph: { nodes: [], connections: [] } });
    await client.getVersion("wf_1", "wfv_1");
    await client.listAudit("wf_1");
    await client.listTemplates();
    await client.createTemplate({
      key: "t",
      name: "T",
      graph: { nodes: [], connections: [] },
    });
    await client.getTemplate("wft_1");
    await client.updateTemplate("wft_1", { name: "T2" });
    await client.deleteTemplate("wft_1");
    await client.listCategories();
    await client.createCategory({ name: "C" });
    await client.getCategory("wfc_1");
    await client.listFolders();
    await client.createFolder({ name: "F", path: "/" });
    await client.getFolder("wff_1");
    await client.validate({ workflowId: "wf_1" });
    await client.getCapabilities();
    await client.getHealth();
    await client.getReadiness();
    await client.getDiagnostics();

    expect(calls.every((c) => c.includes("/api/v1/workflows"))).toBe(true);
    expect(calls.some((c) => /execute|n8n|schedules|runs/.test(c))).toBe(false);
  });

  it("mock client supports create/list without network", async () => {
    const client = createMockWorkflowClient();
    const created = await client.createWorkflow({ key: "x", name: "X" });
    const listed = await client.listWorkflows();
    expect(listed.items.some((row) => row.id === created.id)).toBe(true);
  });

  it("facade accessors use configured client", async () => {
    setWorkflowClient(createMockWorkflowClient());
    const listed = await listWorkflows();
    expect(listed.items.length).toBeGreaterThan(0);
    const got = await getWorkflow(listed.items[0]!.id);
    expect(got.id).toBe(listed.items[0]!.id);
    const created = await createWorkflow({ key: "y", name: "Y" });
    expect(created.key).toBe("y");
  });

  it("covers workflow-api facades and error message helpers", async () => {
    const {
      archiveWorkflow,
      createWorkflowCategory,
      createWorkflowFolder,
      createWorkflowTemplate,
      createWorkflowVersion,
      deleteWorkflow,
      deleteWorkflowTemplate,
      getWorkflowCapabilities,
      getWorkflowCategory,
      getWorkflowDiagnostics,
      getWorkflowFolder,
      getWorkflowHealth,
      getWorkflowReadiness,
      getWorkflowTemplate,
      getWorkflowVersion,
      listWorkflowAudit,
      listWorkflowCategories,
      listWorkflowFolders,
      listWorkflowTemplates,
      listWorkflowVersions,
      publishWorkflow,
      restoreWorkflow,
      transitionWorkflow,
      updateWorkflow,
      updateWorkflowTemplate,
      validateWorkflow,
    } = await import("./workflow-api");

    setWorkflowClient(createMockWorkflowClient());
    const wf = await createWorkflow({ key: "z", name: "Z" });
    await updateWorkflow(wf.id, { name: "Z2", categoryId: null, folderId: null });
    await publishWorkflow(wf.id);
    await archiveWorkflow(wf.id);
    await restoreWorkflow(wf.id);
    await transitionWorkflow(wf.id, { to: "inactive" });
    await createWorkflowVersion(wf.id, { graph: { nodes: [], connections: [] } });
    const versions = await listWorkflowVersions(wf.id);
    if (versions.items[0]) {
      await getWorkflowVersion(wf.id, versions.items[0].id);
    }
    await listWorkflowAudit(wf.id);
    await listWorkflowTemplates();
    const tmpl = await createWorkflowTemplate({
      key: "tt",
      name: "TT",
      graph: { nodes: [], connections: [] },
    });
    await getWorkflowTemplate(tmpl.id);
    await updateWorkflowTemplate(tmpl.id, { name: "TT2", categoryId: null });
    await deleteWorkflowTemplate(tmpl.id);
    await listWorkflowCategories();
    const cat = await createWorkflowCategory({ name: "Cat" });
    await getWorkflowCategory(cat.id);
    await listWorkflowFolders();
    const folder = await createWorkflowFolder({ name: "Fold", path: "/f" });
    await getWorkflowFolder(folder.id);
    await validateWorkflow({ workflowId: wf.id });
    await getWorkflowCapabilities();
    await getWorkflowHealth();
    await getWorkflowReadiness();
    await getWorkflowDiagnostics();
    await deleteWorkflow(wf.id);

    expect(toWorkflowUserMessage(new WorkflowClientError({ message: "x", status: 401 }))).toContain(
      "authorized",
    );
    expect(toWorkflowUserMessage(new WorkflowClientError({ message: "x", status: 403 }))).toContain(
      "permission",
    );
    expect(
      toWorkflowUserMessage(
        new WorkflowClientError({
          message: "down",
          status: 503,
          code: "WORKFLOW_SERVICE_UNAVAILABLE",
        }),
      ),
    ).toContain("unavailable");
    expect(toWorkflowUserMessage(new Error("boom"))).toBe("boom");
    expect(toWorkflowUserMessage("weird")).toContain("Unable");
  });

  it("route helpers reject forbidden segments", () => {
    expect(() => assertWorkflowApiPath("/api/v1/documents")).toThrow();
    for (const segment of WORKFLOW_FORBIDDEN_HTTP_SEGMENTS) {
      expect(() =>
        assertWorkflowApiPath(`/api/v1/workflows/${segment}`),
      ).toThrow();
    }
    expect(workflowQueryKeys.detail("wf_1")).toEqual(["workflows", "detail", "wf_1"]);
  });
});
