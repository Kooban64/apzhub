/**
 * APZHUB Platform Identity Administration domain models (APZIDENTITY-001).
 * System of Record metadata only — owns identity metadata, not authentication credentials.
 */

import type { IdentityAuditFields } from "../common/context";
import type {
  IdentityAssignmentSubjectKind,
  IdentityAuditAction,
  IdentityInvitationStatus,
  IdentityLifecycleStatus,
  IdentityMembershipKind,
  IdentityPolicyKind,
  IdentityReferenceKind,
  IdentityServiceCapability,
  IdentityStatusSubjectKind,
} from "../enums/catalogue";
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

/**
 * Identity user metadata.
 * `authSubjectRef` may reference an Authentication platform subject — never stores credentials.
 */
export type IdentityUser = {
  readonly id: IdentityUserId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly authSubjectRef?: string;
  readonly email?: string;
  readonly displayName: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
} & Partial<IdentityAuditFields>;

export type IdentityGroup = {
  readonly id: IdentityGroupId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type IdentityRole = {
  readonly id: IdentityRoleId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

/** Metadata describing a permission key assignment — not runtime authz evaluation. */
export type IdentityPermissionAssignment = {
  readonly id: IdentityPermissionAssignmentId;
  readonly tenantId: string;
  readonly subjectKind: IdentityAssignmentSubjectKind;
  readonly subjectId: string;
  readonly permissionKey: string;
  readonly roleId?: IdentityRoleId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

/** Organisation metadata for Identity Administration (not product ownership). */
export type IdentityOrganization = {
  readonly id: IdentityOrganizationId;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

/**
 * Tenant metadata governed by Identity Administration.
 * Distinct from Authentication scaffolding tables (`platform_tenant`).
 */
export type IdentityTenant = {
  readonly id: IdentityTenantId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type IdentityDepartment = {
  readonly id: IdentityDepartmentId;
  readonly tenantId: string;
  readonly organisationId: IdentityOrganizationId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityPosition = {
  readonly id: IdentityPositionId;
  readonly tenantId: string;
  readonly organisationId?: IdentityOrganizationId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityEmployment = {
  readonly id: IdentityEmploymentId;
  readonly tenantId: string;
  readonly userId: IdentityUserId;
  readonly organisationId: IdentityOrganizationId;
  readonly departmentId?: IdentityDepartmentId;
  readonly positionId?: IdentityPositionId;
  readonly status: IdentityLifecycleStatus;
  readonly startedAt?: string;
  readonly endedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Metadata describing which platform capability a subject may access — no provisioning. */
export type IdentityServiceAssignment = {
  readonly id: IdentityServiceAssignmentId;
  readonly tenantId: string;
  readonly subjectKind: IdentityAssignmentSubjectKind;
  readonly subjectId: string;
  readonly serviceCapability: IdentityServiceCapability;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type IdentityMembership = {
  readonly id: IdentityMembershipId;
  readonly tenantId: string;
  readonly userId: IdentityUserId;
  readonly kind: IdentityMembershipKind;
  readonly targetId: string;
  readonly status: IdentityLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type IdentityInvitation = {
  readonly id: IdentityInvitationId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly email: string;
  readonly invitedUserId?: IdentityUserId;
  readonly status: IdentityInvitationStatus;
  readonly expiresAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type IdentityActivation = {
  readonly id: IdentityActivationId;
  readonly tenantId: string;
  readonly userId: IdentityUserId;
  readonly activatedAt: string;
  readonly actorUserId: string;
  readonly reason?: string;
  readonly createdAt: string;
};

export type IdentityDeactivation = {
  readonly id: IdentityDeactivationId;
  readonly tenantId: string;
  readonly userId: IdentityUserId;
  readonly deactivatedAt: string;
  readonly actorUserId: string;
  readonly reason?: string;
  readonly createdAt: string;
};

/** Status snapshot metadata for an identity subject. */
export type IdentityStatus = {
  readonly id: IdentityStatusId;
  readonly tenantId: string;
  readonly subjectKind: IdentityStatusSubjectKind;
  readonly subjectId: string;
  readonly status: IdentityLifecycleStatus;
  readonly effectiveAt: string;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type IdentityPolicy = {
  readonly id: IdentityPolicyId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly kind: IdentityPolicyKind;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Append-only audit entry — metadata only. */
export type IdentityAuditEntry = {
  readonly id: IdentityAuditId;
  readonly tenantId: string;
  readonly userId?: IdentityUserId;
  readonly action: IdentityAuditAction;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

/** @deprecated Prefer IdentityAuditEntry */
export type IdentityAudit = IdentityAuditEntry;

export type IdentityHistory = {
  readonly id: IdentityHistoryId;
  readonly tenantId: string;
  readonly userId?: IdentityUserId;
  readonly summary: string;
  readonly actorUserId: string;
  readonly createdAt: string;
};

export type IdentityReference = {
  readonly id: IdentityReferenceId;
  readonly tenantId: string;
  readonly userId?: IdentityUserId;
  readonly kind: IdentityReferenceKind;
  readonly target: string;
  readonly label?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityMetadata = {
  readonly id: IdentityMetadataId;
  readonly tenantId: string;
  readonly userId?: IdentityUserId;
  readonly key: string;
  readonly value: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};
