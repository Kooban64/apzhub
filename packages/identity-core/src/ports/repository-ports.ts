/**
 * Identity Administration repository ports (APZIDENTITY-001).
 * Interfaces only — no Drizzle / HTTP / memory defaults.
 */

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
  IdentityRequestContext,
  IdentityRole,
  IdentityServiceAssignment,
  IdentityStatus,
  IdentityTenant,
  IdentityUser,
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
} from "@apzhub/identity-contracts";

export class IdentityDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "IdentityDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new IdentityDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

type CrudPort<TEntity, TId> = {
  create(ctx: IdentityRequestContext, entity: TEntity): Promise<TEntity>;
  get(ctx: IdentityRequestContext, id: TId): Promise<TEntity | null>;
  update(ctx: IdentityRequestContext, entity: TEntity): Promise<TEntity>;
  list(ctx: IdentityRequestContext): Promise<readonly TEntity[]>;
};

export type IdentityUserRepositoryPort = CrudPort<IdentityUser, IdentityUserId>;
export type IdentityGroupRepositoryPort = CrudPort<
  IdentityGroup,
  IdentityGroupId
>;
export type IdentityRoleRepositoryPort = CrudPort<IdentityRole, IdentityRoleId>;
export type IdentityPermissionAssignmentRepositoryPort = CrudPort<
  IdentityPermissionAssignment,
  IdentityPermissionAssignmentId
>;
export type IdentityOrganizationRepositoryPort = CrudPort<
  IdentityOrganization,
  IdentityOrganizationId
>;
export type IdentityTenantRepositoryPort = {
  create(ctx: IdentityRequestContext, entity: IdentityTenant): Promise<IdentityTenant>;
  get(ctx: IdentityRequestContext, id: IdentityTenantId): Promise<IdentityTenant | null>;
  update(ctx: IdentityRequestContext, entity: IdentityTenant): Promise<IdentityTenant>;
  list(ctx: IdentityRequestContext): Promise<readonly IdentityTenant[]>;
};
export type IdentityDepartmentRepositoryPort = CrudPort<
  IdentityDepartment,
  IdentityDepartmentId
>;
export type IdentityPositionRepositoryPort = CrudPort<
  IdentityPosition,
  IdentityPositionId
>;
export type IdentityEmploymentRepositoryPort = CrudPort<
  IdentityEmployment,
  IdentityEmploymentId
>;
export type IdentityServiceAssignmentRepositoryPort = CrudPort<
  IdentityServiceAssignment,
  IdentityServiceAssignmentId
>;
export type IdentityMembershipRepositoryPort = CrudPort<
  IdentityMembership,
  IdentityMembershipId
>;
export type IdentityInvitationRepositoryPort = CrudPort<
  IdentityInvitation,
  IdentityInvitationId
>;
export type IdentityActivationRepositoryPort = {
  create(
    ctx: IdentityRequestContext,
    entity: IdentityActivation,
  ): Promise<IdentityActivation>;
  get(
    ctx: IdentityRequestContext,
    id: IdentityActivationId,
  ): Promise<IdentityActivation | null>;
  list(ctx: IdentityRequestContext): Promise<readonly IdentityActivation[]>;
};
export type IdentityDeactivationRepositoryPort = {
  create(
    ctx: IdentityRequestContext,
    entity: IdentityDeactivation,
  ): Promise<IdentityDeactivation>;
  get(
    ctx: IdentityRequestContext,
    id: IdentityDeactivationId,
  ): Promise<IdentityDeactivation | null>;
  list(ctx: IdentityRequestContext): Promise<readonly IdentityDeactivation[]>;
};
export type IdentityStatusRepositoryPort = CrudPort<
  IdentityStatus,
  IdentityStatusId
>;
export type IdentityPolicyRepositoryPort = CrudPort<
  IdentityPolicy,
  IdentityPolicyId
>;
export type IdentityAuditRepositoryPort = {
  append(
    ctx: IdentityRequestContext,
    entry: IdentityAuditEntry,
  ): Promise<IdentityAuditEntry>;
  get(
    ctx: IdentityRequestContext,
    id: IdentityAuditId,
  ): Promise<IdentityAuditEntry | null>;
  list(ctx: IdentityRequestContext): Promise<readonly IdentityAuditEntry[]>;
};
export type IdentityHistoryRepositoryPort = {
  create(
    ctx: IdentityRequestContext,
    entity: IdentityHistory,
  ): Promise<IdentityHistory>;
  get(
    ctx: IdentityRequestContext,
    id: IdentityHistoryId,
  ): Promise<IdentityHistory | null>;
  list(
    ctx: IdentityRequestContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityHistory[]>;
};
export type IdentityReferenceRepositoryPort = {
  create(
    ctx: IdentityRequestContext,
    entity: IdentityReference,
  ): Promise<IdentityReference>;
  get(
    ctx: IdentityRequestContext,
    id: IdentityReferenceId,
  ): Promise<IdentityReference | null>;
  update(
    ctx: IdentityRequestContext,
    entity: IdentityReference,
  ): Promise<IdentityReference>;
  list(
    ctx: IdentityRequestContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityReference[]>;
};
export type IdentityMetadataRepositoryPort = {
  create(
    ctx: IdentityRequestContext,
    entity: IdentityMetadata,
  ): Promise<IdentityMetadata>;
  get(
    ctx: IdentityRequestContext,
    id: IdentityMetadataId,
  ): Promise<IdentityMetadata | null>;
  update(
    ctx: IdentityRequestContext,
    entity: IdentityMetadata,
  ): Promise<IdentityMetadata>;
  list(
    ctx: IdentityRequestContext,
    userId?: IdentityUserId,
  ): Promise<readonly IdentityMetadata[]>;
};

export type IdentityFoundationRepos = {
  readonly users: IdentityUserRepositoryPort;
  readonly groups: IdentityGroupRepositoryPort;
  readonly roles: IdentityRoleRepositoryPort;
  readonly permissionAssignments: IdentityPermissionAssignmentRepositoryPort;
  readonly organizations: IdentityOrganizationRepositoryPort;
  readonly tenants: IdentityTenantRepositoryPort;
  readonly departments: IdentityDepartmentRepositoryPort;
  readonly positions: IdentityPositionRepositoryPort;
  readonly employments: IdentityEmploymentRepositoryPort;
  readonly serviceAssignments: IdentityServiceAssignmentRepositoryPort;
  readonly memberships: IdentityMembershipRepositoryPort;
  readonly invitations: IdentityInvitationRepositoryPort;
  readonly activations: IdentityActivationRepositoryPort;
  readonly deactivations: IdentityDeactivationRepositoryPort;
  readonly statuses: IdentityStatusRepositoryPort;
  readonly policies: IdentityPolicyRepositoryPort;
  readonly audits: IdentityAuditRepositoryPort;
  readonly history: IdentityHistoryRepositoryPort;
  readonly references: IdentityReferenceRepositoryPort;
  readonly metadata: IdentityMetadataRepositoryPort;
};
