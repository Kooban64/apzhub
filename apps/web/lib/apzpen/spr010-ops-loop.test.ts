import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  addScopeTarget,
  approveRulesOfEngagement,
  createEngagement,
  createFinding,
  startEngagementTesting,
  updateFindingDetails,
  updateRoeDraft,
  updateEngagementSchedule,
} from "@/lib/apzpen/service";
import { listDispatchJobs, securityWorkRoot } from "@/lib/apzpen/runner-dispatch";
import { resetAllApzpenStoresForTests } from "@/lib/apzpen/follow-on-service";
import { resetProjectSourceBindingsForTests } from "@/lib/commercial/project-source-bindings";

describe("SPR-APZPEN-010 ops loop", () => {
  const prevRoot = process.env.APZTOOLS_ROOT;
  const root = join(tmpdir(), `apzpen-010-${Date.now()}`);

  beforeEach(() => {
    resetAllApzpenStoresForTests();
    resetProjectSourceBindingsForTests();
    process.env.APZTOOLS_ROOT = root;
    mkdirSync(join(securityWorkRoot(), "jobs"), { recursive: true });
  });

  afterEach(() => {
    if (prevRoot === undefined) delete process.env.APZTOOLS_ROOT;
    else process.env.APZTOOLS_ROOT = prevRoot;
    rmSync(root, { recursive: true, force: true });
  });

  it("updates RoE draft, schedule nextRunAt, and finding details", () => {
    const eng = createEngagement({
      tenantId: "t-010",
      customerName: "Acme",
      applicationName: "Portal",
      title: "Ops loop",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    const drafted = updateRoeDraft("t-010", eng.engagementId, {
      allowedTechniques: ["api_testing", "manual_exploration"],
      restrictedTechniques: ["denial_of_service"],
      emergencyContact: "secops@acme.test",
    });
    expect(drafted.roe.allowedTechniques).toContain("api_testing");
    expect(drafted.roe.emergencyContact).toBe("secops@acme.test");

    addScopeTarget("t-010", eng.engagementId, {
      kind: "api",
      label: "API",
      identifier: "https://api.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-010", eng.engagementId, "op@apzor.com");
    expect(() =>
      updateRoeDraft("t-010", eng.engagementId, {
        allowedTechniques: ["api_testing"],
      }),
    ).toThrow(/Approved/);

    const scheduled = updateEngagementSchedule(
      "t-010",
      eng.engagementId,
      "frequent",
      "2026-09-01T09:00:00.000Z",
    );
    expect(scheduled.nextRunAt).toBe("2026-09-01T09:00:00.000Z");

    startEngagementTesting("t-010", eng.engagementId);
    const finding = createFinding({
      tenantId: "t-010",
      engagementId: eng.engagementId,
      title: "Weak session",
      description: "No idle timeout",
      severity: "medium",
      createdBy: "op@apzor.com",
    });
    const updated = updateFindingDetails("t-010", finding.findingId, {
      remediation: "Set idle timeout to 15m",
      location: "/auth/session",
      cwe: "CWE-613",
      severity: "high",
    });
    expect(updated.remediation).toContain("15m");
    expect(updated.severity).toBe("high");
  });

  it("lists dispatch jobs from the security work root", () => {
    writeFileSync(
      join(securityWorkRoot(), "jobs", "job_test.json"),
      JSON.stringify({
        jobId: "job_test",
        engagementId: "eng_x",
        tenantId: "t-010",
        tool: "zap",
        target: "https://x.test",
        status: "skipped",
        dryRun: true,
        createdAt: "2026-08-14T10:00:00.000Z",
        updatedAt: "2026-08-14T10:00:00.000Z",
        commandPreview: "docker compose …",
      }),
      "utf8",
    );
    const jobs = listDispatchJobs({ tenantId: "t-010", engagementId: "eng_x" });
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.tool).toBe("zap");
  });
});
