import { describe, expect, it, beforeEach } from "vitest";

import {
  attachSourceBindingsToProject,
  resetProjectSourceBindingsForTests,
} from "@/lib/commercial/project-source-bindings";
import {
  ensureRepositoryScopeFromSourceBindings,
  parseOwnerRepo,
  pickRepositoryForEngagement,
} from "@/lib/apzpen/source-scope";
import {
  addFindingEvidence,
  assignFinding,
  createEngagement,
  ensureDemoEngagement,
  listTenantFindings,
  updateFindingStatus,
} from "@/lib/apzpen/service";
import {
  createCustomerPortalGrant,
  customerAssignFinding,
  customerUploadEvidence,
  revokeCustomerPortalGrant,
  resetAllApzpenStoresForTests,
} from "@/lib/apzpen/follow-on-service";

describe("SPR-APZPEN-007 product completion", () => {
  beforeEach(() => {
    resetAllApzpenStoresForTests();
    resetProjectSourceBindingsForTests();
  });

  it("parses owner/repo and prefers source bindings for sync", () => {
    expect(parseOwnerRepo("https://github.com/acme/portal.git")?.full).toBe(
      "acme/portal",
    );
    const eng = createEngagement({
      tenantId: "t-src",
      customerName: "Acme",
      applicationName: "Portal",
      title: "Q3",
      environment: "staging",
      createdBy: "op",
    });
    attachSourceBindingsToProject({
      tenantId: "t-src",
      projectId: eng.engagementId,
      productKey: "pentest",
      bindings: [
        {
          providerId: "github",
          externalRef: "acme/portal",
          mode: "granted_read",
        },
      ],
    });
    const withScope = ensureRepositoryScopeFromSourceBindings(
      "t-src",
      eng.engagementId,
    );
    expect(
      withScope.scope.some(
        (s) => s.kind === "repository" && s.identifier === "acme/portal",
      ),
    ).toBe(true);
    expect(pickRepositoryForEngagement(withScope)).toBe("acme/portal");
  });

  it("demo engagement uses a parseable github repository ref", () => {
    const demo = ensureDemoEngagement("t-demo", "demo@apzor.com");
    const repo = demo.scope.find((s) => s.kind === "repository");
    expect(parseOwnerRepo(repo?.identifier ?? "")?.full).toBe(
      "demo-financial/banking-portal",
    );
  });

  it("supports assign, evidence, and customer portal actions", () => {
    const eng = ensureDemoEngagement("t-cust2", "op@apzor.com");
    const finding = listTenantFindings("t-cust2", eng.engagementId)[0];
    expect(finding).toBeTruthy();
    const assigned = assignFinding("t-cust2", finding!.findingId, "dev@customer.com");
    expect(assigned.assignedTo).toBe("dev@customer.com");
    const withEvidence = addFindingEvidence("t-cust2", finding!.findingId, {
      kind: "note",
      label: "Fix PR",
      ref: "https://github.com/acme/portal/pull/1",
      createdBy: "op@apzor.com",
    });
    expect(withEvidence.evidence).toHaveLength(1);

    const grant = createCustomerPortalGrant({
      tenantId: "t-cust2",
      engagementId: eng.engagementId,
      customerEmail: "buyer@customer.com",
      createdBy: "op@apzor.com",
    });
    const viaPortal = customerAssignFinding({
      token: grant.token,
      findingId: finding!.findingId,
      assignedTo: "sec@customer.com",
    });
    expect(viaPortal.assignedTo).toBe("sec@customer.com");
    const evidence = customerUploadEvidence({
      token: grant.token,
      findingId: finding!.findingId,
      label: "Screenshot",
      ref: "https://files.example/evd.png",
    });
    expect(evidence.evidence.length).toBeGreaterThan(1);

    const revoked = revokeCustomerPortalGrant({
      tenantId: "t-cust2",
      grantId: grant.grant.grantId,
    });
    expect(new Date(revoked.expiresAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("allows false_positive transition", () => {
    const eng = ensureDemoEngagement("t-fp", "op");
    const finding = listTenantFindings("t-fp", eng.engagementId)[0]!;
    expect(
      updateFindingStatus("t-fp", finding.findingId, "false_positive").status,
    ).toBe("false_positive");
  });
});
