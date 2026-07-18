import { describe, expect, it, vi } from "vitest";

import {
  asConfigurationAuditId,
  asConfigurationGroupId,
  asConfigurationHistoryId,
  asConfigurationId,
  asConfigurationKeyId,
  asConfigurationNamespaceId,
  asConfigurationOverrideId,
  asConfigurationReferenceId,
  asConfigurationValidationId,
  asConfigurationValueId,
  asConfigurationVersionId,
  type ConfigurationRequestContext,
} from "@apzhub/configuration-contracts";
import { createConfigurationFoundation } from "@apzhub/configuration-core";

import {
  CONFIGURATION_PERSISTENCE_VERSION,
  createConfigurationPersistence,
  createConfigurationPersistenceForTest,
  createEmptyConfigurationInMemoryStores,
  createProductionConfigurationPersistence,
} from "./index";

const ctx: ConfigurationRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

describe("configuration-persistence", () => {
  it("exports persistence version", () => {
    expect(CONFIGURATION_PERSISTENCE_VERSION).toBe("0.1.0");
  });

  it("persists configuration metadata in memory with tenant isolation", async () => {
    const repos = createConfigurationPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const foundation = createConfigurationFoundation({ repos });

    const ns = await foundation.namespaces.create(ctx, {
      id: asConfigurationNamespaceId("ns_1"),
      tenantId: "tenant_a",
      key: "platform",
      name: "Platform",
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
    });
    expect(ns.key).toBe("platform");

    const key = await foundation.keys.create(ctx, {
      id: asConfigurationKeyId("ck_1"),
      tenantId: "tenant_a",
      namespaceId: ns.id,
      key: "ui.theme.default",
      displayName: "Default theme",
      valueKind: "string",
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
    });

    const group = await foundation.groups.create(ctx, {
      id: asConfigurationGroupId("cg_1"),
      tenantId: "tenant_a",
      namespaceId: ns.id,
      key: "ui",
      name: "UI",
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
    });

    const configuration = await foundation.configurations.create(ctx, {
      id: asConfigurationId("cfg_1"),
      tenantId: "tenant_a",
      namespaceId: ns.id,
      groupId: group.id,
      keyId: key.id,
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
      status: "draft",
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    const version = await foundation.versions.create(ctx, {
      id: asConfigurationVersionId("ver_1"),
      configurationId: configuration.id,
      versionNumber: 1,
      immutable: true,
      isCurrent: true,
      createdAt: "2026-07-16T00:00:00.000Z",
      createdBy: "user_1",
    });

    const value = await foundation.values.create(ctx, {
      id: asConfigurationValueId("val_1"),
      configurationId: configuration.id,
      versionId: version.id,
      valueKind: "string",
      payload: "dark",
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
    });

    await foundation.overrides.create(ctx, {
      id: asConfigurationOverrideId("ovr_1"),
      configurationId: configuration.id,
      hierarchyLevel: "user",
      scope: { kind: "user", userId: "user_1" },
      valueId: value.id,
      precedenceRank: 0,
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
    });

    await foundation.validations.create(ctx, {
      id: asConfigurationValidationId("vld_1"),
      configurationKeyId: key.id,
      kind: "enum",
      enumValues: ["light", "dark", "system"],
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
    });

    await foundation.references.create(ctx, {
      id: asConfigurationReferenceId("ref_1"),
      configurationId: configuration.id,
      kind: "documents",
      resourceId: "doc_1",
    });

    await foundation.history.create(ctx, {
      id: asConfigurationHistoryId("hst_1"),
      configurationId: configuration.id,
      versionId: version.id,
      summary: "Created draft",
      actorUserId: "user_1",
      createdAt: "2026-07-16T00:00:00.000Z",
    });

    await foundation.audits.append(ctx, {
      id: asConfigurationAuditId("aud_1"),
      tenantId: "tenant_a",
      configurationId: configuration.id,
      action: "created",
      actorUserId: "user_1",
      createdAt: "2026-07-16T00:00:00.000Z",
    });

    expect(await foundation.configurations.get(ctx, configuration.id)).toEqual(
      configuration,
    );
    expect(
      (
        await foundation.configurations.list({
          tenantId: "other",
          userId: "x",
        })
      ).length,
    ).toBe(0);
    expect(
      (await foundation.values.listByConfiguration(ctx, configuration.id))[0]?.payload,
    ).toBe("dark");
    expect(
      (await foundation.versions.listByConfiguration(ctx, configuration.id)).length,
    ).toBe(1);
    expect(
      (await foundation.overrides.listByConfiguration(ctx, configuration.id)).length,
    ).toBe(1);
    expect((await foundation.validations.listByKey(ctx, key.id)).length).toBe(1);
    expect(
      (await foundation.references.listByConfiguration(ctx, configuration.id)).length,
    ).toBe(1);
    expect(
      (await foundation.history.listByConfiguration(ctx, configuration.id)).length,
    ).toBe(1);
    expect((await foundation.audits.list(ctx)).length).toBe(1);
    expect((await foundation.namespaces.list(ctx)).length).toBe(1);
    expect((await foundation.groups.list(ctx)).length).toBe(1);
    expect((await foundation.keys.list(ctx)).length).toBe(1);
  });

  it("forbids silent production in-memory fallback", () => {
    expect(() => createConfigurationPersistence({ mode: "postgres" })).toThrow(
      /requires db/,
    );
    expect(() => createProductionConfigurationPersistence({} as never)).toThrow(
      /explicit postgres/,
    );
    expect(() => createConfigurationPersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() => createConfigurationPersistence({ mode: "redis" as never })).toThrow(
      /Unsupported/,
    );
  });

  it("wires postgres factory when db provided", () => {
    const insert = vi.fn(async () => undefined);
    const select = vi.fn(() => ({
      from: () => ({
        where: () => ({
          limit: async () => [],
          orderBy: async () => [],
        }),
      }),
    }));
    const db = {
      insert: () => ({ values: insert }),
      select,
      update: () => ({
        set: () => ({
          where: async () => undefined,
        }),
      }),
    } as never;

    const repos = createConfigurationPersistence({ mode: "postgres", db });
    expect(repos.configurations).toBeTruthy();
    const prod = createProductionConfigurationPersistence({ db });
    expect(prod.keys).toBeTruthy();
    const viaTest = createConfigurationPersistenceForTest({ postgresDb: db });
    expect(viaTest.audits).toBeTruthy();
  });

  it("allows custom memory stores", () => {
    const stores = createEmptyConfigurationInMemoryStores();
    const repos = createConfigurationPersistence({ mode: "memory", stores });
    expect(repos).toBeTruthy();
  });
});
