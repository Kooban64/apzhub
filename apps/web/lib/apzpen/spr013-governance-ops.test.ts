import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { checkApzpenPermission } from "@/lib/apzpen/access";
import {
  addScopeTarget,
  approveRulesOfEngagement,
  createEngagement,
  createFinding,
  assignFinding,
  redispatchFailedJob,
  startEngagementTesting,
  updateRoeDraft,
} from "@/lib/apzpen/service";
import { filterMyWorkQueue } from "@/lib/apzpen/workflow-views";
import { securityWorkRoot } from "@/lib/apzpen/runner-dispatch";
import { resetAllApzpenStoresForTests } from "@/lib/apzpen/follow-on-service";
import { resetProjectSourceBindingsForTests } from "@/lib/commercial/project-source-bindings";

describe("SPR-APZPEN-013 governance ops close", () => {
  const prevRoot = process.env.APZTOOLS_ROOT;
  const root = join(tmpdir(), `apzpen-013-${Date.now()}`);

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

  it("enforces granular certify / retest / manage permissions", () => {
    expect(checkApzpenPermission(["apzpen.read"], "certify")).toBe(false);
    expect(checkApzpenPermission(["apzpen.test"], "certify")).toBe(false);
    expect(checkApzpenPermission(["apzpen.certify"], "certify")).toBe(true);
    expect(checkApzpenPermission(["apzpen.manage"], "certify")).toBe(true);

    expect(checkApzpenPermission(["apzpen.test"], "retest")).toBe(false);
    expect(checkApzpenPermission(["apzpen.retest"], "retest")).toBe(true);

    expect(checkApzpenPermission(["apzpen.test"], "manage")).toBe(false);
    expect(checkApzpenPermission(["apzpen.manage"], "manage")).toBe(true);
    expect(checkApzpenPermission(["apzpen.certify"], "write")).toBe(true);
  });

  it("filters My Work by assignee and updates RoE window + methodology", () => {
    const eng = createEngagement({
      tenantId: "t-013",
      customerName: "Acme",
      applicationName: "App",
      title: "Governance",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    const drafted = updateRoeDraft("t-013", eng.engagementId, {
      allowedTechniques: ["api_testing"],
      testingWindowStart: "2026-08-20T09:00:00.000Z",
      testingWindowEnd: "2026-08-22T17:00:00.000Z",
      methodology: ["OWASP WSTG", "PTES"],
      notes: "Weekend window",
    });
    expect(drafted.roe.testingWindowStart).toContain("2026-08-20");
    expect(drafted.roe.testingWindowEnd).toContain("2026-08-22");
    expect(drafted.methodology).toEqual(["OWASP WSTG", "PTES"]);

    expect(() =>
      updateRoeDraft("t-013", eng.engagementId, {
        allowedTechniques: ["api_testing"],
        testingWindowStart: "2026-08-22T09:00:00.000Z",
        testingWindowEnd: "2026-08-20T17:00:00.000Z",
      }),
    ).toThrow(/window end/i);

    addScopeTarget("t-013", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://app.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-013", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-013", eng.engagementId);

    const finding = createFinding({
      tenantId: "t-013",
      engagementId: eng.engagementId,
      title: "Mine",
      description: "Assigned finding",
      severity: "high",
      createdBy: "op@apzor.com",
    });
    const mineAssigned = assignFinding("t-013", finding.findingId, "Dev@Acme.TEST");
    const other = createFinding({
      tenantId: "t-013",
      engagementId: eng.engagementId,
      title: "Theirs",
      description: "Other",
      severity: "low",
      createdBy: "op@apzor.com",
    });
    const otherAssigned = assignFinding("t-013", other.findingId, "other@acme.test");

    const mine = filterMyWorkQueue([mineAssigned, otherAssigned], "dev@acme.test");
    expect(mine.map((f) => f.findingId)).toEqual([mineAssigned.findingId]);
  });

  it("re-dispatches failed jobs with the same tool and target", async () => {
    const eng = createEngagement({
      tenantId: "t-013b",
      customerName: "Acme",
      applicationName: "App",
      title: "Redispatch",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    addScopeTarget("t-013b", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://app.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-013b", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-013b", eng.engagementId);

    const failedJobPath = join(securityWorkRoot(), "jobs", "job_failed013.json");
    writeFileSync(
      failedJobPath,
      JSON.stringify({
        jobId: "job_failed013",
        engagementId: eng.engagementId,
        tenantId: "t-013b",
        tool: "nuclei",
        target: "https://app.acme.test",
        status: "failed",
        dryRun: true,
        createdAt: "2026-08-14T00:00:00.000Z",
        updatedAt: "2026-08-14T00:01:00.000Z",
        error: "boom",
        commandPreview: "docker run …",
      }),
      "utf8",
    );

    const result = await redispatchFailedJob({
      tenantId: "t-013b",
      engagementId: eng.engagementId,
      jobId: "job_failed013",
      createdBy: "op@apzor.com",
      dryRun: true,
      execFn: async () => ({ code: 0, stdout: "", stderr: "" }),
    });
    expect(result.priorJobId).toBe("job_failed013");
    expect(result.job.tool).toBe("nuclei");
    expect(result.job.target).toBe("https://app.acme.test");
    expect(result.job.jobId).not.toBe("job_failed013");
  });
});
