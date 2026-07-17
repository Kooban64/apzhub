/**
 * APZWORKFLOW-008 — coverage filler for engine client facades / errors / mock.
 */

import { describe, expect, it } from "vitest";

import {
  getEngineCapabilities,
  getEngineCompatibility,
  getEngineDiagnostics,
  getEngineHealth,
  getEngineTemplate,
  getEngineWorkflow,
  listEngineProjects,
  listEngineTags,
  listEngineTemplates,
  listEngineUsers,
  listEngineWorkflows,
  resetWorkflowEngineClient,
  validateEngineConnection,
} from "./engine-api";
import {
  toWorkflowEngineUserMessage,
  WorkflowEngineClientError,
} from "./engine-errors";
import { workflowEngineQueryKeys } from "./engine-query-keys";
import {
  createMockWorkflowEngineClient,
  MOCK_ENGINE_TEMPLATE,
  MOCK_ENGINE_WORKFLOW,
} from "./mock-engine-client";

describe("APZWORKFLOW-008 engine coverage", () => {
  it("exercises engine-api facades against mock client", async () => {
    resetWorkflowEngineClient();
    expect((await listEngineWorkflows()).items[0]?.id).toBe(
      MOCK_ENGINE_WORKFLOW.id,
    );
    expect((await getEngineWorkflow(MOCK_ENGINE_WORKFLOW.id)).name).toBeTruthy();
    expect((await listEngineTemplates()).items).toHaveLength(1);
    expect((await getEngineTemplate(MOCK_ENGINE_TEMPLATE.id)).id).toBe(
      MOCK_ENGINE_TEMPLATE.id,
    );
    expect((await listEngineTags()).items[0]?.name).toBe("ops");
    expect((await listEngineUsers()).items).toHaveLength(1);
    expect((await listEngineProjects()).items[0]?.id).toBe("p1");
    expect((await getEngineCapabilities()).unsupportedOperations).toContain(
      "execute",
    );
    expect((await getEngineHealth()).sdkStatus).toBe("healthy");
    expect((await getEngineDiagnostics()).coreServiceCount).toBeGreaterThan(0);
    expect((await getEngineCompatibility()).supportedApi).toBe("v1");
    expect((await validateEngineConnection()).ok).toBe(true);
  });

  it("covers mock not-found paths and query key details", async () => {
    const client = createMockWorkflowEngineClient();
    await expect(client.getWorkflow("nope")).rejects.toBeTruthy();
    await expect(client.getTemplate("nope")).rejects.toBeTruthy();
    expect(workflowEngineQueryKeys.workflows.detail("1")[4]).toBe("1");
    expect(workflowEngineQueryKeys.templates.detail("t")[4]).toBe("t");
    expect(workflowEngineQueryKeys.templates.list()[3]).toBe("list");
  });

  it("covers WorkflowEngineClientError user messaging branches", () => {
    expect(
      toWorkflowEngineUserMessage(
        new WorkflowEngineClientError({
          message: "x",
          status: 401,
          code: "UNAUTHORIZED",
        }),
      ),
    ).toMatch(/authorized/i);
    expect(
      toWorkflowEngineUserMessage(
        new WorkflowEngineClientError({
          message: "x",
          status: 404,
        }),
      ),
    ).toMatch(/not found/i);
    expect(
      toWorkflowEngineUserMessage(
        new WorkflowEngineClientError({
          message: "x",
          status: 501,
          code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        }),
      ),
    ).toMatch(/not supported/i);
    expect(
      toWorkflowEngineUserMessage(
        new WorkflowEngineClientError({
          message: "x",
          status: 503,
          code: "WORKFLOW_SERVICE_UNAVAILABLE",
        }),
      ),
    ).toMatch(/unavailable/i);
    expect(
      toWorkflowEngineUserMessage(
        new WorkflowEngineClientError({ message: "custom" }),
      ),
    ).toBe("custom");
    expect(toWorkflowEngineUserMessage(new Error("boom"))).toBe("boom");
    expect(toWorkflowEngineUserMessage("weird")).toMatch(/Unable to complete/);
  });
});
