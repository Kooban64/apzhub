import { describe, expect, it } from "vitest";

import {
  grantProfessionalTool,
  listProfessionalToolGrants,
  listProfessionalToolsCatalogue,
  resetProfessionalToolGrantsForTests,
  revokeProfessionalToolGrant,
} from "./professional-tools";

describe("professional-tools ledger", () => {
  it("requires reason and supports grant + revoke", () => {
    resetProfessionalToolGrantsForTests();
    expect(listProfessionalToolsCatalogue().length).toBeGreaterThan(0);
    expect(() =>
      grantProfessionalTool({
        organisationId: "org-1",
        userId: "user-1",
        toolId: "workflow-designer",
        reason: "   ",
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        grantedBy: "admin-1",
      }),
    ).toThrow(/reason_required/);

    const grant = grantProfessionalTool({
      organisationId: "org-1",
      userId: "user-1",
      toolId: "analytics-models",
      reason: "Quarterly model work",
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      grantedBy: "admin-1",
    });
    expect(
      listProfessionalToolGrants({ organisationId: "org-1", activeOnly: true }),
    ).toHaveLength(1);
    const revoked = revokeProfessionalToolGrant({
      organisationId: "org-1",
      grantId: grant.id,
    });
    expect(revoked?.revokedAt).toBeTruthy();
    expect(
      listProfessionalToolGrants({ organisationId: "org-1", activeOnly: true }),
    ).toHaveLength(0);
  });
});
