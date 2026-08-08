/**
 * WF-P1-04 — Projects ↔ Workflow approval bridge honesty smoke.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createProjectsWorkflowBridge,
  createUnavailableWorkflowApprovalExecutor,
} from "@apzhub/platform-services";

const root = join(process.cwd());

describe("projects-workflow bridge (WF-P1-04)", () => {
  it("reports health unavailable when executor is unavailable", async () => {
    process.env.APZHUB_PROJECTS_WORKFLOW_BRIDGE_STORE = "memory";
    const bridge = createProjectsWorkflowBridge({
      executor: createUnavailableWorkflowApprovalExecutor("execute gated"),
      useInProcessWorkflow: false,
    });
    const health = await bridge.health({
      tenantId: "t1",
      organisationId: "o1",
      userId: "u1",
      correlationId: "c1",
      permissions: ["*"],
    } as never);
    expect(health.available).toBe(false);
    expect(health.reason).toMatch(/execute gated|unavailable/i);
  });

  it("surfaces approvalsUnavailable on Projects control surface", () => {
    const surface = readFileSync(
      join(root, "apps/web/components/projects/project-control-surface.tsx"),
      "utf8",
    );
    expect(surface).toContain("approvalsUnavailable");
    expect(surface).toContain("Approvals unavailable (Workflow bridge)");
  });

  it("lists Project approval API routes through bridge handlers", () => {
    const listRoute = readFileSync(
      join(root, "apps/web/app/api/v1/projects/[projectId]/approvals/route.ts"),
      "utf8",
    );
    expect(listRoute).toContain("handleListProjectApprovals");
    expect(listRoute).toContain("projects-workflow-bridge");
  });

  it("registers cross-product jump to APZ Workflow from Projects", () => {
    const manifest = readFileSync(
      join(root, "services/projects/manifests/projects/module.yaml"),
      "utf8",
    );
    expect(manifest).toContain("Jump to APZ Workflow");
    expect(manifest).toContain("route:/workspace/workflow");
  });
});
