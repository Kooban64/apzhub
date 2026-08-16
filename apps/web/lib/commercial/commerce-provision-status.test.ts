import { describe, expect, it, beforeEach } from "vitest";

import { getCommerceProvisionStatus } from "./commerce-provision-status";
import {
  resetCommerceIntentsForTests,
  saveCommercePackageIntent,
} from "./commerce-package-intent";
import { resetProductAccessForTests } from "./product-access";
import { subscribeOrganisationToPackage } from "./provisioning";
import {
  acceptOrgMemberInvite,
  inviteOrgMember,
  resetOrgMemberStoreForTests,
  setOrgMemberStatus,
} from "@/lib/iam/org-member-store";

describe("commerce provision status + invite token", () => {
  beforeEach(() => {
    resetCommerceIntentsForTests();
    resetProductAccessForTests();
    resetOrgMemberStoreForTests();
  });

  it("reports ready when admin and package products are present", () => {
    const member = inviteOrgMember({
      organisationId: "org-1",
      email: "admin@example.com",
      personaRoleId: "role-org-admin",
      invitedBy: "system",
      userId: "u-admin",
    });
    setOrgMemberStatus({
      organisationId: "org-1",
      membershipId: member.membershipId,
      status: "active",
    });
    saveCommercePackageIntent({
      organisationId: "org-1",
      packageId: "pkg.apzqep.starter",
      planId: "plan.business",
      ownerUserId: "u-admin",
    });
    subscribeOrganisationToPackage({
      organisationId: "org-1",
      packageId: "pkg.apzqep.starter",
      planId: "plan.business",
      status: "active",
      grantUserIds: ["u-admin"],
    });

    const status = getCommerceProvisionStatus("org-1");
    expect(status.overall).toBe("ready");
    expect(status.productKeys).toContain("qep");
    expect(status.steps.every((s) => s.status === "complete")).toBe(true);
  });

  it("accepts invite via secure token", () => {
    const invited = inviteOrgMember({
      organisationId: "org-2",
      email: "teammate@example.com",
      personaRoleId: "role-employee",
      invitedBy: "u-admin",
    });
    expect(invited.inviteToken).toMatch(/^inv_/);
    const accepted = acceptOrgMemberInvite({
      inviteToken: invited.inviteToken!,
      userId: "u-teammate",
      email: "teammate@example.com",
    });
    expect(accepted.status).toBe("active");
    expect(accepted.userId).toBe("u-teammate");
    expect(accepted.inviteToken).toBeUndefined();
  });
});
