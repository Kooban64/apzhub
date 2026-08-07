import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createProjectsAdministrationService,
  getMemoryProjectsAdministrationStore,
  resetProjectsAdministrationStoreForTests,
} from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "t1",
    userId: "admin_1",
    correlationId: "corr_1",
  } as ServiceRequestContext;
}

describe("Projects Administration (PX-07 / W010)", () => {
  beforeEach(() => {
    resetProjectsAdministrationStoreForTests();
  });

  it("creates time-bounded scoped delegations and blocks SoD permissions", async () => {
    const svc = createProjectsAdministrationService(
      getMemoryProjectsAdministrationStore(),
    );
    await expect(
      svc.createDelegation(ctx(), {
        fromPrincipalId: "user_a",
        toPrincipalId: "user_b",
        scopeType: "project",
        scopeId: "prj_1",
        permissionSet: ["checkpoint.waive"],
        validFrom: "2026-08-01T00:00:00.000Z",
        validTo: "2026-08-31T00:00:00.000Z",
        reason: "Leave cover",
      }),
    ).rejects.toThrow(/delegation_sod_forbidden/);

    const ok = await svc.createDelegation(ctx(), {
      fromPrincipalId: "user_a",
      toPrincipalId: "user_b",
      scopeType: "project",
      scopeId: "prj_1",
      permissionSet: ["projects.commitment.manage"],
      validFrom: "2026-08-01T00:00:00.000Z",
      validTo: "2026-08-31T00:00:00.000Z",
      reason: "Leave cover",
    });
    expect(ok.status).toBe("active");
    const revoked = await svc.revokeDelegation(ctx(), ok.id);
    expect(revoked.status).toBe("revoked");
  });

  it("blocks purge when legal hold is active", async () => {
    const svc = createProjectsAdministrationService(
      getMemoryProjectsAdministrationStore(),
    );
    await svc.placeLegalHold(ctx(), {
      scopeType: "project",
      scopeId: "prj_1",
      reason: "Litigation hold",
    });
    const gate = await svc.canPurgeScope(ctx(), "project", "prj_1");
    expect(gate.allowed).toBe(false);
  });

  it("keeps governed searches distinct and publishes with audit", async () => {
    const svc = createProjectsAdministrationService(
      getMemoryProjectsAdministrationStore(),
    );
    const draft = await svc.createGovernedSearch(ctx(), {
      key: "critical-exceptions",
      name: "Critical exceptions org-wide",
      query: "exception critical",
    });
    expect(draft.status).toBe("draft");
    const published = await svc.publishGovernedSearch(ctx(), draft.id);
    expect(published.status).toBe("published");
    const audit = await svc.listAdminAudit(ctx());
    expect(audit.some((e) => e.type === "projects.governed_search.published")).toBe(
      true,
    );
  });

  it("seeds operational role catalogue and assesses maturity", async () => {
    const svc = createProjectsAdministrationService(
      getMemoryProjectsAdministrationStore(),
    );
    const roles = await svc.listOperationalRoles(ctx());
    expect(roles.map((r) => r.key)).toContain("project_owner");
    const maturity = await svc.assessMaturity(ctx(), {
      scopeType: "organisation",
      scopeId: "organisation",
      publishedProfileCount: 2,
      publishedPolicyCount: 3,
      retentionPublished: true,
      governedSearchCount: 1,
    });
    expect(maturity.band).toBeTruthy();
    expect(svc.getHierarchyLayers("project", "prj_1").length).toBeGreaterThanOrEqual(4);
  });
});
