/**
 * PostgreSQL identity repository coverage (mocked drizzle executor).
 */
import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import {
  asIdentityUserId,
  type IdentityRequestContext,
} from "@apzhub/identity-contracts";

import {
  createPostgresIdentityRepositories,
  createProductionIdentityPersistence,
  mapIdentityActivation,
  mapIdentityAudit,
  mapIdentityDeactivation,
  mapIdentityDepartment,
  mapIdentityEmployment,
  mapIdentityGroup,
  mapIdentityHistory,
  mapIdentityInvitation,
  mapIdentityMembership,
  mapIdentityMetadata,
  mapIdentityOrganization,
  mapIdentityPermissionAssignment,
  mapIdentityPolicy,
  mapIdentityPosition,
  mapIdentityReference,
  mapIdentityRole,
  mapIdentityServiceAssignment,
  mapIdentityStatus,
  mapIdentityTenant,
  mapIdentityUser,
} from "./index";

const ctx: IdentityRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

const now = new Date("2026-07-16T00:00:00.000Z");

function thenableRows(rows: unknown[]) {
  const api = {
    limit: vi.fn(async () => rows),
    where: vi.fn(() => api),
    then: (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(rows).then(resolve, reject),
  };
  return api;
}

function mockDb(rows: unknown[] = []) {
  return {
    insert: vi.fn(() => ({
      values: vi.fn(async () => undefined),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => thenableRows(rows)),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    })),
  } as unknown as DatabaseExecutor;
}

describe("postgres identity repositories", () => {
  it("maps all entity rows", () => {
    expect(
      mapIdentityUser({
        id: "user_1",
        tenantId: "tenant_a",
        organisationId: "org",
        authSubjectRef: "auth:ada",
        email: "a@b.c",
        displayName: "Ada",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }).displayName,
    ).toBe("Ada");

    expect(
      mapIdentityGroup({
        id: "grp_1",
        tenantId: "tenant_a",
        organisationId: null,
        key: "eng",
        name: "Eng",
        description: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }).key,
    ).toBe("eng");

    expect(
      mapIdentityRole({
        id: "role_1",
        tenantId: "tenant_a",
        organisationId: null,
        key: "viewer",
        name: "Viewer",
        description: "d",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }).key,
    ).toBe("viewer");

    expect(
      mapIdentityPermissionAssignment({
        id: "pa_1",
        tenantId: "tenant_a",
        subjectKind: "user",
        subjectId: "user_1",
        permissionKey: "identity.read",
        roleId: "role_1",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }).permissionKey,
    ).toBe("identity.read");

    expect(
      mapIdentityOrganization({
        id: "org_1",
        tenantId: "tenant_a",
        key: "hq",
        name: "HQ",
        description: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }).key,
    ).toBe("hq");

    expect(
      mapIdentityTenant({
        id: "t_1",
        key: "acme",
        name: "Acme",
        description: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }).key,
    ).toBe("acme");

    expect(
      mapIdentityDepartment({
        id: "d_1",
        tenantId: "tenant_a",
        organisationId: "org_1",
        key: "eng",
        name: "Eng",
        description: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
      }).organisationId,
    ).toBe("org_1");

    expect(
      mapIdentityPosition({
        id: "p_1",
        tenantId: "tenant_a",
        organisationId: "org_1",
        key: "eng",
        name: "Engineer",
        description: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
      }).key,
    ).toBe("eng");

    expect(
      mapIdentityEmployment({
        id: "e_1",
        tenantId: "tenant_a",
        userId: "user_1",
        organisationId: "org_1",
        departmentId: "d_1",
        positionId: "p_1",
        status: "active",
        startedAt: null,
        endedAt: null,
        createdAt: now,
        updatedAt: now,
      }).userId,
    ).toBe("user_1");

    expect(
      mapIdentityServiceAssignment({
        id: "sa_1",
        tenantId: "tenant_a",
        subjectKind: "user",
        subjectId: "user_1",
        serviceCapability: "projects",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }).serviceCapability,
    ).toBe("projects");

    expect(
      mapIdentityMembership({
        id: "m_1",
        tenantId: "tenant_a",
        userId: "user_1",
        kind: "group",
        targetId: "grp_1",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }).kind,
    ).toBe("group");

    expect(
      mapIdentityInvitation({
        id: "i_1",
        tenantId: "tenant_a",
        organisationId: null,
        email: "a@b.c",
        invitedUserId: null,
        status: "sent",
        expiresAt: null,
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
      }).status,
    ).toBe("sent");

    expect(
      mapIdentityActivation({
        id: "a_1",
        tenantId: "tenant_a",
        userId: "user_1",
        activatedAt: now.toISOString(),
        actorUserId: "u",
        reason: null,
        createdAt: now,
      }).userId,
    ).toBe("user_1");

    expect(
      mapIdentityDeactivation({
        id: "da_1",
        tenantId: "tenant_a",
        userId: "user_1",
        deactivatedAt: now.toISOString(),
        actorUserId: "u",
        reason: null,
        createdAt: now,
      }).userId,
    ).toBe("user_1");

    expect(
      mapIdentityStatus({
        id: "st_1",
        tenantId: "tenant_a",
        subjectKind: "user",
        subjectId: "user_1",
        status: "active",
        effectiveAt: now.toISOString(),
        actorUserId: "u",
        detail: null,
        createdAt: now,
      }).subjectKind,
    ).toBe("user");

    expect(
      mapIdentityPolicy({
        id: "pol_1",
        tenantId: "tenant_a",
        organisationId: null,
        key: "access",
        name: "Access",
        kind: "access",
        description: null,
        createdAt: now,
        updatedAt: now,
      }).kind,
    ).toBe("access");

    expect(
      mapIdentityAudit({
        id: "aud_1",
        tenantId: "tenant_a",
        userId: "user_1",
        action: "created",
        actorUserId: "u",
        detail: null,
        createdAt: now,
      }).action,
    ).toBe("created");

    expect(
      mapIdentityHistory({
        id: "h_1",
        tenantId: "tenant_a",
        userId: "user_1",
        summary: "created",
        actorUserId: "u",
        createdAt: now,
      }).summary,
    ).toBe("created");

    expect(
      mapIdentityReference({
        id: "r_1",
        tenantId: "tenant_a",
        userId: "user_1",
        kind: "documentation",
        target: "docs",
        label: null,
        createdAt: now,
        updatedAt: now,
      }).kind,
    ).toBe("documentation");

    expect(
      mapIdentityMetadata({
        id: "md_1",
        tenantId: "tenant_a",
        userId: "user_1",
        key: "locale",
        value: "en",
        notes: null,
        createdAt: now,
        updatedAt: now,
      }).key,
    ).toBe("locale");
  });

  it("creates, gets, lists, and updates through postgres ports", async () => {
    const userRow = {
      id: "user_1",
      tenantId: "tenant_a",
      organisationId: null,
      authSubjectRef: null,
      email: null,
      displayName: "Ada",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const db = mockDb([userRow]);
    const repos = createPostgresIdentityRepositories(db);

    await repos.users.create(ctx, {
      id: asIdentityUserId("user_1"),
      tenantId: "tenant_a",
      displayName: "Ada",
      status: "active",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    });
    expect(await repos.users.get(ctx, asIdentityUserId("user_1"))).toMatchObject({
      displayName: "Ada",
    });
    expect((await repos.users.list(ctx)).length).toBe(1);
    await repos.users.update(ctx, {
      id: asIdentityUserId("user_1"),
      tenantId: "tenant_a",
      displayName: "Ada L",
      status: "active",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "u",
      updatedBy: "u",
      revision: 2,
    });

    const tenantDb = mockDb([
      {
        id: "t_1",
        key: "acme",
        name: "Acme",
        description: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      },
    ]);
    const tenantRepos = createPostgresIdentityRepositories(tenantDb);
    await tenantRepos.tenants.create(ctx, {
      id: "t_1" as never,
      key: "acme",
      name: "Acme",
      status: "active",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    });
    expect((await tenantRepos.tenants.list(ctx)).length).toBe(1);

    const auditDb = mockDb([
      {
        id: "aud_1",
        tenantId: "tenant_a",
        userId: "user_1",
        action: "created",
        actorUserId: "u",
        detail: null,
        createdAt: now,
      },
    ]);
    const auditRepos = createPostgresIdentityRepositories(auditDb);
    await auditRepos.audits.append(ctx, {
      id: "aud_1" as never,
      tenantId: "tenant_a",
      action: "created",
      actorUserId: "u",
      createdAt: now.toISOString(),
    });
    expect((await auditRepos.audits.list(ctx)).length).toBe(1);

    expect(createProductionIdentityPersistence({ db: mockDb() }).users).toBeDefined();
  });

  it("exercises remaining postgres ports for coverage", async () => {
    const nowIso = now.toISOString();
    const baseUser = {
      id: "user_1",
      tenantId: "tenant_a",
      organisationId: null,
      authSubjectRef: null,
      email: null,
      displayName: "Ada",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };

    const groupRow = {
      id: "grp_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "eng",
      name: "Eng",
      description: null,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const roleRow = { ...groupRow, id: "role_1", key: "viewer", name: "Viewer" };
    const orgRow = {
      id: "org_1",
      tenantId: "tenant_a",
      key: "hq",
      name: "HQ",
      description: null,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const deptRow = {
      id: "dept_1",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "eng",
      name: "Eng",
      description: null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    const posRow = {
      ...deptRow,
      id: "pos_1",
      key: "eng",
      name: "Engineer",
      organisationId: "org_1",
    };
    const empRow = {
      id: "emp_1",
      tenantId: "tenant_a",
      userId: "user_1",
      organisationId: "org_1",
      departmentId: "dept_1",
      positionId: "pos_1",
      status: "active",
      startedAt: null,
      endedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const saRow = {
      id: "sa_1",
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
    const memRow = {
      id: "mem_1",
      tenantId: "tenant_a",
      userId: "user_1",
      kind: "group",
      targetId: "grp_1",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
    };
    const invRow = {
      id: "inv_1",
      tenantId: "tenant_a",
      organisationId: null,
      email: "a@b.c",
      invitedUserId: null,
      status: "sent",
      expiresAt: null,
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
    };
    const actRow = {
      id: "act_1",
      tenantId: "tenant_a",
      userId: "user_1",
      activatedAt: nowIso,
      actorUserId: "u",
      reason: null,
      createdAt: now,
    };
    const deactRow = {
      id: "deact_1",
      tenantId: "tenant_a",
      userId: "user_1",
      deactivatedAt: nowIso,
      actorUserId: "u",
      reason: null,
      createdAt: now,
    };
    const stRow = {
      id: "st_1",
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: "user_1",
      status: "active",
      effectiveAt: nowIso,
      actorUserId: "u",
      detail: null,
      createdAt: now,
    };
    const polRow = {
      id: "pol_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "access",
      name: "Access",
      kind: "access",
      description: null,
      createdAt: now,
      updatedAt: now,
    };
    const histRow = {
      id: "hist_1",
      tenantId: "tenant_a",
      userId: "user_1",
      summary: "created",
      actorUserId: "u",
      createdAt: now,
    };
    const refRow = {
      id: "ref_1",
      tenantId: "tenant_a",
      userId: "user_1",
      kind: "documentation",
      target: "docs",
      label: null,
      createdAt: now,
      updatedAt: now,
    };
    const mdRow = {
      id: "md_1",
      tenantId: "tenant_a",
      userId: "user_1",
      key: "locale",
      value: "en",
      notes: null,
      createdAt: now,
      updatedAt: now,
    };
    const paRow = {
      id: "pa_1",
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: "user_1",
      permissionKey: "identity.read",
      roleId: "role_1",
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
    };

    const db = mockDb([groupRow]);
    const repos = createPostgresIdentityRepositories(db);

    await repos.groups.create(ctx, {
      id: "grp_1" as never,
      tenantId: "tenant_a",
      key: "eng",
      name: "Eng",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    });
    await repos.groups.update(ctx, {
      id: "grp_1" as never,
      tenantId: "tenant_a",
      key: "eng",
      name: "Engineering",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
      revision: 2,
    });
    expect(await repos.groups.get(ctx, "grp_1" as never)).toBeTruthy();
    expect((await repos.groups.list(ctx)).length).toBe(1);

    const roleRepos = createPostgresIdentityRepositories(mockDb([roleRow]));
    await roleRepos.roles.create(ctx, {
      id: "role_1" as never,
      tenantId: "tenant_a",
      key: "viewer",
      name: "Viewer",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    });
    expect((await roleRepos.roles.list(ctx)).length).toBe(1);

    const orgRepos = createPostgresIdentityRepositories(mockDb([orgRow]));
    await orgRepos.organizations.create(ctx, {
      id: "org_1" as never,
      tenantId: "tenant_a",
      key: "hq",
      name: "HQ",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    });
    expect((await orgRepos.organizations.list(ctx)).length).toBe(1);

    const deptRepos = createPostgresIdentityRepositories(mockDb([deptRow]));
    await deptRepos.departments.create(ctx, {
      id: "dept_1" as never,
      tenantId: "tenant_a",
      organisationId: "org_1" as never,
      key: "eng",
      name: "Eng",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    expect((await deptRepos.departments.list(ctx)).length).toBe(1);

    const posRepos = createPostgresIdentityRepositories(mockDb([posRow]));
    await posRepos.positions.create(ctx, {
      id: "pos_1" as never,
      tenantId: "tenant_a",
      organisationId: "org_1" as never,
      key: "eng",
      name: "Engineer",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    expect((await posRepos.positions.list(ctx)).length).toBe(1);

    const empRepos = createPostgresIdentityRepositories(mockDb([empRow]));
    await empRepos.employments.create(ctx, {
      id: "emp_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      organisationId: "org_1" as never,
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    expect((await empRepos.employments.list(ctx)).length).toBe(1);

    const saRepos = createPostgresIdentityRepositories(mockDb([saRow]));
    await saRepos.serviceAssignments.create(ctx, {
      id: "sa_1" as never,
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: "user_1",
      serviceCapability: "projects",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
    });
    expect((await saRepos.serviceAssignments.list(ctx)).length).toBe(1);

    const memRepos = createPostgresIdentityRepositories(mockDb([memRow]));
    await memRepos.memberships.create(ctx, {
      id: "mem_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      kind: "group",
      targetId: "grp_1",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
    });
    expect((await memRepos.memberships.list(ctx)).length).toBe(1);

    const invRepos = createPostgresIdentityRepositories(mockDb([invRow]));
    await invRepos.invitations.create(ctx, {
      id: "inv_1" as never,
      tenantId: "tenant_a",
      email: "a@b.c",
      status: "sent",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
    });
    expect((await invRepos.invitations.list(ctx)).length).toBe(1);

    const actRepos = createPostgresIdentityRepositories(mockDb([actRow]));
    await actRepos.activations.create(ctx, {
      id: "act_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      activatedAt: nowIso,
      actorUserId: "u",
      createdAt: nowIso,
    });
    expect(await actRepos.activations.get(ctx, "act_1" as never)).toBeTruthy();
    expect((await actRepos.activations.list(ctx)).length).toBe(1);

    const deactRepos = createPostgresIdentityRepositories(mockDb([deactRow]));
    await deactRepos.deactivations.create(ctx, {
      id: "deact_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      deactivatedAt: nowIso,
      actorUserId: "u",
      createdAt: nowIso,
    });
    expect(await deactRepos.deactivations.get(ctx, "deact_1" as never)).toBeTruthy();
    expect((await deactRepos.deactivations.list(ctx)).length).toBe(1);

    const stRepos = createPostgresIdentityRepositories(mockDb([stRow]));
    await stRepos.statuses.create(ctx, {
      id: "st_1" as never,
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: "user_1",
      status: "active",
      effectiveAt: nowIso,
      actorUserId: "u",
      createdAt: nowIso,
    });
    expect((await stRepos.statuses.list(ctx)).length).toBe(1);

    const polRepos = createPostgresIdentityRepositories(mockDb([polRow]));
    await polRepos.policies.create(ctx, {
      id: "pol_1" as never,
      tenantId: "tenant_a",
      key: "access",
      name: "Access",
      kind: "access",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    expect((await polRepos.policies.list(ctx)).length).toBe(1);

    const histRepos = createPostgresIdentityRepositories(mockDb([histRow]));
    await histRepos.history.create(ctx, {
      id: "hist_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      summary: "created",
      actorUserId: "u",
      createdAt: nowIso,
    });
    expect(await histRepos.history.get(ctx, "hist_1" as never)).toBeTruthy();
    expect((await histRepos.history.list(ctx)).length).toBe(1);
    expect((await histRepos.history.list(ctx, "user_1" as never)).length).toBe(1);

    const refRepos = createPostgresIdentityRepositories(mockDb([refRow]));
    await refRepos.references.create(ctx, {
      id: "ref_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      kind: "documentation",
      target: "docs",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    await refRepos.references.update(ctx, {
      id: "ref_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      kind: "documentation",
      target: "docs/v2",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    expect(await refRepos.references.get(ctx, "ref_1" as never)).toBeTruthy();
    expect((await refRepos.references.list(ctx, "user_1" as never)).length).toBe(1);

    const mdRepos = createPostgresIdentityRepositories(mockDb([mdRow]));
    await mdRepos.metadata.create(ctx, {
      id: "md_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      key: "locale",
      value: "en",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    await mdRepos.metadata.update(ctx, {
      id: "md_1" as never,
      tenantId: "tenant_a",
      userId: "user_1" as never,
      key: "locale",
      value: "en-GB",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    expect(await mdRepos.metadata.get(ctx, "md_1" as never)).toBeTruthy();
    expect((await mdRepos.metadata.list(ctx, "user_1" as never)).length).toBe(1);

    const paRepos = createPostgresIdentityRepositories(mockDb([paRow]));
    await paRepos.permissionAssignments.create(ctx, {
      id: "pa_1" as never,
      tenantId: "tenant_a",
      subjectKind: "user",
      subjectId: "user_1",
      permissionKey: "identity.read",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
    });
    expect((await paRepos.permissionAssignments.list(ctx)).length).toBe(1);

    const tenantRepos = createPostgresIdentityRepositories(
      mockDb([
        {
          id: "t_1",
          key: "acme",
          name: "Acme",
          description: null,
          status: "active",
          createdAt: now,
          updatedAt: now,
          createdBy: "u",
          updatedBy: "u",
          revision: 1,
        },
      ]),
    );
    expect(await tenantRepos.tenants.get(ctx, "t_1" as never)).toBeTruthy();
    await tenantRepos.tenants.update(ctx, {
      id: "t_1" as never,
      key: "acme",
      name: "Acme Corp",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "u",
      updatedBy: "u",
      revision: 2,
    });

    const auditRepos = createPostgresIdentityRepositories(
      mockDb([
        {
          id: "aud_1",
          tenantId: "tenant_a",
          userId: "user_1",
          action: "created",
          actorUserId: "u",
          detail: null,
          createdAt: now,
        },
      ]),
    );
    expect(await auditRepos.audits.get(ctx, "aud_1" as never)).toBeTruthy();

    void baseUser;
  });
});
