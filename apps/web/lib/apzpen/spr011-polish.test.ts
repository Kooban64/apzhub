import { describe, expect, it, beforeEach } from "vitest";

import {
  addScopeTarget,
  approveRulesOfEngagement,
  createEngagement,
  createFinding,
  getTenantEngagement,
  listTenantFindings,
  startEngagementTesting,
  suggestAssessmentPosition,
  syncAssessmentFromFindings,
  updateFindingStatus,
} from "@/lib/apzpen/service";
import {
  defaultScopeTargetId,
  scopeTargetsForTool,
} from "@/lib/apzpen/dispatch-targets";
import { assistSecurityIntelligence } from "@/lib/apzpen/intelligence";
import { resetAllApzpenStoresForTests } from "@/lib/apzpen/follow-on-service";
import { resetProjectSourceBindingsForTests } from "@/lib/commercial/project-source-bindings";

describe("SPR-APZPEN-011 polish", () => {
  beforeEach(() => {
    resetAllApzpenStoresForTests();
    resetProjectSourceBindingsForTests();
  });

  it("filters dispatch targets and syncs assessment from findings", () => {
    const eng = createEngagement({
      tenantId: "t-011",
      customerName: "Acme",
      applicationName: "App",
      title: "Polish",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    addScopeTarget("t-011", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://app.acme.test",
      environment: "staging",
    });
    addScopeTarget("t-011", eng.engagementId, {
      kind: "repository",
      label: "Repo",
      identifier: "acme/app",
      environment: "staging",
    });
    const scoped = getTenantEngagement("t-011", eng.engagementId);
    expect(defaultScopeTargetId("zap", scoped.scope)).toBe("https://app.acme.test");
    expect(scopeTargetsForTool("semgrep", scoped.scope)[0]?.identifier).toBe(
      "acme/app",
    );

    approveRulesOfEngagement("t-011", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-011", eng.engagementId);
    const critical = createFinding({
      tenantId: "t-011",
      engagementId: eng.engagementId,
      title: "Auth bypass",
      description: "critical",
      severity: "critical",
      createdBy: "op@apzor.com",
    });
    expect(suggestAssessmentPosition("t-011", eng.engagementId)).toBe("blocked");
    const synced = syncAssessmentFromFindings("t-011", eng.engagementId);
    expect(synced.assessmentPosition).toBe("blocked");
    updateFindingStatus("t-011", critical.findingId, "closed");
    const cleared = syncAssessmentFromFindings("t-011", eng.engagementId);
    expect(cleared.assessmentPosition).not.toBe("blocked");
  });

  it("intelligence suggestions expose findingIds for apply actions", () => {
    const eng = createEngagement({
      tenantId: "t-011i",
      customerName: "Acme",
      applicationName: "App",
      title: "Intel",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    addScopeTarget("t-011i", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://app.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-011i", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-011i", eng.engagementId);
    createFinding({
      tenantId: "t-011i",
      engagementId: eng.engagementId,
      title: "Missing security header",
      description: "informational header check",
      severity: "info",
      createdBy: "op@apzor.com",
    });
    const live = getTenantEngagement("t-011i", eng.engagementId);
    const findings = listTenantFindings("t-011i", eng.engagementId);
    const assist = assistSecurityIntelligence({
      engagement: live,
      findings,
    });
    expect(assist.autoCertify).toBe(false);
    const fp = assist.suggestions.find((s) => s.kind === "fp_candidates");
    expect(fp?.findingIds.length).toBeGreaterThan(0);
  });
});
