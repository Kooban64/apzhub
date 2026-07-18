import { describe, expect, it } from "vitest";

import {
  asIdentityGroupId,
  asIdentityMembershipId,
  asIdentityPermissionAssignmentId,
  asIdentityRoleId,
  asIdentityServiceAssignmentId,
  asIdentityUserId,
  type IdentityGroup,
  type IdentityMembership,
  type IdentityPermissionAssignment,
  type IdentityRole,
  type IdentityServiceAssignment,
  type IdentityUser,
} from "@apzhub/identity-contracts";

import {
  IDENTITY_CORE_VERSION,
  IdentityDomainError,
  assertIdentityLifecycleTransition,
  assertMembershipKindCompatible,
  assertNoCredentialFields,
  assertNoSecretMetadataNotes,
  assertServiceAssignmentActive,
  canTransitionIdentityLifecycle,
  createIdentityFoundation,
  isActiveMembership,
  listAllowedIdentityLifecycleTransitions,
  listAssignedPermissionKeys,
  listAssignedServiceCapabilities,
  requireFound,
  summarizeMembership,
  validateIdentityAggregate,
  validateIdentityGroup,
  validateIdentityMembership,
  validateIdentityMetadataNotes,
  validateIdentityPermissionAssignment,
  validateIdentityRole,
  validateIdentityServiceAssignment,
  validateIdentityUser,
} from "./index";

const now = "2026-07-16T00:00:00.000Z";

describe("identity-core", () => {
  it("exports core version 0.2.0", () => {
    expect(IDENTITY_CORE_VERSION).toBe("0.2.0");
  });

  it("enforces lifecycle transitions fail-closed", () => {
    expect(canTransitionIdentityLifecycle("draft", "active")).toBe(true);
    expect(canTransitionIdentityLifecycle("draft", "suspended")).toBe(false);
    expect(canTransitionIdentityLifecycle("active", "active")).toBe(true);
    expect(listAllowedIdentityLifecycleTransitions("active")).toEqual([
      "suspended",
      "deactivated",
      "archived",
    ]);
    expect(() => assertIdentityLifecycleTransition("archived", "active")).toThrow(
      /Cannot transition/,
    );
  });

  it("validates users, groups, roles and forbids credentials", () => {
    const user: IdentityUser = {
      id: asIdentityUserId("user_1"),
      tenantId: "tenant_a",
      displayName: "Ada",
      authSubjectRef: "auth:ada",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    validateIdentityUser(user);
    validateIdentityAggregate(user);

    expect(() => validateIdentityUser({ ...user, displayName: "  " })).toThrow(
      /displayName/,
    );
    expect(() => validateIdentityUser({ ...user, tenantId: "  " })).toThrow(/tenantId/);
    expect(() => assertNoCredentialFields("passwordHash=abc")).toThrow(
      /must not store authentication credentials/,
    );
    expect(() => assertNoSecretMetadataNotes("contains api_key")).toThrow(
      /must not contain secret/,
    );

    const group: IdentityGroup = {
      id: asIdentityGroupId("grp_1"),
      tenantId: "tenant_a",
      key: "engineers",
      name: "Engineers",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    validateIdentityGroup(group);

    const role: IdentityRole = {
      id: asIdentityRoleId("role_1"),
      tenantId: "tenant_a",
      key: "viewer",
      name: "Viewer",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    validateIdentityRole(role);
  });

  it("validates memberships and assignments", () => {
    const membership: IdentityMembership = {
      id: asIdentityMembershipId("mem_1"),
      tenantId: "tenant_a",
      userId: asIdentityUserId("user_1"),
      kind: "group",
      targetId: "grp_1",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
    };
    validateIdentityMembership(membership);
    assertMembershipKindCompatible("group", "grp_1");
    expect(isActiveMembership(membership)).toBe(true);
    expect(summarizeMembership(membership)).toBe("group:grp_1:active");

    const permission: IdentityPermissionAssignment = {
      id: asIdentityPermissionAssignmentId("pa_1"),
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: "user_1",
      permissionKey: "identity.read",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
    };
    validateIdentityPermissionAssignment(permission);
    expect(listAssignedPermissionKeys([permission])).toEqual(["identity.read"]);

    const service: IdentityServiceAssignment = {
      id: asIdentityServiceAssignmentId("sa_1"),
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: "user_1",
      serviceCapability: "projects",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
    };
    validateIdentityServiceAssignment(service);
    assertServiceAssignmentActive(service);
    expect(listAssignedServiceCapabilities([service])).toEqual(["projects"]);
    expect(() =>
      assertServiceAssignmentActive({ ...service, status: "suspended" }),
    ).toThrow(/not active/);
    expect(() =>
      validateIdentityServiceAssignment({
        ...service,
        serviceCapability: "plane" as never,
      }),
    ).toThrow(/Unknown service capability/);
  });

  it("requireFound and foundation factory enforce boundaries", () => {
    expect(requireFound({ a: 1 }, "thing", "1")).toEqual({ a: 1 });
    expect(() => requireFound(null, "thing", "1")).toThrow(IdentityDomainError);
    expect(() => createIdentityFoundation({} as never)).toThrow(/explicit repos/);
  });

  it("covers remaining validation and membership edge cases", () => {
    expect(() => assertMembershipKindCompatible("group", "  ")).toThrow(
      /non-empty targetId/,
    );
    expect(() =>
      validateIdentityGroup({
        id: asIdentityGroupId("grp_bad"),
        tenantId: " ",
        key: "k",
        name: "n",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }),
    ).toThrow(/IdentityGroup/);
    expect(() =>
      validateIdentityRole({
        id: asIdentityRoleId("role_bad"),
        tenantId: "tenant_a",
        key: " ",
        name: "n",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }),
    ).toThrow(/IdentityRole/);
    expect(() =>
      validateIdentityMembership({
        id: asIdentityMembershipId("mem_bad"),
        tenantId: "tenant_a",
        userId: asIdentityUserId("user_1"),
        kind: "team" as never,
        targetId: "x",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).toThrow(/Unknown membership kind/);
    expect(() =>
      validateIdentityMembership({
        id: asIdentityMembershipId("mem_bad2"),
        tenantId: "tenant_a",
        userId: asIdentityUserId("user_1"),
        kind: "group",
        targetId: " ",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).toThrow(/targetId/);
    expect(() =>
      validateIdentityPermissionAssignment({
        id: asIdentityPermissionAssignmentId("pa_bad"),
        tenantId: "tenant_a",
        subjectKind: "user",
        subjectId: "u1",
        permissionKey: " ",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).toThrow(/Permission assignment key/);
    expect(() =>
      validateIdentityPermissionAssignment({
        id: asIdentityPermissionAssignmentId("pa_bad2"),
        tenantId: "tenant_a",
        subjectKind: "user",
        subjectId: " ",
        permissionKey: "identity.read",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }),
    ).toThrow(/subjectId/);
    expect(() => validateIdentityAggregate({ tenantId: "  " })).toThrow(/tenantId/);
    validateIdentityAggregate({});
    validateIdentityMetadataNotes({
      id: "md_1" as never,
      tenantId: "t",
      key: "locale",
      value: "en",
      createdAt: now,
      updatedAt: now,
    });
    expect(() =>
      validateIdentityMetadataNotes({
        id: "md_2" as never,
        tenantId: "t",
        key: "x",
        value: "ok",
        notes: "contains api_key",
        createdAt: now,
        updatedAt: now,
      }),
    ).toThrow(/must not contain secret/);
  });
});
