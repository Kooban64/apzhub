/**
 * WF-P1-03 — business journey / process daily path (repository smoke).
 * Documents Home → Journeys → Templates → Monitoring wiring without redesign.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveWorkflowRoute, workflowJourneysPath } from "@/lib/workflow/routes";

const root = join(process.cwd());

describe("workflow daily path (WF-P1-03)", () => {
  it("routes Home → Journeys → journey detail → templates → monitoring", () => {
    expect(resolveWorkflowRoute("/workspace/workflow")).toEqual({ kind: "home" });
    expect(resolveWorkflowRoute(workflowJourneysPath())).toEqual({ kind: "journeys" });
    expect(resolveWorkflowRoute("/workspace/workflow/journeys/j_1")).toEqual({
      kind: "journey-detail",
      journeyId: "j_1",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/templates")).toEqual({
      kind: "templates",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/monitoring")).toEqual({
      kind: "monitoring",
    });
  });

  it("mounts business-process views for journey routes", () => {
    const router = readFileSync(
      join(root, "apps/web/components/workflow/workflow-workspace-router.tsx"),
      "utf8",
    );
    expect(router).toContain("WorkflowBusinessJourneysView");
    expect(router).toContain("WorkflowBusinessJourneyDetailView");
    expect(router).toContain("WorkflowProcessTemplatesView");
    expect(router).toContain("WorkflowProcessMonitoringView");
    expect(router).toContain('route.kind === "journeys"');
  });

  it("exposes business-process HTTP handlers and API client", () => {
    const handlers = readFileSync(
      join(root, "apps/web/lib/api/v1/handlers/business-process.ts"),
      "utf8",
    );
    const client = readFileSync(
      join(root, "apps/web/lib/workflow/business-process-api.ts"),
      "utf8",
    );
    expect(handlers).toContain("handleListBusinessJourneys");
    expect(handlers).toContain("handleCreateBusinessJourney");
    expect(client).toContain("listBusinessJourneys");
    expect(client).toContain("createProcessInstance");
  });
});
