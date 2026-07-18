/**
 * APZADMIN-003 — full handler surface coverage.
 */
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import * as handlers from "./administration";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "../testing/fixtures";
import { PlatformApiHttpError } from "../errors";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-admin-cov",
      correlationId: "corr-admin-cov",
      timestamp: "2026-07-16T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

const p = (params: Record<string, string>) => ({
  params: Promise.resolve(params),
});

describe("APZADMIN-003 administration handler full surface", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("exercises every facet handler", async () => {
    installMockGateway();
    const ctx = makeContext();
    const get = (path: string) => makeRequest(path);
    const post = (path: string, body: unknown) =>
      makeRequest(path, { method: "POST", body: JSON.stringify(body) });
    const patch = (path: string, body: unknown) =>
      makeRequest(path, { method: "PATCH", body: JSON.stringify(body) });

    expect(
      (
        await (
          await handlers.handleListAdministrationModules(
            get("/api/v1/administration/modules?status=draft&key=projects"),
            ctx,
          )
        ).json()
      ).data.length,
    ).toBeGreaterThan(0);

    await handlers.handleCreateAdministrationModule(
      post("/api/v1/administration/modules", { key: "testing", name: "Testing" }),
      ctx,
    );
    await handlers.handleGetAdministrationModule(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleUpdateAdministrationModule(
      patch("/m", { name: "X", description: null, organisationId: null }),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleDeleteAdministrationModule(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleArchiveAdministrationModule(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleRestoreAdministrationModule(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleTransitionAdministrationModule(
      post("/m", { to: "active", reason: "go" }),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleListAdministrationModuleAudit(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleListAdministrationModuleHistory(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleListAdministrationModuleMetadata(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );
    await handlers.handleListAdministrationModuleReferences(
      get("/m"),
      ctx,
      p({ moduleId: "mod_1" }),
    );

    await handlers.handleListAdministrationCategories(get("/c"), ctx);
    await handlers.handleCreateAdministrationCategory(
      post("/c", { key: "k", name: "n", moduleId: "mod_1", ordering: 1 }),
      ctx,
    );
    await handlers.handleGetAdministrationCategory(
      get("/c"),
      ctx,
      p({ categoryId: "cat_1" }),
    );
    await handlers.handleUpdateAdministrationCategory(
      patch("/c", { name: "n2", description: null, ordering: 2 }),
      ctx,
      p({ categoryId: "cat_1" }),
    );

    await handlers.handleListAdministrationSections(get("/s"), ctx);
    await handlers.handleCreateAdministrationSection(
      post("/s", { categoryId: "cat_1", key: "k", name: "n" }),
      ctx,
    );
    await handlers.handleGetAdministrationSection(
      get("/s"),
      ctx,
      p({ sectionId: "sec_1" }),
    );
    await handlers.handleUpdateAdministrationSection(
      patch("/s", { name: "n2", description: null }),
      ctx,
      p({ sectionId: "sec_1" }),
    );

    await handlers.handleListAdministrationActions(get("/a"), ctx);
    await handlers.handleCreateAdministrationAction(
      post("/a", {
        key: "k",
        name: "n",
        kind: "view",
        moduleId: "mod_1",
        sectionId: "sec_1",
        permissionKeys: ["admin.read"],
      }),
      ctx,
    );
    await handlers.handleGetAdministrationAction(
      get("/a"),
      ctx,
      p({ actionId: "act_1" }),
    );
    await handlers.handleUpdateAdministrationAction(
      patch("/a", {
        name: "n2",
        description: null,
        kind: "manage",
        permissionKeys: null,
      }),
      ctx,
      p({ actionId: "act_1" }),
    );

    await handlers.handleListAdministrationPermissions(get("/p"), ctx);
    await handlers.handleCreateAdministrationPermission(
      post("/p", { key: "admin.x", name: "X" }),
      ctx,
    );
    await handlers.handleGetAdministrationPermission(
      get("/p"),
      ctx,
      p({ permissionId: "perm_1" }),
    );
    await handlers.handleUpdateAdministrationPermission(
      patch("/p", { name: "Y", description: null }),
      ctx,
      p({ permissionId: "perm_1" }),
    );

    await handlers.handleListAdministrationRegistrations(get("/r"), ctx);
    await handlers.handleCreateAdministrationRegistration(
      post("/r", { moduleKey: "projects", version: "1.0.0", notes: "n" }),
      ctx,
    );
    await handlers.handleGetAdministrationRegistration(
      get("/r"),
      ctx,
      p({ registrationId: "reg_1" }),
    );
    await handlers.handleUpdateAdministrationRegistration(
      patch("/r", { version: "1.0.1", notes: null, status: "active" }),
      ctx,
      p({ registrationId: "reg_1" }),
    );

    await handlers.handleListAdministrationPolicies(get("/pol"), ctx);
    await handlers.handleCreateAdministrationPolicy(
      post("/pol", { kind: "access", key: "k", name: "n", moduleId: "mod_1" }),
      ctx,
    );
    await handlers.handleGetAdministrationPolicy(
      get("/pol"),
      ctx,
      p({ policyId: "pol_1" }),
    );
    await handlers.handleUpdateAdministrationPolicy(
      patch("/pol", { name: "n2", description: null, kind: "audit" }),
      ctx,
      p({ policyId: "pol_1" }),
    );

    await handlers.handleListAdministrationCapabilities(get("/cap"), ctx);
    await handlers.handleCreateAdministrationCapability(
      post("/cap", {
        moduleId: "mod_1",
        key: "k",
        name: "n",
        owner: "o",
        version: "1",
        enabled: true,
        available: true,
        healthy: true,
        certified: false,
        productionReady: false,
        limitations: ["l"],
        documentation: "d",
      }),
      ctx,
    );
    await handlers.handleGetAdministrationCapability(
      get("/cap"),
      ctx,
      p({ capabilityId: "cap_1" }),
    );
    await handlers.handleUpdateAdministrationCapability(
      patch("/cap", {
        name: "n2",
        description: null,
        limitations: null,
        documentation: null,
        enabled: false,
      }),
      ctx,
      p({ capabilityId: "cap_1" }),
    );

    await handlers.handleListAdministrationNavigations(get("/n"), ctx);
    await handlers.handleCreateAdministrationNavigation(
      post("/n", {
        moduleId: "mod_1",
        key: "k",
        label: "L",
        ordering: 0,
        visibility: "visible",
        categoryId: "cat_1",
        sectionId: "sec_1",
        permissionKeys: ["admin.read"],
        iconKey: "i",
        routePath: "/x",
      }),
      ctx,
    );
    await handlers.handleGetAdministrationNavigation(
      get("/n"),
      ctx,
      p({ navigationId: "nav_1" }),
    );
    await handlers.handleUpdateAdministrationNavigation(
      patch("/n", {
        label: "L2",
        permissionKeys: null,
        iconKey: null,
        routePath: null,
      }),
      ctx,
      p({ navigationId: "nav_1" }),
    );

    await handlers.handleListAdministrationShortcuts(get("/sc"), ctx);
    await handlers.handleCreateAdministrationShortcut(
      post("/sc", {
        key: "k",
        label: "L",
        ordering: 0,
        moduleId: "mod_1",
        actionId: "act_1",
      }),
      ctx,
    );
    await handlers.handleGetAdministrationShortcut(
      get("/sc"),
      ctx,
      p({ shortcutId: "sc_1" }),
    );
    await handlers.handleUpdateAdministrationShortcut(
      patch("/sc", { label: "L2", permissionKeys: null }),
      ctx,
      p({ shortcutId: "sc_1" }),
    );

    await handlers.handleListAdministrationDashboards(get("/d"), ctx);
    await handlers.handleCreateAdministrationDashboard(
      post("/d", { key: "k", name: "n", moduleId: "mod_1" }),
      ctx,
    );
    await handlers.handleGetAdministrationDashboard(
      get("/d"),
      ctx,
      p({ dashboardId: "dash_1" }),
    );
    await handlers.handleUpdateAdministrationDashboard(
      patch("/d", { name: "n2", description: null }),
      ctx,
      p({ dashboardId: "dash_1" }),
    );

    await handlers.handleListAdministrationWidgets(
      get("/w"),
      ctx,
      p({ dashboardId: "dash_1" }),
    );
    await handlers.handleCreateAdministrationWidget(
      post("/w", { key: "k", name: "n", kind: "card" }),
      ctx,
      p({ dashboardId: "dash_1" }),
    );
    await handlers.handleCreateAdministrationWidget(
      post("/w", { dashboardId: "dash_1", key: "k2", name: "n2", kind: "metric" }),
      ctx,
    );
    await expect(
      handlers.handleCreateAdministrationWidget(
        post("/w", { key: "k3", name: "n3", kind: "table" }),
        ctx,
      ),
    ).rejects.toBeInstanceOf(PlatformApiHttpError);
    await handlers.handleGetAdministrationWidget(
      get("/w"),
      ctx,
      p({ widgetId: "wid_1" }),
    );
    await handlers.handleUpdateAdministrationWidget(
      patch("/w", { name: "n2", kind: "chart", ordering: 1 }),
      ctx,
      p({ widgetId: "wid_1" }),
    );

    await handlers.handleListAdministrationMetadata(
      get("/api/v1/administration/metadata?moduleId=mod_1"),
      ctx,
    );
    await handlers.handleCreateAdministrationMetadata(
      post("/meta", { moduleId: "mod_1", labels: { a: "b" }, tags: ["t"], notes: "n" }),
      ctx,
    );
    await handlers.handleGetAdministrationMetadata(
      get("/meta"),
      ctx,
      p({ metadataId: "meta_1" }),
    );
    await handlers.handleUpdateAdministrationMetadata(
      patch("/meta", { labels: null, tags: null, notes: null }),
      ctx,
      p({ metadataId: "meta_1" }),
    );

    await handlers.handleListAdministrationReferences(
      get("/api/v1/administration/references?moduleId=mod_1"),
      ctx,
    );
    await handlers.handleCreateAdministrationReference(
      post("/ref", {
        moduleId: "mod_1",
        kind: "module",
        resourceId: "r1",
        label: "L",
      }),
      ctx,
    );
    await handlers.handleGetAdministrationReference(
      get("/ref"),
      ctx,
      p({ referenceId: "ref_1" }),
    );

    await handlers.handleListAdministrationAudit(
      get("/api/v1/administration/audit?moduleId=mod_1"),
      ctx,
    );
    await handlers.handleListAdministrationAudit(
      get("/api/v1/administration/audit"),
      ctx,
    );
    await handlers.handleGetAdministrationAuditEntry(
      get("/aud"),
      ctx,
      p({ auditId: "aud_1" }),
    );
    await handlers.handleGetAdministrationHistory(
      get("/h"),
      ctx,
      p({ historyId: "hist_1" }),
    );

    await handlers.handleListAdministrationDiagnostics(get("/diag"), ctx);
    await handlers.handleGetAdministrationDiagnostic(
      get("/diag"),
      ctx,
      p({ diagnosticId: "diag_1" }),
    );
    await handlers.handleGetAdministrationHealth(get("/health"), ctx);
    await handlers.handleGetAdministrationReadiness(get("/ready"), ctx);
    await handlers.handleGetAdministrationManagementCapabilities(get("/caps"), ctx);

    const dto = handlers.buildAdministrationManagementPlaneDto({
      administrationEnabled: false,
    });
    expect(dto.httpEnabled).toBe(true);
    expect(dto.workbenchEnabled).toBe(false);
  });
});
