import { describe, expect, it } from "vitest";

import type { IdentityRequestContext } from "@apzhub/identity-contracts";
import { createIdentityPersistenceForTest } from "@apzhub/identity-persistence";

import { IdentityDomainError } from "../ports/repository-ports";
import { createPlatformIdentityService } from "./create-platform-identity-service";

const ctx: IdentityRequestContext = {
  tenantId: "tenant_a",
  userId: "actor_1",
};

function createService() {
  let n = 0;
  const repos = createIdentityPersistenceForTest({
    allowInMemoryPersistence: true,
  });
  return createPlatformIdentityService({
    repos,
    now: () => "2026-07-16T12:00:00.000Z",
    id: () => `id_${++n}`,
    persistenceMode: "memory",
  });
}

describe("createPlatformIdentityService", () => {
  it("requires explicit repos", () => {
    expect(() => createPlatformIdentityService({} as never)).toThrow(/explicit repos/);
  });

  it("rejects invalid request context", async () => {
    const service = createService();
    await expect(
      service.listUsers({ tenantId: "", userId: "x" }),
    ).rejects.toBeInstanceOf(IdentityDomainError);
  });

  it("covers CRUD, memberships, assignments, lifecycle, and diagnostics", async () => {
    const service = createService();

    const user = await service.createUser(ctx, {
      displayName: "Ada",
      email: "ada@example.com",
      authSubjectRef: "auth:ada",
    });
    expect(user.status).toBe("draft");

    await service.updateUser(ctx, {
      userId: user.id,
      displayName: "Ada L",
      email: null,
      authSubjectRef: null,
      organisationId: null,
    });

    const group = await service.createGroup(ctx, {
      key: "engineers",
      name: "Engineers",
    });
    await service.updateGroup(ctx, {
      groupId: group.id,
      name: "Engineering",
      status: "active",
    });

    const role = await service.createRole(ctx, {
      key: "member",
      name: "Member",
    });
    await service.updateRole(ctx, { roleId: role.id, name: "Member 2" });
    expect(await service.listRoles(ctx)).toHaveLength(1);

    const org = await service.createOrganization(ctx, {
      key: "apz",
      name: "APZ",
    });
    await service.updateOrganization(ctx, {
      organisationId: org.id,
      name: "APZHUB",
    });
    expect(await service.listOrganizations(ctx)).toHaveLength(1);

    const tenant = await service.createTenant(ctx, {
      key: "t1",
      name: "Tenant 1",
    });
    await service.updateTenant(ctx, {
      tenantRecordId: tenant.id,
      name: "Tenant One",
    });
    expect(await service.listTenants(ctx)).toHaveLength(1);

    const dept = await service.createDepartment(ctx, {
      organisationId: org.id,
      key: "eng",
      name: "Engineering",
    });
    await service.updateDepartment(ctx, {
      departmentId: dept.id,
      name: "Eng",
    });
    expect(await service.listDepartments(ctx)).toHaveLength(1);

    const position = await service.createPosition(ctx, {
      key: "dev",
      name: "Developer",
    });
    await service.updatePosition(ctx, {
      positionId: position.id,
      name: "Dev",
    });
    expect(await service.listPositions(ctx)).toHaveLength(1);

    const membership = await service.createMembership(ctx, {
      userId: user.id,
      kind: "group",
      targetId: group.id,
    });
    expect(membership.status).toBe("active");
    await service.updateMembership(ctx, {
      membershipId: membership.id,
      status: "suspended",
    });

    const assignment = await service.createServiceAssignment(ctx, {
      subjectKind: "user",
      subjectId: user.id,
      serviceCapability: "projects",
    });
    expect(assignment.serviceCapability).toBe("projects");
    await service.updateServiceAssignment(ctx, {
      assignmentId: assignment.id,
      status: "suspended",
    });

    const invitation = await service.createInvitation(ctx, {
      email: "invitee@example.com",
    });
    await service.updateInvitation(ctx, {
      invitationId: invitation.id,
      status: "accepted",
      expiresAt: null,
    });
    expect(await service.listInvitations(ctx)).toHaveLength(1);

    await service.createActivation(ctx, { userId: user.id, reason: "onboard" });
    expect((await service.getUser(ctx, user.id)).status).toBe("active");

    await service.createDeactivation(ctx, {
      userId: user.id,
      reason: "offboard",
    });
    expect(await service.listDeactivations(ctx)).toHaveLength(1);

    const policy = await service.createPolicy(ctx, {
      key: "default",
      name: "Default",
      kind: "access",
    });
    await service.updatePolicy(ctx, {
      policyId: policy.id,
      name: "Default 2",
      description: null,
    });
    expect(await service.listPolicies(ctx)).toHaveLength(1);

    const reference = await service.createReference(ctx, {
      kind: "external",
      target: "doc:1",
      userId: user.id,
    });
    await service.updateReference(ctx, {
      referenceId: reference.id,
      label: "Doc",
    });

    const readiness = await service.diagnosticsReadiness(ctx);
    expect(readiness.httpEnabled).toBe(false);
    expect(readiness.authenticationManaged).toBe(false);
    expect(readiness.facets).toContain("users");
    expect(readiness.serviceCapabilities).toContain("workflow-engine");
    expect((await service.diagnosticsHealth(ctx)).ok).toBe(true);
    expect((await service.diagnosticsCapabilities(ctx)).facets).toContain(
      "memberships",
    );

    expect((await service.listAudits(ctx)).length).toBeGreaterThan(0);
    expect((await service.listHistory(ctx, user.id)).length).toBeGreaterThan(0);
    expect(await service.listReferences(ctx, user.id)).toHaveLength(1);

    await expect(
      service.createUser(ctx, {
        displayName: "Bad",
        authSubjectRef: "passwordHash=secret",
      }),
    ).rejects.toBeInstanceOf(IdentityDomainError);
  });
});
