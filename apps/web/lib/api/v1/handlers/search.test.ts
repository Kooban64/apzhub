/**
 * Platform Search HTTP handler coverage (APZSEARCH-007).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  handleCreateSearchCollection,
  handleCreateSearchConfiguration,
  handleGetSearchCapabilities,
  handleGetSearchCollection,
  handleGetSearchConfiguration,
  handleGetSearchDiagnostics,
  handleGetSearchHealth,
  handleGetSearchManagementCapabilities,
  handleGetSearchManagementDiagnostics,
  handleGetSearchManagementHealth,
  handleGetSearchManagementStatistics,
  handleGetSearchProfile,
  handleGetSearchProvider,
  handleGetSearchReadiness,
  handleGetSearchScope,
  handleGetSearchSource,
  handleGetSearchStatistics,
  handleListSearchAudit,
  handleListSearchCollections,
  handleListSearchConfigurations,
  handleListSearchProfiles,
  handleListSearchProviders,
  handleListSearchScopes,
  handleListSearchSources,
  handleSearchManagementValidateConfiguration,
  handleSearchManagementValidateQuery,
  handleSearchQuery,
  handleSearchSuggestions,
  handleSearchValidateQuery,
  handleUpdateSearchCollection,
  handleUpdateSearchConfiguration,
  handleUpdateSearchProvider,
  OMITTED_SEARCH_HTTP_ROUTES,
  redactSearchManagementValue,
} from "./search";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import { loadPlatformOpenApiSpecObject } from "../openapi";
import { searchQueryBodySchema, searchValidateBodySchema } from "../schemas/search";
import {
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "../testing/fixtures";

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

function makeContext(
  overrides: Parameters<typeof buildTestServiceContext>[0] = {},
): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-search",
      correlationId: "corr-test-search",
      timestamp: "2026-07-14T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(overrides),
  };
}

describe("APZSEARCH-007 search handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("executes query via searchExecution only and preserves trusted context", async () => {
    const calls: Array<{ service: string; operation: string; tenantId: string }> = [];
    installMockGateway({
      onCall: (service, operation, ctx) => {
        calls.push({ service, operation, tenantId: ctx.tenantId });
      },
    });

    await expect(
      handleSearchQuery(
        makeRequest("http://localhost/api/v1/search/query", {
          method: "POST",
          body: JSON.stringify({
            query: { keywords: "policy" },
            tenantId: "evil-tenant",
          }),
        }),
        makeContext({ tenantId: "tenant_a" }),
      ),
    ).rejects.toBeTruthy();
    expect(calls.filter((c) => c.service === "searchExecution")).toHaveLength(0);

    const ok = await handleSearchQuery(
      makeRequest("http://localhost/api/v1/search/query", {
        method: "POST",
        body: JSON.stringify({ query: { keywords: "policy" } }),
      }),
      makeContext({ tenantId: "tenant_a" }),
    );
    expect(ok.status).toBe(200);
    const body = await ok.json();
    expect(body.data.page.hits[0].metadata.tenantId).toBe("tenant_a");
    expect(
      calls.some(
        (c) =>
          c.service === "searchExecution" &&
          c.operation === "execute" &&
          c.tenantId === "tenant_a",
      ),
    ).toBe(true);
    expect(calls.some((c) => c.service === "search")).toBe(false);
  });

  it("validates and suggests via searchExecution", async () => {
    installMockGateway();
    const validated = await handleSearchValidateQuery(
      makeRequest("http://localhost/api/v1/search/query/validate", {
        method: "POST",
        body: JSON.stringify({ query: { keywords: "doc" } }),
      }),
      makeContext(),
    );
    expect((await validated.json()).data.valid).toBe(true);

    const suggestions = await handleSearchSuggestions(
      makeRequest("http://localhost/api/v1/search/suggestions", {
        method: "POST",
        body: JSON.stringify({ keywords: "doc" }),
      }),
      makeContext(),
    );
    expect((await suggestions.json()).data.suggestions[0].text).toBe("doc");
  });

  it("returns capabilities, health, readiness, diagnostics, statistics", async () => {
    installMockGateway();
    const ctx = makeContext();
    expect(
      (await (await handleGetSearchCapabilities(makeRequest("/"), ctx)).json()).data
        .keywords,
    ).toBe(true);
    expect(
      (await (await handleGetSearchHealth(makeRequest("/"), ctx)).json()).data.status,
    ).toBe("available");
    expect(
      (await (await handleGetSearchReadiness(makeRequest("/"), ctx)).json()).data
        .healthy,
    ).toBe(true);
    const diag = await (await handleGetSearchDiagnostics(makeRequest("/"), ctx)).json();
    expect(diag.data.apiKey).toBeUndefined();
    expect(diag.data.apiKeyPresent).toBe(true);
    expect(
      (await (await handleGetSearchStatistics(makeRequest("/"), ctx)).json()).data
        .declaredProviderCount,
    ).toBe(1);
  });

  it("lists management providers and redacts secrets", async () => {
    installMockGateway();
    const listed = await handleListSearchProviders(makeRequest("/"), makeContext());
    const listBody = await listed.json();
    expect(listBody.data[0].label).toBe("Fixture Provider");
    expect(listBody.data[0].apiKey).toBeUndefined();
    expect(listBody.data[0].apiKeyPresent).toBe(true);

    const got = await handleGetSearchProvider(makeRequest("/"), makeContext(), {
      params: Promise.resolve({ providerId: "prov_1" }),
    });
    const gotBody = await got.json();
    expect(gotBody.data.secret).toBeUndefined();
    expect(gotBody.data.secretPresent).toBe(true);

    const audit = await handleListSearchAudit(makeRequest("/"), makeContext());
    expect((await audit.json()).data).toHaveLength(1);

    const mgmtValidate = await handleSearchManagementValidateQuery(
      makeRequest("/", {
        method: "POST",
        body: JSON.stringify({ query: { keywords: "x" } }),
      }),
      makeContext(),
    );
    expect((await mgmtValidate.json()).data.valid).toBe(true);
  });

  it("covers management create/update/list surfaces", async () => {
    installMockGateway();
    const ctx = makeContext();
    const cfgBody = {
      configuration: {
        defaultPageSize: 20,
        maxPageSize: 100,
        maxKeywordLength: 512,
        allowedProviderKinds: ["meilisearch"],
        enforceTenantIsolation: true,
        enforceOrganisationIsolation: true,
        enforcePermissionFilter: true,
      },
    };

    expect(
      (await (await handleListSearchConfigurations(makeRequest("/"), ctx)).json())
        .data[0].id,
    ).toBe("cfg_1");
    expect(
      (
        await (
          await handleGetSearchConfiguration(makeRequest("/"), ctx, {
            params: Promise.resolve({ configurationId: "cfg_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("cfg_1");
    expect(
      (
        await (
          await handleCreateSearchConfiguration(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify({ label: "New", ...cfgBody }),
            }),
            ctx,
          )
        ).json()
      ).data.id,
    ).toBe("cfg_new");
    expect(
      (
        await (
          await handleUpdateSearchConfiguration(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify(cfgBody),
            }),
            ctx,
            { params: Promise.resolve({ configurationId: "cfg_1" }) },
          )
        ).json()
      ).data.currentVersion,
    ).toBe(2);

    expect(
      (await (await handleListSearchCollections(makeRequest("/"), ctx)).json()).data[0]
        .id,
    ).toBe("col_1");
    expect(
      (
        await (
          await handleGetSearchCollection(makeRequest("/"), ctx, {
            params: Promise.resolve({ collectionId: "col_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("col_1");
    expect(
      (
        await (
          await handleCreateSearchCollection(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify({ name: "New", scope: "tenant" }),
            }),
            ctx,
          )
        ).json()
      ).data.id,
    ).toBe("col_new");
    expect(
      (
        await (
          await handleUpdateSearchCollection(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ name: "Renamed" }),
            }),
            ctx,
            { params: Promise.resolve({ collectionId: "col_1" }) },
          )
        ).json()
      ).data.name,
    ).toBe("Renamed");

    expect(
      (await (await handleListSearchSources(makeRequest("/"), ctx)).json()).data[0].id,
    ).toBe("src_1");
    expect(
      (
        await (
          await handleGetSearchSource(makeRequest("/"), ctx, {
            params: Promise.resolve({ sourceId: "src_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("src_1");
    expect(
      (await (await handleListSearchScopes(makeRequest("/"), ctx)).json()).data[0].id,
    ).toBe("scope_1");
    expect(
      (
        await (
          await handleGetSearchScope(makeRequest("/"), ctx, {
            params: Promise.resolve({ scopeId: "scope_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("scope_1");
    expect(
      (await (await handleListSearchProfiles(makeRequest("/"), ctx)).json()).data[0].id,
    ).toBe("profile_1");
    expect(
      (
        await (
          await handleGetSearchProfile(makeRequest("/"), ctx, {
            params: Promise.resolve({ profileId: "profile_1" }),
          })
        ).json()
      ).data.id,
    ).toBe("profile_1");

    expect(
      (
        await (
          await handleGetSearchManagementCapabilities(makeRequest("/"), ctx)
        ).json()
      ).data.keywords,
    ).toBe(true);
    expect(
      (await (await handleGetSearchManagementHealth(makeRequest("/"), ctx)).json()).data
        .status,
    ).toBe("available");
    expect(
      (await (await handleGetSearchManagementDiagnostics(makeRequest("/"), ctx)).json())
        .data.health.status,
    ).toBe("available");
    expect(
      (await (await handleGetSearchManagementStatistics(makeRequest("/"), ctx)).json())
        .data.declaredProviderCount,
    ).toBe(1);
    expect(
      (
        await (
          await handleSearchManagementValidateConfiguration(
            makeRequest("/", {
              method: "POST",
              body: JSON.stringify(cfgBody),
            }),
            ctx,
          )
        ).json()
      ).data.valid,
    ).toBe(true);

    expect(
      (
        await (
          await handleUpdateSearchProvider(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ label: "Updated", enabled: true }),
            }),
            ctx,
            { params: Promise.resolve({ providerId: "prov_1" }) },
          )
        ).json()
      ).data.label,
    ).toBe("Updated");

    expect(
      (
        await (
          await handleUpdateSearchProvider(
            makeRequest("/", {
              method: "PATCH",
              body: JSON.stringify({ enabled: false }),
            }),
            ctx,
            { params: Promise.resolve({ providerId: "prov_1" }) },
          )
        ).json()
      ).data.id,
    ).toBe("prov_1");
  });

  it("rejects isolation-stripping filters and raw Meili syntax", () => {
    expect(
      searchQueryBodySchema.safeParse({
        query: {
          keywords: "x",
          filters: [{ field: "tenantId", op: "eq", value: "other" }],
        },
      }).success,
    ).toBe(false);

    expect(
      searchQueryBodySchema.safeParse({
        query: {
          keywords: "x",
          filters: [{ field: "classification", op: "eq", value: "public" }],
        },
      }).success,
    ).toBe(false);

    expect(
      searchQueryBodySchema.safeParse({
        query: {
          keywords: "x",
          filters: [
            {
              field: "title",
              op: "eq",
              value: 'title = "x" AND tenantId = "y"',
            },
          ],
        },
      }).success,
    ).toBe(false);

    expect(
      searchQueryBodySchema.safeParse({
        query: { keywords: "x", pageSize: 10_000 },
      }).success,
    ).toBe(false);

    expect(
      searchValidateBodySchema.safeParse({
        query: { keywords: "ok", pageSize: 20 },
      }).success,
    ).toBe(true);
  });

  it("proves omitted internal index/document HTTP routes do not exist", () => {
    const root = join(process.cwd(), "apps/web/app/api/v1/search");
    expect(existsSync(join(root, "internal"))).toBe(false);
    expect(existsSync(join(root, "indexes"))).toBe(false);
    expect(existsSync(join(root, "documents"))).toBe(false);
    for (const route of OMITTED_SEARCH_HTTP_ROUTES) {
      expect(route).toMatch(
        /internal\/indexes|internal\/documents|\/indexes|\/documents/,
      );
    }

    const spec = loadPlatformOpenApiSpecObject() as {
      paths: Record<string, unknown>;
    };
    expect(spec.paths["/search/query"]).toBeTruthy();
    expect(spec.paths["/search/query/validate"]).toBeTruthy();
    expect(spec.paths["/search/suggestions"]).toBeTruthy();
    expect(spec.paths["/search/internal/indexes"]).toBeUndefined();
    expect(spec.paths["/search/internal/documents"]).toBeUndefined();
    expect(spec.paths["/search/indexes"]).toBeUndefined();
    expect(spec.paths["/search/documents"]).toBeUndefined();
  });

  it("redacts nested secrets", () => {
    const redacted = redactSearchManagementValue({
      nested: { password: "hunter2", label: "ok" },
      token: "abc",
    });
    expect(redacted).toEqual({
      nested: { passwordPresent: true, label: "ok" },
      tokenPresent: true,
    });
  });
});
