/**
 * Nested Identity Administration Platform gateway facets (APZIDENTITY-002).
 * Metadata / lifecycle only — no authentication, provisioning, or directory sync.
 */

import type {
  IdentityActivation,
  IdentityAuditEntry,
  IdentityDeactivation,
  IdentityDepartment,
  IdentityGroup,
  IdentityHistory,
  IdentityInvitation,
  IdentityMembership,
  IdentityOrganization,
  IdentityPolicy,
  IdentityPosition,
  IdentityReference,
  IdentityRole,
  IdentityServiceAssignment,
  IdentityTenant,
  IdentityUser,
} from "../domain/identity";
import type {
  IdentityAssignmentSubjectKind,
  IdentityInvitationStatus,
  IdentityLifecycleStatus,
  IdentityMembershipKind,
  IdentityPolicyKind,
  IdentityReferenceKind,
  IdentityServiceCapability,
} from "../enums/catalogue";
import type {
  IdentityActivationId,
  IdentityAuditId,
  IdentityDeactivationId,
  IdentityDepartmentId,
  IdentityGroupId,
  IdentityHistoryId,
  IdentityInvitationId,
  IdentityMembershipId,
  IdentityOrganizationId,
  IdentityPolicyId,
  IdentityPositionId,
  IdentityReferenceId,
  IdentityRoleId,
  IdentityServiceAssignmentId,
  IdentityTenantId,
  IdentityUserId,
} from "../identifiers";

/** Structurally compatible with ServiceRequestContext — mapped in platform-services. */
export type IdentityPlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type CreateIdentityUserInput = {
  readonly displayName: string;
  readonly email?: string;
  readonly authSubjectRef?: string;
  readonly organisationId?: string;
  readonly status?: IdentityLifecycleStatus;
};

export type UpdateIdentityUserInput = {
  readonly userId: IdentityUserId;
  readonly displayName?: string;
  readonly email?: string | null;
  readonly authSubjectRef?: string | null;
  readonly organisationId?: string | null;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityGroupInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateIdentityGroupInput = {
  readonly groupId: IdentityGroupId;
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityRoleInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateIdentityRoleInput = {
  readonly roleId: IdentityRoleId;
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityOrganizationInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

export type UpdateIdentityOrganizationInput = {
  readonly organisationId: IdentityOrganizationId;
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityTenantInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

export type UpdateIdentityTenantInput = {
  readonly tenantRecordId: IdentityTenantId;
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityDepartmentInput = {
  readonly organisationId: IdentityOrganizationId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

export type UpdateIdentityDepartmentInput = {
  readonly departmentId: IdentityDepartmentId;
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityPositionInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: IdentityOrganizationId;
};

export type UpdateIdentityPositionInput = {
  readonly positionId: IdentityPositionId;
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityMembershipInput = {
  readonly userId: IdentityUserId;
  readonly kind: IdentityMembershipKind;
  readonly targetId: string;
  readonly status?: IdentityLifecycleStatus;
};

export type UpdateIdentityMembershipInput = {
  readonly membershipId: IdentityMembershipId;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityServiceAssignmentInput = {
  readonly subjectKind: IdentityAssignmentSubjectKind;
  readonly subjectId: string;
  readonly serviceCapability: IdentityServiceCapability;
  readonly status?: IdentityLifecycleStatus;
};

export type UpdateIdentityServiceAssignmentInput = {
  readonly assignmentId: IdentityServiceAssignmentId;
  readonly status?: IdentityLifecycleStatus;
};

export type CreateIdentityInvitationInput = {
  readonly email: string;
  readonly organisationId?: string;
  readonly invitedUserId?: IdentityUserId;
  readonly expiresAt?: string;
  readonly status?: IdentityInvitationStatus;
};

export type UpdateIdentityInvitationInput = {
  readonly invitationId: IdentityInvitationId;
  readonly status?: IdentityInvitationStatus;
  readonly expiresAt?: string | null;
};

export type CreateIdentityActivationInput = {
  readonly userId: IdentityUserId;
  readonly reason?: string;
  readonly activatedAt?: string;
};

export type CreateIdentityDeactivationInput = {
  readonly userId: IdentityUserId;
  readonly reason?: string;
  readonly deactivatedAt?: string;
};

export type CreateIdentityPolicyInput = {
  readonly key: string;
  readonly name: string;
  readonly kind: IdentityPolicyKind;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateIdentityPolicyInput = {
  readonly policyId: IdentityPolicyId;
  readonly name?: string;
  readonly description?: string | null;
};

export type CreateIdentityReferenceInput = {
  readonly kind: IdentityReferenceKind;
  readonly target: string;
  readonly label?: string;
  readonly userId?: IdentityUserId;
};

export type UpdateIdentityReferenceInput = {
  readonly referenceId: IdentityReferenceId;
  readonly target?: string;
  readonly label?: string | null;
};

export type IdentityUsersService = {
  list(ctx: IdentityPlatformServiceContext): Promise<readonly IdentityUser[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    userId: IdentityUserId,
  ): Promise<IdentityUser>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityUserInput,
  ): Promise<IdentityUser>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityUserInput,
  ): Promise<IdentityUser>;
};

export type IdentityGroupsService = {
  list(ctx: IdentityPlatformServiceContext): Promise<readonly IdentityGroup[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    groupId: IdentityGroupId,
  ): Promise<IdentityGroup>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityGroupInput,
  ): Promise<IdentityGroup>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityGroupInput,
  ): Promise<IdentityGroup>;
};

export type IdentityRolesService = {
  list(ctx: IdentityPlatformServiceContext): Promise<readonly IdentityRole[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    roleId: IdentityRoleId,
  ): Promise<IdentityRole>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityRoleInput,
  ): Promise<IdentityRole>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityRoleInput,
  ): Promise<IdentityRole>;
};

export type IdentityOrganisationsService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityOrganization[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    organisationId: IdentityOrganizationId,
  ): Promise<IdentityOrganization>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityOrganizationInput,
  ): Promise<IdentityOrganization>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityOrganizationInput,
  ): Promise<IdentityOrganization>;
};

export type IdentityTenantsService = {
  list(ctx: IdentityPlatformServiceContext): Promise<readonly IdentityTenant[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    tenantRecordId: IdentityTenantId,
  ): Promise<IdentityTenant>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityTenantInput,
  ): Promise<IdentityTenant>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityTenantInput,
  ): Promise<IdentityTenant>;
};

export type IdentityDepartmentsService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityDepartment[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    departmentId: IdentityDepartmentId,
  ): Promise<IdentityDepartment>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityDepartmentInput,
  ): Promise<IdentityDepartment>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityDepartmentInput,
  ): Promise<IdentityDepartment>;
};

export type IdentityPositionsService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityPosition[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    positionId: IdentityPositionId,
  ): Promise<IdentityPosition>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityPositionInput,
  ): Promise<IdentityPosition>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityPositionInput,
  ): Promise<IdentityPosition>;
};

export type IdentityMembershipsService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityMembership[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    membershipId: IdentityMembershipId,
  ): Promise<IdentityMembership>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityMembershipInput,
  ): Promise<IdentityMembership>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityMembershipInput,
  ): Promise<IdentityMembership>;
};

export type IdentityServiceAssignmentsService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityServiceAssignment[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    assignmentId: IdentityServiceAssignmentId,
  ): Promise<IdentityServiceAssignment>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityServiceAssignmentInput,
  ): Promise<IdentityServiceAssignment>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityServiceAssignmentInput,
  ): Promise<IdentityServiceAssignment>;
};

export type IdentityInvitationsService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityInvitation[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    invitationId: IdentityInvitationId,
  ): Promise<IdentityInvitation>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityInvitationInput,
  ): Promise<IdentityInvitation>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityInvitationInput,
  ): Promise<IdentityInvitation>;
};

export type IdentityActivationService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityActivation[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    activationId: IdentityActivationId,
  ): Promise<IdentityActivation>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityActivationInput,
  ): Promise<IdentityActivation>;
};

export type IdentityDeactivationService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityDeactivation[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    deactivationId: IdentityDeactivationId,
  ): Promise<IdentityDeactivation>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityDeactivationInput,
  ): Promise<IdentityDeactivation>;
};

export type IdentityPoliciesService = {
  list(ctx: IdentityPlatformServiceContext): Promise<readonly IdentityPolicy[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    policyId: IdentityPolicyId,
  ): Promise<IdentityPolicy>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityPolicyInput,
  ): Promise<IdentityPolicy>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityPolicyInput,
  ): Promise<IdentityPolicy>;
};

export type IdentityAuditService = {
  list(
    ctx: IdentityPlatformServiceContext,
  ): Promise<readonly IdentityAuditEntry[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    auditId: IdentityAuditId,
  ): Promise<IdentityAuditEntry>;
};

export type IdentityHistoryService = {
  list(
    ctx: IdentityPlatformServiceContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityHistory[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    historyId: IdentityHistoryId,
  ): Promise<IdentityHistory>;
};

export type IdentityReferencesService = {
  list(
    ctx: IdentityPlatformServiceContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityReference[]>;
  get(
    ctx: IdentityPlatformServiceContext,
    referenceId: IdentityReferenceId,
  ): Promise<IdentityReference>;
  create(
    ctx: IdentityPlatformServiceContext,
    input: CreateIdentityReferenceInput,
  ): Promise<IdentityReference>;
  update(
    ctx: IdentityPlatformServiceContext,
    input: UpdateIdentityReferenceInput,
  ): Promise<IdentityReference>;
};

export type IdentityDiagnosticsSnapshot = {
  readonly identityEnabled: true;
  readonly persistenceMode: "postgres" | "memory";
  readonly workbenchEnabled: false;
  readonly httpEnabled: false;
  readonly authenticationManaged: false;
  readonly provisioningEnabled: false;
  readonly directorySyncEnabled: false;
  readonly facets: readonly string[];
  readonly serviceCapabilities: readonly IdentityServiceCapability[];
};

export type IdentityDiagnosticsService = {
  health(
    ctx: IdentityPlatformServiceContext,
  ): Promise<{ readonly ok: true; readonly checkedAt: string }>;
  readiness(
    ctx: IdentityPlatformServiceContext,
  ): Promise<IdentityDiagnosticsSnapshot>;
  capabilities(
    ctx: IdentityPlatformServiceContext,
  ): Promise<{ readonly facets: readonly string[] }>;
};

/**
 * Canonical Identity Administration gateway.
 * Shape: gateway.identity.{users,groups,roles,organisations,tenants,departments,positions,memberships,serviceAssignments,invitations,activation,deactivation,policies,audit,history,references,diagnostics}
 */
export type IdentityPlatformGateway = {
  readonly users: IdentityUsersService;
  readonly groups: IdentityGroupsService;
  readonly roles: IdentityRolesService;
  readonly organisations: IdentityOrganisationsService;
  readonly tenants: IdentityTenantsService;
  readonly departments: IdentityDepartmentsService;
  readonly positions: IdentityPositionsService;
  readonly memberships: IdentityMembershipsService;
  readonly serviceAssignments: IdentityServiceAssignmentsService;
  readonly invitations: IdentityInvitationsService;
  readonly activation: IdentityActivationService;
  readonly deactivation: IdentityDeactivationService;
  readonly policies: IdentityPoliciesService;
  readonly audit: IdentityAuditService;
  readonly history: IdentityHistoryService;
  readonly references: IdentityReferencesService;
  readonly diagnostics: IdentityDiagnosticsService;
};
