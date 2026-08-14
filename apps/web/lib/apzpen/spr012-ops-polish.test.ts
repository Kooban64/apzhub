import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  addScopeTarget,
  approveRulesOfEngagement,
  createEngagement,
  createFinding,
  ingestDispatchJobArtefact,
  startEngagementTesting,
  updateRoeDraft,
} from "@/lib/apzpen/service";
import {
  certificationBlockers,
  buildCertificationBoard,
} from "@/lib/apzpen/workflow-views";
import { formatForDispatchTool, securityWorkRoot } from "@/lib/apzpen/runner-dispatch";
import { probeApzpenProviderHealth } from "@/lib/apzpen/provider-health";
import { resetAllApzpenStoresForTests } from "@/lib/apzpen/follow-on-service";
import { resetProjectSourceBindingsForTests } from "@/lib/commercial/project-source-bindings";

describe("SPR-APZPEN-012 ops polish", () => {
  const prevRoot = process.env.APZTOOLS_ROOT;
  const root = join(tmpdir(), `apzpen-012-${Date.now()}`);

  beforeEach(() => {
    resetAllApzpenStoresForTests();
    resetProjectSourceBindingsForTests();
    process.env.APZTOOLS_ROOT = root;
    mkdirSync(join(securityWorkRoot(), "jobs"), { recursive: true });
    mkdirSync(join(securityWorkRoot(), "out", "zap"), { recursive: true });
  });

  afterEach(() => {
    if (prevRoot === undefined) delete process.env.APZTOOLS_ROOT;
    else process.env.APZTOOLS_ROOT = prevRoot;
    rmSync(root, { recursive: true, force: true });
  });

  it("re-ingests artefacts from dispatch jobs and updates RoE notes", () => {
    const eng = createEngagement({
      tenantId: "t-012",
      customerName: "Acme",
      applicationName: "App",
      title: "Reingest",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    const drafted = updateRoeDraft("t-012", eng.engagementId, {
      allowedTechniques: ["api_testing"],
      notes: "Window: weekends only",
      emergencyContact: "sec@acme.test",
    });
    expect(drafted.roe.notes).toContain("weekends");

    addScopeTarget("t-012", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://app.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-012", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-012", eng.engagementId);

    const artefact = join(securityWorkRoot(), "out", "zap", "job_r1.json");
    writeFileSync(
      artefact,
      JSON.stringify({
        alerts: [
          {
            name: "Missing CSP",
            riskdesc: "Medium",
            desc: "CSP missing",
            solution: "Add CSP",
          },
        ],
      }),
      "utf8",
    );
    writeFileSync(
      join(securityWorkRoot(), "jobs", "job_r1.json"),
      JSON.stringify({
        jobId: "job_r1",
        engagementId: eng.engagementId,
        tenantId: "t-012",
        tool: "zap",
        target: "https://app.acme.test",
        status: "succeeded",
        dryRun: false,
        createdAt: "2026-08-14T10:00:00.000Z",
        updatedAt: "2026-08-14T10:00:00.000Z",
        artefactPath: artefact,
        commandPreview: "docker …",
      }),
      "utf8",
    );

    expect(formatForDispatchTool("zap")).toBe("zap");
    const result = ingestDispatchJobArtefact({
      tenantId: "t-012",
      engagementId: eng.engagementId,
      jobId: "job_r1",
      createdBy: "op@apzor.com",
    });
    expect(result.created.length).toBe(1);
    expect(result.job.jobId).toBe("job_r1");
  });

  it("computes certification blockers and sorts board", () => {
    const eng = createEngagement({
      tenantId: "t-012b",
      customerName: "Acme",
      applicationName: "App",
      title: "Blocked",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    addScopeTarget("t-012b", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://app.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-012b", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-012b", eng.engagementId);
    createFinding({
      tenantId: "t-012b",
      engagementId: eng.engagementId,
      title: "Critical",
      description: "x",
      severity: "critical",
      createdBy: "op@apzor.com",
    });
    const live = {
      ...eng,
      status: "in_progress" as const,
      roe: { ...eng.roe, status: "approved" as const },
      scope: [
        {
          targetId: "t1",
          kind: "web_application" as const,
          label: "Web",
          identifier: "https://app.acme.test",
          environment: "staging",
        },
      ],
      posture: {
        engagementId: eng.engagementId,
        assessmentPosition: "blocked" as const,
        critical: 1,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        openCount: 1,
        remediatingCount: 0,
        retestCount: 0,
        scopeCount: 1,
        roeApproved: true,
      },
    };
    const blockers = certificationBlockers(live);
    expect(blockers.some((b) => b.includes("critical"))).toBe(true);
    const board = buildCertificationBoard([live]);
    expect(board[0]?.canCertify).toBe(false);
  });

  it("probes provider health without throwing", async () => {
    const rows = await probeApzpenProviderHealth({
      mobsfUrl: "http://127.0.0.1:1",
    });
    expect(rows.some((r) => r.id === "mobsf")).toBe(true);
    expect(rows.find((r) => r.id === "mobsf")?.status).toBe("down");
  });
});
