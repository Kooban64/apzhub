/** Branded platform identifiers for Identity Administration entities (APZIDENTITY-001). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type IdentityUserId = Brand<string, "IdentityUserId">;
export type IdentityGroupId = Brand<string, "IdentityGroupId">;
export type IdentityRoleId = Brand<string, "IdentityRoleId">;
export type IdentityPermissionAssignmentId = Brand<
  string,
  "IdentityPermissionAssignmentId"
>;
export type IdentityOrganizationId = Brand<string, "IdentityOrganizationId">;
export type IdentityTenantId = Brand<string, "IdentityTenantId">;
export type IdentityDepartmentId = Brand<string, "IdentityDepartmentId">;
export type IdentityPositionId = Brand<string, "IdentityPositionId">;
export type IdentityEmploymentId = Brand<string, "IdentityEmploymentId">;
export type IdentityServiceAssignmentId = Brand<string, "IdentityServiceAssignmentId">;
export type IdentityMembershipId = Brand<string, "IdentityMembershipId">;
export type IdentityInvitationId = Brand<string, "IdentityInvitationId">;
export type IdentityActivationId = Brand<string, "IdentityActivationId">;
export type IdentityDeactivationId = Brand<string, "IdentityDeactivationId">;
export type IdentityStatusId = Brand<string, "IdentityStatusId">;
export type IdentityPolicyId = Brand<string, "IdentityPolicyId">;
export type IdentityAuditId = Brand<string, "IdentityAuditId">;
export type IdentityHistoryId = Brand<string, "IdentityHistoryId">;
export type IdentityReferenceId = Brand<string, "IdentityReferenceId">;
export type IdentityMetadataId = Brand<string, "IdentityMetadataId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformIdentityIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformIdentityIdShape(value)) {
    throw new Error(`Invalid platform identity identifier shape: ${value}`);
  }
  return value as T;
}

export function asIdentityUserId(value: string): IdentityUserId {
  return brandId(value);
}
export function asIdentityGroupId(value: string): IdentityGroupId {
  return brandId(value);
}
export function asIdentityRoleId(value: string): IdentityRoleId {
  return brandId(value);
}
export function asIdentityPermissionAssignmentId(
  value: string,
): IdentityPermissionAssignmentId {
  return brandId(value);
}
export function asIdentityOrganizationId(value: string): IdentityOrganizationId {
  return brandId(value);
}
export function asIdentityTenantId(value: string): IdentityTenantId {
  return brandId(value);
}
export function asIdentityDepartmentId(value: string): IdentityDepartmentId {
  return brandId(value);
}
export function asIdentityPositionId(value: string): IdentityPositionId {
  return brandId(value);
}
export function asIdentityEmploymentId(value: string): IdentityEmploymentId {
  return brandId(value);
}
export function asIdentityServiceAssignmentId(
  value: string,
): IdentityServiceAssignmentId {
  return brandId(value);
}
export function asIdentityMembershipId(value: string): IdentityMembershipId {
  return brandId(value);
}
export function asIdentityInvitationId(value: string): IdentityInvitationId {
  return brandId(value);
}
export function asIdentityActivationId(value: string): IdentityActivationId {
  return brandId(value);
}
export function asIdentityDeactivationId(value: string): IdentityDeactivationId {
  return brandId(value);
}
export function asIdentityStatusId(value: string): IdentityStatusId {
  return brandId(value);
}
export function asIdentityPolicyId(value: string): IdentityPolicyId {
  return brandId(value);
}
export function asIdentityAuditId(value: string): IdentityAuditId {
  return brandId(value);
}
export function asIdentityHistoryId(value: string): IdentityHistoryId {
  return brandId(value);
}
export function asIdentityReferenceId(value: string): IdentityReferenceId {
  return brandId(value);
}
export function asIdentityMetadataId(value: string): IdentityMetadataId {
  return brandId(value);
}
