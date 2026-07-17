/**
 * APZWORKFLOW-010 — Workflow Engine vertical certification harness (no new functionality).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZWORKFLOW-010 Workflow Engine Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(
      ROOT,
      "scripts/apzworkflow-010-workflow-engine-vertical-audit.mjs",
    );
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required engine HTTP routes and OpenAPI Workflow Engine paths", () => {
    const routes = [
      "apps/web/app/api/v1/workflows/engine/workflows/route.ts",
      "apps/web/app/api/v1/workflows/engine/workflows/[workflowId]/route.ts",
      "apps/web/app/api/v1/workflows/engine/templates/route.ts",
      "apps/web/app/api/v1/workflows/engine/templates/[templateId]/route.ts",
      "apps/web/app/api/v1/workflows/engine/tags/route.ts",
      "apps/web/app/api/v1/workflows/engine/users/route.ts",
      "apps/web/app/api/v1/workflows/engine/projects/route.ts",
      "apps/web/app/api/v1/workflows/engine/capabilities/route.ts",
      "apps/web/app/api/v1/workflows/engine/health/route.ts",
      "apps/web/app/api/v1/workflows/engine/diagnostics/route.ts",
      "apps/web/app/api/v1/workflows/engine/compatibility/route.ts",
      "apps/web/app/api/v1/workflows/engine/validate/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/workflows/engine/workflows",
      "/workflows/engine/workflows/{workflowId}",
      "/workflows/engine/templates",
      "/workflows/engine/capabilities",
      "/workflows/engine/health",
      "/workflows/engine/validate",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Workflow Engine");
  });

  it("asserts execution and mutation engine routes are absent", () => {
    for (const omitted of [
      "apps/web/app/api/v1/workflows/engine/execute",
      "apps/web/app/api/v1/workflows/engine/runs",
      "apps/web/app/api/v1/workflows/engine/schedules",
      "apps/web/app/api/v1/workflows/engine/activate",
      "apps/web/app/api/v1/workflows/engine/deactivate",
      "apps/web/app/api/v1/workflows/engine/webhooks",
      "apps/web/app/api/v1/workflows/engine/credentials",
      "apps/web/app/api/v1/workflows/engine/workers",
      "apps/web/app/api/v1/workflows/engine/queues",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    expect(openapi).not.toContain("/workflows/engine/execute");
    expect(openapi).not.toContain("/workflows/engine/runs");
    expect(openapi).not.toContain("/workflows/engine/schedules");
  });

  it("exposes typed engine client surface and mock parity exports", () => {
    const client = readFileSync(
      join(ROOT, "apps/web/lib/workflows/engine-client.ts"),
      "utf8",
    );
    for (const method of [
      "listWorkflows",
      "getWorkflow",
      "listTemplates",
      "getTemplate",
      "listTags",
      "listUsers",
      "listProjects",
      "capabilities",
      "health",
      "diagnostics",
      "compatibility",
      "validate",
      "createHttpWorkflowEngineClient",
    ]) {
      expect(client.includes(method), method).toBe(true);
    }
    expect(client).not.toContain("executeWorkflow");
    expect(client).not.toContain("getPlatformServiceGateway");
    expect(client).not.toContain("@apzhub/integration-n8n");

    const mock = readFileSync(
      join(ROOT, "apps/web/lib/workflows/mock-engine-client.ts"),
      "utf8",
    );
    expect(mock).toContain("createMockWorkflowEngineClient");

    const keys = readFileSync(
      join(ROOT, "apps/web/lib/workflows/engine-query-keys.ts"),
      "utf8",
    );
    for (const key of [
      "workflows",
      "workflow",
      "templates",
      "projects",
      "users",
      "tags",
      "capabilities",
      "diagnostics",
      "health",
      "compatibility",
    ]) {
      expect(keys.includes(key), key).toBe(true);
    }
  });

  it("certifies workbench read-only presentation markers", () => {
    const view = readFileSync(
      join(
        ROOT,
        "apps/web/components/workflow-engine/platform-workflow-engine-view.tsx",
      ),
      "utf8",
    );
    expect(view).toContain("READ-ONLY ENGINE");
    expect(view).toContain("@/lib/workflows/engine-api");
    expect(view).toContain("workflowEngineQueryKeys");
    expect(view).not.toMatch(/\bexecute\b/i);
    expect(view).not.toMatch(/\bdesigner\b/i);
    expect(view).not.toMatch(/\bn8n\b/i);

    const shell = readFileSync(
      join(ROOT, "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(shell).toContain("WorkflowEngineWorkspaceRouter");
  });

  it("keeps frozen package versions for the engine vertical", () => {
    const versions = {
      "integrations/n8n/package.json": "0.1.0",
      "packages/workflow-contracts/package.json": "0.3.0",
      "packages/platform-services/package.json": "0.21.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const version = JSON.parse(readFileSync(join(ROOT, path), "utf8"))
        .version;
      expect(version, path).toBe(expected);
    }
  });

  it("maps Production Authorization workflow.engine permissions", () => {
    const authz = readFileSync(
      join(
        ROOT,
        "packages/platform-services/src/authorization/operation-authorization-map.ts",
      ),
      "utf8",
    );
    expect(authz).toContain("workflowEngineOps");
    for (const permission of [
      "workflow.engine.read",
      "workflow.engine.health",
      "workflow.engine.diagnostics",
      "workflow.engine.capabilities",
    ]) {
      expect(authz.includes(permission), permission).toBe(true);
    }
  });
});
