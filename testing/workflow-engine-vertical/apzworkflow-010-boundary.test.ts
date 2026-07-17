/**
 * APZWORKFLOW-010 — static boundary spot-checks (complements vertical audit).
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZWORKFLOW-010 Workflow Engine boundary spot-checks", () => {
  it("engine handlers call gateway.workflow.engine only", () => {
    const handlers = readFileSync(
      join(ROOT, "apps/web/lib/api/v1/handlers/workflow-engine.ts"),
      "utf8",
    );
    expect(handlers).toContain("getPlatformServiceGateway");
    expect(handlers).toContain("gateway.workflow.engine");
    expect(handlers).not.toContain("@apzhub/integration-n8n");
    expect(handlers).not.toContain("@apzhub/workflow-core");
  });

  it("engine services wrap RequestPipeline", () => {
    const factory = readFileSync(
      join(
        ROOT,
        "packages/platform-services/src/services/workflow/create-workflow-engine-services.ts",
      ),
      "utf8",
    );
    expect(factory).toMatch(/RequestPipeline|wrapWithPipeline/);
  });

  it("workspace routes do not collide", () => {
    const routes = readFileSync(
      join(ROOT, "apps/web/lib/workflows/routes.ts"),
      "utf8",
    );
    expect(routes).toContain('WORKFLOW_ENGINE_WORKSPACE_BASE = "/workspace/workflow-engine"');
    expect(routes).toContain('WORKFLOWS_WORKSPACE_BASE = "/workspace/workflows"');
    expect(existsSync(join(ROOT, "apps/web/components/workflow-engine"))).toBe(
      true,
    );
  });
});
