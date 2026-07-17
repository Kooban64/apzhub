/**
 * Platform Administration HTTP handler coverage (APZADMIN-003).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import "./administration.coverage.test";

import {
  assertAdministrationHttpEnabled,
  buildAdministrationManagementPlaneDto,
  handleArchiveAdministrationModule,
  handleCreateAdministrationCategory,
  handleCreateAdministrationModule,
  handleCreateAdministrationWidget,
  handleDeleteAdministrationModule,
  handleGetAdministrationAuditEntry,
  handleGetAdministrationHealth,
  handleGetAdministrationManagementCapabilities,
  handleGetAdministrationModule,
  handleGetAdministrationReadiness,
  handleGetAdministrationReference,
  handleListAdministrationAudit,
  handleListAdministrationCategories,
  handleListAdministrationDiagnostics,
  handleListAdministrationModuleAudit,
  handleListAdministrationModules,
  handleListAdministrationWidgets,
  handleRestoreAdministrationModule,
  handleTransitionAdministrationModule,
  handleUpdateAdministrationModule,
} from "./administration";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  installMockGateway,
} from "../testing/fixtures";
import { loadPlatformOpenApiSpecObject } from "../openapi";

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
      requestId: "req-test-administration",
      correlationId: "corr-test-administration",
      timestamp: "2026-07-16T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZADMIN-003 administration handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when administration HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        administrationEnabled: false,
      }),
    );
    await expect(assertAdministrationHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "ADMINISTRATION_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists, creates, gets, updates modules with standard envelopes", async () => {
    installMockGateway();
    const ctx = makeContext();
    const list = await handleListAdministrationModules(
      makeRequest("/api/v1/administration/modules"),
      ctx,
    );
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.page).toBeDefined();
    expect(listBody.meta.correlationId).toBe("corr-test-administration");

    const created = await handleCreateAdministrationModule(
      makeRequest("/api/v1/administration/modules", {
        method: "POST",
        body: JSON.stringify({ key: "support", name: "Support" }),
      }),
      ctx,
    );
    expect((await created.json()).data.key).toBe("support");

    const got = await handleGetAdministrationModule(
      makeRequest("/api/v1/administration/modules/mod_1"),
      ctx,
      { params: Promise.resolve({ moduleId: "mod_1" }) },
    );
    expect((await got.json()).data.id).toBe("mod_1");

    const updated = await handleUpdateAdministrationModule(
      makeRequest("/api/v1/administration/modules/mod_1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Projects Hub" }),
      }),
      ctx,
      { params: Promise.resolve({ moduleId: "mod_1" }) },
    );
    expect((await updated.json()).data.name).toBe("Projects Hub");
  });

  it("archives, restores, and transitions modules", async () => {
    installMockGateway();
    const ctx = makeContext();
    const archived = await handleDeleteAdministrationModule(
      makeRequest("/api/v1/administration/modules/mod_1", { method: "DELETE" }),
      ctx,
      { params: Promise.resolve({ moduleId: "mod_1" }) },
    );
    const archivedBody = await archived.json();
    expect(archivedBody.data.archived).toBe(true);
    expect(archivedBody.data.module.status).toBe("archived");

    const alias = await handleArchiveAdministrationModule(
      makeRequest("/api/v1/administration/modules/mod_1/archive", {
        method: "POST",
      }),
      ctx,
      { params: Promise.resolve({ moduleId: "mod_1" }) },
    );
    expect((await alias.json()).data.archived).toBe(true);

    const restored = await handleRestoreAdministrationModule(
      makeRequest("/api/v1/administration/modules/mod_1/restore", {
        method: "POST",
      }),
      ctx,
      { params: Promise.resolve({ moduleId: "mod_1" }) },
    );
    expect((await restored.json()).data.status).toBe("draft");

    const transitioned = await handleTransitionAdministrationModule(
      makeRequest("/api/v1/administration/modules/mod_1/transition", {
        method: "POST",
        body: JSON.stringify({ to: "registered" }),
      }),
      ctx,
      { params: Promise.resolve({ moduleId: "mod_1" }) },
    );
    expect((await transitioned.json()).data.status).toBe("registered");
  });

  it("covers categories, widgets, audit, references, and diagnostics plane flags", async () => {
    installMockGateway();
    const ctx = makeContext();

    const cats = await handleListAdministrationCategories(
      makeRequest("/api/v1/administration/categories"),
      ctx,
    );
    expect((await cats.json()).data[0].id).toBe("cat_1");

    const createdCat = await handleCreateAdministrationCategory(
      makeRequest("/api/v1/administration/categories", {
        method: "POST",
        body: JSON.stringify({ key: "ops", name: "Ops" }),
      }),
      ctx,
    );
    expect((await createdCat.json()).data.key).toBe("ops");

    const widgets = await handleListAdministrationWidgets(
      makeRequest("/api/v1/administration/dashboards/dash_1/widgets"),
      ctx,
      { params: Promise.resolve({ dashboardId: "dash_1" }) },
    );
    expect((await widgets.json()).data[0].id).toBe("wid_1");

    const createdWidget = await handleCreateAdministrationWidget(
      makeRequest("/api/v1/administration/dashboards/dash_1/widgets", {
        method: "POST",
        body: JSON.stringify({ key: "metric", name: "Metric", kind: "metric" }),
      }),
      ctx,
      { params: Promise.resolve({ dashboardId: "dash_1" }) },
    );
    expect((await createdWidget.json()).data.kind).toBe("metric");

    const audit = await handleListAdministrationAudit(
      makeRequest("/api/v1/administration/audit"),
      ctx,
    );
    expect((await audit.json()).data[0].id).toBe("aud_1");

    const moduleAudit = await handleListAdministrationModuleAudit(
      makeRequest("/api/v1/administration/modules/mod_1/audit"),
      ctx,
      { params: Promise.resolve({ moduleId: "mod_1" }) },
    );
    expect((await moduleAudit.json()).data[0].id).toBe("aud_1");

    const auditEntry = await handleGetAdministrationAuditEntry(
      makeRequest("/api/v1/administration/audit/aud_1"),
      ctx,
      { params: Promise.resolve({ auditId: "aud_1" }) },
    );
    expect((await auditEntry.json()).data.id).toBe("aud_1");

    const ref = await handleGetAdministrationReference(
      makeRequest("/api/v1/administration/references/ref_1"),
      ctx,
      { params: Promise.resolve({ referenceId: "ref_1" }) },
    );
    expect((await ref.json()).data.id).toBe("ref_1");

    const health = await handleGetAdministrationHealth(
      makeRequest("/api/v1/administration/health"),
      ctx,
    );
    const healthBody = await health.json();
    expect(healthBody.data.httpEnabled).toBe(true);
    expect(healthBody.data.workbenchEnabled).toBe(false);
    expect(healthBody.data.runtimeAdminEnabled).toBe(false);

    const readiness = await handleGetAdministrationReadiness(
      makeRequest("/api/v1/administration/readiness"),
      ctx,
    );
    expect((await readiness.json()).data.httpEnabled).toBe(true);

    const caps = await handleGetAdministrationManagementCapabilities(
      makeRequest("/api/v1/administration/management-capabilities"),
      ctx,
    );
    const capsBody = await caps.json();
    expect(capsBody.data.httpEnabled).toBe(true);
    expect(capsBody.data.workbenchEnabled).toBe(false);
    expect(capsBody.data.gatewayCapabilities.http).toBe(true);

    const diagnostics = await handleListAdministrationDiagnostics(
      makeRequest("/api/v1/administration/diagnostics"),
      ctx,
    );
    const diagBody = await diagnostics.json();
    expect(diagBody.data.httpEnabled).toBe(true);
    expect(diagBody.data.capabilities.workbench).toBe(false);
  });

  it("builds management plane DTO with excluded planes false", () => {
    const dto = buildAdministrationManagementPlaneDto({
      administrationEnabled: true,
      persistenceMode: "memory",
    });
    expect(dto.httpEnabled).toBe(true);
    expect(dto.workbenchEnabled).toBe(false);
    expect(dto.runtimeAdminEnabled).toBe(false);
    expect(dto.userManagementEnabled).toBe(false);
    expect(dto.capabilities.workbench).toBe(false);
    expect(dto.capabilities.http).toBe(true);
  });

  it("ships only authenticated administration route entrypoints without forbidden segments", () => {
    const routes = walkRoutes(
      join(process.cwd(), "apps/web/app/api/v1/administration"),
    );
    expect(routes.length).toBeGreaterThanOrEqual(40);
    for (const route of routes) {
      const content = readFileSync(route, "utf8");
      expect(content).toContain("withPlatformApiAuth");
      expect(content).toContain('runtime = "nodejs"');
    }
    const joined = routes.join("\n");
    for (const bad of [
      "/execute/",
      "/runtime/",
      "/users/",
      "/roles/",
      "/workbench/",
      "/tenants/",
    ]) {
      expect(joined.includes(bad)).toBe(false);
    }
  });

  it("documents administration in OpenAPI >= 1.6.0", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      info?: { version?: string };
      paths?: Record<string, unknown>;
      tags?: Array<{ name?: string }>;
    };
    expect(spec.info?.version).toMatch(/^1\.(?:[6-9]|\d{2,})\.\d+$/);
    expect(spec.paths?.["/administration/modules"]).toBeDefined();
    expect(spec.paths?.["/administration/management-capabilities"]).toBeDefined();
    expect(spec.paths?.["/administration/execute"]).toBeUndefined();
    expect(spec.paths?.["/administration/users"]).toBeUndefined();
    const tags = (spec.tags ?? []).map((t) => t.name);
    expect(tags).toContain("Platform Administration");
  });
});
