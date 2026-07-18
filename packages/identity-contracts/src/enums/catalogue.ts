/**
 * Platform Identity Administration enums (APZIDENTITY-001).
 * Metadata catalogue only — no authentication, provisioning, or directory sync.
 */

/** Platform capabilities that may be referenced by service assignments (metadata). */
export const IDENTITY_SERVICE_CAPABILITIES = [
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "search",
  "workflow",
  "workflow-engine",
  "notifications",
  "configuration",
  "administration",
] as const;

export type IdentityServiceCapability = (typeof IDENTITY_SERVICE_CAPABILITIES)[number];

export function isIdentityServiceCapability(
  value: string,
): value is IdentityServiceCapability {
  return (IDENTITY_SERVICE_CAPABILITIES as readonly string[]).includes(value);
}

export const IDENTITY_LIFECYCLE_STATUSES = [
  "draft",
  "invited",
  "pending",
  "active",
  "suspended",
  "deactivated",
  "archived",
] as const;

export type IdentityLifecycleStatus = (typeof IDENTITY_LIFECYCLE_STATUSES)[number];

export function isIdentityLifecycleStatus(
  value: string,
): value is IdentityLifecycleStatus {
  return (IDENTITY_LIFECYCLE_STATUSES as readonly string[]).includes(value);
}

export const IDENTITY_MEMBERSHIP_KINDS = [
  "group",
  "organisation",
  "tenant",
  "department",
] as const;

export type IdentityMembershipKind = (typeof IDENTITY_MEMBERSHIP_KINDS)[number];

export function isIdentityMembershipKind(
  value: string,
): value is IdentityMembershipKind {
  return (IDENTITY_MEMBERSHIP_KINDS as readonly string[]).includes(value);
}

export const IDENTITY_ASSIGNMENT_SUBJECT_KINDS = ["user", "group", "role"] as const;

export type IdentityAssignmentSubjectKind =
  (typeof IDENTITY_ASSIGNMENT_SUBJECT_KINDS)[number];

export function isIdentityAssignmentSubjectKind(
  value: string,
): value is IdentityAssignmentSubjectKind {
  return (IDENTITY_ASSIGNMENT_SUBJECT_KINDS as readonly string[]).includes(value);
}

export const IDENTITY_INVITATION_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "expired",
  "revoked",
] as const;

export type IdentityInvitationStatus = (typeof IDENTITY_INVITATION_STATUSES)[number];

export function isIdentityInvitationStatus(
  value: string,
): value is IdentityInvitationStatus {
  return (IDENTITY_INVITATION_STATUSES as readonly string[]).includes(value);
}

export const IDENTITY_POLICY_KINDS = [
  "access",
  "membership",
  "assignment",
  "lifecycle",
  "retention",
] as const;

export type IdentityPolicyKind = (typeof IDENTITY_POLICY_KINDS)[number];

export function isIdentityPolicyKind(value: string): value is IdentityPolicyKind {
  return (IDENTITY_POLICY_KINDS as readonly string[]).includes(value);
}

export const IDENTITY_REFERENCE_KINDS = [
  "user",
  "group",
  "role",
  "organisation",
  "tenant",
  "service",
  "documentation",
  "external",
] as const;

export type IdentityReferenceKind = (typeof IDENTITY_REFERENCE_KINDS)[number];

export function isIdentityReferenceKind(value: string): value is IdentityReferenceKind {
  return (IDENTITY_REFERENCE_KINDS as readonly string[]).includes(value);
}

export const IDENTITY_AUDIT_ACTIONS = [
  "created",
  "updated",
  "invited",
  "activated",
  "deactivated",
  "membership_changed",
  "role_assigned",
  "permission_assigned",
  "service_assigned",
  "policy_attached",
  "archived",
] as const;

export type IdentityAuditAction = (typeof IDENTITY_AUDIT_ACTIONS)[number];

export function isIdentityAuditAction(value: string): value is IdentityAuditAction {
  return (IDENTITY_AUDIT_ACTIONS as readonly string[]).includes(value);
}

export const IDENTITY_STATUS_SUBJECT_KINDS = [
  "user",
  "membership",
  "invitation",
  "employment",
  "assignment",
] as const;

export type IdentityStatusSubjectKind = (typeof IDENTITY_STATUS_SUBJECT_KINDS)[number];

export function isIdentityStatusSubjectKind(
  value: string,
): value is IdentityStatusSubjectKind {
  return (IDENTITY_STATUS_SUBJECT_KINDS as readonly string[]).includes(value);
}
