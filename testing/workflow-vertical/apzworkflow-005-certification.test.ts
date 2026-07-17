/**
 * APZWORKFLOW-005 — Workflow vertical certification harness (no new functionality).
 * Executes static audits + smoke assertions for the certified Workflow management plane.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZWORKFLOW-005 Workflow Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(
      ROOT,
      "scripts/apzworkflow-005-workflow-vertical-audit.mjs",
    );
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required HTTP routes and OpenAPI Platform Workflow paths", () => {
    const routes = [
      "apps/web/app/api/v1/workflows/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/publish/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/archive/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/restore/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/transition/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/versions/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/versions/[versionId]/route.ts",
      "apps/web/app/api/v1/workflows/[workflowId]/audit/route.ts",
      "apps/web/app/api/v1/workflows/templates/route.ts",
      "apps/web/app/api/v1/workflows/templates/[templateId]/route.ts",
      "apps/web/app/api/v1/workflows/categories/route.ts",
      "apps/web/app/api/v1/workflows/categories/[categoryId]/route.ts",
      "apps/web/app/api/v1/workflows/folders/route.ts",
      "apps/web/app/api/v1/workflows/folders/[folderId]/route.ts",
      "apps/web/app/api/v1/workflows/validation/route.ts",
      "apps/web/app/api/v1/workflows/capabilities/route.ts",
      "apps/web/app/api/v1/workflows/health/route.ts",
      "apps/web/app/api/v1/workflows/readiness/route.ts",
      "apps/web/app/api/v1/workflows/diagnostics/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/workflows",
      "/workflows/{workflowId}",
      "/workflows/{workflowId}/versions",
      "/workflows/validation",
      "/workflows/capabilities",
      "/workflows/health",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Platform Workflow");
  });

  it("asserts execution and engine routes are absent", () => {
    for (const omitted of [
      "apps/web/app/api/v1/workflows/execute",
      "apps/web/app/api/v1/workflows/runs",
      "apps/web/app/api/v1/workflows/jobs",
      "apps/web/app/api/v1/workflows/steps",
      "apps/web/app/api/v1/workflows/schedules",
      "apps/web/app/api/v1/workflows/n8n",
      "apps/web/app/api/v1/workflows/webhooks",
      "apps/web/app/api/v1/workflows/workers",
      "apps/web/app/api/v1/workflows/queues",
      "apps/web/app/api/v1/workflows/credentials",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    expect(openapi).not.toContain("/workflows/execute");
    expect(openapi).not.toContain("/workflows/runs");
    expect(openapi).not.toContain("/workflows/n8n");
  });

  it("exposes typed client surface and mock parity exports", () => {
    const client = readFileSync(
      join(ROOT, "apps/web/lib/workflows/workflow-client.ts"),
      "utf8",
    );
    for (const method of [
      "listWorkflows",
      "getWorkflow",
      "publishWorkflow",
      "archiveWorkflow",
      "restoreWorkflow",
      "transitionWorkflow",
      "listVersions",
      "getVersion",
      "validate",
      "listAudit",
      "listTemplates",
      "listCategories",
      "listFolders",
      "getCapabilities",
      "getHealth",
      "getReadiness",
      "getDiagnostics",
      "createHttpWorkflowClient",
    ]) {
      expect(client.includes(method), method).toBe(true);
    }
    expect(client).not.toContain("executeWorkflow");
    expect(client).not.toContain("listRuns");
    expect(
      existsSync(join(ROOT, "apps/web/lib/workflows/mock-workflow-client.ts")),
    ).toBe(true);
    expect(existsSync(join(ROOT, "apps/web/lib/workflows/query-keys.ts"))).toBe(
      true,
    );
  });

  it("keeps workbench manifests and Workflow UI components", () => {
    const manifests = [
      "packages/workbench-framework/manifests/platform-workflows/module.yaml",
      "packages/workbench-framework/manifests/platform-workflows-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-workflows-library/module.yaml",
      "packages/workbench-framework/manifests/platform-workflows-versions/module.yaml",
      "packages/workbench-framework/manifests/platform-workflows-diagnostics/module.yaml",
    ];
    for (const manifest of manifests) {
      const yaml = readFileSync(join(ROOT, manifest), "utf8");
      expect(yaml).toMatch(/workflow/i);
      expect(yaml).not.toMatch(/\bn8n\b/i);
      expect(yaml).not.toMatch(/\b(execute|runs?|schedule)\b/i);
    }
    expect(
      existsSync(
        join(ROOT, "apps/web/components/workflows/platform-workflows-view.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "apps/web/components/workflows/workflows-workspace-router.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "apps/web/components/workflows/definition-viewer.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "apps/web/components/workflows/definition-graph.tsx")),
    ).toBe(true);
  });

  it("asserts certified package versions", () => {
    // Frozen after APZWORKFLOW-007…011 (contracts/services bumped for engine track).
    const versions: Record<string, string> = {
      "packages/workflow-contracts/package.json": "0.3.0",
      "packages/workflow-core/package.json": "0.1.1",
      "packages/workflow-persistence/package.json": "0.1.1",
      "packages/platform-services/package.json": "0.21.0",
      "packages/platform-service-contracts/package.json": "0.16.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("documents external Testing slug conflict as LIMITED (not a Workflow defect)", () => {
    expect(
      existsSync(
        join(
          ROOT,
          "apps/web/app/api/v1/testing/traceability/[relationshipId]",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "apps/web/app/api/v1/testing/traceability/[resourceType]/[resourceId]",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "testing/playwright/e2e/apzworkflow-004-platform-workflows-workbench.spec.ts",
        ),
      ),
    ).toBe(true);
  });

  it("keeps execution status string in workbench diagnostics surface", () => {
    const view = readFileSync(
      join(ROOT, "apps/web/components/workflows/platform-workflows-view.tsx"),
      "utf8",
    );
    expect(view).toContain("Workflow Execution Not Available");
    expect(view).not.toMatch(/\bExecute\b/);
    expect(view).not.toMatch(/\bSchedule\b/);
  });
});
