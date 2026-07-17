import { describe, expect, it } from "vitest";

import {
  IDENTITY_ASSIGNMENT_SUBJECT_KINDS,
  IDENTITY_AUDIT_ACTIONS,
  IDENTITY_CONTRACTS_VERSION,
  IDENTITY_INVITATION_STATUSES,
  IDENTITY_LIFECYCLE_STATUSES,
  IDENTITY_MEMBERSHIP_KINDS,
  IDENTITY_POLICY_KINDS,
  IDENTITY_REFERENCE_KINDS,
  IDENTITY_SERVICE_CAPABILITIES,
  IDENTITY_STATUS_SUBJECT_KINDS,
  PLATFORM_IDENTITY_PERMISSIONS,
  asIdentityUserId,
  hasIdentityPermission,
  isIdentityAssignmentSubjectKind,
  isIdentityAuditAction,
  isIdentityInvitationStatus,
  isIdentityLifecycleStatus,
  isIdentityMembershipKind,
  isIdentityPolicyKind,
  isIdentityReferenceKind,
  isIdentityServiceCapability,
  isIdentityStatusSubjectKind,
  isPlatformIdentityIdShape,
  isPlatformIdentityPermission,
} from "./index";

describe("identity-contracts", () => {
  it("exports version 0.2.0", () => {
    expect(IDENTITY_CONTRACTS_VERSION).toBe("0.2.0");
  });

  it("exposes full permission catalogue", () => {
    expect(PLATFORM_IDENTITY_PERMISSIONS).toEqual([
      "identity.*",
      "identity.read",
      "identity.manage",
      "identity.user",
      "identity.group",
      "identity.role",
      "identity.organization",
      "identity.tenant",
      "identity.assignment",
      "identity.audit",
    ]);
    expect(isPlatformIdentityPermission("identity.read")).toBe(true);
    expect(isPlatformIdentityPermission("identity.secret")).toBe(false);
  });

  it("evaluates permission wildcards", () => {
    expect(hasIdentityPermission(["identity.*"], "audit")).toBe(true);
    expect(hasIdentityPermission(["identity.read"], "manage")).toBe(false);
    expect(hasIdentityPermission(["identity.user"], "user")).toBe(true);
  });

  it("validates enum catalogues and type guards", () => {
    expect(IDENTITY_SERVICE_CAPABILITIES).toHaveLength(11);
    expect(isIdentityServiceCapability("projects")).toBe(true);
    expect(isIdentityServiceCapability("workflow-engine")).toBe(true);
    expect(isIdentityServiceCapability("plane")).toBe(false);
    expect(IDENTITY_LIFECYCLE_STATUSES).toContain("active");
    expect(isIdentityLifecycleStatus("draft")).toBe(true);
    expect(isIdentityLifecycleStatus("live")).toBe(false);
    expect(IDENTITY_MEMBERSHIP_KINDS).toContain("group");
    expect(isIdentityMembershipKind("organisation")).toBe(true);
    expect(isIdentityMembershipKind("team")).toBe(false);
    expect(IDENTITY_AUDIT_ACTIONS).toContain("role_assigned");
    expect(isIdentityAuditAction("created")).toBe(true);
    expect(isIdentityAuditAction("login")).toBe(false);
    expect(IDENTITY_ASSIGNMENT_SUBJECT_KINDS).toContain("role");
    expect(isIdentityAssignmentSubjectKind("user")).toBe(true);
    expect(isIdentityAssignmentSubjectKind("org")).toBe(false);
    expect(IDENTITY_INVITATION_STATUSES).toContain("accepted");
    expect(isIdentityInvitationStatus("sent")).toBe(true);
    expect(isIdentityInvitationStatus("queued")).toBe(false);
    expect(IDENTITY_POLICY_KINDS).toContain("lifecycle");
    expect(isIdentityPolicyKind("access")).toBe(true);
    expect(isIdentityPolicyKind("quota")).toBe(false);
    expect(IDENTITY_REFERENCE_KINDS).toContain("service");
    expect(isIdentityReferenceKind("user")).toBe(true);
    expect(isIdentityReferenceKind("engine")).toBe(false);
    expect(IDENTITY_STATUS_SUBJECT_KINDS).toContain("invitation");
    expect(isIdentityStatusSubjectKind("user")).toBe(true);
    expect(isIdentityStatusSubjectKind("session")).toBe(false);
  });

  it("brands identifiers and rejects invalid shapes", () => {
    expect(isPlatformIdentityIdShape("user_1")).toBe(true);
    expect(isPlatformIdentityIdShape("")).toBe(false);
    expect(asIdentityUserId("user_1")).toBe("user_1");
    expect(() => asIdentityUserId("")).toThrow(/Invalid platform identity/);
  });
});
