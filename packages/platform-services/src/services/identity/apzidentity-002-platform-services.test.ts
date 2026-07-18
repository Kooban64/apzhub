/**
 * APZIDENTITY-002 — Identity Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_IDENTITY_PERMISSIONS } from "@apzhub/identity-contracts";
import { IdentityDomainError } from "@apzhub/identity-core";

import {
  createIdentityPlatformServicesForProduction,
  createIdentityPlatformServicesForTest,
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
  isIdentityServiceEnabled,
  mapIdentityDomainError,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  resolveOperationAuthorization,
} from "../../index";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_iam",
    userId: "user_iam",
    organisationId: "org_iam",
    correlationId: "corr_apzidentity_002",
    permissions: ["identity.*"],
    ...overrides,
  };
}

describe("APZIDENTITY-002 identity platform services", () => {
  it("exports platform services version 0.25.0", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.25.0");
  });

  it("registers identity permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_IDENTITY_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to identity permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("identityUsers", "create")?.requiredPermission,
    ).toBe("identity.user");
    expect(
      resolveOperationAuthorization("identityGroups", "list")?.requiredPermission,
    ).toBe("identity.group");
    expect(
      resolveOperationAuthorization("identityRoles", "get")?.requiredPermission,
    ).toBe("identity.role");
    expect(
      resolveOperationAuthorization("identityOrganisations", "create")
        ?.requiredPermission,
    ).toBe("identity.organization");
    expect(
      resolveOperationAuthorization("identityTenants", "list")?.requiredPermission,
    ).toBe("identity.tenant");
    expect(
      resolveOperationAuthorization("identityServiceAssignments", "create")
        ?.requiredPermission,
    ).toBe("identity.assignment");
    expect(
      resolveOperationAuthorization("identityAudit", "list")?.requiredPermission,
    ).toBe("identity.audit");
    expect(
      resolveOperationAuthorization("identityDiagnostics", "health")
        ?.requiredPermission,
    ).toBe("identity.read");
    expect(
      resolveOperationAuthorization("identityMemberships", "create")
        ?.requiredPermission,
    ).toBe("identity.user");
    expect(
      resolveOperationAuthorization("identityInvitations", "create")
        ?.requiredPermission,
    ).toBe("identity.manage");
  });

  it("ForTest requires allowInMemoryPersistence without postgres", () => {
    expect(() => createIdentityPlatformServicesForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() => createIdentityPlatformServicesForProduction({} as never)).toThrow(
      /postgresDb/,
    );
  });

  it("env gate is deny-by-default", () => {
    expect(isIdentityServiceEnabled({})).toBe(false);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "true" })).toBe(true);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "1" })).toBe(true);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "on" })).toBe(true);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "false" })).toBe(false);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "0" })).toBe(false);
    expect(isIdentityServiceEnabled({ APZHUB_IDENTITY_ENABLED: "off" })).toBe(false);
  });

  it("maps IdentityDomainError to PlatformServiceError", () => {
    const mapped = mapIdentityDomainError(
      new IdentityDomainError("not_found", "missing", { id: "x" }),
      "corr",
    );
    expect(isPlatformServiceError(mapped)).toBe(true);
    expect(mapped.code).toBe("NOT_FOUND");
    expect(
      mapIdentityDomainError(new IdentityDomainError("validation_error", "bad"), "c")
        .code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapIdentityDomainError(
        new IdentityDomainError("invalid_lifecycle_transition", "nope"),
        "c",
      ).code,
    ).toBe("BUSINESS_RULE_VIOLATION");
    expect(
      mapIdentityDomainError(new IdentityDomainError("duplicate", "dup"), "c").code,
    ).toBe("CONFLICT");
    expect(
      mapIdentityDomainError(
        new IdentityDomainError("credentials_forbidden", "no"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapIdentityDomainError(new IdentityDomainError("forbidden", "no"), "c").code,
    ).toBe("FORBIDDEN");
  });

  it("wires gateway.identity through RequestPipeline with allow-all for functional test", async () => {
    let seq = 0;
    const identity = createIdentityPlatformServicesForTest({
      allowInMemoryPersistence: true,
      id: () => `iam_test_${++seq}`,
    });
    const bundle = createPlatformServices({
      identity,
      authorizationMode: "allow-all",
    });

    const user = await bundle.gateway.identity.users.create(ctx(), {
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      authSubjectRef: "auth:ada",
    });
    expect(user.status).toBe("draft");
    expect(await bundle.gateway.identity.users.get(ctx(), user.id)).toMatchObject({
      displayName: "Ada Lovelace",
    });
    expect(await bundle.gateway.identity.users.list(ctx())).toHaveLength(1);

    const updated = await bundle.gateway.identity.users.update(ctx(), {
      userId: user.id,
      displayName: "Ada",
    });
    expect(updated.displayName).toBe("Ada");

    const group = await bundle.gateway.identity.groups.create(ctx(), {
      key: "engineers",
      name: "Engineers",
    });
    await bundle.gateway.identity.groups.update(ctx(), {
      groupId: group.id,
      name: "Engineering",
    });
    expect(await bundle.gateway.identity.groups.list(ctx())).toHaveLength(1);
    expect(await bundle.gateway.identity.groups.get(ctx(), group.id)).toMatchObject({
      name: "Engineering",
    });

    const role = await bundle.gateway.identity.roles.create(ctx(), {
      key: "member",
      name: "Member",
    });
    await bundle.gateway.identity.roles.update(ctx(), {
      roleId: role.id,
      name: "Member 2",
    });
    expect(await bundle.gateway.identity.roles.get(ctx(), role.id)).toBeDefined();
    expect(await bundle.gateway.identity.roles.list(ctx())).toHaveLength(1);

    const org = await bundle.gateway.identity.organisations.create(ctx(), {
      key: "apz",
      name: "APZ",
    });
    await bundle.gateway.identity.organisations.update(ctx(), {
      organisationId: org.id,
      name: "APZHUB",
    });
    expect(
      await bundle.gateway.identity.organisations.get(ctx(), org.id),
    ).toMatchObject({ name: "APZHUB" });
    expect(await bundle.gateway.identity.organisations.list(ctx())).toHaveLength(1);

    const tenant = await bundle.gateway.identity.tenants.create(ctx(), {
      key: "t1",
      name: "Tenant 1",
    });
    await bundle.gateway.identity.tenants.update(ctx(), {
      tenantRecordId: tenant.id,
      name: "Tenant One",
    });
    expect(await bundle.gateway.identity.tenants.get(ctx(), tenant.id)).toMatchObject({
      name: "Tenant One",
    });
    expect(await bundle.gateway.identity.tenants.list(ctx())).toHaveLength(1);

    const dept = await bundle.gateway.identity.departments.create(ctx(), {
      organisationId: org.id,
      key: "eng",
      name: "Engineering",
    });
    await bundle.gateway.identity.departments.update(ctx(), {
      departmentId: dept.id,
      name: "Eng",
    });
    expect(await bundle.gateway.identity.departments.get(ctx(), dept.id)).toBeDefined();
    expect(await bundle.gateway.identity.departments.list(ctx())).toHaveLength(1);

    const position = await bundle.gateway.identity.positions.create(ctx(), {
      key: "dev",
      name: "Developer",
    });
    await bundle.gateway.identity.positions.update(ctx(), {
      positionId: position.id,
      name: "Dev",
    });
    expect(
      await bundle.gateway.identity.positions.get(ctx(), position.id),
    ).toBeDefined();
    expect(await bundle.gateway.identity.positions.list(ctx())).toHaveLength(1);

    const membership = await bundle.gateway.identity.memberships.create(ctx(), {
      userId: user.id,
      kind: "group",
      targetId: group.id,
    });
    expect(membership.status).toBe("active");
    await bundle.gateway.identity.memberships.update(ctx(), {
      membershipId: membership.id,
      status: "suspended",
    });
    expect(
      await bundle.gateway.identity.memberships.get(ctx(), membership.id),
    ).toMatchObject({ status: "suspended" });
    expect(await bundle.gateway.identity.memberships.list(ctx())).toHaveLength(1);

    const assignment = await bundle.gateway.identity.serviceAssignments.create(ctx(), {
      subjectKind: "user",
      subjectId: user.id,
      serviceCapability: "projects",
    });
    expect(assignment.serviceCapability).toBe("projects");
    const wfEngine = await bundle.gateway.identity.serviceAssignments.create(ctx(), {
      subjectKind: "user",
      subjectId: user.id,
      serviceCapability: "workflow-engine",
    });
    expect(wfEngine.serviceCapability).toBe("workflow-engine");
    await bundle.gateway.identity.serviceAssignments.update(ctx(), {
      assignmentId: assignment.id,
      status: "suspended",
    });
    expect(
      await bundle.gateway.identity.serviceAssignments.get(ctx(), assignment.id),
    ).toBeDefined();
    expect(await bundle.gateway.identity.serviceAssignments.list(ctx())).toHaveLength(
      2,
    );

    const invitation = await bundle.gateway.identity.invitations.create(ctx(), {
      email: "invitee@example.com",
    });
    await bundle.gateway.identity.invitations.update(ctx(), {
      invitationId: invitation.id,
      status: "accepted",
    });
    expect(
      await bundle.gateway.identity.invitations.get(ctx(), invitation.id),
    ).toBeDefined();
    expect(await bundle.gateway.identity.invitations.list(ctx())).toHaveLength(1);

    const activation = await bundle.gateway.identity.activation.create(ctx(), {
      userId: user.id,
      reason: "onboard",
    });
    expect(activation.userId).toBe(user.id);
    expect((await bundle.gateway.identity.users.get(ctx(), user.id)).status).toBe(
      "active",
    );
    expect(
      await bundle.gateway.identity.activation.get(ctx(), activation.id),
    ).toBeDefined();
    expect(await bundle.gateway.identity.activation.list(ctx())).toHaveLength(1);

    const deactivation = await bundle.gateway.identity.deactivation.create(ctx(), {
      userId: user.id,
      reason: "offboard",
    });
    expect((await bundle.gateway.identity.users.get(ctx(), user.id)).status).toBe(
      "deactivated",
    );
    expect(
      await bundle.gateway.identity.deactivation.get(ctx(), deactivation.id),
    ).toBeDefined();
    expect(await bundle.gateway.identity.deactivation.list(ctx())).toHaveLength(1);

    const policy = await bundle.gateway.identity.policies.create(ctx(), {
      key: "default",
      name: "Default",
      kind: "access",
    });
    await bundle.gateway.identity.policies.update(ctx(), {
      policyId: policy.id,
      name: "Default 2",
    });
    expect(await bundle.gateway.identity.policies.get(ctx(), policy.id)).toBeDefined();
    expect(await bundle.gateway.identity.policies.list(ctx())).toHaveLength(1);

    const reference = await bundle.gateway.identity.references.create(ctx(), {
      kind: "external",
      target: "doc:1",
      userId: user.id,
    });
    await bundle.gateway.identity.references.update(ctx(), {
      referenceId: reference.id,
      label: "Doc",
    });
    expect(
      await bundle.gateway.identity.references.get(ctx(), reference.id),
    ).toMatchObject({ label: "Doc" });
    expect(await bundle.gateway.identity.references.list(ctx(), user.id)).toHaveLength(
      1,
    );

    const audits = await bundle.gateway.identity.audit.list(ctx());
    expect(audits.length).toBeGreaterThan(0);
    expect(await bundle.gateway.identity.audit.get(ctx(), audits[0]!.id)).toBeDefined();

    const history = await bundle.gateway.identity.history.list(ctx(), user.id);
    expect(history.length).toBeGreaterThan(0);
    expect(
      await bundle.gateway.identity.history.get(ctx(), history[0]!.id),
    ).toBeDefined();

    const health = await bundle.gateway.identity.diagnostics.health(ctx());
    expect(health.ok).toBe(true);
    const readiness = await bundle.gateway.identity.diagnostics.readiness(ctx());
    expect(readiness.httpEnabled).toBe(false);
    expect(readiness.authenticationManaged).toBe(false);
    expect(readiness.provisioningEnabled).toBe(false);
    expect(readiness.facets).toContain("users");
    expect(readiness.serviceCapabilities).toContain("workflow-engine");
    const caps = await bundle.gateway.identity.diagnostics.capabilities(ctx());
    expect(caps.facets).toContain("serviceAssignments");

    expect(identity.readiness.authenticationManaged).toBe(false);
    expect(identity.readiness.persistenceMode).toBe("memory");
  });

  it("throws when identity gateway is not enabled", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.identity).toThrow(/not enabled/);
  });

  it("enforces production authorization deny-by-default on identity ops", async () => {
    const identity = createIdentityPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const bundle = createPlatformServices({
      identity,
      authorizationMode: "production",
      accessResolver,
    });

    await expect(
      bundle.gateway.identity.users.list(ctx({ permissions: [] })),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));
  });

  it("covers remaining factory and error-mapping branches", async () => {
    const persistence = (
      await import("@apzhub/identity-persistence")
    ).createIdentityPersistenceForTest({ allowInMemoryPersistence: true });
    const composed = (
      await import("./create-identity-platform-services")
    ).createIdentityPlatformServices({
      persistence,
      persistenceMode: "memory",
    });
    expect(composed.readiness.identityEnabled).toBe(true);

    const { wrapIdentityPlatformGatewayWithPipeline } =
      await import("./create-identity-platform-services");
    const wrapped = wrapIdentityPlatformGatewayWithPipeline(composed.gatewaySurface, {
      execute: async (request: {
        invoke: (ctx: ServiceRequestContext, args: unknown[]) => Promise<unknown>;
        context: ServiceRequestContext;
        args: unknown[];
      }) => request.invoke(request.context, request.args),
    } as never);
    expect(await wrapped.users.list(ctx())).toEqual([]);

    const production = (
      await import("./create-identity-platform-services")
    ).createIdentityPlatformServicesForProduction({
      postgresDb: { execute: async () => [] } as never,
    });
    expect(production.readiness.persistenceMode).toBe("postgres");

    expect(
      mapIdentityDomainError(
        new IdentityDomainError("secret_metadata_forbidden", "x"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapIdentityDomainError(new IdentityDomainError("invalid_display_name", "x"), "c")
        .code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapIdentityDomainError(new IdentityDomainError("conflict", "x"), "c").code,
    ).toBe("CONFLICT");
    expect(
      mapIdentityDomainError(new IdentityDomainError("assignment_not_active", "x"), "c")
        .code,
    ).toBe("BUSINESS_RULE_VIOLATION");

    const { createIdentityPlatformServiceImpls } =
      await import("./identity-service-impls");
    const domain = (
      await import("@apzhub/identity-core")
    ).createPlatformIdentityService({
      repos: persistence,
      now: () => "2026-07-16T00:00:00.000Z",
      id: () => "x",
      persistenceMode: "memory",
    });
    const impls = createIdentityPlatformServiceImpls({ domain });
    await expect(impls.users.get(ctx(), "missing" as never)).rejects.toSatisfy(
      (error: unknown) => {
        return (
          isPlatformServiceError(error) &&
          (error as { code: string }).code === "NOT_FOUND"
        );
      },
    );

    const failingDomain = {
      ...domain,
      listUsers: async () => {
        throw new Error('relation "platform_iam_user" does not exist');
      },
      listGroups: async () => {
        throw new Error("unexpected boom");
      },
    };
    const failingImpls = createIdentityPlatformServiceImpls({
      domain: failingDomain as never,
    });
    await expect(failingImpls.users.list(ctx())).rejects.toSatisfy(
      (error: unknown) =>
        isPlatformServiceError(error) &&
        (error as { code: string }).code === "PROVIDER_UNAVAILABLE",
    );
    await expect(failingImpls.groups.list(ctx())).rejects.toSatisfy(
      (error: unknown) =>
        isPlatformServiceError(error) &&
        (error as { code: string }).code === "INTERNAL_ERROR",
    );
  });
});
