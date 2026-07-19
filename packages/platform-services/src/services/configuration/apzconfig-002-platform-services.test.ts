/**
 * APZCONFIG-002 — Configuration Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_CONFIGURATION_PERMISSIONS } from "@apzhub/configuration-contracts";
import { ConfigurationDomainError } from "@apzhub/configuration-core";

import {
  createConfigurationPlatformServicesForProduction,
  createConfigurationPlatformServicesForTest,
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
  isConfigurationServiceEnabled,
  mapConfigurationDomainError,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  resolveOperationAuthorization,
} from "../../index";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_cfg",
    userId: "user_cfg",
    organisationId: "org_cfg",
    correlationId: "corr_apzconfig_002",
    permissions: ["configuration.*"],
    ...overrides,
  };
}

describe("APZCONFIG-002 configuration platform services", () => {
  it("exports platform services version 0.26.1", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.26.1");
  });

  it("registers configuration permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_CONFIGURATION_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to configuration permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("configurationConfigurations", "create")
        ?.requiredPermission,
    ).toBe("configuration.manage");
    expect(
      resolveOperationAuthorization("configurationConfigurations", "get")
        ?.requiredPermission,
    ).toBe("configuration.read");
    expect(
      resolveOperationAuthorization("configurationVersions", "publish")
        ?.requiredPermission,
    ).toBe("configuration.version");
    expect(
      resolveOperationAuthorization("configurationValidation", "listRules")
        ?.requiredPermission,
    ).toBe("configuration.validation");
    expect(
      resolveOperationAuthorization("configurationAudit", "list")?.requiredPermission,
    ).toBe("configuration.audit");
    expect(
      resolveOperationAuthorization("configurationDiagnostics", "health")
        ?.requiredPermission,
    ).toBe("configuration.read");
  });

  it("ForTest requires allowInMemoryPersistence without postgres", () => {
    expect(() => createConfigurationPlatformServicesForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() => createConfigurationPlatformServicesForProduction({} as never)).toThrow(
      /postgresDb/,
    );
  });

  it("env gate is deny-by-default", () => {
    expect(isConfigurationServiceEnabled({})).toBe(false);
    expect(
      isConfigurationServiceEnabled({ APZHUB_CONFIGURATION_ENABLED: "true" }),
    ).toBe(true);
    expect(
      isConfigurationServiceEnabled({ APZHUB_CONFIGURATION_ENABLED: "false" }),
    ).toBe(false);
  });

  it("maps ConfigurationDomainError to PlatformServiceError", () => {
    const mapped = mapConfigurationDomainError(
      new ConfigurationDomainError("not_found", "missing", { id: "x" }),
      "corr",
    );
    expect(isPlatformServiceError(mapped)).toBe(true);
    expect(mapped.code).toBe("NOT_FOUND");
    expect(
      mapConfigurationDomainError(
        new ConfigurationDomainError("validation_error", "bad"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapConfigurationDomainError(
        new ConfigurationDomainError("invalid_lifecycle_transition", "nope"),
        "c",
      ).code,
    ).toBe("BUSINESS_RULE_VIOLATION");
    expect(
      mapConfigurationDomainError(new ConfigurationDomainError("duplicate", "dup"), "c")
        .code,
    ).toBe("CONFLICT");
  });

  it("wires gateway.configuration through RequestPipeline with allow-all for functional test", async () => {
    let seq = 0;
    const configuration = createConfigurationPlatformServicesForTest({
      allowInMemoryPersistence: true,
      id: () => `cfg_test_${++seq}`,
    });
    const bundle = createPlatformServices({
      configuration,
      authorizationMode: "allow-all",
    });

    const created = await bundle.gateway.configuration.configurations.create(ctx(), {
      namespaceKey: "platform",
      key: "feature.x",
      displayName: "Feature X",
      valueKind: "string",
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_cfg" },
      references: [{ kind: "projects", resourceId: "proj_1" }],
    });
    expect(created.status).toBe("draft");

    const got = await bundle.gateway.configuration.configurations.get(
      ctx(),
      created.id,
    );
    expect(got.id).toBe(created.id);

    const listed = await bundle.gateway.configuration.configurations.list(ctx());
    expect(listed).toHaveLength(1);

    const updated = await bundle.gateway.configuration.configurations.updateMetadata(
      ctx(),
      {
        configurationId: created.id,
        hierarchyLevel: "organisation",
      },
    );
    expect(updated.hierarchyLevel).toBe("organisation");

    const validated = await bundle.gateway.configuration.configurations.transition(
      ctx(),
      {
        configurationId: created.id,
        to: "validated",
      },
    );
    expect(validated.status).toBe("validated");

    const archived = await bundle.gateway.configuration.configurations.archive(
      ctx(),
      created.id,
    );
    expect(archived.status).toBe("archived");

    const restored = await bundle.gateway.configuration.configurations.restore(
      ctx(),
      created.id,
    );
    expect(restored.status).toBe("draft");

    await bundle.gateway.configuration.configurations.transition(ctx(), {
      configurationId: created.id,
      to: "validated",
    });
    await bundle.gateway.configuration.configurations.transition(ctx(), {
      configurationId: created.id,
      to: "approved",
    });

    const namespace = await bundle.gateway.configuration.namespaces.create(ctx(), {
      key: "custom",
      name: "Custom",
    });
    expect(namespace.key).toBe("custom");
    await bundle.gateway.configuration.namespaces.update(ctx(), {
      namespaceId: namespace.id,
      name: "Custom NS",
    });

    const group = await bundle.gateway.configuration.groups.create(ctx(), {
      namespaceId: namespace.id,
      key: "grp",
      name: "Group",
    });
    await bundle.gateway.configuration.groups.update(ctx(), {
      groupId: group.id,
      name: "Group 2",
    });

    const version = await bundle.gateway.configuration.versions.create(ctx(), {
      configurationId: created.id,
      valueKind: "string",
      payload: "enabled",
      label: "v1",
    });
    expect(version.versionNumber).toBe(1);

    const published = await bundle.gateway.configuration.versions.publish(
      ctx(),
      version.id,
    );
    expect(published.isCurrent).toBe(true);

    const override = await bundle.gateway.configuration.overrides.create(ctx(), {
      configurationId: created.id,
      hierarchyLevel: "user",
      scope: { kind: "user", userId: "user_cfg" },
      valueKind: "string",
      payload: "override",
    });
    await bundle.gateway.configuration.overrides.update(ctx(), {
      overrideId: override.id,
      payload: "override-2",
    });

    const scopes = await bundle.gateway.configuration.scopes.list(ctx());
    expect(scopes.length).toBeGreaterThan(0);
    const scope = await bundle.gateway.configuration.scopes.get(ctx(), created.id);
    expect(scope.scopeKind).toBe("tenant");

    const validation = await bundle.gateway.configuration.validation.validateMetadata(
      ctx(),
      created,
    );
    expect(validation.valid).toBe(true);
    const rules = await bundle.gateway.configuration.validation.listRules(ctx());
    expect(rules.length).toBeGreaterThan(0);

    const refs = await bundle.gateway.configuration.references.list(ctx(), created.id);
    expect(refs).toHaveLength(1);
    expect(
      await bundle.gateway.configuration.references.get(ctx(), refs[0]!.id),
    ).toMatchObject({ kind: "projects" });

    const audits = await bundle.gateway.configuration.audit.list(ctx(), created.id);
    expect(audits.length).toBeGreaterThan(0);
    expect(
      await bundle.gateway.configuration.audit.get(ctx(), audits[0]!.id),
    ).toBeDefined();

    const health = await bundle.gateway.configuration.diagnostics.health(ctx());
    expect(health.runtimeApplyEnabled).toBe(false);
    expect(health.status).toBe("healthy");
    const readiness = await bundle.gateway.configuration.diagnostics.readiness(ctx());
    expect(readiness.ready).toBe(true);
    const caps = await bundle.gateway.configuration.diagnostics.capabilities(ctx());
    expect(caps.runtimeApply).toBe(false);
    expect(caps.facets).toContain("configurations");

    expect(configuration.readiness.runtimeApplyEnabled).toBe(false);
    expect(configuration.readiness.persistenceMode).toBe("memory");
  });

  it("throws when configuration gateway is not enabled", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.configuration).toThrow(/not enabled/);
  });

  it("enforces production authorization deny-by-default on configuration ops", async () => {
    const configuration = createConfigurationPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const bundle = createPlatformServices({
      configuration,
      authorizationMode: "production",
      accessResolver,
    });

    await expect(
      bundle.gateway.configuration.configurations.list(ctx({ permissions: [] })),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));
  });

  it("covers remaining factory and error-mapping branches", async () => {
    const persistence = (
      await import("@apzhub/configuration-persistence")
    ).createConfigurationPersistenceForTest({ allowInMemoryPersistence: true });
    const composed = (
      await import("./create-configuration-platform-services")
    ).createConfigurationPlatformServices({
      persistence,
      persistenceMode: "memory",
    });
    expect(composed.readiness.configurationEnabled).toBe(true);

    expect(
      mapConfigurationDomainError(new ConfigurationDomainError("forbidden", "no"), "c")
        .code,
    ).toBe("FORBIDDEN");
    expect(
      mapConfigurationDomainError(
        new ConfigurationDomainError("secret_payload_forbidden", "x"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");

    const { createConfigurationPlatformServiceImpls } =
      await import("./configuration-service-impls");
    const domain = {
      async listConfigurations() {
        throw new Error('relation "platform_configuration" does not exist');
      },
    } as never;
    const impls = createConfigurationPlatformServiceImpls({ domain });
    await expect(impls.configurations.list(ctx())).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });

    const domainConflict = {
      async listConfigurations() {
        throw new ConfigurationDomainError("conflict", "c");
      },
    } as never;
    const implsConflict = createConfigurationPlatformServiceImpls({
      domain: domainConflict,
    });
    await expect(implsConflict.configurations.list(ctx())).rejects.toMatchObject({
      code: "CONFLICT",
    });

    const pse = mapConfigurationDomainError(
      new ConfigurationDomainError("not_found", "n"),
      "corr",
    );
    const domainPse = {
      async listConfigurations() {
        throw pse;
      },
    } as never;
    const implsPse = createConfigurationPlatformServiceImpls({
      domain: domainPse,
    });
    await expect(implsPse.configurations.list(ctx())).rejects.toBe(pse);

    const domain2 = {
      async listConfigurations() {
        throw new Error("boom unrelated");
      },
    } as never;
    const impls2 = createConfigurationPlatformServiceImpls({ domain: domain2 });
    await expect(impls2.configurations.list(ctx())).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
  });

  it("boundary: configuration platform services source does not import HTTP or runtime apply", () => {
    const root = join(
      process.cwd(),
      "packages/platform-services/src/services/configuration",
    );
    const files = [
      "configuration-service-impls.ts",
      "create-configuration-platform-services.ts",
      "configuration-env.ts",
      "index.ts",
    ];
    for (const file of files) {
      const content = readFileSync(join(root, file), "utf8");
      expect(content).not.toMatch(
        /NextRequest|\/api\/v1\/|hotReload|applyConfiguration/i,
      );
      expect(content).not.toMatch(/EventBus|workbench-framework/);
    }
  });
});
