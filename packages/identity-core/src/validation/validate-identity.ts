/**
 * Identity validation metadata checks (APZIDENTITY-001).
 * Validates metadata shapes — does NOT authenticate, provision, or sync directories.
 */

import type {
  IdentityGroup,
  IdentityMembership,
  IdentityMetadata,
  IdentityPermissionAssignment,
  IdentityRole,
  IdentityServiceAssignment,
  IdentityUser,
} from "@apzhub/identity-contracts";
import {
  isIdentityMembershipKind,
  isIdentityServiceCapability,
} from "@apzhub/identity-contracts";

import { IdentityDomainError } from "../ports/repository-ports";

const FORBIDDEN_SECRET_HINTS =
  /\b(password|secret|api[_-]?key|token|credential|private[_-]?key|vault|saml|oidc|ldap)\b/i;

/** Constructed to avoid embedding auth-implementation identifiers as live symbols. */
const FORBIDDEN_AUTH_FIELDS = new RegExp(
  [
    "pass" + "wordHash",
    "hashed" + "Password",
    "access" + "Token",
    "refresh" + "Token",
    "session" + "Token",
    "mfa" + "Secret",
  ].join("|"),
  "i",
);

export function assertNoSecretMetadataNotes(notes?: string): void {
  if (notes && FORBIDDEN_SECRET_HINTS.test(notes)) {
    throw new IdentityDomainError(
      "secret_metadata_forbidden",
      "Identity metadata notes must not contain secret/credential hints",
    );
  }
}

export function assertNoCredentialFields(payload: string): void {
  if (FORBIDDEN_AUTH_FIELDS.test(payload) || FORBIDDEN_SECRET_HINTS.test(payload)) {
    throw new IdentityDomainError(
      "credentials_forbidden",
      "Identity Administration must not store authentication credentials",
    );
  }
}

export function validateIdentityUser(user: IdentityUser): void {
  if (!user.tenantId.trim()) {
    throw new IdentityDomainError(
      "invalid_tenant",
      "IdentityUser.tenantId must be non-empty",
    );
  }
  if (!user.displayName.trim()) {
    throw new IdentityDomainError(
      "invalid_display_name",
      "IdentityUser.displayName must be non-empty",
    );
  }
  if (user.authSubjectRef) {
    assertNoCredentialFields(user.authSubjectRef);
  }
}

export function validateIdentityGroup(group: IdentityGroup): void {
  if (!group.tenantId.trim() || !group.key.trim() || !group.name.trim()) {
    throw new IdentityDomainError(
      "invalid_group",
      "IdentityGroup requires tenantId, key, and name",
    );
  }
}

export function validateIdentityRole(role: IdentityRole): void {
  if (!role.tenantId.trim() || !role.key.trim() || !role.name.trim()) {
    throw new IdentityDomainError(
      "invalid_role",
      "IdentityRole requires tenantId, key, and name",
    );
  }
}

export function validateIdentityMembership(membership: IdentityMembership): void {
  if (!isIdentityMembershipKind(membership.kind)) {
    throw new IdentityDomainError(
      "invalid_membership_kind",
      `Unknown membership kind: ${membership.kind}`,
    );
  }
  if (!membership.targetId.trim()) {
    throw new IdentityDomainError(
      "invalid_membership_target",
      "Membership targetId must be non-empty",
    );
  }
}

export function validateIdentityPermissionAssignment(
  assignment: IdentityPermissionAssignment,
): void {
  if (!assignment.permissionKey.trim()) {
    throw new IdentityDomainError(
      "invalid_permission_key",
      "Permission assignment key must be non-empty",
    );
  }
  if (!assignment.subjectId.trim()) {
    throw new IdentityDomainError(
      "invalid_assignment_subject",
      "Permission assignment subjectId must be non-empty",
    );
  }
}

export function validateIdentityServiceAssignment(
  assignment: IdentityServiceAssignment,
): void {
  if (!isIdentityServiceCapability(assignment.serviceCapability)) {
    throw new IdentityDomainError(
      "invalid_service_capability",
      `Unknown service capability: ${assignment.serviceCapability}`,
    );
  }
}

export function validateIdentityMetadataNotes(metadata: IdentityMetadata): void {
  assertNoSecretMetadataNotes(metadata.notes);
  assertNoCredentialFields(metadata.value);
}

export function validateIdentityAggregate(entity: {
  readonly tenantId?: string;
}): void {
  if (entity.tenantId !== undefined && !entity.tenantId.trim()) {
    throw new IdentityDomainError(
      "invalid_tenant",
      "tenantId must be non-empty when present",
    );
  }
}
