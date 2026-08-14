import { describe, expect, it, beforeEach } from "vitest";

import { resetOrgMemberStoreForTests } from "./org-member-store";
import {
  inviteOrganisationMember,
  listOrganisationMembers,
  suspendOrganisationMember,
  changeOrganisationMemberPersona,
} from "./identity-lifecycle";

describe("identity lifecycle", () => {
  beforeEach(() => {
    resetOrgMemberStoreForTests();
  });

  it("invites, assigns persona, and suspends under one org ruleset", () => {
    const member = inviteOrganisationMember({
      organisationId: "org-1",
      email: "qa@example.com",
      personaRoleId: "role-employee",
      invitedBy: "admin-1",
    });
    expect(member.status).toBe("invited");
    expect(listOrganisationMembers("org-1")).toHaveLength(1);

    const assigned = changeOrganisationMemberPersona({
      organisationId: "org-1",
      membershipId: member.membershipId,
      personaRoleId: "role-org-admin",
    });
    expect(assigned.personaRoleId).toBe("role-org-admin");

    const suspended = suspendOrganisationMember({
      organisationId: "org-1",
      membershipId: member.membershipId,
    });
    expect(suspended.status).toBe("suspended");
  });

  it("rejects unknown personas", () => {
    expect(() =>
      inviteOrganisationMember({
        organisationId: "org-1",
        email: "x@example.com",
        personaRoleId: "role-does-not-exist",
        invitedBy: "admin-1",
      }),
    ).toThrow(/persona_unknown/);
  });
});
