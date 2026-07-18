/**
 * Administration typed client coverage (APZADMIN-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createHttpAdministrationClient,
  createMockAdministrationClient,
  getAdministrationClient,
  listModules,
  resetAdministrationClient,
  setAdministrationClient,
  administrationQueryKeys,
  toAdministrationUserMessage,
  AdministrationClientError,
  assertAdministrationApiPath,
} from "./index";

afterEach(() => {
  resetAdministrationClient();
  vi.unstubAllGlobals();
});

describe("mock administration client", () => {
  it("supports module lifecycle without runtime methods", async () => {
    const client = createMockAdministrationClient();
    const listed = await client.listModules();
    expect(listed.items[0]?.id).toBe("mod_mock_1");
    const created = await client.createModule({
      key: "support",
      name: "Support",
    });
    expect(created.key).toBe("support");
    const archived = await client.archiveModule(created.id);
    expect(archived.status).toBe("archived");
    const restored = await client.restoreModule(created.id);
    expect(restored.status).toBe("draft");
    const transitioned = await client.transitionModule(created.id, {
      to: "active",
    });
    expect(transitioned.status).toBe("active");
    expect("executeAdministration" in client || "provisionUser" in client).toBe(false);
  });
});

describe("HTTP administration client", () => {
  it("builds routes and maps envelopes for core facets", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push(`${init?.method ?? "GET"} ${url}`);
        const path = url.split("?")[0] ?? url;
        const item = {
          id: "x",
          tenantId: "t",
          key: "projects",
          name: "Projects",
          status: "draft",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
          createdBy: "u",
          updatedBy: "u",
          revision: 1,
          moduleId: "mod_1",
          categoryId: "cat_1",
          kind: "view",
          label: "L",
          ordering: 0,
          visibility: "visible",
          enabled: true,
          available: true,
          healthy: true,
          certified: false,
          productionReady: false,
          owner: "o",
          version: "1",
          dashboardId: "dash_1",
          action: "created",
          actorUserId: "u",
          summary: "s",
          severity: "info",
          code: "OK",
          message: "ok",
          resourceId: "r",
          moduleKey: "projects",
          registeredAt: "2026-07-16T00:00:00.000Z",
          registeredBy: "u",
          administrationEnabled: true,
          managementPlaneReady: true,
          httpEnabled: true,
          workbenchEnabled: false,
          runtimeAdminEnabled: false,
        };
        const method = init?.method ?? "GET";
        const isCollectionGet =
          method === "GET" &&
          (path.endsWith("/modules") ||
            path.endsWith("/categories") ||
            path.endsWith("/sections") ||
            path.endsWith("/actions") ||
            path.endsWith("/permissions") ||
            path.endsWith("/registrations") ||
            path.endsWith("/policies") ||
            path.endsWith("/capabilities") ||
            path.endsWith("/navigations") ||
            path.endsWith("/shortcuts") ||
            path.endsWith("/dashboards") ||
            path.endsWith("/widgets") ||
            path.endsWith("/metadata") ||
            path.endsWith("/references") ||
            path.endsWith("/audit") ||
            path.includes("/audit?") ||
            path.includes("/metadata?") ||
            path.includes("/references?") ||
            path.endsWith("/history") ||
            false);
        if (isCollectionGet) {
          return new Response(
            JSON.stringify({
              data: [{ ...item, id: path.includes("modules") ? "mod_1" : "x" }],
              page: { limit: 1, hasMore: false },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        return new Response(JSON.stringify({ data: item }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );

    const client = createHttpAdministrationClient();
    const modules = await client.listModules({ status: "draft" });
    expect(modules.items[0]?.id).toBe("mod_1");
    await client.getModule("mod_1");
    await client.createModule({ key: "projects", name: "Projects" });
    await client.updateModule("mod_1", { name: "P" });
    await client.archiveModule("mod_1");
    await client.restoreModule("mod_1");
    await client.transitionModule("mod_1", { to: "active" });
    await client.listModuleAudit("mod_1");
    await client.listModuleHistory("mod_1");
    await client.listModuleMetadata("mod_1");
    await client.listModuleReferences("mod_1");
    await client.listCategories();
    await client.getCategory("cat_1");
    await client.createCategory({ key: "g", name: "G" });
    await client.updateCategory("cat_1", { name: "G2" });
    await client.listSections();
    await client.getSection("sec_1");
    await client.createSection({
      categoryId: "cat_1",
      key: "s",
      name: "S",
    });
    await client.updateSection("sec_1", { name: "S2" });
    await client.listActions();
    await client.getAction("act_1");
    await client.createAction({ key: "a", name: "A", kind: "view" });
    await client.updateAction("act_1", { name: "A2" });
    await client.listPermissions();
    await client.getPermission("perm_1");
    await client.createPermission({ key: "p", name: "P" });
    await client.updatePermission("perm_1", { name: "P2" });
    await client.listRegistrations();
    await client.getRegistration("reg_1");
    await client.createRegistration({
      moduleKey: "projects",
      version: "1.0.0",
    });
    await client.updateRegistration("reg_1", { version: "1.0.1" });
    await client.listPolicies();
    await client.getPolicy("pol_1");
    await client.createPolicy({ kind: "access", key: "k", name: "N" });
    await client.updatePolicy("pol_1", { name: "N2" });
    await client.listCapabilities();
    await client.getCapability("cap_1");
    await client.createCapability({
      moduleId: "mod_1",
      key: "c",
      name: "C",
      owner: "o",
      version: "1",
    });
    await client.updateCapability("cap_1", { name: "C2" });
    await client.listNavigations();
    await client.getNavigation("nav_1");
    await client.createNavigation({
      moduleId: "mod_1",
      key: "n",
      label: "N",
      ordering: 0,
      visibility: "visible",
    });
    await client.updateNavigation("nav_1", { label: "N2" });
    await client.listShortcuts();
    await client.getShortcut("sc_1");
    await client.createShortcut({ key: "s", label: "S", ordering: 0 });
    await client.updateShortcut("sc_1", { label: "S2" });
    await client.listDashboards();
    await client.getDashboard("dash_1");
    await client.createDashboard({ key: "d", name: "D" });
    await client.updateDashboard("dash_1", { name: "D2" });
    await client.listWidgets("dash_1");
    await client.getWidget("wid_1");
    await client.createWidget("dash_1", {
      key: "w",
      name: "W",
      kind: "card",
    });
    await client.updateWidget("wid_1", { name: "W2" });
    await client.listMetadata("mod_1");
    await client.getMetadata("meta_1");
    await client.createMetadata({ moduleId: "mod_1" });
    await client.updateMetadata("meta_1", { notes: "n" });
    await client.listReferences("mod_1");
    await client.getReference("ref_1");
    await client.createReference({
      moduleId: "mod_1",
      kind: "module",
      resourceId: "r",
    });
    await client.listAudit();
    await client.listAudit("mod_1");
    await client.getAudit("aud_1");
    await client.getHistory("hist_1");
    await client.getDiagnostics();
    await client.getDiagnostic("diag_1");
    await client.getHealth();
    await client.getReadiness();
    await client.getManagementCapabilities();

    expect(calls.some((c) => c.includes("/api/v1/administration/modules"))).toBe(true);
    expect(calls.some((c) => c.includes("/management-capabilities"))).toBe(true);
    expect(calls.every((c) => c.includes("/api/v1/administration"))).toBe(true);
  });

  it("maps error envelopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: { message: "Nope", code: "FORBIDDEN" },
              meta: { correlationId: "c1", requestId: "r1" },
            }),
            { status: 403, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const client = createHttpAdministrationClient();
    await expect(client.getModule("mod_1")).rejects.toMatchObject({
      message: "Nope",
      code: "FORBIDDEN",
      status: 403,
      correlationId: "c1",
    });
  });

  it("rejects forbidden path segments via assert", () => {
    expect(() =>
      assertAdministrationApiPath("/api/v1/administration/runtime"),
    ).toThrow();
  });
});

describe("administration API facade and query keys", () => {
  it("uses injectable client and query key roots", async () => {
    const mock = createMockAdministrationClient();
    setAdministrationClient(mock);
    expect(getAdministrationClient()).toBe(mock);
    const listed = await listModules();
    expect(listed.items[0]?.id).toBe("mod_mock_1");
    expect(administrationQueryKeys.all).toEqual(["administration"]);
    expect(administrationQueryKeys.modules.detail("mod_1")).toEqual([
      "administration",
      "modules",
      "detail",
      "mod_1",
    ]);
    expect(administrationQueryKeys.health()).toEqual(["administration", "health"]);
  });

  it("formats user messages", () => {
    expect(
      toAdministrationUserMessage(new AdministrationClientError({ message: "x" })),
    ).toBe("x");
    expect(toAdministrationUserMessage(new Error("y"))).toBe("y");
    expect(toAdministrationUserMessage("z")).toBe("Administration request failed");
  });
});
