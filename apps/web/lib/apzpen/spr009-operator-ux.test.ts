import { describe, expect, it, beforeEach } from "vitest";

import {
  attachSourceBindingsToProject,
  resetProjectSourceBindingsForTests,
} from "@/lib/commercial/project-source-bindings";
import {
  addFindingEvidence,
  addScopeTarget,
  approveRulesOfEngagement,
  assignFinding,
  createEngagement,
  createFinding,
  ensureDemoEngagement,
  listTenantAssets,
  listTenantFindings,
  startEngagementTesting,
  updateFindingStatus,
} from "@/lib/apzpen/service";
import { resetAllApzpenStoresForTests } from "@/lib/apzpen/follow-on-service";

describe("SPR-APZPEN-009 operator UX close", () => {
  beforeEach(() => {
    resetAllApzpenStoresForTests();
    resetProjectSourceBindingsForTests();
  });

  it("records manual findings with remediation and assign/evidence", () => {
    const eng = createEngagement({
      tenantId: "t-009",
      customerName: "Acme",
      applicationName: "Portal",
      title: "Manual QT",
      environment: "staging",
      createdBy: "tester@apzor.com",
    });
    addScopeTarget("t-009", eng.engagementId, {
      kind: "api",
      label: "Invoices",
      identifier: "https://api.acme.test/invoices",
      environment: "staging",
    });
    approveRulesOfEngagement("t-009", eng.engagementId, "tester@apzor.com");
    startEngagementTesting("t-009", eng.engagementId);
    const finding = createFinding({
      tenantId: "t-009",
      engagementId: eng.engagementId,
      title: "IDOR on invoice API",
      description: "User can read other invoices",
      severity: "high",
      createdBy: "tester@apzor.com",
      remediation: "Enforce tenant ownership checks",
      location: "/api/invoices/{id}",
      cwe: "CWE-639",
    });
    expect(finding.remediation).toContain("ownership");
    const assigned = assignFinding("t-009", finding.findingId, "dev@acme.test");
    expect(assigned.assignedTo).toBe("dev@acme.test");
    const withEvidence = addFindingEvidence("t-009", finding.findingId, {
      kind: "note",
      label: "PoC",
      ref: "https://evidence.example/idor",
      createdBy: "tester@apzor.com",
    });
    expect(withEvidence.evidence).toHaveLength(1);
    updateFindingStatus("t-009", finding.findingId, "remediating");
    expect(
      listTenantFindings("t-009").find((f) => f.findingId === finding.findingId)
        ?.status,
    ).toBe("remediating");
  });

  it("exposes open finding counts and engagement links on assets", () => {
    const eng = ensureDemoEngagement("t-assets", "op@apzor.com");
    attachSourceBindingsToProject({
      tenantId: "t-assets",
      projectId: eng.engagementId,
      productKey: "pentest",
      bindings: [
        {
          providerId: "github",
          externalRef: "demo-financial/banking-portal",
          mode: "granted_read",
        },
      ],
    });
    const assets = listTenantAssets("t-assets");
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((a) => typeof a.openFindingCount === "number")).toBe(true);
    expect(assets.some((a) => a.engagementIds.includes(eng.engagementId))).toBe(true);
    expect(assets.some((a) => a.environment.length > 0)).toBe(true);
  });
});
