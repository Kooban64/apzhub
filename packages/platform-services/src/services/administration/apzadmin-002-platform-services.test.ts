/**
 * APZADMIN-002 — Administration Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_ADMIN_PERMISSIONS } from "@apzhub/admin-contracts";
import { AdministrationDomainError } from "@apzhub/admin-core";

import {
  createAdministrationPlatformServicesForProduction,
  createAdministrationPlatformServicesForTest,
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
  isAdministrationServiceEnabled,
  mapAdministrationDomainError,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  resolveOperationAuthorization,
} from "../../index";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_adm",
    userId: "user_adm",
    organisationId: "org_adm",
    correlationId: "corr_apzadmin_002",
    permissions: ["admin.*"],
    ...overrides,
  };
}

describe("APZADMIN-002 administration platform services", () => {
  it("exports platform services version 0.26.1", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.32.0");
  });

  it("registers admin permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_ADMIN_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to admin permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("administrationModules", "create")
        ?.requiredPermission,
    ).toBe("admin.manage");
    expect(
      resolveOperationAuthorization("administrationModules", "get")?.requiredPermission,
    ).toBe("admin.read");
    expect(
      resolveOperationAuthorization("administrationAudit", "list")?.requiredPermission,
    ).toBe("admin.audit");
    expect(
      resolveOperationAuthorization("administrationPolicies", "create")
        ?.requiredPermission,
    ).toBe("admin.policy");
    expect(
      resolveOperationAuthorization("administrationDiagnostics", "health")
        ?.requiredPermission,
    ).toBe("admin.diagnostics");
    expect(
      resolveOperationAuthorization("administrationNavigations", "list")
        ?.requiredPermission,
    ).toBe("admin.navigation");
    expect(
      resolveOperationAuthorization("administrationRegistrations", "create")
        ?.requiredPermission,
    ).toBe("admin.registration");
  });

  it("ForTest requires allowInMemoryPersistence without postgres", () => {
    expect(() => createAdministrationPlatformServicesForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() =>
      createAdministrationPlatformServicesForProduction({} as never),
    ).toThrow(/postgresDb/);
  });

  it("env gate is deny-by-default", () => {
    expect(isAdministrationServiceEnabled({})).toBe(false);
    expect(
      isAdministrationServiceEnabled({ APZHUB_ADMINISTRATION_ENABLED: "true" }),
    ).toBe(true);
    expect(
      isAdministrationServiceEnabled({ APZHUB_ADMINISTRATION_ENABLED: "false" }),
    ).toBe(false);
  });

  it("maps AdministrationDomainError to PlatformServiceError", () => {
    const mapped = mapAdministrationDomainError(
      new AdministrationDomainError("not_found", "missing", { id: "x" }),
      "corr",
    );
    expect(isPlatformServiceError(mapped)).toBe(true);
    expect(mapped.code).toBe("NOT_FOUND");
    expect(
      mapAdministrationDomainError(
        new AdministrationDomainError("validation_error", "bad"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapAdministrationDomainError(
        new AdministrationDomainError("invalid_lifecycle_transition", "nope"),
        "c",
      ).code,
    ).toBe("BUSINESS_RULE_VIOLATION");
    expect(
      mapAdministrationDomainError(
        new AdministrationDomainError("duplicate", "dup"),
        "c",
      ).code,
    ).toBe("CONFLICT");
  });

  it("wires gateway.administration through RequestPipeline with allow-all for functional test", async () => {
    let seq = 0;
    const administration = createAdministrationPlatformServicesForTest({
      allowInMemoryPersistence: true,
      id: () => `adm_test_${++seq}`,
    });
    const bundle = createPlatformServices({
      administration,
      authorizationMode: "allow-all",
    });

    const created = await bundle.gateway.administration.modules.create(ctx(), {
      key: "configuration",
      name: "Configuration",
      description: "Config admin module",
    });
    expect(created.status).toBe("draft");

    const got = await bundle.gateway.administration.modules.get(ctx(), created.id);
    expect(got.id).toBe(created.id);

    const listed = await bundle.gateway.administration.modules.list(ctx());
    expect(listed).toHaveLength(1);

    const updated = await bundle.gateway.administration.modules.updateMetadata(ctx(), {
      moduleId: created.id,
      name: "Configuration Admin",
    });
    expect(updated.name).toBe("Configuration Admin");

    const registered = await bundle.gateway.administration.modules.transition(ctx(), {
      moduleId: created.id,
      to: "registered",
    });
    expect(registered.status).toBe("registered");

    await bundle.gateway.administration.modules.transition(ctx(), {
      moduleId: created.id,
      to: "active",
    });

    const archived = await bundle.gateway.administration.modules.archive(
      ctx(),
      created.id,
    );
    expect(archived.status).toBe("archived");

    const restored = await bundle.gateway.administration.modules.restore(
      ctx(),
      created.id,
    );
    expect(restored.status).toBe("draft");

    const category = await bundle.gateway.administration.categories.create(ctx(), {
      key: "general",
      name: "General",
      moduleId: created.id,
    });
    await bundle.gateway.administration.categories.update(ctx(), {
      categoryId: category.id,
      name: "General 2",
    });

    const section = await bundle.gateway.administration.sections.create(ctx(), {
      categoryId: category.id,
      key: "overview",
      name: "Overview",
    });
    await bundle.gateway.administration.sections.update(ctx(), {
      sectionId: section.id,
      name: "Overview 2",
    });

    const action = await bundle.gateway.administration.actions.create(ctx(), {
      key: "view",
      name: "View",
      kind: "view",
      moduleId: created.id,
    });
    await bundle.gateway.administration.actions.update(ctx(), {
      actionId: action.id,
      name: "View 2",
    });

    const permission = await bundle.gateway.administration.permissions.create(ctx(), {
      key: "admin.read",
      name: "Read",
    });
    await bundle.gateway.administration.permissions.update(ctx(), {
      permissionId: permission.id,
      name: "Read Admin",
    });

    const registration = await bundle.gateway.administration.registrations.create(
      ctx(),
      {
        moduleKey: "configuration",
        version: "1.0.0",
      },
    );
    expect(registration.status).toBe("registered");

    const metadata = await bundle.gateway.administration.metadata.create(ctx(), {
      moduleId: created.id,
      tags: ["core"],
    });
    await bundle.gateway.administration.metadata.update(ctx(), {
      metadataId: metadata.id,
      notes: "ok",
    });

    const policy = await bundle.gateway.administration.policies.create(ctx(), {
      kind: "access",
      key: "default",
      name: "Default",
      moduleId: created.id,
    });
    await bundle.gateway.administration.policies.update(ctx(), {
      policyId: policy.id,
      name: "Default 2",
    });

    const ref = await bundle.gateway.administration.references.create(ctx(), {
      moduleId: created.id,
      kind: "documentation",
      resourceId: "doc_1",
    });
    expect(
      await bundle.gateway.administration.references.get(ctx(), ref.id),
    ).toMatchObject({ kind: "documentation" });

    const capability = await bundle.gateway.administration.capabilities.create(ctx(), {
      moduleId: created.id,
      key: "cfg.admin",
      name: "Config Admin",
      owner: "platform",
      version: "0.1.0",
    });
    expect(capability.key).toBe("cfg.admin");

    const navigation = await bundle.gateway.administration.navigations.create(ctx(), {
      moduleId: created.id,
      key: "home",
      label: "Home",
      ordering: 1,
      visibility: "visible",
    });
    await bundle.gateway.administration.navigations.update(ctx(), {
      navigationId: navigation.id,
      label: "Home 2",
    });

    const shortcut = await bundle.gateway.administration.shortcuts.create(ctx(), {
      key: "go",
      label: "Go",
      ordering: 1,
      moduleId: created.id,
    });
    await bundle.gateway.administration.shortcuts.update(ctx(), {
      shortcutId: shortcut.id,
      label: "Go 2",
    });

    const dashboard = await bundle.gateway.administration.dashboards.create(ctx(), {
      key: "main",
      name: "Main",
      moduleId: created.id,
    });
    const widget = await bundle.gateway.administration.widgets.create(ctx(), {
      dashboardId: dashboard.id,
      key: "summary",
      name: "Summary",
      kind: "summary",
    });
    expect(widget.kind).toBe("summary");
    await bundle.gateway.administration.widgets.update(ctx(), {
      widgetId: widget.id,
      name: "Summary 2",
    });
    expect(
      await bundle.gateway.administration.widgets.get(ctx(), widget.id),
    ).toMatchObject({ name: "Summary 2" });
    expect(
      await bundle.gateway.administration.widgets.list(ctx(), dashboard.id),
    ).toHaveLength(1);

    expect(await bundle.gateway.administration.categories.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.categories.get(ctx(), category.id),
    ).toBeDefined();
    expect(await bundle.gateway.administration.sections.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.sections.get(ctx(), section.id),
    ).toBeDefined();
    expect(await bundle.gateway.administration.actions.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.actions.get(ctx(), action.id),
    ).toBeDefined();
    expect(await bundle.gateway.administration.permissions.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.permissions.get(ctx(), permission.id),
    ).toBeDefined();
    expect(await bundle.gateway.administration.registrations.list(ctx())).toHaveLength(
      1,
    );
    expect(
      await bundle.gateway.administration.registrations.get(ctx(), registration.id),
    ).toBeDefined();
    await bundle.gateway.administration.registrations.update(ctx(), {
      registrationId: registration.id,
      version: "1.0.1",
    });
    expect(
      await bundle.gateway.administration.metadata.list(ctx(), created.id),
    ).toHaveLength(1);
    expect(
      await bundle.gateway.administration.metadata.get(ctx(), metadata.id),
    ).toBeDefined();
    expect(await bundle.gateway.administration.policies.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.policies.get(ctx(), policy.id),
    ).toBeDefined();
    expect(
      await bundle.gateway.administration.references.list(ctx(), created.id),
    ).toHaveLength(1);
    expect(await bundle.gateway.administration.capabilities.list(ctx())).toHaveLength(
      1,
    );
    expect(
      await bundle.gateway.administration.capabilities.get(ctx(), capability.id),
    ).toBeDefined();
    await bundle.gateway.administration.capabilities.update(ctx(), {
      capabilityId: capability.id,
      name: "Config Admin 2",
    });
    expect(await bundle.gateway.administration.navigations.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.navigations.get(ctx(), navigation.id),
    ).toBeDefined();
    expect(await bundle.gateway.administration.shortcuts.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.shortcuts.get(ctx(), shortcut.id),
    ).toBeDefined();
    expect(await bundle.gateway.administration.dashboards.list(ctx())).toHaveLength(1);
    expect(
      await bundle.gateway.administration.dashboards.get(ctx(), dashboard.id),
    ).toBeDefined();
    await bundle.gateway.administration.dashboards.update(ctx(), {
      dashboardId: dashboard.id,
      name: "Main 2",
    });

    const audits = await bundle.gateway.administration.audit.list(ctx(), created.id);
    expect(audits.length).toBeGreaterThan(0);
    expect(
      await bundle.gateway.administration.audit.get(ctx(), audits[0]!.id),
    ).toBeDefined();

    const history = await bundle.gateway.administration.history.list(ctx(), created.id);
    expect(history.length).toBeGreaterThan(0);
    expect(
      await bundle.gateway.administration.history.get(ctx(), history[0]!.id),
    ).toBeDefined();

    expect(await bundle.gateway.administration.diagnostics.list(ctx())).toEqual([]);

    const health = await bundle.gateway.administration.diagnostics.health(ctx());
    expect(health.runtimeAdminEnabled).toBe(false);
    expect(health.workbenchEnabled).toBe(false);
    expect(health.httpEnabled).toBe(false);
    expect(health.status).toBe("healthy");
    const readiness = await bundle.gateway.administration.diagnostics.readiness(ctx());
    expect(readiness.ready).toBe(true);
    const caps = await bundle.gateway.administration.diagnostics.capabilities(ctx());
    expect(caps.runtimeAdmin).toBe(false);
    expect(caps.facets).toContain("modules");

    expect(administration.readiness.runtimeAdminEnabled).toBe(false);
    expect(administration.readiness.persistenceMode).toBe("memory");
  });

  it("throws when administration gateway is not enabled", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.administration).toThrow(/not enabled/);
  });

  it("enforces production authorization deny-by-default on administration ops", async () => {
    const administration = createAdministrationPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const bundle = createPlatformServices({
      administration,
      authorizationMode: "production",
      accessResolver,
    });

    await expect(
      bundle.gateway.administration.modules.list(ctx({ permissions: [] })),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));
  });

  it("covers remaining factory and error-mapping branches", async () => {
    const persistence = (
      await import("@apzhub/admin-persistence")
    ).createAdministrationPersistenceForTest({ allowInMemoryPersistence: true });
    const composed = (
      await import("./create-administration-platform-services")
    ).createAdministrationPlatformServices({
      persistence,
      persistenceMode: "memory",
    });
    expect(composed.readiness.administrationEnabled).toBe(true);

    const { wrapAdministrationPlatformGatewayWithPipeline } =
      await import("./create-administration-platform-services");
    const wrapped = wrapAdministrationPlatformGatewayWithPipeline(
      composed.gatewaySurface,
      {
        execute: async (request: {
          invoke: (ctx: ServiceRequestContext, args: unknown[]) => Promise<unknown>;
          context: ServiceRequestContext;
          args: unknown[];
        }) => request.invoke(request.context, request.args),
      } as never,
    );
    expect(await wrapped.modules.list(ctx())).toEqual([]);

    const production = (
      await import("./create-administration-platform-services")
    ).createAdministrationPlatformServicesForProduction({
      postgresDb: { execute: async () => [] } as never,
    });
    expect(production.readiness.persistenceMode).toBe("postgres");

    expect(
      mapAdministrationDomainError(
        new AdministrationDomainError("forbidden", "no"),
        "c",
      ).code,
    ).toBe("FORBIDDEN");
    expect(
      mapAdministrationDomainError(
        new AdministrationDomainError("secret_metadata_forbidden", "x"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapAdministrationDomainError(
        new AdministrationDomainError("invalid_module_key", "x"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");

    const { createAdministrationPlatformServiceImpls } =
      await import("./administration-service-impls");
    const domain = {
      async listModules() {
        throw new Error('relation "platform_administration" does not exist');
      },
    } as never;
    const impls = createAdministrationPlatformServiceImpls({ domain });
    await expect(impls.modules.list(ctx())).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });

    const domainConflict = {
      async listModules() {
        throw new AdministrationDomainError("conflict", "c");
      },
    } as never;
    const implsConflict = createAdministrationPlatformServiceImpls({
      domain: domainConflict,
    });
    await expect(implsConflict.modules.list(ctx())).rejects.toMatchObject({
      code: "CONFLICT",
    });

    const pse = mapAdministrationDomainError(
      new AdministrationDomainError("not_found", "n"),
      "corr",
    );
    const domainPse = {
      async listModules() {
        throw pse;
      },
    } as never;
    const implsPse = createAdministrationPlatformServiceImpls({
      domain: domainPse,
    });
    await expect(implsPse.modules.list(ctx())).rejects.toBe(pse);

    const domain2 = {
      async listModules() {
        throw new Error("boom unrelated");
      },
    } as never;
    const impls2 = createAdministrationPlatformServiceImpls({ domain: domain2 });
    await expect(impls2.modules.list(ctx())).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });

    const domainThrow = {
      async getDiagnostic() {
        throw new AdministrationDomainError("not_found", "missing");
      },
      async listDiagnostics() {
        return [];
      },
    } as never;
    const implsDiag = createAdministrationPlatformServiceImpls({
      domain: domainThrow,
    });
    await expect(
      implsDiag.diagnostics.get(ctx(), "diag_x" as never),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(await implsDiag.diagnostics.list(ctx())).toEqual([]);
  });

  it("boundary: administration platform services source does not import HTTP or runtime admin", () => {
    const root = join(
      process.cwd(),
      "packages/platform-services/src/services/administration",
    );
    const files = [
      "administration-service-impls.ts",
      "create-administration-platform-services.ts",
      "administration-env.ts",
      "index.ts",
    ];
    for (const file of files) {
      const content = readFileSync(join(root, file), "utf8");
      expect(content).not.toMatch(
        /NextRequest|\/api\/v1\/|executeAdminAction|liveProbe/i,
      );
      expect(content).not.toMatch(/EventBus|workbench-framework/);
    }
  });
});
