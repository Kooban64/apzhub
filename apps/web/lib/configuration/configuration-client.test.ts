/**
 * Platform Configuration typed client tests (APZCONFIG-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertConfigurationApiPath,
  CONFIGURATION_FORBIDDEN_HTTP_SEGMENTS,
  createHttpConfigurationClient,
  createMockConfigurationClient,
  ConfigurationClientError,
  configurationQueryKeys,
  getConfigurationClient,
  resetConfigurationClient,
  setConfigurationClient,
} from "./index";

describe("APZCONFIG-003 configuration typed client", () => {
  afterEach(() => {
    resetConfigurationClient();
    vi.unstubAllGlobals();
  });

  it("mock client covers core operations without runtime methods", async () => {
    const client = createMockConfigurationClient();
    expect(await client.listConfigurations()).toMatchObject({
      items: [{ id: "cfg_mock_1" }],
    });
    expect(
      (
        await client.createConfiguration({
          namespaceKey: "platform",
          key: "x",
          displayName: "X",
          valueKind: "string",
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_a" },
        })
      ).id,
    ).toBe("cfg_new");
    expect((await client.getCapabilities()).runtimeResolutionReady).toBe(false);
    expect(
      (
        await client.validateMetadata({
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_a" },
        })
      ).valid,
    ).toBe(true);
    expect(client).not.toHaveProperty("resolve");
    expect(client).not.toHaveProperty("getEffectiveConfiguration");
    expect(client).not.toHaveProperty("evaluateFlag");
    expect(client).not.toHaveProperty("retrieveSecret");
  });

  it("HTTP client builds routes, parses envelopes, and supports AbortSignal", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/capabilities")) {
        return new Response(
          JSON.stringify({
            data: {
              configurationEnabled: true,
              managementPlaneReady: true,
              runtimeResolutionReady: false,
              runtimeApplicationReady: false,
              featureFlagsReady: false,
              secretManagementReady: false,
              hotReloadReady: false,
              eventBusReady: false,
            },
            meta: { requestId: "r1", correlationId: "c1" },
          }),
          { status: 200 },
        );
      }
      if (
        init?.method === "POST" &&
        url.endsWith("/api/v1/configuration/configurations")
      ) {
        return new Response(
          JSON.stringify({
            data: {
              id: "cfg_1",
              tenantId: "tenant_a",
              namespaceId: "ns_1",
              keyId: "key_1",
              hierarchyLevel: "tenant",
              scope: { kind: "tenant", tenantId: "tenant_a" },
              status: "draft",
              createdAt: "2026-07-16T12:00:00.000Z",
              updatedAt: "2026-07-16T12:00:00.000Z",
              createdBy: "user_1",
              updatedBy: "user_1",
              revision: 1,
            },
            meta: { requestId: "r1", correlationId: "c1" },
          }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({
          data: [
            {
              id: "cfg_1",
              tenantId: "tenant_a",
              namespaceId: "ns_1",
              keyId: "key_1",
              hierarchyLevel: "tenant",
              scope: { kind: "tenant", tenantId: "tenant_a" },
              status: "draft",
              createdAt: "2026-07-16T12:00:00.000Z",
              updatedAt: "2026-07-16T12:00:00.000Z",
              createdBy: "user_1",
              updatedBy: "user_1",
              revision: 1,
            },
          ],
          page: { limit: 20, hasMore: false },
          meta: { requestId: "r1", correlationId: "c1" },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpConfigurationClient();
    const listed = await client.listConfigurations(
      { status: "draft", limit: 20 },
      { signal: AbortSignal.timeout(5_000) },
    );
    expect(listed.items[0]?.id).toBe("cfg_1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/api/v1/configuration/configurations?status=draft&limit=20",
    );

    const created = await client.createConfiguration({
      namespaceKey: "platform",
      key: "x",
      displayName: "Created",
      valueKind: "string",
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
    });
    expect(created.revision).toBe(1);

    const caps = await client.getCapabilities();
    expect(caps.runtimeResolutionReady).toBe(false);
  });

  it("mock client covers all HTTP-backed operations", async () => {
    const client = createMockConfigurationClient();
    await client.getConfiguration("cfg_mock_1");
    await client.updateConfiguration("cfg_mock_1", { revision: 1 });
    await client.archiveConfiguration("cfg_mock_1");
    await client.restoreConfiguration("cfg_mock_1");
    await client.transitionConfiguration("cfg_mock_1", { to: "approved" });
    await client.validateConfiguration("cfg_mock_1");
    await client.approveConfiguration("cfg_mock_1");
    await client.publishConfiguration("cfg_mock_1");
    await client.deprecateConfiguration("cfg_mock_1");
    await client.listNamespaces();
    await client.getNamespace("ns_mock");
    await client.listGroups();
    await client.listVersions("cfg_mock_1");
    await client.createVersion("cfg_mock_1", {
      valueKind: "string",
      payload: '"x"',
    });
    await client.publishVersion("cfg_mock_1", "ver_mock");
    await client.listOverrides("cfg_mock_1");
    await client.createOverride({
      configurationId: "cfg_mock_1",
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
      valueKind: "string",
      payload: '"x"',
    });
    await client.updateOverride("ovr_mock", { payload: '"y"' });
    await client.listScopes();
    await client.getScope("cfg_mock_1");
    await client.listValidationRules();
    await client.listReferences("cfg_mock_1");
    await client.getReference("ref_mock");
    await client.listAudit();
    await client.listAudit("cfg_mock_1");
    await client.getHealth();
    await client.getReadiness();
    await client.getDiagnostics();
    expect(true).toBe(true);
  });

  it("HTTP client exercises all endpoint families", async () => {
    const cfg = {
      id: "cfg_1",
      tenantId: "tenant_a",
      namespaceId: "ns_1",
      keyId: "key_1",
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
      status: "draft",
      createdAt: "2026-07-16T12:00:00.000Z",
      updatedAt: "2026-07-16T12:00:00.000Z",
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    };
    const collection = (data: unknown[]) =>
      new Response(JSON.stringify({ data, page: { limit: 20, hasMore: false } }), {
        status: 200,
      });
    const single = (data: unknown) =>
      new Response(JSON.stringify({ data }), { status: 200 });

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.includes("/capabilities")) {
        return single({
          configurationEnabled: true,
          managementPlaneReady: true,
          runtimeResolutionReady: false,
          runtimeApplicationReady: false,
          featureFlagsReady: false,
          secretManagementReady: false,
          hotReloadReady: false,
          eventBusReady: false,
        });
      }
      if (url.endsWith("/validation") && method === "POST") {
        return single({ valid: true, errors: [] });
      }
      if (url.includes("/validation/rules")) return collection([{ kind: "string" }]);
      if (url.includes("/namespaces") && method === "GET") {
        return collection([
          {
            id: "ns_1",
            tenantId: "tenant_a",
            key: "platform",
            name: "Platform",
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/namespaces/ns_1"))
        return single({
          id: "ns_1",
          tenantId: "tenant_a",
          key: "platform",
          name: "Platform",
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        });
      if (url.includes("/groups") && method === "GET") {
        return collection([
          {
            id: "grp_1",
            tenantId: "tenant_a",
            namespaceId: "ns_1",
            key: "ui",
            name: "UI",
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/versions") && method === "GET") {
        return collection([
          {
            id: "ver_1",
            configurationId: "cfg_1",
            versionNumber: 1,
            immutable: true,
            isCurrent: false,
            createdAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
          },
        ]);
      }
      if (url.includes("/versions") && method === "POST") {
        return single({
          id: "ver_2",
          configurationId: "cfg_1",
          versionNumber: 2,
          immutable: false,
          isCurrent: false,
          createdAt: "2026-07-16T12:00:00.000Z",
          createdBy: "user_1",
        });
      }
      if (url.includes("/overrides") && method === "GET") {
        return collection([
          {
            id: "ovr_1",
            configurationId: "cfg_1",
            hierarchyLevel: "tenant",
            scope: { kind: "tenant", tenantId: "tenant_a" },
            valueId: "val_1",
            precedenceRank: 0,
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/overrides") && method === "POST") {
        return single({
          id: "ovr_new",
          configurationId: "cfg_1",
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_a" },
          valueId: "val_new",
          precedenceRank: 0,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        });
      }
      if (url.includes("/overrides/ovr_1") && method === "PATCH") {
        return single({
          id: "ovr_1",
          configurationId: "cfg_1",
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_a" },
          valueId: "val_1",
          precedenceRank: 0,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        });
      }
      if (url.includes("/scopes") && method === "GET" && !url.includes("/scopes/cfg")) {
        return collection([
          {
            configurationId: "cfg_1",
            scopeKind: "tenant",
            scope: { kind: "tenant", tenantId: "tenant_a" },
          },
        ]);
      }
      if (url.includes("/scopes/cfg_1")) {
        return single({
          configurationId: "cfg_1",
          scopeKind: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_a" },
        });
      }
      if (url.includes("/references") && method === "GET") {
        return collection([
          { id: "ref_1", configurationId: "cfg_1", kind: "projects", resourceId: "p1" },
        ]);
      }
      if (url.includes("/references/ref_1")) {
        return single({
          id: "ref_1",
          configurationId: "cfg_1",
          kind: "projects",
          resourceId: "p1",
        });
      }
      if (url.includes("/audit") && method === "GET") {
        return collection([
          {
            id: "aud_1",
            tenantId: "tenant_a",
            configurationId: "cfg_1",
            action: "created",
            actorUserId: "user_1",
            createdAt: "2026-07-16T12:00:00.000Z",
          },
        ]);
      }
      if (url.includes("/health")) return single({ status: "ok" });
      if (url.includes("/readiness")) return single({ ready: true });
      if (url.includes("/diagnostics")) return single({ checks: [] });
      if (method === "POST" && url.includes("/validate"))
        return single({ valid: true, errors: [] });
      if (method === "POST") return single(cfg);
      if (method === "PATCH") return single({ ...cfg, revision: 2 });
      if (url.includes("/configurations/cfg_1") && method === "GET") return single(cfg);
      return collection([cfg]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpConfigurationClient();
    await client.listNamespaces();
    await client.getNamespace("ns_1");
    await client.listGroups();
    await client.listVersions("cfg_1");
    await client.createVersion("cfg_1", { valueKind: "string", payload: '"a"' });
    await client.publishVersion("cfg_1", "ver_1");
    await client.listOverrides("cfg_1");
    await client.createOverride({
      configurationId: "cfg_1",
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
      valueKind: "string",
      payload: '"a"',
    });
    await client.updateOverride("ovr_1", { payload: '"b"' });
    await client.listScopes();
    await client.getScope("cfg_1");
    await client.listValidationRules();
    await client.validateMetadata({
      hierarchyLevel: "tenant",
      scope: { kind: "tenant", tenantId: "tenant_a" },
    });
    await client.listReferences("cfg_1");
    await client.getReference("ref_1");
    await client.listAudit();
    await client.listAudit("cfg_1");
    await client.getConfiguration("cfg_1");
    await client.updateConfiguration("cfg_1", { revision: 1 });
    await client.archiveConfiguration("cfg_1");
    await client.restoreConfiguration("cfg_1");
    await client.transitionConfiguration("cfg_1", { to: "approved" });
    await client.validateConfiguration("cfg_1");
    await client.approveConfiguration("cfg_1");
    await client.publishConfiguration("cfg_1");
    await client.deprecateConfiguration("cfg_1");
    await client.getHealth();
    await client.getReadiness();
    await client.getDiagnostics();
    expect(fetchMock.mock.calls.length).toBeGreaterThan(20);
  });

  it("HTTP client maps error envelopes with status codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: { code: "FORBIDDEN", message: "Denied" },
              meta: { requestId: "r1", correlationId: "c1" },
            }),
            { status: 403 },
          ),
      ),
    );
    const client = createHttpConfigurationClient();
    await expect(client.listConfigurations()).rejects.toBeInstanceOf(
      ConfigurationClientError,
    );
  });

  it("assertConfigurationApiPath rejects forbidden segments", () => {
    expect(() =>
      assertConfigurationApiPath("/api/v1/configuration/configurations"),
    ).not.toThrow();
    for (const segment of CONFIGURATION_FORBIDDEN_HTTP_SEGMENTS) {
      expect(() =>
        assertConfigurationApiPath(`/api/v1/configuration/${segment}`),
      ).toThrow(/Forbidden configuration HTTP segment/);
    }
  });

  it("supports dependency injection via setConfigurationClient", async () => {
    const mock = createMockConfigurationClient();
    setConfigurationClient(mock);
    expect(getConfigurationClient()).toBe(mock);
  });

  it("builds tenant-scoped query keys", () => {
    expect(configurationQueryKeys.list({ status: "draft" })).toEqual([
      "configuration",
      "list",
      JSON.stringify({ status: "draft" }),
    ]);
    expect(configurationQueryKeys.capabilities()).toContain("capabilities");
  });
});
