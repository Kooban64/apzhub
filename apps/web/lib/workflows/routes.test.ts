import { describe, expect, it } from "vitest";

import {
  isWorkflowApiPath,
  isWorkflowEngineApiPath,
  isWorkflowEngineRoute,
  isWorkflowsRoute,
  resolveWorkflowEngineSection,
  resolveWorkflowsSection,
  WORKFLOW_ENGINE_API_BASE,
  WORKFLOW_ENGINE_SECTIONS,
  WORKFLOW_ENGINE_WORKSPACE_BASE,
  WORKFLOWS_API_BASE,
  WORKFLOWS_SECTIONS,
  WORKFLOWS_WORKSPACE_BASE,
  workflowEngineSectionPath,
  workflowsSectionPath,
} from "./routes";

describe("workflow workspace routes", () => {
  it("exposes workspace base and sections", () => {
    expect(WORKFLOWS_WORKSPACE_BASE).toBe("/workspace/workflows");
    expect(WORKFLOWS_SECTIONS).toContain("validation");
    expect(WORKFLOWS_API_BASE).toBe("/api/v1/workflows");
  });

  it("detects workspace routes", () => {
    expect(isWorkflowsRoute("/workspace/workflows")).toBe(true);
    expect(isWorkflowsRoute("/workspace/workflows/")).toBe(true);
    expect(isWorkflowsRoute("/workspace/workflows/audit")).toBe(true);
    expect(isWorkflowsRoute("/workspace/documents")).toBe(false);
  });

  it("resolves sections with fallback", () => {
    expect(resolveWorkflowsSection("/workspace/workflows")).toBe("overview");
    expect(resolveWorkflowsSection("/workspace/workflows/templates")).toBe("templates");
    expect(resolveWorkflowsSection("/workspace/workflows/unknown")).toBe("overview");
  });

  it("builds section paths", () => {
    expect(workflowsSectionPath()).toBe("/workspace/workflows/overview");
    expect(workflowsSectionPath("audit")).toBe("/workspace/workflows/audit");
  });

  it("keeps API path helper", () => {
    expect(isWorkflowApiPath("/api/v1/workflows/health")).toBe(true);
    expect(WORKFLOW_ENGINE_API_BASE).toBe("/api/v1/workflows/engine");
    expect(isWorkflowEngineApiPath("/api/v1/workflows/engine/health")).toBe(true);
    expect(isWorkflowEngineApiPath("/api/v1/workflows/health")).toBe(false);
  });
});

describe("workflow engine workspace routes (APZWORKFLOW-009)", () => {
  it("exposes engine workspace base and sections", () => {
    expect(WORKFLOW_ENGINE_WORKSPACE_BASE).toBe("/workspace/workflow-engine");
    expect(WORKFLOW_ENGINE_SECTIONS).toContain("compatibility");
    expect(WORKFLOW_ENGINE_SECTIONS).toContain("capabilities");
  });

  it("detects engine routes without colliding with SoR workflows", () => {
    expect(isWorkflowEngineRoute("/workspace/workflow-engine")).toBe(true);
    expect(isWorkflowEngineRoute("/workspace/workflow-engine/workflows")).toBe(true);
    expect(isWorkflowEngineRoute("/workspace/workflows")).toBe(false);
    expect(isWorkflowsRoute("/workspace/workflow-engine")).toBe(false);
  });

  it("resolves engine sections with fallback", () => {
    expect(resolveWorkflowEngineSection("/workspace/workflow-engine")).toBe("overview");
    expect(resolveWorkflowEngineSection("/workspace/workflow-engine/diagnostics")).toBe(
      "diagnostics",
    );
    expect(resolveWorkflowEngineSection("/workspace/workflow-engine/unknown")).toBe(
      "overview",
    );
  });

  it("builds engine section paths", () => {
    expect(workflowEngineSectionPath()).toBe("/workspace/workflow-engine/overview");
    expect(workflowEngineSectionPath("tags")).toBe("/workspace/workflow-engine/tags");
  });
});
