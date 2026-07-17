import { describe, expect, it } from "vitest";

import {
  asIdentityActivationId,
  asIdentityAuditId,
  asIdentityDeactivationId,
  asIdentityDepartmentId,
  asIdentityEmploymentId,
  asIdentityGroupId,
  asIdentityHistoryId,
  asIdentityInvitationId,
  asIdentityMembershipId,
  asIdentityMetadataId,
  asIdentityOrganizationId,
  asIdentityPermissionAssignmentId,
  asIdentityPolicyId,
  asIdentityPositionId,
  asIdentityReferenceId,
  asIdentityRoleId,
  asIdentityServiceAssignmentId,
  asIdentityStatusId,
  asIdentityTenantId,
  asIdentityUserId,
  type IdentityRequestContext,
} from "@apzhub/identity-contracts";
import { createIdentityFoundation } from "@apzhub/identity-core";

import {
  IDENTITY_PERSISTENCE_VERSION,
  createEmptyIdentityInMemoryStores,
  createIdentityPersistence,
  createIdentityPersistenceForTest,
  createProductionIdentityPersistence,
} from "./index";

const ctx: IdentityRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

const otherCtx: IdentityRequestContext = {
  tenantId: "tenant_b",
  userId: "user_2",
};

const now = "2026-07-16T00:00:00.000Z";

describe("identity-persistence", () => {
  it("exports persistence version 0.1.0", () => {
    expect(IDENTITY_PERSISTENCE_VERSION).toBe("0.1.0");
  });

  it("forbids silent production in-memory fallback", () => {
    expect(() => createIdentityPersistence({ mode: "postgres" })).toThrow(
      /requires db/,
    );
    expect(() =>
      createProductionIdentityPersistence({} as never),
    ).toThrow(/explicit postgres/);
    expect(() => createIdentityPersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() =>
      createIdentityPersistence({ mode: "redis" as never }),
    ).toThrow(/Unsupported/);
  });

  it("persists identity metadata with tenant isolation", async () => {
    const stores = createEmptyIdentityInMemoryStores();
    const repos = createIdentityPersistence({ mode: "memory", stores });
    const foundation = createIdentityFoundation({ repos });

    const user = await foundation.users.create(ctx, {
      id: asIdentityUserId("user_1"),
      tenantId: "tenant_a",
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      authSubjectRef: "auth:ada",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    expect(await foundation.users.get(otherCtx, user.id)).toBeNull();
    expect((await foundation.users.list(otherCtx)).length).toBe(0);

    const group = await foundation.groups.create(ctx, {
      id: asIdentityGroupId("grp_1"),
      tenantId: "tenant_a",
      key: "engineers",
      name: "Engineers",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    const role = await foundation.roles.create(ctx, {
      id: asIdentityRoleId("role_1"),
      tenantId: "tenant_a",
      key: "viewer",
      name: "Viewer",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    await foundation.permissionAssignments.create(ctx, {
      id: asIdentityPermissionAssignmentId("pa_1"),
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: user.id,
      permissionKey: "identity.read",
      roleId: role.id,
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
    });

    const org = await foundation.organizations.create(ctx, {
      id: asIdentityOrganizationId("org_1"),
      tenantId: "tenant_a",
      key: "hq",
      name: "Headquarters",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    await foundation.tenants.create(ctx, {
      id: asIdentityTenantId("iam_tenant_1"),
      key: "acme",
      name: "Acme",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    const dept = await foundation.departments.create(ctx, {
      id: asIdentityDepartmentId("dept_1"),
      tenantId: "tenant_a",
      organisationId: org.id,
      key: "eng",
      name: "Engineering",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const position = await foundation.positions.create(ctx, {
      id: asIdentityPositionId("pos_1"),
      tenantId: "tenant_a",
      organisationId: org.id,
      key: "engineer",
      name: "Engineer",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await foundation.employments.create(ctx, {
      id: asIdentityEmploymentId("emp_1"),
      tenantId: "tenant_a",
      userId: user.id,
      organisationId: org.id,
      departmentId: dept.id,
      positionId: position.id,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await foundation.serviceAssignments.create(ctx, {
      id: asIdentityServiceAssignmentId("sa_1"),
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: user.id,
      serviceCapability: "projects",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
    });

    await foundation.memberships.create(ctx, {
      id: asIdentityMembershipId("mem_1"),
      tenantId: "tenant_a",
      userId: user.id,
      kind: "group",
      targetId: group.id,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
    });

    await foundation.invitations.create(ctx, {
      id: asIdentityInvitationId("inv_1"),
      tenantId: "tenant_a",
      email: "new@example.com",
      status: "sent",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
    });

    await foundation.activations.create(ctx, {
      id: asIdentityActivationId("act_1"),
      tenantId: "tenant_a",
      userId: user.id,
      activatedAt: now,
      actorUserId: "user_1",
      createdAt: now,
    });

    await foundation.deactivations.create(ctx, {
      id: asIdentityDeactivationId("deact_1"),
      tenantId: "tenant_a",
      userId: user.id,
      deactivatedAt: now,
      actorUserId: "user_1",
      createdAt: now,
    });

    await foundation.statuses.create(ctx, {
      id: asIdentityStatusId("st_1"),
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: user.id,
      status: "active",
      effectiveAt: now,
      actorUserId: "user_1",
      createdAt: now,
    });

    await foundation.policies.create(ctx, {
      id: asIdentityPolicyId("pol_1"),
      tenantId: "tenant_a",
      key: "default-access",
      name: "Default Access",
      kind: "access",
      createdAt: now,
      updatedAt: now,
    });

    await foundation.audits.append(ctx, {
      id: asIdentityAuditId("aud_1"),
      tenantId: "tenant_a",
      userId: user.id,
      action: "created",
      actorUserId: "user_1",
      createdAt: now,
    });

    await foundation.history.create(ctx, {
      id: asIdentityHistoryId("hist_1"),
      tenantId: "tenant_a",
      userId: user.id,
      summary: "User created",
      actorUserId: "user_1",
      createdAt: now,
    });

    await foundation.references.create(ctx, {
      id: asIdentityReferenceId("ref_1"),
      tenantId: "tenant_a",
      userId: user.id,
      kind: "documentation",
      target: "docs/identity",
      createdAt: now,
      updatedAt: now,
    });

    await foundation.metadata.create(ctx, {
      id: asIdentityMetadataId("md_1"),
      tenantId: "tenant_a",
      userId: user.id,
      key: "locale",
      value: "en-GB",
      createdAt: now,
      updatedAt: now,
    });

    expect((await foundation.users.list(ctx)).length).toBe(1);
    expect((await foundation.groups.list(ctx)).length).toBe(1);
    expect((await foundation.memberships.list(ctx)).length).toBe(1);
    expect((await foundation.serviceAssignments.list(ctx)).length).toBe(1);
    expect((await foundation.permissionAssignments.list(ctx)).length).toBe(1);
    expect((await foundation.history.list(ctx, user.id)).length).toBe(1);
    expect((await foundation.metadata.list(ctx, user.id)).length).toBe(1);
    expect((await foundation.tenants.list(ctx)).length).toBe(1);

    const updatedUser = {
      ...user,
      displayName: "Ada",
      updatedAt: "2026-07-16T01:00:00.000Z",
    };
    await foundation.users.update(ctx, updatedUser);
    expect((await foundation.users.get(ctx, user.id))?.displayName).toBe("Ada");
  });

  it("allows explicit in-memory test factory", () => {
    const repos = createIdentityPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    expect(repos.users).toBeDefined();
  });

  it("accepts postgres mode and postgresDb test factory with mock executor", () => {
    const db = {
      insert: () => ({ values: async () => undefined }),
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
            then: (r: (v: unknown) => unknown) => Promise.resolve([]).then(r),
          }),
          then: (r: (v: unknown) => unknown) => Promise.resolve([]).then(r),
        }),
      }),
      update: () => ({ set: () => ({ where: async () => undefined }) }),
    } as never;
    expect(createIdentityPersistence({ mode: "postgres", db }).users).toBeDefined();
    expect(
      createIdentityPersistenceForTest({ postgresDb: db }).users,
    ).toBeDefined();
  });

  it("isolates append-only and scoped stores by tenant", async () => {
    const repos = createIdentityPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    await repos.activations.create(ctx, {
      id: asIdentityActivationId("act_x"),
      tenantId: "tenant_a",
      userId: asIdentityUserId("user_1"),
      activatedAt: now,
      actorUserId: "user_1",
      createdAt: now,
    });
    expect(await repos.activations.get(otherCtx, asIdentityActivationId("act_x"))).toBeNull();
    await repos.audits.append(ctx, {
      id: asIdentityAuditId("aud_x"),
      tenantId: "tenant_a",
      action: "created",
      actorUserId: "user_1",
      createdAt: now,
    });
    expect(await repos.audits.get(otherCtx, asIdentityAuditId("aud_x"))).toBeNull();
    await repos.history.create(ctx, {
      id: asIdentityHistoryId("hist_x"),
      tenantId: "tenant_a",
      summary: "x",
      actorUserId: "user_1",
      createdAt: now,
    });
    expect(await repos.history.get(otherCtx, asIdentityHistoryId("hist_x"))).toBeNull();
    await repos.references.create(ctx, {
      id: asIdentityReferenceId("ref_x"),
      tenantId: "tenant_a",
      kind: "external",
      target: "x",
      createdAt: now,
      updatedAt: now,
    });
    expect(await repos.references.get(otherCtx, asIdentityReferenceId("ref_x"))).toBeNull();
    await repos.references.update(ctx, {
      id: asIdentityReferenceId("ref_x"),
      tenantId: "tenant_a",
      kind: "external",
      target: "y",
      createdAt: now,
      updatedAt: now,
    });
    await repos.metadata.create(ctx, {
      id: asIdentityMetadataId("md_x"),
      tenantId: "tenant_a",
      key: "k",
      value: "v",
      createdAt: now,
      updatedAt: now,
    });
    expect(await repos.metadata.get(otherCtx, asIdentityMetadataId("md_x"))).toBeNull();
    await repos.metadata.update(ctx, {
      id: asIdentityMetadataId("md_x"),
      tenantId: "tenant_a",
      key: "k",
      value: "v2",
      createdAt: now,
      updatedAt: now,
    });
    await repos.deactivations.create(ctx, {
      id: asIdentityDeactivationId("deact_x"),
      tenantId: "tenant_a",
      userId: asIdentityUserId("user_1"),
      deactivatedAt: now,
      actorUserId: "user_1",
      createdAt: now,
    });
    expect(
      await repos.deactivations.get(otherCtx, asIdentityDeactivationId("deact_x")),
    ).toBeNull();
  });
});
