import { describe, expect, it } from "vitest";

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
import { createAdministrationFoundation } from "@apzhub/admin-core";

import {
  ADMIN_PERSISTENCE_VERSION,
  createAdministrationPersistence,
  createAdministrationPersistenceForTest,
  createEmptyAdministrationInMemoryStores,
  createProductionAdministrationPersistence,
} from "./index";

const ctx: AdministrationRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

const otherCtx: AdministrationRequestContext = {
  tenantId: "tenant_b",
  userId: "user_2",
};

const now = "2026-07-16T00:00:00.000Z";

describe("admin-persistence", () => {
  it("exports persistence version 0.1.0", () => {
    expect(ADMIN_PERSISTENCE_VERSION).toBe("0.1.0");
  });

  it("forbids silent production in-memory fallback", () => {
    expect(() => createAdministrationPersistence({ mode: "postgres" })).toThrow(
      /requires db/,
    );
    expect(() => createProductionAdministrationPersistence({} as never)).toThrow(
      /explicit postgres/,
    );
    expect(() => createAdministrationPersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() => createAdministrationPersistence({ mode: "redis" as never })).toThrow(
      /Unsupported/,
    );
  });

  it("persists administration metadata in memory with tenant isolation", async () => {
    const stores = createEmptyAdministrationInMemoryStores();
    const repos = createAdministrationPersistence({ mode: "memory", stores });
    const foundation = createAdministrationFoundation({ repos });

    const module = await foundation.modules.create(ctx, {
      id: asAdministrationModuleId("mod_1"),
      tenantId: "tenant_a",
      key: "identity",
      name: "Identity",
      status: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    expect(await foundation.modules.get(otherCtx, module.id)).toBeNull();
    expect((await foundation.modules.list(otherCtx)).length).toBe(0);

    const updated = {
      ...module,
      name: "Identity Admin",
      status: "registered" as const,
      updatedAt: "2026-07-16T01:00:00.000Z",
    };
    await foundation.modules.update(ctx, updated);
    expect((await foundation.modules.get(ctx, module.id))?.name).toBe("Identity Admin");

    const category = await foundation.categories.create(ctx, {
      id: asAdministrationCategoryId("cat_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      key: "general",
      name: "General",
      ordering: 1,
      createdAt: now,
      updatedAt: now,
    });
    await foundation.categories.update(ctx, { ...category, name: "General 2" });
    expect((await foundation.categories.list(ctx)).length).toBe(1);

    const section = await foundation.sections.create(ctx, {
      id: asAdministrationSectionId("sec_1"),
      tenantId: "tenant_a",
      categoryId: category.id,
      key: "overview",
      name: "Overview",
      ordering: 1,
      createdAt: now,
      updatedAt: now,
    });
    await foundation.sections.update(ctx, { ...section, name: "Overview 2" });

    const action = await foundation.actions.create(ctx, {
      id: asAdministrationActionId("act_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      sectionId: section.id,
      key: "view",
      name: "View",
      kind: "view",
      permissionKeys: ["admin.read"],
      createdAt: now,
      updatedAt: now,
    });
    await foundation.actions.update(ctx, { ...action, name: "View 2" });

    const permission = await foundation.permissions.create(ctx, {
      id: asAdministrationPermissionId("perm_1"),
      tenantId: "tenant_a",
      key: "admin.read",
      name: "Admin Read",
      createdAt: now,
      updatedAt: now,
    });
    await foundation.permissions.update(ctx, {
      ...permission,
      name: "Admin Read 2",
    });

    await foundation.audits.append(ctx, {
      id: asAdministrationAuditId("aud_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      action: "created",
      actorUserId: "user_1",
      createdAt: now,
    });
    expect(
      await foundation.audits.get(otherCtx, asAdministrationAuditId("aud_1")),
    ).toBeNull();
    expect((await foundation.audits.list(ctx)).length).toBe(1);

    await foundation.history.create(ctx, {
      id: asAdministrationHistoryId("hst_1"),
      moduleId: module.id,
      summary: "Registered",
      actorUserId: "user_1",
      createdAt: now,
    });
    expect((await foundation.history.listByModule(ctx, module.id)).length).toBe(1);
    expect(
      await foundation.history.get(ctx, asAdministrationHistoryId("hst_1")),
    ).toBeTruthy();
    expect((await foundation.history.listByModule(otherCtx, module.id)).length).toBe(0);

    const diagnostic = await foundation.diagnostics.create(ctx, {
      id: asAdministrationDiagnosticId("diag_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      severity: "info",
      code: "OK",
      message: "Healthy",
      createdAt: now,
    });
    await foundation.diagnostics.update(ctx, {
      ...diagnostic,
      message: "Still healthy",
    });

    const registration = await foundation.registrations.create(ctx, {
      id: asAdministrationRegistrationId("reg_1"),
      tenantId: "tenant_a",
      moduleKey: "identity",
      version: "0.1.0",
      status: "registered",
      registeredAt: now,
      registeredBy: "user_1",
    });
    await foundation.registrations.update(ctx, {
      ...registration,
      status: "active",
    });

    await foundation.metadata.create(ctx, {
      id: asAdministrationMetadataId("md_1"),
      moduleId: module.id,
      labels: { tier: "core" },
      tags: ["admin"],
      notes: "ok",
    });
    await foundation.metadata.update(ctx, {
      id: asAdministrationMetadataId("md_1"),
      moduleId: module.id,
      notes: "updated",
    });
    expect((await foundation.metadata.listByModule(ctx, module.id)).length).toBe(1);
    expect((await foundation.metadata.listByModule(otherCtx, module.id)).length).toBe(
      0,
    );

    const policy = await foundation.policies.create(ctx, {
      id: asAdministrationPolicyId("pol_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      kind: "access",
      key: "default",
      name: "Default access",
      createdAt: now,
      updatedAt: now,
    });
    await foundation.policies.update(ctx, { ...policy, name: "Default 2" });

    await foundation.references.create(ctx, {
      id: asAdministrationReferenceId("ref_1"),
      moduleId: module.id,
      kind: "documentation",
      resourceId: "doc_1",
      label: "Docs",
    });
    expect((await foundation.references.listByModule(ctx, module.id)).length).toBe(1);

    const capability = await foundation.capabilities.create(ctx, {
      id: asAdministrationCapabilityId("cap_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      key: "sso",
      name: "SSO",
      enabled: true,
      available: true,
      healthy: true,
      certified: true,
      productionReady: true,
      owner: "platform-identity",
      version: "1.0.0",
      createdAt: now,
      updatedAt: now,
    });
    await foundation.capabilities.update(ctx, {
      ...capability,
      limitations: ["beta-ui"],
    });

    const navigation = await foundation.navigations.create(ctx, {
      id: asAdministrationNavigationId("nav_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      categoryId: category.id,
      sectionId: section.id,
      key: "identity.root",
      label: "Identity",
      ordering: 1,
      visibility: "permission-gated",
      permissionKeys: ["admin.navigation"],
      iconKey: "shield",
      routePath: "/admin/identity",
      createdAt: now,
      updatedAt: now,
    });
    await foundation.navigations.update(ctx, {
      ...navigation,
      label: "Identity Admin",
    });

    const shortcut = await foundation.shortcuts.create(ctx, {
      id: asAdministrationShortcutId("sh_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      actionId: action.id,
      key: "open",
      label: "Open",
      ordering: 1,
      createdAt: now,
      updatedAt: now,
    });
    await foundation.shortcuts.update(ctx, { ...shortcut, label: "Open 2" });

    const dashboard = await foundation.dashboards.create(ctx, {
      id: asAdministrationDashboardId("dash_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      key: "overview",
      name: "Overview",
      ordering: 1,
      createdAt: now,
      updatedAt: now,
    });
    await foundation.dashboards.update(ctx, {
      ...dashboard,
      name: "Overview 2",
    });

    await foundation.widgets.create(ctx, {
      id: asAdministrationWidgetId("w_1"),
      dashboardId: dashboard.id,
      key: "health",
      name: "Health",
      kind: "metric",
      ordering: 1,
      createdAt: now,
      updatedAt: now,
    });
    await foundation.widgets.update(ctx, {
      id: asAdministrationWidgetId("w_1"),
      dashboardId: dashboard.id,
      key: "health",
      name: "Health 2",
      kind: "metric",
      ordering: 2,
      createdAt: now,
      updatedAt: now,
    });
    expect((await foundation.widgets.listByDashboard(ctx, dashboard.id)).length).toBe(
      1,
    );
    expect(
      (await foundation.widgets.listByDashboard(otherCtx, dashboard.id)).length,
    ).toBe(0);

    expect(await foundation.categories.get(ctx, category.id)).toBeTruthy();
    expect(await foundation.sections.get(ctx, section.id)).toBeTruthy();
    expect(await foundation.actions.get(ctx, action.id)).toBeTruthy();
    expect(await foundation.permissions.get(ctx, permission.id)).toBeTruthy();
    expect(await foundation.diagnostics.get(ctx, diagnostic.id)).toBeTruthy();
    expect(await foundation.registrations.get(ctx, registration.id)).toBeTruthy();
    expect(
      await foundation.metadata.get(ctx, asAdministrationMetadataId("md_1")),
    ).toBeTruthy();
    expect(await foundation.policies.get(ctx, policy.id)).toBeTruthy();
    expect(
      await foundation.references.get(ctx, asAdministrationReferenceId("ref_1")),
    ).toBeTruthy();
    expect(await foundation.capabilities.get(ctx, capability.id)).toBeTruthy();
    expect(await foundation.navigations.get(ctx, navigation.id)).toBeTruthy();
    expect(await foundation.shortcuts.get(ctx, shortcut.id)).toBeTruthy();
    expect(await foundation.dashboards.get(ctx, dashboard.id)).toBeTruthy();
    expect(
      await foundation.widgets.get(ctx, asAdministrationWidgetId("w_1")),
    ).toBeTruthy();
  });

  it("supports explicit test helpers", () => {
    const repos = createAdministrationPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    expect(repos.modules).toBeTruthy();
  });

  it("rejects cross-tenant writes and allows history without parent module", async () => {
    const repos = createAdministrationPersistence({ mode: "memory" });
    await expect(
      repos.modules.create(ctx, {
        id: asAdministrationModuleId("mod_x"),
        tenantId: "tenant_b",
        key: "identity",
        name: "Identity",
        status: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: "user_1",
        updatedBy: "user_1",
        revision: 1,
      }),
    ).rejects.toThrow(/tenant_mismatch/);

    const orphanHistory = await repos.history.create(ctx, {
      id: asAdministrationHistoryId("hst_orphan"),
      moduleId: asAdministrationModuleId("missing_mod"),
      summary: "No parent yet",
      actorUserId: "user_1",
      createdAt: now,
    });
    expect(orphanHistory.summary).toBe("No parent yet");

    await repos.modules.create(ctx, {
      id: asAdministrationModuleId("mod_hist"),
      tenantId: "tenant_a",
      key: "projects",
      name: "Projects",
      status: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    await expect(
      repos.history.create(otherCtx, {
        id: asAdministrationHistoryId("hst_bad"),
        moduleId: asAdministrationModuleId("mod_hist"),
        summary: "wrong tenant",
        actorUserId: "user_2",
        createdAt: now,
      }),
    ).rejects.toThrow(/tenant_mismatch/);
  });
});
