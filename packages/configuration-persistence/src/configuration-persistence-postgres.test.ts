/**
 * PostgreSQL configuration repository coverage (mocked drizzle executor).
 */
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

import { createPostgresConfigurationRepositories } from "./postgres/repositories";

const ctx: ConfigurationRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

const now = new Date("2026-07-16T00:00:00.000Z");

function thenableRows(rows: unknown[]) {
  const api = {
    limit: vi.fn(async () => rows),
    orderBy: vi.fn(async () => rows),
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
      from: vi.fn(() => ({
        where: vi.fn(() => thenableRows(rows)),
        orderBy: vi.fn(async () => rows),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    })),
  };
}

describe("postgres configuration repositories coverage", () => {
  it("covers all repository create/list/get paths", async () => {
    const configurationRow = {
      id: "cfg_1",
      tenantId: "tenant_a",
      organisationId: "org_a",
      namespaceId: "ns_1",
      groupId: "cg_1",
      keyId: "ck_1",
      hierarchyLevel: "tenant",
      scopeJson: { kind: "tenant", tenantId: "tenant_a" },
      status: "draft",
      currentVersionId: "ver_1",
      inheritsFromConfigurationId: "cfg_0",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    };
    const namespaceRow = {
      id: "ns_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "platform",
      name: "Platform",
      description: "desc",
      createdAt: now,
      updatedAt: now,
    };
    const groupRow = {
      id: "cg_1",
      tenantId: "tenant_a",
      organisationId: null,
      namespaceId: "ns_1",
      key: "ui",
      name: "UI",
      description: null,
      createdAt: now,
      updatedAt: now,
    };
    const keyRow = {
      id: "ck_1",
      tenantId: "tenant_a",
      organisationId: null,
      namespaceId: "ns_1",
      groupId: "cg_1",
      key: "theme",
      displayName: "Theme",
      description: null,
      valueKind: "string",
      createdAt: now,
      updatedAt: now,
    };
    const valueRow = {
      id: "val_1",
      configurationId: "cfg_1",
      versionId: "ver_1",
      valueKind: "string",
      payload: "dark",
      createdAt: now,
      updatedAt: now,
    };
    const versionRow = {
      id: "ver_1",
      configurationId: "cfg_1",
      versionNumber: 1,
      immutable: true,
      isCurrent: true,
      label: "v1",
      createdAt: now,
      createdBy: "user_1",
      rollbackFromVersionId: "ver_0",
    };
    const overrideRow = {
      id: "ovr_1",
      configurationId: "cfg_1",
      hierarchyLevel: "user",
      scopeJson: {
        kind: "user",
        userId: "user_1",
        organisationId: "org",
        productId: "p",
        environmentId: "e",
      },
      valueId: "val_1",
      precedenceRank: 0,
      createdAt: now,
      updatedAt: now,
    };
    const validationRow = {
      id: "vld_1",
      configurationKeyId: "ck_1",
      kind: "enum",
      ruleRef: "r",
      pattern: ".*",
      min: 1,
      max: 2,
      enumValuesJson: ["light", "dark"],
      required: true,
      customValidatorKey: "c",
      createdAt: now,
      updatedAt: now,
    };
    const referenceRow = {
      id: "ref_1",
      configurationId: "cfg_1",
      kind: "documents",
      resourceId: "doc_1",
      label: "Doc",
    };
    const historyRow = {
      id: "hst_1",
      configurationId: "cfg_1",
      versionId: "ver_1",
      summary: "created",
      actorUserId: "user_1",
      createdAt: now,
    };
    const auditRow = {
      id: "aud_1",
      tenantId: "tenant_a",
      configurationId: "cfg_1",
      action: "created",
      actorUserId: "user_1",
      detail: "ok",
      createdAt: now,
    };

    const queue = [
      [configurationRow],
      [configurationRow],
      [namespaceRow],
      [namespaceRow],
      [groupRow],
      [groupRow],
      [keyRow],
      [keyRow],
      [configurationRow],
      [valueRow],
      [versionRow],
      [configurationRow],
      [configurationRow],
      [versionRow],
      [configurationRow],
      [overrideRow],
      [keyRow],
      [validationRow],
      [configurationRow],
      [referenceRow],
      [configurationRow],
      [historyRow],
      [auditRow],
    ];
    let i = 0;
    const next = () => queue[i++] ?? [];

    const db = {
      insert: vi.fn(() => ({
        values: vi.fn(async () => undefined),
      })),
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => thenableRows(next())),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(async () => undefined),
        })),
      })),
    };

    const repos = createPostgresConfigurationRepositories(db as never);

    await repos.configurations.create(ctx, {
      id: asConfigurationId("cfg_1"),
      tenantId: "tenant_a",
      organisationId: "org_a",
      namespaceId: asConfigurationNamespaceId("ns_1"),
      groupId: asConfigurationGroupId("cg_1"),
      keyId: asConfigurationKeyId("ck_1"),
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
      status: "draft",
      currentVersionId: asConfigurationVersionId("ver_1"),
      inheritsFromConfigurationId: asConfigurationId("cfg_0"),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    await repos.configurations.update(ctx, {
      id: asConfigurationId("cfg_1"),
      tenantId: "tenant_a",
      namespaceId: asConfigurationNamespaceId("ns_1"),
      keyId: asConfigurationKeyId("ck_1"),
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
      status: "validated",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 2,
    });
    expect((await repos.configurations.get(ctx, asConfigurationId("cfg_1")))?.id).toBe(
      "cfg_1",
    );
    expect((await repos.configurations.list(ctx))[0]?.organisationId).toBe("org_a");

    await repos.namespaces.create(ctx, {
      id: asConfigurationNamespaceId("ns_1"),
      tenantId: "tenant_a",
      key: "platform",
      name: "Platform",
      description: "desc",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(
      (await repos.namespaces.get(ctx, asConfigurationNamespaceId("ns_1")))?.key,
    ).toBe("platform");
    expect((await repos.namespaces.list(ctx))[0]?.name).toBe("Platform");

    await repos.groups.create(ctx, {
      id: asConfigurationGroupId("cg_1"),
      tenantId: "tenant_a",
      namespaceId: asConfigurationNamespaceId("ns_1"),
      key: "ui",
      name: "UI",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect((await repos.groups.get(ctx, asConfigurationGroupId("cg_1")))?.key).toBe(
      "ui",
    );
    expect((await repos.groups.list(ctx))[0]?.key).toBe("ui");

    await repos.keys.create(ctx, {
      id: asConfigurationKeyId("ck_1"),
      tenantId: "tenant_a",
      namespaceId: asConfigurationNamespaceId("ns_1"),
      groupId: asConfigurationGroupId("cg_1"),
      key: "theme",
      displayName: "Theme",
      valueKind: "string",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect((await repos.keys.get(ctx, asConfigurationKeyId("ck_1")))?.key).toBe(
      "theme",
    );
    expect((await repos.keys.list(ctx))[0]?.displayName).toBe("Theme");

    await repos.values.create(ctx, {
      id: asConfigurationValueId("val_1"),
      configurationId: asConfigurationId("cfg_1"),
      versionId: asConfigurationVersionId("ver_1"),
      valueKind: "string",
      payload: "dark",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(
      (await repos.values.listByConfiguration(ctx, asConfigurationId("cfg_1")))[0]
        ?.payload,
    ).toBe("dark");

    await repos.versions.create(ctx, {
      id: asConfigurationVersionId("ver_1"),
      configurationId: asConfigurationId("cfg_1"),
      versionNumber: 1,
      immutable: true,
      isCurrent: true,
      label: "v1",
      createdAt: now.toISOString(),
      createdBy: "user_1",
      rollbackFromVersionId: asConfigurationVersionId("ver_0"),
    });
    expect(
      (await repos.versions.get(ctx, asConfigurationVersionId("ver_1")))
        ?.rollbackFromVersionId,
    ).toBe("ver_0");
    expect(
      (await repos.versions.listByConfiguration(ctx, asConfigurationId("cfg_1")))[0]
        ?.label,
    ).toBe("v1");

    await repos.overrides.create(ctx, {
      id: asConfigurationOverrideId("ovr_1"),
      configurationId: asConfigurationId("cfg_1"),
      hierarchyLevel: "user",
      scope: { kind: "user", userId: "user_1" },
      valueId: asConfigurationValueId("val_1"),
      precedenceRank: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(
      (await repos.overrides.listByConfiguration(ctx, asConfigurationId("cfg_1")))[0]
        ?.hierarchyLevel,
    ).toBe("user");

    await repos.validations.create(ctx, {
      id: asConfigurationValidationId("vld_1"),
      configurationKeyId: asConfigurationKeyId("ck_1"),
      kind: "enum",
      enumValues: ["light", "dark"],
      required: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(
      (await repos.validations.listByKey(ctx, asConfigurationKeyId("ck_1")))[0]
        ?.enumValues,
    ).toEqual(["light", "dark"]);

    await repos.references.create(ctx, {
      id: asConfigurationReferenceId("ref_1"),
      configurationId: asConfigurationId("cfg_1"),
      kind: "documents",
      resourceId: "doc_1",
      label: "Doc",
    });
    expect(
      (await repos.references.listByConfiguration(ctx, asConfigurationId("cfg_1")))[0]
        ?.kind,
    ).toBe("documents");

    await repos.history.create(ctx, {
      id: asConfigurationHistoryId("hst_1"),
      configurationId: asConfigurationId("cfg_1"),
      versionId: asConfigurationVersionId("ver_1"),
      summary: "created",
      actorUserId: "user_1",
      createdAt: now.toISOString(),
    });
    expect(
      (await repos.history.listByConfiguration(ctx, asConfigurationId("cfg_1")))[0]
        ?.summary,
    ).toBe("created");

    await repos.audits.append(ctx, {
      id: asConfigurationAuditId("aud_1"),
      tenantId: "tenant_a",
      configurationId: asConfigurationId("cfg_1"),
      action: "created",
      actorUserId: "user_1",
      detail: "ok",
      createdAt: now.toISOString(),
    });
    expect((await repos.audits.list(ctx))[0]?.action).toBe("created");
  });

  it("returns null for empty get queries", async () => {
    const db = mockDb([]);
    const repos = createPostgresConfigurationRepositories(db as never);
    expect(
      await repos.configurations.get(ctx, asConfigurationId("missing")),
    ).toBeNull();
    expect(
      await repos.namespaces.get(ctx, asConfigurationNamespaceId("missing")),
    ).toBeNull();
    expect(await repos.groups.get(ctx, asConfigurationGroupId("missing"))).toBeNull();
    expect(await repos.keys.get(ctx, asConfigurationKeyId("missing"))).toBeNull();
    expect(
      await repos.versions.get(ctx, asConfigurationVersionId("missing")),
    ).toBeNull();
  });
});
