/**
 * Platform Identity Administration service contract (APZIDENTITY-001).
 * Interface only — implementation deferred to APZIDENTITY-002 Platform Services.
 * List/get methods only — no authentication, provisioning, or mutate runtime methods.
 */

import type { IdentityRequestContext } from "../common/context";
import type {
  IdentityActivation,
  IdentityAuditEntry,
  IdentityDeactivation,
  IdentityDepartment,
  IdentityEmployment,
  IdentityGroup,
  IdentityHistory,
  IdentityInvitation,
  IdentityMembership,
  IdentityMetadata,
  IdentityOrganization,
  IdentityPermissionAssignment,
  IdentityPolicy,
  IdentityPosition,
  IdentityReference,
  IdentityRole,
  IdentityServiceAssignment,
  IdentityStatus,
  IdentityTenant,
  IdentityUser,
} from "../domain/identity";
import type {
  IdentityActivationId,
  IdentityAuditId,
  IdentityDeactivationId,
  IdentityDepartmentId,
  IdentityEmploymentId,
  IdentityGroupId,
  IdentityHistoryId,
  IdentityInvitationId,
  IdentityMembershipId,
  IdentityMetadataId,
  IdentityOrganizationId,
  IdentityPermissionAssignmentId,
  IdentityPolicyId,
  IdentityPositionId,
  IdentityReferenceId,
  IdentityRoleId,
  IdentityServiceAssignmentId,
  IdentityStatusId,
  IdentityTenantId,
  IdentityUserId,
} from "../identifiers";

export type IdentityPlatformService = {
  listUsers(ctx: IdentityRequestContext): Promise<readonly IdentityUser[]>;
  getUser(
    ctx: IdentityRequestContext,
    userId: IdentityUserId,
  ): Promise<IdentityUser | null>;
  listGroups(ctx: IdentityRequestContext): Promise<readonly IdentityGroup[]>;
  getGroup(
    ctx: IdentityRequestContext,
    groupId: IdentityGroupId,
  ): Promise<IdentityGroup | null>;
  listRoles(ctx: IdentityRequestContext): Promise<readonly IdentityRole[]>;
  getRole(
    ctx: IdentityRequestContext,
    roleId: IdentityRoleId,
  ): Promise<IdentityRole | null>;
  listPermissionAssignments(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityPermissionAssignment[]>;
  getPermissionAssignment(
    ctx: IdentityRequestContext,
    assignmentId: IdentityPermissionAssignmentId,
  ): Promise<IdentityPermissionAssignment | null>;
  listOrganizations(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityOrganization[]>;
  getOrganization(
    ctx: IdentityRequestContext,
    organisationId: IdentityOrganizationId,
  ): Promise<IdentityOrganization | null>;
  listTenants(ctx: IdentityRequestContext): Promise<readonly IdentityTenant[]>;
  getTenant(
    ctx: IdentityRequestContext,
    tenantId: IdentityTenantId,
  ): Promise<IdentityTenant | null>;
  listDepartments(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityDepartment[]>;
  getDepartment(
    ctx: IdentityRequestContext,
    departmentId: IdentityDepartmentId,
  ): Promise<IdentityDepartment | null>;
  listPositions(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityPosition[]>;
  getPosition(
    ctx: IdentityRequestContext,
    positionId: IdentityPositionId,
  ): Promise<IdentityPosition | null>;
  listEmployments(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityEmployment[]>;
  getEmployment(
    ctx: IdentityRequestContext,
    employmentId: IdentityEmploymentId,
  ): Promise<IdentityEmployment | null>;
  listServiceAssignments(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityServiceAssignment[]>;
  getServiceAssignment(
    ctx: IdentityRequestContext,
    assignmentId: IdentityServiceAssignmentId,
  ): Promise<IdentityServiceAssignment | null>;
  listMemberships(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityMembership[]>;
  getMembership(
    ctx: IdentityRequestContext,
    membershipId: IdentityMembershipId,
  ): Promise<IdentityMembership | null>;
  listInvitations(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityInvitation[]>;
  getInvitation(
    ctx: IdentityRequestContext,
    invitationId: IdentityInvitationId,
  ): Promise<IdentityInvitation | null>;
  listActivations(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityActivation[]>;
  getActivation(
    ctx: IdentityRequestContext,
    activationId: IdentityActivationId,
  ): Promise<IdentityActivation | null>;
  listDeactivations(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityDeactivation[]>;
  getDeactivation(
    ctx: IdentityRequestContext,
    deactivationId: IdentityDeactivationId,
  ): Promise<IdentityDeactivation | null>;
  listStatuses(ctx: IdentityRequestContext): Promise<readonly IdentityStatus[]>;
  getStatus(
    ctx: IdentityRequestContext,
    statusId: IdentityStatusId,
  ): Promise<IdentityStatus | null>;
  listPolicies(ctx: IdentityRequestContext): Promise<readonly IdentityPolicy[]>;
  getPolicy(
    ctx: IdentityRequestContext,
    policyId: IdentityPolicyId,
  ): Promise<IdentityPolicy | null>;
  listAudits(
    ctx: IdentityRequestContext,
  ): Promise<readonly IdentityAuditEntry[]>;
  getAudit(
    ctx: IdentityRequestContext,
    auditId: IdentityAuditId,
  ): Promise<IdentityAuditEntry | null>;
  listHistory(
    ctx: IdentityRequestContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityHistory[]>;
  getHistory(
    ctx: IdentityRequestContext,
    historyId: IdentityHistoryId,
  ): Promise<IdentityHistory | null>;
  listReferences(
    ctx: IdentityRequestContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityReference[]>;
  getReference(
    ctx: IdentityRequestContext,
    referenceId: IdentityReferenceId,
  ): Promise<IdentityReference | null>;
  listMetadata(
    ctx: IdentityRequestContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityMetadata[]>;
  getMetadata(
    ctx: IdentityRequestContext,
    metadataId: IdentityMetadataId,
  ): Promise<IdentityMetadata | null>;
};
