/**
 * SPR-IAM-COMMERCIAL-001 — Identity Lifecycle operations (org-scoped).
 */

import {
  listPersonaRoles,
  listStaffFunctionTemplates,
  type PersonaRoleDefinition,
  type StaffFunctionTemplate,
} from "@apzhub/platform-authorization";

import {
  assignOrgMemberPersona,
  getOrgMember,
  inviteOrgMember,
  listOrgMembers,
  setOrgMemberStatus,
  type OrgMemberRecord,
} from "@/lib/iam/org-member-store";
import type { ProductKey } from "@/lib/commercial/catalogue";
import type { ProvisionTenantUserResult } from "@/lib/iam/provision-tenant-user";

export function listAvailablePersonas(): readonly PersonaRoleDefinition[] {
  return listPersonaRoles();
}

export function listAvailableStaffFunctions(): readonly StaffFunctionTemplate[] {
  return listStaffFunctionTemplates();
}

export function listOrganisationMembers(
  organisationId: string,
): readonly OrgMemberRecord[] {
  return listOrgMembers({ organisationId });
}

export function inviteOrganisationMember(input: {
  readonly organisationId: string;
  readonly email: string;
  readonly personaRoleId?: string;
  readonly invitedBy: string;
  readonly displayName?: string;
}): OrgMemberRecord {
  const requested = input.personaRoleId?.trim() || "role-employee";
  const known = listPersonaRoles().some((p) => p.roleId === requested);
  if (!known) {
    throw new Error("iam.invite.persona_unknown");
  }
  return inviteOrgMember({
    organisationId: input.organisationId,
    email: input.email,
    personaRoleId: requested,
    invitedBy: input.invitedBy,
    displayName: input.displayName,
  });
}

/** Create BetterAuth user + grants + product roles from a staff-function template. */
export async function provisionOrganisationMember(input: {
  readonly organisationId: string;
  readonly email: string;
  readonly displayName: string;
  readonly invitedBy: string;
  readonly staffFunctionId?: string;
  readonly orgJobRoleId?: string;
  readonly temporaryPassword?: string;
  readonly productKeys?: readonly ProductKey[];
}): Promise<ProvisionTenantUserResult> {
  const { provisionTenantUserFromStaffFunction } =
    await import("@/lib/iam/provision-tenant-user");
  return provisionTenantUserFromStaffFunction(input);
}

export function changeOrganisationMemberPersona(input: {
  readonly organisationId: string;
  readonly membershipId: string;
  readonly personaRoleId: string;
}): OrgMemberRecord {
  const known = listPersonaRoles().some((p) => p.roleId === input.personaRoleId);
  if (!known) throw new Error("iam.invite.persona_unknown");
  return assignOrgMemberPersona(input);
}

export function suspendOrganisationMember(input: {
  readonly organisationId: string;
  readonly membershipId: string;
}): OrgMemberRecord {
  const member = getOrgMember(input.organisationId, input.membershipId);
  if (!member) throw new Error("iam.member.not_found");
  return setOrgMemberStatus({
    organisationId: input.organisationId,
    membershipId: input.membershipId,
    status: "suspended",
  });
}

export function activateOrganisationMember(input: {
  readonly organisationId: string;
  readonly membershipId: string;
}): OrgMemberRecord {
  return setOrgMemberStatus({
    organisationId: input.organisationId,
    membershipId: input.membershipId,
    status: "active",
  });
}
