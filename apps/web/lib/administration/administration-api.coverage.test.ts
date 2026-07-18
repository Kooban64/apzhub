/**
 * APZADMIN-003 — facade + query-key coverage.
 */
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";

import {
  archiveModule,
  clearAdministrationQueries,
  createAction,
  createCapability,
  createCategory,
  createDashboard,
  createMetadata,
  createModule,
  createNavigation,
  createPermission,
  createPolicy,
  createReference,
  createRegistration,
  createSection,
  createShortcut,
  createWidget,
  createMockAdministrationClient,
  getAction,
  getAdministrationClient,
  getAudit,
  getCapability,
  getCategory,
  getDashboard,
  getDiagnostic,
  getDiagnostics,
  getHealth,
  getHistory,
  getManagementCapabilities,
  getMetadata,
  getModule,
  getNavigation,
  getPermission,
  getPolicy,
  getReadiness,
  getReference,
  getRegistration,
  getSection,
  getShortcut,
  getWidget,
  listActions,
  listAudit,
  listCapabilities,
  listCategories,
  listDashboards,
  listMetadata,
  listModuleAudit,
  listModuleHistory,
  listModuleMetadata,
  listModuleReferences,
  listModules,
  listNavigations,
  listPermissions,
  listPolicies,
  listReferences,
  listRegistrations,
  listSections,
  listShortcuts,
  listWidgets,
  resetAdministrationClient,
  restoreModule,
  setAdministrationClient,
  transitionModule,
  updateAction,
  updateCapability,
  updateCategory,
  updateDashboard,
  updateMetadata,
  updateModule,
  updateNavigation,
  updatePermission,
  updatePolicy,
  updateRegistration,
  updateSection,
  updateShortcut,
  updateWidget,
  administrationQueryKeys,
} from "./index";

describe("APZADMIN-003 administration-api facade coverage", () => {
  afterEach(() => {
    resetAdministrationClient();
  });

  it("exercises every production facade through the mock client", async () => {
    setAdministrationClient(createMockAdministrationClient());
    expect(getAdministrationClient()).toBeTruthy();

    expect((await listModules()).items.length).toBeGreaterThan(0);
    expect((await getModule("mod_mock_1")).id).toBe("mod_mock_1");
    expect((await createModule({ key: "support", name: "Support" })).id).toBe(
      "mod_new",
    );
    expect((await updateModule("mod_new", { name: "S2" })).name).toBe("S2");
    expect((await archiveModule("mod_new")).status).toBe("archived");
    expect((await restoreModule("mod_new")).status).toBe("draft");
    expect((await transitionModule("mod_new", { to: "active" })).status).toBe("active");
    await listModuleAudit("mod_new");
    await listModuleHistory("mod_new");
    await listModuleMetadata("mod_new");
    await listModuleReferences("mod_new");

    await listCategories();
    await getCategory("cat_1");
    await createCategory({ key: "k", name: "n" });
    await updateCategory("cat_1", { name: "n2" });

    await listSections();
    await getSection("sec_1");
    await createSection({ categoryId: "cat_1", key: "k", name: "n" });
    await updateSection("sec_1", { name: "n2" });

    await listActions();
    await getAction("act_1");
    await createAction({ key: "k", name: "n", kind: "view" });
    await updateAction("act_1", { name: "n2" });

    await listPermissions();
    await getPermission("perm_1");
    await createPermission({ key: "k", name: "n" });
    await updatePermission("perm_1", { name: "n2" });

    await listRegistrations();
    await getRegistration("reg_1");
    await createRegistration({ moduleKey: "projects", version: "1.0.0" });
    await updateRegistration("reg_1", { version: "1.0.1" });

    await listPolicies();
    await getPolicy("pol_1");
    await createPolicy({ kind: "access", key: "k", name: "n" });
    await updatePolicy("pol_1", { name: "n2" });

    await listCapabilities();
    await getCapability("cap_1");
    await createCapability({
      moduleId: "mod_1",
      key: "k",
      name: "n",
      owner: "o",
      version: "1",
    });
    await updateCapability("cap_1", { name: "n2" });

    await listNavigations();
    await getNavigation("nav_1");
    await createNavigation({
      moduleId: "mod_1",
      key: "k",
      label: "L",
      ordering: 0,
      visibility: "visible",
    });
    await updateNavigation("nav_1", { label: "L2" });

    await listShortcuts();
    await getShortcut("sc_1");
    await createShortcut({ key: "k", label: "L", ordering: 0 });
    await updateShortcut("sc_1", { label: "L2" });

    await listDashboards();
    await getDashboard("dash_1");
    await createDashboard({ key: "k", name: "n" });
    await updateDashboard("dash_1", { name: "n2" });

    await listWidgets("dash_1");
    await getWidget("wid_1");
    await createWidget("dash_1", { key: "k", name: "n", kind: "card" });
    await updateWidget("wid_1", { name: "n2" });

    await listMetadata("mod_1");
    await getMetadata("meta_1");
    await createMetadata({ moduleId: "mod_1" });
    await updateMetadata("meta_1", { notes: "n" });

    await listReferences("mod_1");
    await getReference("ref_1");
    await createReference({
      moduleId: "mod_1",
      kind: "module",
      resourceId: "r",
    });

    await listAudit();
    await listAudit("mod_1");
    await getAudit("aud_1");
    await getHistory("hist_1");
    await getDiagnostics();
    await getDiagnostic("diag_1");
    await getHealth();
    await getReadiness();
    expect((await getManagementCapabilities()).httpEnabled).toBe(true);

    expect(administrationQueryKeys.modules.list({ status: "draft", key: "" })[2]).toBe(
      "list",
    );
    expect(
      administrationQueryKeys.modules.list({ status: "draft", limit: 10 })[3],
    ).toContain("draft");
    expect(administrationQueryKeys.modules.detail("mod")[3]).toBe("mod");
    expect(administrationQueryKeys.modules.audit("m")[3]).toBe("m");
    expect(administrationQueryKeys.modules.history("m")[3]).toBe("m");
    expect(administrationQueryKeys.modules.metadata("m")[3]).toBe("m");
    expect(administrationQueryKeys.modules.references("m")[3]).toBe("m");
    expect(administrationQueryKeys.categories.list()[2]).toBe("list");
    expect(administrationQueryKeys.categories.detail("c")[3]).toBe("c");
    expect(administrationQueryKeys.sections.list()[2]).toBe("list");
    expect(administrationQueryKeys.sections.detail("s")[3]).toBe("s");
    expect(administrationQueryKeys.actions.list()[2]).toBe("list");
    expect(administrationQueryKeys.actions.detail("a")[3]).toBe("a");
    expect(administrationQueryKeys.permissions.list()[2]).toBe("list");
    expect(administrationQueryKeys.permissions.detail("p")[3]).toBe("p");
    expect(administrationQueryKeys.registrations.list()[2]).toBe("list");
    expect(administrationQueryKeys.registrations.detail("r")[3]).toBe("r");
    expect(administrationQueryKeys.policies.list()[2]).toBe("list");
    expect(administrationQueryKeys.policies.detail("p")[3]).toBe("p");
    expect(administrationQueryKeys.capabilities.list()[2]).toBe("list");
    expect(administrationQueryKeys.capabilities.detail("c")[3]).toBe("c");
    expect(administrationQueryKeys.navigations.list()[2]).toBe("list");
    expect(administrationQueryKeys.navigations.detail("n")[3]).toBe("n");
    expect(administrationQueryKeys.shortcuts.list()[2]).toBe("list");
    expect(administrationQueryKeys.shortcuts.detail("s")[3]).toBe("s");
    expect(administrationQueryKeys.dashboards.list()[2]).toBe("list");
    expect(administrationQueryKeys.dashboards.detail("d")[3]).toBe("d");
    expect(administrationQueryKeys.widgets.list("d")[3]).toBe("d");
    expect(administrationQueryKeys.widgets.detail("w")[3]).toBe("w");
    expect(administrationQueryKeys.metadata.list("m")[3]).toBe("m");
    expect(administrationQueryKeys.metadata.detail("x")[3]).toBe("x");
    expect(administrationQueryKeys.references.list("m")[3]).toBe("m");
    expect(administrationQueryKeys.references.detail("r")[3]).toBe("r");
    expect(administrationQueryKeys.audit.list()[3]).toBe("all");
    expect(administrationQueryKeys.audit.list("m")[3]).toBe("m");
    expect(administrationQueryKeys.audit.detail("a")[3]).toBe("a");
    expect(administrationQueryKeys.history.detail("h")[3]).toBe("h");
    expect(administrationQueryKeys.diagnostics.list()[2]).toBe("list");
    expect(administrationQueryKeys.diagnostics.detail("d")[3]).toBe("d");
    expect(administrationQueryKeys.managementCapabilities()[1]).toBe(
      "management-capabilities",
    );
    expect(administrationQueryKeys.health()[1]).toBe("health");
    expect(administrationQueryKeys.readiness()[1]).toBe("readiness");

    const qc = new QueryClient();
    clearAdministrationQueries(qc);
  });
});
