/**
 * Platform Administration domain service coverage (APZADMIN-002).
 */

import { describe, expect, it } from "vitest";

import type { AdministrationRequestContext } from "@apzhub/admin-contracts";
import { asAdministrationModuleId } from "@apzhub/admin-contracts";
import {
  AdministrationDomainError,
  createPlatformAdministrationService,
} from "@apzhub/admin-core";
import { createAdministrationPersistenceForTest } from "@apzhub/admin-persistence";

const ctx: AdministrationRequestContext = {
  tenantId: "tenant_adm",
  userId: "user_adm",
  correlationId: "corr_adm",
};

function createService() {
  let seq = 0;
  const repos = createAdministrationPersistenceForTest({
    allowInMemoryPersistence: true,
  });
  return createPlatformAdministrationService({
    repos,
    now: () => "2026-07-16T00:00:00.000Z",
    id: () => `adm_${++seq}`,
    persistenceMode: "memory",
  });
}

describe("createPlatformAdministrationService", () => {
  it("requires explicit repos", () => {
    expect(() =>
      createPlatformAdministrationService({
        repos: undefined as never,
        now: () => "",
        id: () => "x",
      }),
    ).toThrow(AdministrationDomainError);
  });

  it("rejects missing tenant/user context", async () => {
    const service = createService();
    await expect(service.listModules({ ...ctx, tenantId: "" })).rejects.toThrow(
      /tenantId/,
    );
    await expect(service.listModules({ ...ctx, userId: "" })).rejects.toThrow(
      /userId/,
    );
  });

  it("creates module with lifecycle, audit, and history", async () => {
    const service = createService();
    const created = await service.createModule(ctx, {
      key: "configuration",
      name: "Configuration",
      description: "Config admin",
    });
    expect(created.status).toBe("draft");

    const registered = await service.transitionLifecycle(ctx, {
      moduleId: created.id,
      to: "registered",
    });
    expect(registered.status).toBe("registered");

    const active = await service.transitionLifecycle(ctx, {
      moduleId: created.id,
      to: "active",
    });
    expect(active.status).toBe("active");

    const updated = await service.updateModuleMetadata(ctx, {
      moduleId: created.id,
      name: "Configuration Admin",
    });
    expect(updated.name).toBe("Configuration Admin");

    const audits = await service.listAudit(ctx, created.id);
    expect(audits.length).toBeGreaterThan(0);
    const history = await service.listHistory(ctx, created.id);
    expect(history.length).toBeGreaterThan(0);

    const archived = await service.archiveModule(ctx, created.id);
    expect(archived.status).toBe("archived");
    const restored = await service.restoreModule(ctx, created.id);
    expect(restored.status).toBe("draft");
  });

  it("supports nested facet CRUD and diagnostics metadata", async () => {
    const service = createService();
    const module = await service.createModule(ctx, {
      key: "projects",
      name: "Projects",
    });
    expect((await service.listModules(ctx)).length).toBeGreaterThan(0);
    expect((await service.getModule(ctx, module.id)).id).toBe(module.id);

    const category = await service.createCategory(ctx, {
      key: "general",
      name: "General",
      moduleId: module.id,
      description: "desc",
    });
    expect(
      (
        await service.updateCategory(ctx, {
          categoryId: category.id,
          name: "Gen",
          description: null,
          ordering: 2,
        })
      ).name,
    ).toBe("Gen");
    expect((await service.listCategories(ctx)).length).toBeGreaterThan(0);
    expect((await service.getCategory(ctx, category.id)).id).toBe(category.id);

    const section = await service.createSection(ctx, {
      categoryId: category.id,
      key: "overview",
      name: "Overview",
      description: "s",
    });
    expect(
      (
        await service.updateSection(ctx, {
          sectionId: section.id,
          name: "OV",
          description: null,
          ordering: 3,
        })
      ).name,
    ).toBe("OV");
    expect((await service.listSections(ctx)).length).toBeGreaterThan(0);
    expect((await service.getSection(ctx, section.id)).id).toBe(section.id);

    const action = await service.createAction(ctx, {
      key: "view",
      name: "View",
      kind: "view",
      moduleId: module.id,
      description: "a",
      permissionKeys: ["admin.read"],
    });
    expect(
      (
        await service.updateAction(ctx, {
          actionId: action.id,
          name: "View2",
          description: null,
          kind: "manage",
          permissionKeys: null,
        })
      ).name,
    ).toBe("View2");
    expect((await service.listActions(ctx)).length).toBeGreaterThan(0);
    expect((await service.getAction(ctx, action.id)).id).toBe(action.id);

    const permission = await service.createPermission(ctx, {
      key: "admin.read",
      name: "Read",
      description: "p",
    });
    expect(
      (
        await service.updatePermission(ctx, {
          permissionId: permission.id,
          name: "Read Admin",
          description: null,
        })
      ).name,
    ).toBe("Read Admin");
    expect((await service.listPermissions(ctx)).length).toBeGreaterThan(0);
    expect((await service.getPermission(ctx, permission.id)).id).toBe(
      permission.id,
    );

    const registration = await service.createRegistration(ctx, {
      moduleKey: "projects",
      version: "1.0.0",
      notes: "n",
    });
    expect(registration.status).toBe("registered");
    expect(
      (
        await service.updateRegistration(ctx, {
          registrationId: registration.id,
          version: "1.0.1",
          notes: null,
          status: "active",
        })
      ).version,
    ).toBe("1.0.1");
    expect((await service.listRegistrations(ctx)).length).toBeGreaterThan(0);
    expect((await service.getRegistration(ctx, registration.id)).id).toBe(
      registration.id,
    );

    const metadata = await service.createMetadata(ctx, {
      moduleId: module.id,
      labels: { a: "1" },
      tags: ["core"],
      notes: "safe notes",
    });
    expect(
      (
        await service.updateMetadata(ctx, {
          metadataId: metadata.id,
          notes: "updated",
          labels: null,
          tags: null,
        })
      ).notes,
    ).toBe("updated");
    expect((await service.listMetadata(ctx, module.id)).length).toBeGreaterThan(
      0,
    );
    expect((await service.getMetadata(ctx, metadata.id)).id).toBe(metadata.id);

    const policy = await service.createPolicy(ctx, {
      kind: "access",
      key: "default",
      name: "Default",
      moduleId: module.id,
      description: "pol",
    });
    expect(
      (
        await service.updatePolicy(ctx, {
          policyId: policy.id,
          name: "Def",
          description: null,
          kind: "audit",
        })
      ).name,
    ).toBe("Def");
    expect((await service.listPolicies(ctx)).length).toBeGreaterThan(0);
    expect((await service.getPolicy(ctx, policy.id)).id).toBe(policy.id);

    const reference = await service.createReference(ctx, {
      moduleId: module.id,
      kind: "documentation",
      resourceId: "doc_1",
      label: "Doc",
    });
    expect(reference.kind).toBe("documentation");
    expect((await service.listReferences(ctx, module.id)).length).toBeGreaterThan(
      0,
    );
    expect((await service.getReference(ctx, reference.id)).id).toBe(reference.id);

    const capability = await service.createCapability(ctx, {
      moduleId: module.id,
      key: "projects.admin",
      name: "Projects Admin",
      owner: "platform",
      version: "0.1.0",
      description: "c",
      enabled: true,
      available: true,
      healthy: true,
      certified: true,
      productionReady: true,
      limitations: ["none"],
      documentation: "docs",
    });
    expect(capability.productionReady).toBe(true);
    expect(
      (
        await service.updateCapability(ctx, {
          capabilityId: capability.id,
          name: "PA",
          description: null,
          limitations: null,
          documentation: null,
          enabled: true,
          available: true,
          healthy: true,
          certified: true,
          productionReady: true,
          owner: "platform",
          version: "0.1.1",
        })
      ).name,
    ).toBe("PA");
    expect((await service.listCapabilities(ctx)).length).toBeGreaterThan(0);
    expect((await service.getCapability(ctx, capability.id)).id).toBe(
      capability.id,
    );

    const navigation = await service.createNavigation(ctx, {
      moduleId: module.id,
      key: "home",
      label: "Home",
      ordering: 1,
      visibility: "visible",
      permissionKeys: ["admin.read"],
      iconKey: "home",
      routePath: "/home",
    });
    expect(
      (
        await service.updateNavigation(ctx, {
          navigationId: navigation.id,
          label: "Home2",
          ordering: 2,
          visibility: "hidden",
          permissionKeys: null,
          iconKey: null,
          routePath: null,
        })
      ).label,
    ).toBe("Home2");
    expect((await service.listNavigations(ctx)).length).toBeGreaterThan(0);
    expect((await service.getNavigation(ctx, navigation.id)).id).toBe(
      navigation.id,
    );

    const shortcut = await service.createShortcut(ctx, {
      key: "go",
      label: "Go",
      ordering: 1,
      moduleId: module.id,
      permissionKeys: ["admin.read"],
    });
    expect(
      (
        await service.updateShortcut(ctx, {
          shortcutId: shortcut.id,
          label: "Go2",
          ordering: 2,
          permissionKeys: null,
        })
      ).label,
    ).toBe("Go2");
    expect((await service.listShortcuts(ctx)).length).toBeGreaterThan(0);
    expect((await service.getShortcut(ctx, shortcut.id)).id).toBe(shortcut.id);

    const dashboard = await service.createDashboard(ctx, {
      key: "main",
      name: "Main",
      moduleId: module.id,
      description: "d",
      ordering: 1,
    });
    expect(
      (
        await service.updateDashboard(ctx, {
          dashboardId: dashboard.id,
          name: "Main2",
          description: null,
          ordering: 2,
        })
      ).name,
    ).toBe("Main2");
    expect((await service.listDashboards(ctx)).length).toBeGreaterThan(0);
    expect((await service.getDashboard(ctx, dashboard.id)).id).toBe(dashboard.id);

    const widget = await service.createWidget(ctx, {
      dashboardId: dashboard.id,
      key: "summary",
      name: "Summary",
      kind: "summary",
    });
    expect(widget.kind).toBe("summary");
    expect(
      (
        await service.updateWidget(ctx, {
          widgetId: widget.id,
          name: "Summary2",
          kind: "metric",
          ordering: 2,
        })
      ).name,
    ).toBe("Summary2");
    expect(await service.listWidgets(ctx, dashboard.id)).toHaveLength(1);
    expect((await service.getWidget(ctx, widget.id)).id).toBe(widget.id);

    expect((await service.listAudit(ctx)).length).toBeGreaterThan(0);
    const audits = await service.listAudit(ctx, module.id);
    expect((await service.getAudit(ctx, audits[0]!.id)).id).toBe(audits[0]!.id);
    const history = await service.listHistory(ctx, module.id);
    expect((await service.getHistory(ctx, history[0]!.id)).id).toBe(
      history[0]!.id,
    );
    expect(await service.listDiagnostics(ctx)).toEqual([]);
    await expect(
      service.getDiagnostic(ctx, "missing_diag" as never),
    ).rejects.toThrow(/not found/);

    expect((await service.diagnosticsHealth(ctx)).runtimeAdminEnabled).toBe(
      false,
    );
    expect((await service.diagnosticsHealth(ctx)).workbenchEnabled).toBe(false);
    expect((await service.diagnosticsHealth(ctx)).httpEnabled).toBe(false);
    expect((await service.diagnosticsReadiness(ctx)).ready).toBe(true);
    expect((await service.diagnosticsCapabilities(ctx)).runtimeAdmin).toBe(
      false,
    );
    expect((await service.diagnosticsCapabilities(ctx)).facets).toContain(
      "modules",
    );

    await service.updateModuleMetadata(ctx, {
      moduleId: module.id,
      description: null,
      organisationId: null,
    });
  });

  it("throws not_found for missing entities", async () => {
    const service = createService();
    await expect(
      service.getModule(ctx, asAdministrationModuleId("missing_mod")),
    ).rejects.toThrow(/not found/);
    await expect(
      service.createSection(ctx, {
        categoryId: "missing_cat" as never,
        key: "s",
        name: "S",
      }),
    ).rejects.toThrow(/not found/);
  });

  it("rejects secret hints in metadata notes", async () => {
    const service = createService();
    const module = await service.createModule(ctx, {
      key: "support",
      name: "Support",
    });
    await expect(
      service.createMetadata(ctx, {
        moduleId: module.id,
        notes: "contains password hint",
      }),
    ).rejects.toThrow(/secret/);
  });
});
