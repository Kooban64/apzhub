import { describe, expect, it, beforeEach } from "vitest";

import { resetOrgMemberStoreForTests, inviteOrgMember } from "./org-member-store";
import { inspectMemberEffectiveAccess } from "./effective-access-inspector";
import {
  resetProductAccessForTests,
  setUserProductGrants,
  upsertOrgProductSubscription,
} from "@/lib/commercial/product-access";
import { STAFF_FUNCTION_CUSTOMER_SUPPORT_ID } from "@apzhub/platform-authorization";

describe("effective access inspector", () => {
  beforeEach(() => {
    resetOrgMemberStoreForTests();
    resetProductAccessForTests();
  });

  it("explains Customer Support access without inventing permissions", () => {
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
      productKeys: ["support", "time", "knowledge"],
    });

    const inspection = inspectMemberEffectiveAccess({
      organisationId: "org-inspect",
      membershipId: member.membershipId,
    });

    expect(inspection?.staffFunctionId).toBe(STAFF_FUNCTION_CUSTOMER_SUPPORT_ID);
    expect(inspection?.productKeys).toEqual(
      expect.arrayContaining(["support", "time", "knowledge"]),
    );
    expect(inspection?.why.some((line) => line.includes("shell baseline"))).toBe(true);
  });
});
