/**
 * Platform Configuration HTTP handler coverage (APZCONFIG-003).
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertConfigurationHttpEnabled,
  buildConfigurationManagementPlaneDto,
  handleApproveConfiguration,
  handleArchiveConfiguration,
  handleCreateConfiguration,
  handleCreateConfigurationGroup,
  handleCreateConfigurationNamespace,
  handleCreateConfigurationOverride,
  handleCreateConfigurationVersion,
  handleDeleteConfiguration,
  handleDeprecateConfiguration,
  handleDeprecateConfigurationVersion,
  handleGetConfiguration,
  handleGetConfigurationAuditEntry,
  handleGetConfigurationCapabilities,
  handleGetConfigurationGroup,
  handleGetConfigurationHealth,
  handleGetConfigurationNamespace,
  handleGetConfigurationOverride,
  handleGetConfigurationReadiness,
  handleGetConfigurationReference,
  handleGetConfigurationScope,
  handleGetConfigurationVersion,
  handleGetConfigurationDiagnostics,
  handleListConfigurationAudit,
  handleListConfigurationGroups,
  handleListConfigurationNamespaces,
  handleListConfigurationOverrides,
  handleListConfigurationReferences,
  handleListConfigurationScopedAudit,
  handleListConfigurations,
  handleListConfigurationScopes,
  handleListConfigurationValidationRules,
  handleListConfigurationVersions,
  handlePublishConfiguration,
  handlePublishConfigurationVersion,
  handleRestoreConfiguration,
  handleTransitionConfiguration,
  handleUpdateConfiguration,
  handleUpdateConfigurationGroup,
  handleUpdateConfigurationNamespace,
  handleUpdateConfigurationOverride,
  handleValidateConfiguration,
  handleValidateConfigurationMetadata,
  handleValidateConfigurationVersion,
} from "./configuration";
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
      requestId: "req-test-configuration",
      correlationId: "corr-test-configuration",
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

describe("APZCONFIG-003 configuration handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when configuration HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        configurationEnabled: false,
      }),
    );
    await expect(assertConfigurationHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "CONFIGURATION_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists, creates, gets, updates configurations with standard envelopes", async () => {
    installMockGateway();
    const ctx = makeContext();

    const list = await handleListConfigurations(
      makeRequest("/api/v1/configuration/configurations?status=draft&limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.meta.requestId).toBe("req-test-configuration");
    expect(listBody.page.limit).toBe(10);

    const created = await handleCreateConfiguration(
      makeRequest("/api/v1/configuration/configurations", {
        method: "POST",
        body: JSON.stringify({
          namespaceKey: "platform",
          key: "feature.x",
          displayName: "Feature X",
          valueKind: "string",
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_a" },
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(200);
    expect((await created.json()).data.id).toBe("cfg_new");

    const got = await handleGetConfiguration(
      makeRequest("/api/v1/configuration/configurations/cfg_1"),
      ctx,
      { params: Promise.resolve({ configurationId: "cfg_1" }) },
    );
    expect((await got.json()).data.id).toBe("cfg_1");

    const updated = await handleUpdateConfiguration(
      makeRequest("/api/v1/configuration/configurations/cfg_1", {
        method: "PATCH",
        body: JSON.stringify({ hierarchyLevel: "organisation" }),
      }),
      ctx,
      { params: Promise.resolve({ configurationId: "cfg_1" }) },
    );
    expect((await updated.json()).data.hierarchyLevel).toBe("organisation");
  });

  it("maps revision conflict to 409", async () => {
    installMockGateway();
    const ctx = makeContext();
    await expect(
      handleUpdateConfiguration(
        makeRequest("/api/v1/configuration/configurations/cfg_1", {
          method: "PATCH",
          body: JSON.stringify({ revision: 99 }),
        }),
        ctx,
        { params: Promise.resolve({ configurationId: "cfg_1" }) },
      ),
    ).rejects.toMatchObject({ status: 409, body: { code: "REVISION_CONFLICT" } });
  });

  it("supports lifecycle transition and metadata validation", async () => {
    installMockGateway();
    const ctx = makeContext();

    const transitioned = await handleTransitionConfiguration(
      makeRequest("/api/v1/configuration/configurations/cfg_1/transition", {
        method: "POST",
        body: JSON.stringify({ to: "approved" }),
      }),
      ctx,
      { params: Promise.resolve({ configurationId: "cfg_1" }) },
    );
    expect(transitioned.status).toBe(200);

    const validated = await handleValidateConfiguration(
      makeRequest("/api/v1/configuration/configurations/cfg_1/validate", {
        method: "POST",
      }),
      ctx,
      { params: Promise.resolve({ configurationId: "cfg_1" }) },
    );
    expect((await validated.json()).data.valid).toBe(true);

    const metadataValidated = await handleValidateConfigurationMetadata(
      makeRequest("/api/v1/configuration/validation", {
        method: "POST",
        body: JSON.stringify({
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_a" },
        }),
      }),
      ctx,
    );
    expect((await metadataValidated.json()).data.valid).toBe(true);
  });

  it("lists validation rules and namespaces/groups", async () => {
    installMockGateway();
    const ctx = makeContext();
    const rules = await handleListConfigurationValidationRules(
      makeRequest("/api/v1/configuration/validation/rules"),
      ctx,
    );
    expect((await rules.json()).data[0]?.kind).toBe("string");

    const groups = await handleListConfigurationGroups(
      makeRequest("/api/v1/configuration/groups"),
      ctx,
    );
    expect((await groups.json()).data.length).toBeGreaterThan(0);
  });

  it("reports management-plane capabilities with runtime features disabled", async () => {
    installMockGateway();
    const ctx = makeContext();
    const caps = await handleGetConfigurationCapabilities(
      makeRequest("/api/v1/configuration/capabilities"),
      ctx,
    );
    const body = await caps.json();
    expect(body.data.runtimeResolutionReady).toBe(false);
    expect(body.data.runtimeApplicationReady).toBe(false);
    expect(body.data.featureFlagsReady).toBe(false);
    expect(body.data.secretManagementReady).toBe(false);
    expect(body.data.hotReloadReady).toBe(false);
    expect(body.data.eventBusReady).toBe(false);
    expect(
      buildConfigurationManagementPlaneDto({ configurationEnabled: true }).capabilities
        .runtimeResolution,
    ).toBe(false);
  });

  it("lists audit entries", async () => {
    installMockGateway();
    const ctx = makeContext();
    const audit = await handleListConfigurationAudit(
      makeRequest("/api/v1/configuration/audit"),
      ctx,
    );
    expect((await audit.json()).data.length).toBeGreaterThan(0);
  });

  it("covers namespaces, groups, versions, overrides, scopes, references, audit, diagnostics", async () => {
    installMockGateway();
    const ctx = makeContext();
    const cfgRoute = { params: Promise.resolve({ configurationId: "cfg_1" }) };

    expect(
      (await (await handleListConfigurationNamespaces(makeRequest("/"), ctx)).json())
        .data[0]?.id,
    ).toBeDefined();
    expect(
      (
        await (
          await handleCreateConfigurationNamespace(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify({ key: "ns", name: "NS" }),
            }),
            ctx,
          )
        ).json()
      ).data.key,
    ).toBe("ns");
    expect(
      (
        await (
          await handleGetConfigurationNamespace(makeRequest("/"), ctx, {
            params: Promise.resolve({ namespaceId: "ns_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("ns_1");
    expect(
      (
        await (
          await handleUpdateConfigurationNamespace(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ name: "Renamed" }),
            }),
            ctx,
            { params: Promise.resolve({ namespaceId: "ns_1" }) },
          )
        ).json()
      ).data.name,
    ).toBe("Renamed");

    expect(
      (await (await handleListConfigurationGroups(makeRequest("/"), ctx)).json())
        .data[0]?.id,
    ).toBeDefined();
    expect(
      (
        await (
          await handleCreateConfigurationGroup(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify({
                namespaceId: "ns_1",
                key: "grp",
                name: "Group",
              }),
            }),
            ctx,
          )
        ).json()
      ).data.key,
    ).toBe("grp");
    expect(
      (
        await (
          await handleGetConfigurationGroup(makeRequest("/"), ctx, {
            params: Promise.resolve({ groupId: "grp_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("grp_1");
    expect(
      (
        await (
          await handleUpdateConfigurationGroup(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ name: "Group 2" }),
            }),
            ctx,
            { params: Promise.resolve({ groupId: "grp_1" }) },
          )
        ).json()
      ).data.name,
    ).toBe("Group 2");

    expect(
      (
        await (
          await handleListConfigurationVersions(makeRequest("/"), ctx, cfgRoute)
        ).json()
      ).data.length,
    ).toBeGreaterThan(0);
    expect(
      (
        await (
          await handleCreateConfigurationVersion(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify({
                valueKind: "string",
                payload: '"hello"',
              }),
            }),
            ctx,
            cfgRoute,
          )
        ).json()
      ).data.id,
    ).toBeDefined();
    const versionRoute = {
      params: Promise.resolve({ configurationId: "cfg_1", versionId: "ver_1" }),
    };
    expect(
      (
        await (
          await handleGetConfigurationVersion(makeRequest("/"), ctx, versionRoute)
        ).json()
      ).data.id,
    ).toBe("ver_1");
    expect(
      (
        await (
          await handleValidateConfigurationVersion(makeRequest("/"), ctx, versionRoute)
        ).json()
      ).data.valid,
    ).toBe(true);
    expect(
      (
        await (
          await handlePublishConfigurationVersion(makeRequest("/"), ctx, versionRoute)
        ).json()
      ).data.id,
    ).toBeDefined();
    expect(
      (
        await (
          await handleDeprecateConfigurationVersion(makeRequest("/"), ctx, versionRoute)
        ).json()
      ).data.id,
    ).toBeDefined();

    expect(
      (
        await (
          await handleListConfigurationOverrides(
            makeRequest("/?configurationId=cfg_1"),
            ctx,
          )
        ).json()
      ).data.length,
    ).toBeGreaterThan(0);
    expect(
      (
        await (
          await handleCreateConfigurationOverride(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify({
                configurationId: "cfg_1",
                hierarchyLevel: "tenant",
                scope: { kind: "tenant", tenantId: "tenant_a" },
                valueKind: "string",
                payload: '"x"',
              }),
            }),
            ctx,
          )
        ).json()
      ).data.id,
    ).toBeDefined();
    expect(
      (
        await (
          await handleGetConfigurationOverride(makeRequest("/"), ctx, {
            params: Promise.resolve({ overrideId: "ovr_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("ovr_1");
    expect(
      (
        await (
          await handleUpdateConfigurationOverride(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ payload: '"y"' }),
            }),
            ctx,
            { params: Promise.resolve({ overrideId: "ovr_1" }) },
          )
        ).json()
      ).data.id,
    ).toBe("ovr_1");

    expect(
      (await (await handleListConfigurationScopes(makeRequest("/"), ctx)).json()).data
        .length,
    ).toBeGreaterThan(0);
    expect(
      (
        await (
          await handleGetConfigurationScope(makeRequest("/"), ctx, {
            params: Promise.resolve({ scopeId: "cfg_1" }),
          })
        ).json()
      ).data.configurationId,
    ).toBe("cfg_1");

    expect(
      (
        await (
          await handleListConfigurationReferences(makeRequest("/"), ctx, cfgRoute)
        ).json()
      ).data[0]?.id,
    ).toBeDefined();
    expect(
      (
        await (
          await handleGetConfigurationReference(makeRequest("/"), ctx, {
            params: Promise.resolve({ referenceId: "ref_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("ref_1");

    expect(
      (
        await (
          await handleGetConfigurationAuditEntry(makeRequest("/"), ctx, {
            params: Promise.resolve({ auditId: "aud_1" }),
          })
        ).json()
      ).data.id,
    ).toBeDefined();
    expect(
      (
        await (
          await handleListConfigurationScopedAudit(makeRequest("/"), ctx, cfgRoute)
        ).json()
      ).data.length,
    ).toBeGreaterThan(0);

    expect(
      (await (await handleGetConfigurationHealth(makeRequest("/"), ctx)).json()).data,
    ).toBeDefined();
    expect(
      (await (await handleGetConfigurationReadiness(makeRequest("/"), ctx)).json())
        .data,
    ).toBeDefined();
    expect(
      (await (await handleGetConfigurationDiagnostics(makeRequest("/"), ctx)).json())
        .data,
    ).toBeDefined();
  });

  it("supports lifecycle shortcuts archive restore approve publish deprecate", async () => {
    installMockGateway();
    const ctx = makeContext();
    const route = { params: Promise.resolve({ configurationId: "cfg_1" }) };

    const archived = await handleDeleteConfiguration(
      makeRequest("/", { method: "DELETE" }),
      ctx,
      route,
    );
    expect((await archived.json()).data.archived).toBe(true);

    await handleArchiveConfiguration(makeRequest("/"), ctx, route);
    expect(
      (await (await handleRestoreConfiguration(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("draft");
    expect(
      (await (await handleApproveConfiguration(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("approved");
    expect(
      (await (await handlePublishConfiguration(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("published");
    expect(
      (await (await handleDeprecateConfiguration(makeRequest("/"), ctx, route)).json())
        .data.status,
    ).toBe("deprecated");
  });

  it("rejects malformed JSON with 400", async () => {
    installMockGateway();
    const ctx = makeContext();
    await expect(
      handleCreateConfiguration(
        makeRequest("/api/v1/configuration/configurations", {
          method: "POST",
          body: "{not-json",
        }),
        ctx,
      ),
    ).rejects.toBeInstanceOf(PlatformApiHttpError);
  });

  it("proves forbidden runtime route segments are absent", () => {
    const routesRoot = join(process.cwd(), "apps/web/app/api/v1/configuration");
    const files = walkRoutes(routesRoot);
    const joined = files.join("\n");
    const forbidden = [
      "resolve",
      "effective",
      "evaluate",
      "apply",
      "inject",
      "reload",
      "hot-reload",
      "rollout",
      "feature-flags",
      "secrets",
      "vault",
      "environment",
      "env",
      "kubernetes",
      "configmaps",
      "events",
      "subscribe",
      "stream",
      "runtime",
    ];
    for (const segment of forbidden) {
      expect(joined.includes(`/configuration/${segment}/`)).toBe(false);
      expect(joined.endsWith(`/configuration/${segment}/route.ts`)).toBe(false);
    }
  });

  it("documents configuration paths in OpenAPI without runtime routes", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      paths: Record<string, unknown>;
      tags?: { name: string }[];
      info?: { version?: string };
    };
    expect(["1.5.0", "1.6.0", "1.7.0", "1.8.0", "1.9.0"]).toContain(spec.info?.version);
    expect(spec.paths["/configuration/configurations"]).toBeDefined();
    expect(spec.paths["/configuration/capabilities"]).toBeDefined();
    expect(spec.paths["/configuration/validation"]).toBeDefined();
    expect(spec.tags?.some((t) => t.name === "Platform Configuration")).toBe(true);
    for (const bad of [
      "/configuration/resolve",
      "/configuration/effective",
      "/configuration/runtime",
      "/configuration/secrets",
      "/configuration/feature-flags",
    ]) {
      expect(spec.paths[bad]).toBeUndefined();
    }
  });
});
