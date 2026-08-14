import { beforeEach, describe, expect, it } from "vitest";

import { ApzpenDomainError } from "./domain";
import { ingestProviderArtefact } from "./service";
import {
  addScopeTarget,
  approveRulesOfEngagement,
  certifyEngagement,
  createEngagement,
  createFinding,
  ensureDemoEngagement,
  getEngagementPosture,
  importProviderFindings,
  requestRetest,
  startEngagementTesting,
  updateFindingStatus,
} from "./service";
import { resetApzpenStoreForTests } from "./store";

describe("APZPEN service", () => {
  beforeEach(() => {
    resetApzpenStoreForTests();
  });

  it("runs the engagement → RoE → finding → retest lifecycle", () => {
    const eng = createEngagement({
      tenantId: "t1",
      customerName: "Acme",
      applicationName: "Portal",
      title: "Q3 Pen Test",
      environment: "staging",
      createdBy: "lead@apzor.com",
    });
    expect(eng.status).toBe("draft");
    expect(eng.roe.status).toBe("draft");

    expect(() =>
      createFinding({
        tenantId: "t1",
        engagementId: eng.engagementId,
        title: "Too early",
        description: "x",
        severity: "low",
        createdBy: "tester@apzor.com",
      }),
    ).toThrow(ApzpenDomainError);

    addScopeTarget("t1", eng.engagementId, {
      kind: "web_application",
      label: "Portal",
      identifier: "https://staging.acme.test",
      environment: "staging",
    });

    const approved = approveRulesOfEngagement("t1", eng.engagementId, "lead@apzor.com");
    expect(approved.roe.status).toBe("approved");
    expect(approved.status).toBe("approved");

    const active = startEngagementTesting("t1", eng.engagementId);
    expect(active.status).toBe("in_progress");

    const finding = createFinding({
      tenantId: "t1",
      engagementId: eng.engagementId,
      title: "SQLi in search",
      description: "Unparameterised query",
      severity: "critical",
      createdBy: "tester@apzor.com",
      providerTool: "manual",
    });
    expect(finding.status).toBe("open");

    updateFindingStatus("t1", finding.findingId, "remediating");
    const retest = requestRetest("t1", finding.findingId);
    expect(retest.status).toBe("retest_requested");

    const posture = getEngagementPosture("t1", eng.engagementId);
    expect(posture.critical).toBe(1);
    expect(posture.retestCount).toBe(1);
    expect(posture.roeApproved).toBe(true);
    expect(posture.assessmentPosition).toBe("blocked");
  });

  it("imports provider findings and seeds demo engagement", () => {
    const eng = createEngagement({
      tenantId: "t2",
      customerName: "Beta",
      applicationName: "API",
      title: "API Assurance",
      environment: "staging",
      createdBy: "admin@apzor.com",
    });
    addScopeTarget("t2", eng.engagementId, {
      kind: "api",
      label: "API",
      identifier: "https://api.beta.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t2", eng.engagementId, "admin@apzor.com");

    const imported = importProviderFindings("t2", eng.engagementId, "admin@apzor.com", [
      {
        title: "CVE-2024-XXXX in base image",
        description: "Trivy hit",
        severity: "high",
        providerTool: "trivy",
      },
      {
        title: "Reflected XSS",
        description: "ZAP hit",
        severity: "medium",
        providerTool: "zap",
      },
    ]);
    expect(imported.created).toHaveLength(2);

    const deduped = importProviderFindings("t2", eng.engagementId, "admin@apzor.com", [
      {
        title: "CVE-2024-XXXX in base image",
        description: "Trivy hit",
        severity: "high",
        providerTool: "trivy",
      },
    ]);
    expect(deduped.created).toHaveLength(0);
    expect(deduped.skipped).toBe(1);

    const demo = ensureDemoEngagement("t3", "demo@apzor.com");
    const demoAgain = ensureDemoEngagement("t3", "demo@apzor.com");
    expect(demoAgain.engagementId).toBe(demo.engagementId);
    const posture = getEngagementPosture("t3", demo.engagementId);
    expect(posture.scopeCount).toBe(4);
    expect(posture.critical + posture.high + posture.medium).toBeGreaterThan(0);
  });

  it("rejects RoE approval without scope", () => {
    const eng = createEngagement({
      tenantId: "t4",
      customerName: "Gamma",
      applicationName: "App",
      title: "Empty scope",
      environment: "dev",
      createdBy: "a@apzor.com",
    });
    expect(() =>
      approveRulesOfEngagement("t4", eng.engagementId, "a@apzor.com"),
    ).toThrow(/scope/);
  });

  it("ingests ZAP artefacts and certifies after criticals close", () => {
    const eng = createEngagement({
      tenantId: "t5",
      customerName: "Delta",
      applicationName: "Web",
      title: "ZAP ingest",
      environment: "staging",
      createdBy: "sec@apzor.com",
    });
    addScopeTarget("t5", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://staging.delta.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t5", eng.engagementId, "sec@apzor.com");
    startEngagementTesting("t5", eng.engagementId);

    const ingested = ingestProviderArtefact({
      tenantId: "t5",
      engagementId: eng.engagementId,
      createdBy: "sec@apzor.com",
      format: "zap",
      payload: {
        alerts: [
          {
            name: "SQL Injection",
            riskdesc: "High",
            desc: "SQLi",
            solution: "Parameterise",
          },
        ],
      },
    });
    expect(ingested.created.length).toBe(1);
    expect(ingested.toolId).toBe("zap");

    const critical = createFinding({
      tenantId: "t5",
      engagementId: eng.engagementId,
      title: "Auth bypass",
      description: "critical",
      severity: "critical",
      createdBy: "sec@apzor.com",
    });
    expect(() => certifyEngagement("t5", eng.engagementId)).toThrow(/critical/);

    updateFindingStatus("t5", critical.findingId, "risk_accepted");
    updateFindingStatus("t5", ingested.created[0]!.findingId, "closed");
    const certified = certifyEngagement("t5", eng.engagementId);
    expect(certified.status).toBe("certified");
    expect(certified.assessmentPosition).toBe("complete");
  });
});
