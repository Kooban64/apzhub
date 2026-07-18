/**
 * PostgreSQL administration repository coverage (mocked drizzle executor).
 */
import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import {
  asAdministrationActionId,
  asAdministrationAuditId,
  asAdministrationCapabilityId,
  asAdministrationCategoryId,
  asAdministrationDashboardId,
  asAdministrationDiagnosticId,
  asAdministrationHistoryId,
  asAdministrationMetadataId,
  asAdministrationModuleId,
  asAdministrationNavigationId,
  asAdministrationPermissionId,
  asAdministrationPolicyId,
  asAdministrationReferenceId,
  asAdministrationRegistrationId,
  asAdministrationSectionId,
  asAdministrationShortcutId,
  asAdministrationWidgetId,
  type AdministrationRequestContext,
} from "@apzhub/admin-contracts";

import {
  createPostgresAdministrationRepositories,
  createProductionAdministrationPersistence,
  mapAdministrationAction,
  mapAdministrationAudit,
  mapAdministrationCapability,
  mapAdministrationCategory,
  mapAdministrationDashboard,
  mapAdministrationDiagnostic,
  mapAdministrationHistory,
  mapAdministrationMetadata,
  mapAdministrationModule,
  mapAdministrationNavigation,
  mapAdministrationPermission,
  mapAdministrationPolicy,
  mapAdministrationReference,
  mapAdministrationRegistration,
  mapAdministrationSection,
  mapAdministrationShortcut,
  mapAdministrationWidget,
} from "./index";

const ctx: AdministrationRequestContext = {
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
  } as unknown as DatabaseExecutor;
}

describe("postgres administration repositories", () => {
  it("maps all entity rows", () => {
    expect(
      mapAdministrationModule({
        id: "mod_1",
        tenantId: "tenant_a",
        organisationId: "org",
        key: "identity",
        name: "Identity",
        description: "d",
        status: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }).key,
    ).toBe("identity");

    expect(
      mapAdministrationCategory({
        id: "cat_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        key: "g",
        name: "G",
        description: null,
        ordering: 1,
        createdAt: now,
        updatedAt: now,
      }).moduleId,
    ).toBe("mod_1");

    expect(
      mapAdministrationSection({
        id: "sec_1",
        tenantId: "tenant_a",
        categoryId: "cat_1",
        key: "s",
        name: "S",
        description: null,
        ordering: 1,
        createdAt: now,
        updatedAt: now,
      }).categoryId,
    ).toBe("cat_1");

    expect(
      mapAdministrationAction({
        id: "act_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        sectionId: "sec_1",
        key: "view",
        name: "View",
        description: null,
        kind: "view",
        permissionKeysJson: ["admin.read"],
        createdAt: now,
        updatedAt: now,
      }).kind,
    ).toBe("view");

    expect(
      mapAdministrationPermission({
        id: "perm_1",
        tenantId: "tenant_a",
        key: "admin.read",
        name: "Read",
        description: null,
        createdAt: now,
        updatedAt: now,
      }).key,
    ).toBe("admin.read");

    expect(
      mapAdministrationAudit({
        id: "aud_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        action: "created",
        actorUserId: "u",
        detail: null,
        createdAt: now,
      }).action,
    ).toBe("created");

    expect(
      mapAdministrationHistory({
        id: "hst_1",
        moduleId: "mod_1",
        summary: "s",
        actorUserId: "u",
        createdAt: now,
      }).summary,
    ).toBe("s");

    expect(
      mapAdministrationDiagnostic({
        id: "diag_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        capabilityId: "cap_1",
        severity: "info",
        code: "OK",
        message: "m",
        detail: null,
        createdAt: now,
      }).severity,
    ).toBe("info");

    expect(
      mapAdministrationRegistration({
        id: "reg_1",
        tenantId: "tenant_a",
        moduleKey: "identity",
        version: "0.1.0",
        status: "registered",
        registeredAt: now,
        registeredBy: "u",
        notes: null,
      }).moduleKey,
    ).toBe("identity");

    expect(
      mapAdministrationMetadata({
        id: "md_1",
        moduleId: "mod_1",
        labelsJson: { a: "1" },
        tagsJson: ["t"],
        notes: "n",
      }).notes,
    ).toBe("n");

    expect(
      mapAdministrationPolicy({
        id: "pol_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        kind: "access",
        key: "k",
        name: "n",
        description: null,
        createdAt: now,
        updatedAt: now,
      }).kind,
    ).toBe("access");

    expect(
      mapAdministrationReference({
        id: "ref_1",
        moduleId: "mod_1",
        kind: "module",
        resourceId: "r",
        label: null,
      }).kind,
    ).toBe("module");

    expect(
      mapAdministrationCapability({
        id: "cap_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        key: "sso",
        name: "SSO",
        description: null,
        enabled: true,
        available: true,
        healthy: true,
        certified: true,
        productionReady: true,
        limitationsJson: ["x"],
        owner: "o",
        version: "1",
        documentation: null,
        createdAt: now,
        updatedAt: now,
      }).productionReady,
    ).toBe(true);

    expect(
      mapAdministrationNavigation({
        id: "nav_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        categoryId: "cat_1",
        sectionId: "sec_1",
        key: "k",
        label: "L",
        ordering: 1,
        visibility: "visible",
        permissionKeysJson: null,
        iconKey: null,
        routePath: null,
        createdAt: now,
        updatedAt: now,
      }).visibility,
    ).toBe("visible");

    expect(
      mapAdministrationShortcut({
        id: "sh_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        actionId: "act_1",
        key: "k",
        label: "L",
        ordering: 1,
        permissionKeysJson: null,
        createdAt: now,
        updatedAt: now,
      }).label,
    ).toBe("L");

    expect(
      mapAdministrationShortcut({
        id: "sh_2",
        tenantId: "tenant_a",
        moduleId: null,
        actionId: null,
        key: "k2",
        label: "L2",
        ordering: 2,
        permissionKeysJson: ["admin.read"],
        createdAt: now,
        updatedAt: now,
      }).moduleId,
    ).toBeUndefined();

    expect(
      mapAdministrationDashboard({
        id: "dash_1",
        tenantId: "tenant_a",
        moduleId: "mod_1",
        key: "k",
        name: "N",
        description: null,
        ordering: 1,
        createdAt: now,
        updatedAt: now,
      }).name,
    ).toBe("N");

    expect(
      mapAdministrationDashboard({
        id: "dash_2",
        tenantId: "tenant_a",
        moduleId: null,
        key: "k2",
        name: "N2",
        description: "desc",
        ordering: 2,
        createdAt: now,
        updatedAt: now,
      }).moduleId,
    ).toBeUndefined();

    expect(
      mapAdministrationWidget({
        id: "w_1",
        dashboardId: "dash_1",
        key: "k",
        name: "N",
        kind: "metric",
        ordering: 1,
        createdAt: now,
        updatedAt: now,
      }).kind,
    ).toBe("metric");
  });

  it("covers create/get/list/update paths via mocked drizzle", async () => {
    const moduleRow = {
      id: "mod_1",
      tenantId: "tenant_a",
      organisationId: null,
      key: "identity",
      name: "Identity",
      description: null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    };
    const moduleDb = mockDb([moduleRow]);
    const moduleRepos = createPostgresAdministrationRepositories(moduleDb);
    expect(
      await moduleRepos.modules.get(ctx, asAdministrationModuleId("mod_1")),
    ).toBeTruthy();
    expect((await moduleRepos.modules.list(ctx)).length).toBe(1);

    const db = mockDb([]);
    const repos = createPostgresAdministrationRepositories(db);
    const production = createProductionAdministrationPersistence({ db });
    expect(production.modules).toBeTruthy();

    await repos.modules.create(ctx, {
      id: asAdministrationModuleId("mod_1"),
      tenantId: "tenant_a",
      key: "identity",
      name: "Identity",
      status: "draft",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    expect(await repos.modules.get(ctx, asAdministrationModuleId("mod_1"))).toBeNull();
    expect((await repos.modules.list(ctx)).length).toBe(0);
    await repos.modules.update(ctx, {
      id: asAdministrationModuleId("mod_1"),
      tenantId: "tenant_a",
      key: "identity",
      name: "Identity 2",
      status: "registered",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 2,
    });

    await repos.categories.create(ctx, {
      id: asAdministrationCategoryId("cat_1"),
      tenantId: "tenant_a",
      key: "g",
      name: "G",
      ordering: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.categories.get(ctx, asAdministrationCategoryId("cat_1"));
    await repos.categories.list(ctx);
    await repos.categories.update(ctx, {
      id: asAdministrationCategoryId("cat_1"),
      tenantId: "tenant_a",
      key: "g",
      name: "G2",
      ordering: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.sections.create(ctx, {
      id: asAdministrationSectionId("sec_1"),
      tenantId: "tenant_a",
      categoryId: asAdministrationCategoryId("cat_1"),
      key: "s",
      name: "S",
      ordering: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.sections.get(ctx, asAdministrationSectionId("sec_1"));
    await repos.sections.list(ctx);
    await repos.sections.update(ctx, {
      id: asAdministrationSectionId("sec_1"),
      tenantId: "tenant_a",
      categoryId: asAdministrationCategoryId("cat_1"),
      key: "s",
      name: "S2",
      ordering: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.actions.create(ctx, {
      id: asAdministrationActionId("act_1"),
      tenantId: "tenant_a",
      key: "view",
      name: "View",
      kind: "view",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.actions.get(ctx, asAdministrationActionId("act_1"));
    await repos.actions.list(ctx);
    await repos.actions.update(ctx, {
      id: asAdministrationActionId("act_1"),
      tenantId: "tenant_a",
      key: "view",
      name: "View2",
      kind: "view",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.permissions.create(ctx, {
      id: asAdministrationPermissionId("perm_1"),
      tenantId: "tenant_a",
      key: "admin.read",
      name: "Read",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.permissions.get(ctx, asAdministrationPermissionId("perm_1"));
    await repos.permissions.list(ctx);
    await repos.permissions.update(ctx, {
      id: asAdministrationPermissionId("perm_1"),
      tenantId: "tenant_a",
      key: "admin.read",
      name: "Read2",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.diagnostics.create(ctx, {
      id: asAdministrationDiagnosticId("diag_1"),
      tenantId: "tenant_a",
      severity: "info",
      code: "OK",
      message: "m",
      createdAt: now.toISOString(),
    });
    await repos.diagnostics.get(ctx, asAdministrationDiagnosticId("diag_1"));
    await repos.diagnostics.list(ctx);
    await repos.diagnostics.update(ctx, {
      id: asAdministrationDiagnosticId("diag_1"),
      tenantId: "tenant_a",
      severity: "warning",
      code: "WARN",
      message: "m2",
      createdAt: now.toISOString(),
    });

    await repos.registrations.create(ctx, {
      id: asAdministrationRegistrationId("reg_1"),
      tenantId: "tenant_a",
      moduleKey: "identity",
      version: "0.1.0",
      status: "registered",
      registeredAt: now.toISOString(),
      registeredBy: "user_1",
    });
    await repos.registrations.get(ctx, asAdministrationRegistrationId("reg_1"));
    await repos.registrations.list(ctx);
    await repos.registrations.update(ctx, {
      id: asAdministrationRegistrationId("reg_1"),
      tenantId: "tenant_a",
      moduleKey: "identity",
      version: "0.1.0",
      status: "active",
      registeredAt: now.toISOString(),
      registeredBy: "user_1",
    });

    await repos.policies.create(ctx, {
      id: asAdministrationPolicyId("pol_1"),
      tenantId: "tenant_a",
      kind: "access",
      key: "k",
      name: "n",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.policies.get(ctx, asAdministrationPolicyId("pol_1"));
    await repos.policies.list(ctx);
    await repos.policies.update(ctx, {
      id: asAdministrationPolicyId("pol_1"),
      tenantId: "tenant_a",
      kind: "audit",
      key: "k",
      name: "n2",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.capabilities.create(ctx, {
      id: asAdministrationCapabilityId("cap_1"),
      tenantId: "tenant_a",
      moduleId: asAdministrationModuleId("mod_1"),
      key: "sso",
      name: "SSO",
      enabled: true,
      available: true,
      healthy: true,
      certified: true,
      productionReady: true,
      owner: "o",
      version: "1",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.capabilities.get(ctx, asAdministrationCapabilityId("cap_1"));
    await repos.capabilities.list(ctx);
    await repos.capabilities.update(ctx, {
      id: asAdministrationCapabilityId("cap_1"),
      tenantId: "tenant_a",
      moduleId: asAdministrationModuleId("mod_1"),
      key: "sso",
      name: "SSO2",
      enabled: true,
      available: true,
      healthy: true,
      certified: true,
      productionReady: true,
      owner: "o",
      version: "1",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.navigations.create(ctx, {
      id: asAdministrationNavigationId("nav_1"),
      tenantId: "tenant_a",
      moduleId: asAdministrationModuleId("mod_1"),
      key: "k",
      label: "L",
      ordering: 1,
      visibility: "visible",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.navigations.get(ctx, asAdministrationNavigationId("nav_1"));
    await repos.navigations.list(ctx);
    await repos.navigations.update(ctx, {
      id: asAdministrationNavigationId("nav_1"),
      tenantId: "tenant_a",
      moduleId: asAdministrationModuleId("mod_1"),
      key: "k",
      label: "L2",
      ordering: 2,
      visibility: "hidden",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.shortcuts.create(ctx, {
      id: asAdministrationShortcutId("sh_1"),
      tenantId: "tenant_a",
      key: "k",
      label: "L",
      ordering: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.shortcuts.get(ctx, asAdministrationShortcutId("sh_1"));
    await repos.shortcuts.list(ctx);
    await repos.shortcuts.update(ctx, {
      id: asAdministrationShortcutId("sh_1"),
      tenantId: "tenant_a",
      key: "k",
      label: "L2",
      ordering: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.dashboards.create(ctx, {
      id: asAdministrationDashboardId("dash_1"),
      tenantId: "tenant_a",
      key: "k",
      name: "N",
      ordering: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.dashboards.get(ctx, asAdministrationDashboardId("dash_1"));
    await repos.dashboards.list(ctx);
    await repos.dashboards.update(ctx, {
      id: asAdministrationDashboardId("dash_1"),
      tenantId: "tenant_a",
      key: "k",
      name: "N2",
      ordering: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await repos.audits.append(ctx, {
      id: asAdministrationAuditId("aud_1"),
      tenantId: "tenant_a",
      action: "created",
      actorUserId: "user_1",
      createdAt: now.toISOString(),
    });
    await repos.audits.get(ctx, asAdministrationAuditId("aud_1"));
    await repos.audits.list(ctx);

    await repos.history.create(ctx, {
      id: asAdministrationHistoryId("hst_1"),
      moduleId: asAdministrationModuleId("mod_1"),
      summary: "s",
      actorUserId: "user_1",
      createdAt: now.toISOString(),
    });
    await repos.history.get(ctx, asAdministrationHistoryId("hst_1"));
    await repos.history.listByModule(ctx, asAdministrationModuleId("mod_1"));

    await repos.metadata.create(ctx, {
      id: asAdministrationMetadataId("md_1"),
      moduleId: asAdministrationModuleId("mod_1"),
      notes: "n",
    });
    await repos.metadata.get(ctx, asAdministrationMetadataId("md_1"));
    await repos.metadata.update(ctx, {
      id: asAdministrationMetadataId("md_1"),
      moduleId: asAdministrationModuleId("mod_1"),
      notes: "n2",
    });
    await repos.metadata.listByModule(ctx, asAdministrationModuleId("mod_1"));

    await repos.references.create(ctx, {
      id: asAdministrationReferenceId("ref_1"),
      moduleId: asAdministrationModuleId("mod_1"),
      kind: "documentation",
      resourceId: "r",
    });
    await repos.references.get(ctx, asAdministrationReferenceId("ref_1"));
    await repos.references.listByModule(ctx, asAdministrationModuleId("mod_1"));

    await repos.widgets.create(ctx, {
      id: asAdministrationWidgetId("w_1"),
      dashboardId: asAdministrationDashboardId("dash_1"),
      key: "k",
      name: "N",
      kind: "metric",
      ordering: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.widgets.get(ctx, asAdministrationWidgetId("w_1"));
    await repos.widgets.update(ctx, {
      id: asAdministrationWidgetId("w_1"),
      dashboardId: asAdministrationDashboardId("dash_1"),
      key: "k",
      name: "N2",
      kind: "card",
      ordering: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await repos.widgets.listByDashboard(ctx, asAdministrationDashboardId("dash_1"));

    const emptyDb = mockDb([]);
    const emptyRepos = createPostgresAdministrationRepositories(emptyDb);
    expect(
      await emptyRepos.modules.get(ctx, asAdministrationModuleId("missing")),
    ).toBeNull();
  });

  it("wires createAdministrationPersistenceForTest with postgresDb", async () => {
    const { createAdministrationPersistenceForTest } = await import("./index");
    const repos = createAdministrationPersistenceForTest({
      postgresDb: mockDb([]),
    });
    expect(repos.modules).toBeTruthy();
  });
});
