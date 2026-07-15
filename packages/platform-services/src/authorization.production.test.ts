import { describe, expect, it } from "vitest";

import { generateGlobalId } from "./mapping/global-id";
import { InMemoryEntityMappingStore } from "./mapping/in-memory-entity-mapping-store";
import { RequestPipeline } from "./execution/request-pipeline";
import { InMemoryAuthorizationAuditSink } from "./authorization/authorization-audit";
import {
  assertAuthorizationProviderModeAllowed,
  createAuthorizationProvider,
  createAuthorizationRuntime,
  resolveAuthorizationProviderMode,
} from "./authorization/create-authorization-provider";
import { ProductionAuthorizationProvider } from "./authorization/production-authorization-provider";
import { DenyAllAuthorizationProvider } from "./authorization/production-authorization-provider";
import { AllowAllAuthorizationProvider } from "./authorization/authorization-provider";
import { createDefaultProductionPolicies } from "./authorization/production-policies";
import { resolveOperationAuthorization } from "./authorization/operation-authorization-map";
import { PLATFORM_SERVICE_PERMISSION_CATALOGUE } from "./authorization/permission-catalogue";
import { createPlatformServices } from "./services/create-platform-services";
import { ProviderRegistry } from "./providers/registry/provider-registry";
import { createMockProjectProvider } from "./testing/mock-providers";
import {
  AUTH_TEST_ORG_1,
  AUTH_TEST_ORG_2,
  AUTH_TEST_TENANT_A,
  AUTH_TEST_TENANT_B,
  buildActiveSnapshot,
  buildServiceContext,
  createAuthzTestResolver,
} from "./testing/authorization-fixtures";

describe("permission catalogue and operation mapping", () => {
  it("exposes deterministic catalogue entries", () => {
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("project.create");
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("platform.impersonation.use");
  });

  it("maps gateway operations to permissions explicitly", () => {
    expect(resolveOperationAuthorization("project", "createProject")).toMatchObject({
      requiredPermission: "project.create",
      resourceType: "project",
      action: "create",
    });
    expect(resolveOperationAuthorization("workspace", "getWorkspace")).toMatchObject({
      requiredPermission: "workspace.read",
      resourceIdArgIndex: 0,
    });
    expect(resolveOperationAuthorization("search", "search")?.requiredPermission).toBe(
      "search.execute",
    );
  });
});

describe("ProductionAuthorizationProvider", () => {
  const resolver = createAuthzTestResolver();
  const provider = new ProductionAuthorizationProvider({ accessResolver: resolver });

  it("allows authenticated actors with grants", async () => {
    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "user-standard" }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
      resource: { type: "project", tenantId: AUTH_TEST_TENANT_A },
    });
    expect(decision.effect).toBe("allow");
  });

  it("denies anonymous actors", async () => {
    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "anonymous" }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
    });
    expect(decision).toMatchObject({ effect: "deny", denialCode: "unauthenticated" });
  });

  it("denies inactive and suspended actors", async () => {
    await expect(
      provider.authorize({
        context: buildServiceContext({ userId: "user-inactive" }),
        action: { name: "project.listProjects" },
        requiredPermissions: ["project.list"],
      }),
    ).resolves.toMatchObject({ effect: "deny", denialCode: "inactive_actor" });

    await expect(
      provider.authorize({
        context: buildServiceContext({ userId: "user-suspended" }),
        action: { name: "project.listProjects" },
        requiredPermissions: ["project.list"],
      }),
    ).resolves.toMatchObject({ effect: "deny", denialCode: "inactive_actor" });
  });

  it("enforces tenant membership", async () => {
    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "user-orphan" }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
    });
    expect(decision).toMatchObject({
      effect: "deny",
      denialCode: "tenant_membership_required",
    });
  });

  it("enforces organisation scope", async () => {
    const decision = await provider.authorize({
      context: buildServiceContext({
        userId: "user-org",
        organisationId: AUTH_TEST_ORG_2,
      }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
    });
    expect(decision).toMatchObject({
      effect: "deny",
      denialCode: "organisation_scope_mismatch",
    });
  });

  it("honours explicit deny over allow", async () => {
    resolver.set(
      "user-denied",
      AUTH_TEST_TENANT_A,
      buildActiveSnapshot({
        userId: "user-denied",
        allowPermissions: ["project.*"],
        denyPermissions: ["project.create"],
      }),
    );

    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "user-denied" }),
      action: { name: "project.createProject" },
      requiredPermissions: ["project.create"],
    });
    expect(decision).toMatchObject({ effect: "deny", denialCode: "permission_denied" });
  });

  it("allows platform administrator override", async () => {
    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "user-admin" }),
      action: { name: "project.createProject" },
      requiredPermissions: ["project.create"],
    });
    expect(decision).toMatchObject({
      effect: "allow",
      reason: "platform-administrator-override",
    });
  });

  it("denies standard user without grant", async () => {
    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "user-standard" }),
      action: { name: "project.createProject" },
      requiredPermissions: ["project.create"],
    });
    expect(decision.effect).toBe("deny");
  });

  it("does not trust client-supplied permissions alone", async () => {
    const decision = await provider.authorize({
      context: buildServiceContext({
        userId: "user-standard",
        permissions: ["*", "project.create"],
      }),
      action: { name: "project.createProject" },
      requiredPermissions: ["project.create"],
    });
    expect(decision.effect).toBe("deny");
  });

  it("allows impersonation with permission and blocks privilege escalation", async () => {
    const allowed = await provider.authorize({
      context: buildServiceContext({
        userId: "user-standard",
        impersonation: { actorUserId: "user-impersonator", reason: "support" },
      }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
    });
    expect(allowed.effect).toBe("allow");

    const escalated = await provider.authorize({
      context: buildServiceContext({
        userId: "user-admin",
        impersonation: { actorUserId: "user-impersonator", reason: "support" },
      }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
    });
    expect(escalated).toMatchObject({
      effect: "deny",
      denialCode: "privilege_escalation_denied",
    });

    const withoutPermission = await provider.authorize({
      context: buildServiceContext({
        userId: "user-standard",
        impersonation: { actorUserId: "user-manager", reason: "support" },
      }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
    });
    expect(withoutPermission).toMatchObject({
      effect: "deny",
      denialCode: "impersonation_denied",
    });
  });

  it("supports resource membership grants", async () => {
    const projectId = generateGlobalId("project");
    resolver.set(
      "user-member",
      AUTH_TEST_TENANT_A,
      buildActiveSnapshot({
        userId: "user-member",
        allowPermissions: [],
        resourceMemberships: [
          {
            resourceType: "project",
            resourceId: projectId,
            tenantId: AUTH_TEST_TENANT_A,
            relation: "member",
          },
        ],
      }),
    );

    const decision = await provider.authorize({
      context: buildServiceContext({ userId: "user-member" }),
      action: { name: "project.getProject" },
      requiredPermissions: ["project.read"],
      resource: { type: "project", id: projectId, tenantId: AUTH_TEST_TENANT_A },
    });
    expect(decision.effect).toBe("allow");
  });
});

describe("production policies and pipeline enforcement", () => {
  it("denies before service execution when permission is missing", async () => {
    const resolver = createAuthzTestResolver();
    const audit = new InMemoryAuthorizationAuditSink();
    let invoked = false;

    const pipeline = new RequestPipeline({
      authorization: new ProductionAuthorizationProvider({ accessResolver: resolver }),
      policies: createDefaultProductionPolicies({ accessResolver: resolver }),
      auditSink: audit,
    });

    await expect(
      pipeline.execute({
        service: "project",
        operation: "createProject",
        context: buildServiceContext({ userId: "user-standard" }),
        args: [buildServiceContext({ userId: "user-standard" }), { name: "X" }],
        invoke: async () => {
          invoked = true;
          return true;
        },
      }),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });

    expect(invoked).toBe(false);
    expect(audit.events.some((event) => event.decision === "deny")).toBe(true);
    expect(JSON.stringify(audit.events)).not.toMatch(/password|token|secret/i);
  });

  it("allows manager create and records allow audit", async () => {
    const resolver = createAuthzTestResolver();
    const audit = new InMemoryAuthorizationAuditSink();
    const pipeline = new RequestPipeline({
      authorization: new ProductionAuthorizationProvider({ accessResolver: resolver }),
      policies: createDefaultProductionPolicies({ accessResolver: resolver }),
      auditSink: audit,
    });

    await expect(
      pipeline.execute({
        service: "project",
        operation: "createProject",
        context: buildServiceContext({ userId: "user-manager" }),
        args: [buildServiceContext({ userId: "user-manager" })],
        invoke: async () => ({ ok: true }),
      }),
    ).resolves.toEqual({ ok: true });

    expect(audit.events.at(-1)).toMatchObject({
      decision: "allow",
      permission: "project.create",
      correlationId: "corr-auth-test",
    });
  });

  it("policy denial prevents authorization provider and service execution", async () => {
    const resolver = createAuthzTestResolver();
    let authCalled = false;
    let invoked = false;

    const pipeline = new RequestPipeline({
      authorization: {
        async authorize() {
          authCalled = true;
          return { effect: "allow" };
        },
      },
      policies: createDefaultProductionPolicies({
        accessResolver: resolver,
        isMaintenanceMode: () => true,
      }),
    });

    await expect(
      pipeline.execute({
        service: "project",
        operation: "createProject",
        context: buildServiceContext({ userId: "user-manager" }),
        args: [buildServiceContext({ userId: "user-manager" })],
        invoke: async () => {
          invoked = true;
          return true;
        },
      }),
    ).rejects.toMatchObject({ code: "POLICY_DENIED" });

    expect(authCalled).toBe(false);
    expect(invoked).toBe(false);
  });
});

describe("tenant isolation with mapping-aware operations", () => {
  it("denies cross-tenant access by guessed global ID", async () => {
    const resolver = createAuthzTestResolver();
    const mappingStore = new InMemoryEntityMappingStore();
    const projectId = generateGlobalId("project");

    await mappingStore.create({
      platformId: projectId,
      entityType: "project",
      providerId: "mock-project",
      integrationId: "mock",
      providerNativeId: "native-1",
      tenantId: AUTH_TEST_TENANT_B,
    });

    const registry = new ProviderRegistry();
    registry.register({
      providerId: "mock-project",
      integrationId: "mock",
      capability: "project",
      priority: 10,
      provider: createMockProjectProvider({
        async getProject() {
          return {
            id: projectId,
            tenantId: AUTH_TEST_TENANT_B,
            workspaceId: generateGlobalId("workspace"),
            name: "Secret",
            identifier: "SEC",
            status: "active",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          };
        },
      }),
    });

    const services = createPlatformServices({
      registry,
      mappingStore,
      authorizationMode: "production",
      accessResolver: resolver,
    });

    await expect(
      services.gateway.projects.getProject(
        buildServiceContext({ userId: "user-manager" }),
        projectId,
      ),
    ).rejects.toMatchObject({ code: "POLICY_DENIED" });
  });

  it("allows same-tenant mapped project read for permitted user", async () => {
    const resolver = createAuthzTestResolver();
    const mappingStore = new InMemoryEntityMappingStore();
    const projectId = generateGlobalId("project");
    const workspaceId = generateGlobalId("workspace");

    await mappingStore.create({
      platformId: projectId,
      entityType: "project",
      providerId: "mock-project",
      integrationId: "mock",
      providerNativeId: "native-ok",
      tenantId: AUTH_TEST_TENANT_A,
    });

    const registry = new ProviderRegistry();
    registry.register({
      providerId: "mock-project",
      integrationId: "mock",
      capability: "project",
      priority: 10,
      provider: createMockProjectProvider({
        async getProject() {
          return {
            id: "native-ok",
            tenantId: AUTH_TEST_TENANT_A,
            workspaceId,
            name: "Visible",
            identifier: "VIS",
            status: "active",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          };
        },
      }),
    });

    const services = createPlatformServices({
      registry,
      mappingStore,
      authorizationMode: "production",
      accessResolver: resolver,
    });

    const project = await services.gateway.projects.getProject(
      buildServiceContext({ userId: "user-standard" }),
      projectId,
    );
    expect(project.name).toBe("Visible");
  });
});

describe("authorization bootstrap", () => {
  it("defaults to allow-all outside production and production in production", () => {
    expect(resolveAuthorizationProviderMode({ NODE_ENV: "test" }).mode).toBe("allow-all");
    expect(resolveAuthorizationProviderMode({ NODE_ENV: "production" }).mode).toBe(
      "production",
    );
  });

  it("rejects allow-all in production without escape hatch", () => {
    expect(() =>
      assertAuthorizationProviderModeAllowed("allow-all", { NODE_ENV: "production" }),
    ).toThrow(/Allow-all authorisation is not permitted/);
  });

  it("allows explicit allow-all in production with escape hatch", () => {
    expect(() =>
      assertAuthorizationProviderModeAllowed("allow-all", {
        NODE_ENV: "production",
        AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION: "true",
      }),
    ).not.toThrow();
  });

  it("creates deny-all and allow-all providers", () => {
    expect(createAuthorizationProvider({ mode: "allow-all" })).toBeInstanceOf(
      AllowAllAuthorizationProvider,
    );
    expect(createAuthorizationProvider({ mode: "deny-all" })).toBeInstanceOf(
      DenyAllAuthorizationProvider,
    );
  });

  it("fails clearly when production mode lacks access resolver", () => {
    expect(() =>
      createAuthorizationRuntime({
        mode: "production",
        env: { NODE_ENV: "test" },
      }),
    ).toThrow(/requires an AuthorizationAccessResolver/);
  });

  it("wires production runtime with policies", () => {
    const resolver = createAuthzTestResolver();
    const runtime = createAuthorizationRuntime({
      mode: "production",
      accessResolver: resolver,
    });
    expect(runtime.provider).toBeInstanceOf(ProductionAuthorizationProvider);
    expect(runtime.policies.length).toBeGreaterThan(0);
  });
});

describe("public denial errors", () => {
  it("does not leak internal evaluation details", async () => {
    const resolver = createAuthzTestResolver();
    const pipeline = new RequestPipeline({
      authorization: new ProductionAuthorizationProvider({ accessResolver: resolver }),
      policies: createDefaultProductionPolicies({ accessResolver: resolver }),
    });

    try {
      await pipeline.execute({
        service: "project",
        operation: "createProject",
        context: buildServiceContext({ userId: "user-standard" }),
        args: [buildServiceContext({ userId: "user-standard" })],
        invoke: async () => true,
      });
      expect.unreachable("expected denial");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toMatch(/role-platform-admin|wildcard|grantType/i);
      expect(message).toBe("Permission denied");
    }
  });
});

describe("organisation-scoped allow", () => {
  it("allows when organisation membership matches", async () => {
    const resolver = createAuthzTestResolver();
    const provider = new ProductionAuthorizationProvider({ accessResolver: resolver });
    const decision = await provider.authorize({
      context: buildServiceContext({
        userId: "user-org",
        organisationId: AUTH_TEST_ORG_1,
      }),
      action: { name: "project.listProjects" },
      requiredPermissions: ["project.list"],
    });
    expect(decision.effect).toBe("allow");
  });
});
