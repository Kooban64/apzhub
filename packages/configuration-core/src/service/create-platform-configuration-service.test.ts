/**
 * Platform Configuration domain service coverage (APZCONFIG-002).
 */

import { describe, expect, it } from "vitest";

import type { ConfigurationRequestContext } from "@apzhub/configuration-contracts";
import { asConfigurationId } from "@apzhub/configuration-contracts";
import { ConfigurationDomainError } from "@apzhub/configuration-core";
import { createPlatformConfigurationService } from "@apzhub/configuration-core";
import { createConfigurationPersistenceForTest } from "@apzhub/configuration-persistence";

const ctx: ConfigurationRequestContext = {
  tenantId: "tenant_dom",
  userId: "user_dom",
  correlationId: "corr_dom",
};

function createService() {
  let seq = 0;
  const repos = createConfigurationPersistenceForTest({
    allowInMemoryPersistence: true,
  });
  return createPlatformConfigurationService({
    repos,
    now: () => "2026-07-16T00:00:00.000Z",
    id: () => `dom_${++seq}`,
    persistenceMode: "memory",
  });
}

describe("createPlatformConfigurationService", () => {
  it("requires explicit repos", () => {
    expect(() =>
      createPlatformConfigurationService({
        repos: undefined as never,
        now: () => "",
        id: () => "x",
      }),
    ).toThrow(ConfigurationDomainError);
  });

  it("rejects missing tenant/user context", async () => {
    const service = createService();
    await expect(service.listConfigurations({ ...ctx, tenantId: "" })).rejects.toThrow(
      /tenantId/,
    );
    await expect(service.listConfigurations({ ...ctx, userId: "" })).rejects.toThrow(
      /userId/,
    );
  });

  it("creates configuration with namespace, references, and audit trail", async () => {
    const service = createService();
    const created = await service.createConfiguration(ctx, {
      namespaceKey: "app",
      key: "theme",
      displayName: "Theme",
      valueKind: "string",
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_dom" },
      references: [{ kind: "documents", resourceId: "doc_1" }],
    });
    expect(created.status).toBe("draft");
    const refs = await service.listReferences(ctx, created.id);
    expect(refs).toHaveLength(1);
    const audits = await service.listAudit(ctx, created.id);
    expect(audits.length).toBeGreaterThan(0);
  });

  it("supports namespace/group CRUD and version publish/deprecate", async () => {
    const service = createService();
    const ns = await service.createNamespace(ctx, {
      key: "ns",
      name: "NS",
    });
    const updatedNs = await service.updateNamespace(ctx, {
      namespaceId: ns.id,
      name: "NS2",
    });
    expect(updatedNs.name).toBe("NS2");

    const group = await service.createGroup(ctx, {
      namespaceId: ns.id,
      key: "g",
      name: "G",
    });
    const updatedGroup = await service.updateGroup(ctx, {
      groupId: group.id,
      name: "G2",
    });
    expect(updatedGroup.name).toBe("G2");

    const configuration = await service.createConfiguration(ctx, {
      namespaceKey: "other",
      key: "k",
      displayName: "K",
      valueKind: "boolean",
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_dom" },
    });
    await service.transitionLifecycle(ctx, {
      configurationId: configuration.id,
      to: "validated",
    });
    await service.transitionLifecycle(ctx, {
      configurationId: configuration.id,
      to: "approved",
    });
    const version = await service.createVersion(ctx, {
      configurationId: configuration.id,
      valueKind: "boolean",
      payload: "true",
    });
    const published = await service.publishVersion(ctx, version.id);
    expect(published.isCurrent).toBe(true);
    await service.deprecateVersion(ctx, version.id);
    const got = await service.getConfiguration(ctx, configuration.id);
    expect(got.status).toBe("deprecated");
  });

  it("supports overrides, scopes, validation rules, and diagnostics", async () => {
    const service = createService();
    const configuration = await service.createConfiguration(ctx, {
      namespaceKey: "scope",
      key: "flag",
      displayName: "Flag",
      valueKind: "string",
      hierarchyLevel: "organisation",
      scope: { kind: "organisation", organisationId: "org_dom" },
    });
    const override = await service.createOverride(ctx, {
      configurationId: configuration.id,
      hierarchyLevel: "user",
      scope: { kind: "user", userId: "user_dom" },
      valueKind: "string",
      payload: "on",
    });
    const updated = await service.updateOverride(ctx, {
      overrideId: override.id,
      payload: "off",
    });
    expect(updated.id).toBe(override.id);

    const scopes = await service.listScopes(ctx);
    expect(scopes.length).toBeGreaterThan(0);
    const scope = await service.getScope(ctx, configuration.id);
    expect(scope.scopeKind).toBe("organisation");

    const validation = service.validateConfigurationMetadata(configuration);
    expect(validation.valid).toBe(true);
    expect(service.listValidationRules().length).toBeGreaterThan(0);

    expect((await service.diagnosticsHealth(ctx)).runtimeApplyEnabled).toBe(false);
    expect((await service.diagnosticsReadiness(ctx)).ready).toBe(true);
    expect((await service.diagnosticsCapabilities(ctx)).runtimeApply).toBe(false);
  });

  it("throws not_found for missing entities", async () => {
    const service = createService();
    await expect(
      service.getConfiguration(ctx, asConfigurationId("missing_cfg")),
    ).rejects.toThrow(/not found/);
    await expect(
      service.createGroup(ctx, {
        namespaceId: "missing_ns" as never,
        key: "g",
        name: "G",
      }),
    ).rejects.toThrow(/not found/);
  });
});
