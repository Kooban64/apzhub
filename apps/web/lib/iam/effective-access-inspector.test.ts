import { describe, expect, it, beforeEach } from "vitest";

import { resetOrgMemberStoreForTests, inviteOrgMember } from "./org-member-store";
import { inspectMemberEffectiveAccess } from "./effective-access-inspector";
import {
  resetProductAccessForTests,
  setUserProductGrants,
  upsertOrgProductSubscription,
} from "@/lib/commercial/product-access";
import {
  grantProfessionalTool,
  resetProfessionalToolGrantsForTests,
} from "./professional-tools";
import { STAFF_FUNCTION_CUSTOMER_SUPPORT_ID } from "@apzhub/platform-authorization";

describe("effective access inspector", () => {
  beforeEach(() => {
    resetOrgMemberStoreForTests();
    resetProductAccessForTests();
    resetProfessionalToolGrantsForTests();
  });

  it("explains Customer Support access with flagship tabs", async () => {
    const member = inviteOrgMember({
      organisationId: "org-inspect",
      email: "agent@example.com",
      personaRoleId: "role-support-agent",
      invitedBy: "admin-1",
      userId: "user-agent-1",
    });
    for (const productKey of ["support", "time", "knowledge"] as const) {
      upsertOrgProductSubscription({
        organisationId: "org-inspect",
        productKey,
        planId: "plan.business",
        status: "active",
      });
    }
    setUserProductGrants({
      organisationId: "org-inspect",
      userId: "user-agent-1",
      productKeys: ["support", "time"],
    });
    grantProfessionalTool({
      organisationId: "org-inspect",
      userId: "user-agent-1",
      toolId: "workflow-designer",
      reason: "process specialist",
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      grantedBy: "admin-1",
    });

    const inspection = await inspectMemberEffectiveAccess({
      organisationId: "org-inspect",
      membershipId: member.membershipId,
    });

    expect(inspection?.staffFunctionId).toBe(STAFF_FUNCTION_CUSTOMER_SUPPORT_ID);
    expect(inspection?.productKeys).toEqual(
      expect.arrayContaining(["support", "time"]),
    );
    expect(inspection?.provisionStatus).toBe("invited");
    expect(inspection?.tabs.products.some((p) => p.status === "granted")).toBe(true);
    expect(
      inspection?.tabs.products.some(
        (p) =>
          p.productKey === "knowledge" && p.status === "org_subscribed_user_denied",
      ),
    ).toBe(true);
    expect(inspection?.tabs.roles.some((r) => r.source === "org_job")).toBe(true);
    expect(inspection?.tabs.scopes.length).toBeGreaterThan(0);
    expect(
      inspection?.tabs.professionalTools.some(
        (t) => t.toolId === "workflow-designer" && t.status === "granted",
      ),
    ).toBe(true);
    expect(inspection?.tabs.provisioning.provisionStatus).toBe("invited");
    expect(inspection?.why.some((line) => line.includes("shell baseline"))).toBe(true);
  });
});
