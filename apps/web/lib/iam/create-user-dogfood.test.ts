/**
 * Phase L — APZOR create-user dogfood (unit): overlays → Inspector.
 * Proves Support Agent path with queue scope + professional tool without live HTTP.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { STAFF_FUNCTION_CUSTOMER_SUPPORT_ID } from "@apzhub/platform-authorization";

import {
  resetProductAccessForTests,
  setUserProductGrants,
  upsertOrgProductSubscription,
} from "@/lib/commercial/product-access";
import { inspectMemberEffectiveAccess } from "@/lib/iam/effective-access-inspector";
import {
  inviteOrgMember,
  resetOrgMemberStoreForTests,
  setOrgMemberStatus,
} from "@/lib/iam/org-member-store";
import { applyProvisionOverlays } from "@/lib/iam/provision-overlays";
import { resetProfessionalToolGrantsForTests } from "@/lib/iam/professional-tools";

describe("Phase L create-user dogfood", () => {
  beforeEach(() => {
    resetOrgMemberStoreForTests();
    resetProductAccessForTests();
    resetProfessionalToolGrantsForTests();
  });

  it("Support Agent with queue scope + tool appears in Inspector tabs", async () => {
    const organisationId = "org-apzor-dogfood";
    const userId = `user-support-dogfood-${Date.now()}`;
    const member = inviteOrgMember({
      organisationId,
      email: "support.dogfood@example.com",
      personaRoleId: "role-support-agent",
      invitedBy: "admin-1",
      userId,
      displayName: "Support Dogfood",
    });
    setOrgMemberStatus({
      organisationId,
      membershipId: member.membershipId,
      status: "active",
    });

    for (const productKey of ["support", "time", "knowledge"] as const) {
      upsertOrgProductSubscription({
        organisationId,
        productKey,
        planId: "plan.business",
        status: "active",
      });
    }
    setUserProductGrants({
      organisationId,
      userId,
      productKeys: ["support", "time", "knowledge"],
    });

    const overlays = await applyProvisionOverlays({
      organisationId,
      userId,
      invitedBy: "admin-1",
      resourceScopeGrants: ["support.queue:intake"],
      professionalToolIds: ["analytics-models"],
    });
    expect(overlays.resourceScopeGrants).toEqual(["support.queue:intake"]);
    expect(overlays.professionalToolIds).toEqual(["analytics-models"]);

    const inspection = await inspectMemberEffectiveAccess({
      organisationId,
      membershipId: member.membershipId,
    });

    expect(inspection?.staffFunctionId).toBe(STAFF_FUNCTION_CUSTOMER_SUPPORT_ID);
    expect(inspection?.productKeys).toEqual(
      expect.arrayContaining(["support", "time", "knowledge"]),
    );
    expect(inspection?.productKeys).not.toContain("qep");
    expect(inspection?.productKeys).not.toContain("projects");
    expect(
      inspection?.tabs.scopes.some(
        (s) => s.grantKey === "support.queue:intake" && s.kind === "support.queue",
      ),
    ).toBe(true);
    expect(
      inspection?.tabs.professionalTools.some(
        (t) => t.toolId === "analytics-models" && t.status === "granted",
      ),
    ).toBe(true);
    expect(
      inspection?.tabs.professionalTools.some(
        (t) => t.toolId === "workflow-designer" && t.status === "not_granted",
      ),
    ).toBe(true);
  });
});
