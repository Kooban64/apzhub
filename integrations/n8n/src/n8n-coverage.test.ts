import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import {
  buildN8nCompatibilityMatrix,
  classifyN8nOperationalHealth,
  createMockN8nFetch,
  createN8nAdapter,
  createN8nCapabilityRegistration,
  createN8nVendorErrorMapper,
  DEFAULT_TEST_N8N_CONFIG,
  discoverN8nCoreServiceCapabilities,
  disposeN8nAdapter,
  getN8nCoreServiceCapability,
  isN8nServiceImplemented,
  listN8nRegisteredCapabilityIds,
  mapN8nCredentialMetadata,
  mapN8nExecutionMetadata,
  mapN8nProjectMetadata,
  mapN8nTagMetadata,
  mapN8nUnknownError,
  mapN8nUserMetadata,
  mapN8nVariableMetadata,
  mapN8nWorkflowAsTemplateMetadata,
  mapN8nWorkflowToCanonical,
  mapOperationalHealthToSdkStatus,
  MOCK_CREDENTIAL,
  MOCK_EXECUTION,
  MOCK_PROJECT,
  MOCK_TAG,
  MOCK_USER,
  MOCK_VARIABLE,
  MOCK_WORKFLOW,
  normalizeN8nConfiguration,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  validateN8nConfiguration,
} from "./index";

function ctx(): IntegrationRequestContext {
  return {
    tenantId: TEST_TENANT_ID,
    correlationId: TEST_CORRELATION_ID,
  };
}

describe("n8n coverage — mappers / config / operations", () => {
  it("maps all canonical entity types", () => {
    expect(mapN8nWorkflowToCanonical({ ...MOCK_WORKFLOW, connections: undefined }).connectionCount).toBe(0);
    expect(mapN8nWorkflowAsTemplateMetadata(MOCK_WORKFLOW).support).toBe("partial");
    expect(mapN8nCredentialMetadata(MOCK_CREDENTIAL).secretsIncluded).toBe(false);
    expect(mapN8nVariableMetadata(MOCK_VARIABLE).valueIncluded).toBe(false);
    expect(mapN8nExecutionMetadata(MOCK_EXECUTION).payloadIncluded).toBe(false);
    expect(mapN8nTagMetadata(MOCK_TAG).name).toBe("ops");
    expect(mapN8nUserMetadata(MOCK_USER).displayName).toBe("Ops User");
    expect(mapN8nUserMetadata({ id: "x" }).displayName).toBeUndefined();
    expect(mapN8nProjectMetadata(MOCK_PROJECT).support).toBe("partial");
  });

  it("validates configuration edge cases", () => {
    expect(validateN8nConfiguration({ baseUrl: "not-a-url" }).ok).toBe(false);
    expect(validateN8nConfiguration({ apiBaseUrl: "ftp://x" }).ok).toBe(false);
    expect(validateN8nConfiguration({ timeoutMs: 0 }).ok).toBe(false);
    expect(
      validateN8nConfiguration({
        retry: { maxAttempts: 0, baseDelayMs: -1, maxDelayMs: 1 },
      }).ok,
    ).toBe(false);
    expect(
      validateN8nConfiguration({
        authMode: "api_key",
      }).ok,
    ).toBe(false);
    expect(
      validateN8nConfiguration({
        authMode: "basic",
        basicUsernameRef: "u",
      }).ok,
    ).toBe(false);
    expect(
      normalizeN8nConfiguration({
        baseUrl: "https://n8n.test",
        authMode: "personal_access_token",
        personalAccessTokenRef: "secret://pat",
      }).personalAccessTokenRef,
    ).toBe("secret://pat");
  });

  it("classifies health and maps SDK status", () => {
    expect(
      classifyN8nOperationalHealth({
        apiStatus: "reachable",
        authenticationStatus: "valid",
      }).level,
    ).toBe("healthy");
    expect(
      classifyN8nOperationalHealth({
        apiStatus: "unavailable",
        authenticationStatus: "valid",
      }).level,
    ).toBe("unhealthy");
    expect(
      classifyN8nOperationalHealth({
        apiStatus: "degraded",
        authenticationStatus: "valid",
      }).level,
    ).toBe("degraded");
    expect(
      classifyN8nOperationalHealth({
        apiStatus: "not_tested",
        authenticationStatus: "unknown",
      }).level,
    ).toBe("degraded");
    expect(mapOperationalHealthToSdkStatus("unhealthy")).toBe("unavailable");
    expect(buildN8nCompatibilityMatrix().supportedApi).toBe("v1");
  });

  it("exposes capability registry helpers", () => {
    expect(discoverN8nCoreServiceCapabilities().length).toBeGreaterThan(5);
    expect(getN8nCoreServiceCapability("workflows")?.implemented).toBe(true);
    expect(isN8nServiceImplemented("workflows")).toBe(true);
    expect(isN8nServiceImplemented("missing")).toBe(false);
    expect(listN8nRegisteredCapabilityIds()).toContain("diagnostics");
    expect(createN8nCapabilityRegistration().serviceIds).toContain("tags");
  });

  it("translates vendor errors", () => {
    const mapper = createN8nVendorErrorMapper();
    const context = {
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
      integrationId: "n8n",
      operation: "list",
    };
    expect(
      mapper.map({
        statusCode: 401,
        body: { message: "Unauthorized" },
        context,
      })?.error.category,
    ).toBe("authentication");
    expect(
      mapper.map({
        statusCode: 404,
        body: { message: "not found" },
        context,
      })?.error.category,
    ).toBe("not_found");
    expect(
      mapper.map({
        statusCode: 429,
        body: { message: "rate limit" },
        context,
      })?.error.category,
    ).toBe("rate_limited");
    expect(
      mapper.map({
        statusCode: 501,
        body: { code: "NOT_IMPLEMENTED" },
        context: { ...context, operation: "execute" },
      })?.error.category,
    ).toBe("not_implemented");
    expect(
      mapN8nUnknownError(new Error("boom"), context).error.message.length,
    ).toBeGreaterThan(0);
    expect(
      mapN8nUnknownError(
        { statusCode: 503, body: { message: "down" }, code: "ECONNREFUSED" },
        context,
      ).error.category,
    ).toBe("vendor_unavailable");
    expect(mapper.map({ context }) ).toBeNull();
  });
});

describe("n8n coverage — adapter surface", () => {
  it("exercises tags, templates, variables, get*, capabilities, diagnostics", async () => {
    const { adapter, factory } = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: { fetchFn: createMockN8nFetch() },
    });
    await adapter.connect(ctx());

    expect((await adapter.core.listTags(ctx()))[0]?.id).toBe("t1");
    expect((await adapter.core.getTag(ctx(), "t1")).name).toBe("ops");
    expect((await adapter.core.getWorkflow(ctx(), "1")).id).toBe("1");
    expect((await adapter.core.listWorkflowTemplates(ctx())).length).toBe(1);
    expect((await adapter.core.getWorkflowTemplate(ctx(), "1")).id).toBe("1");
    expect((await adapter.core.getCredentialMetadata(ctx(), "c1")).type).toBe(
      "smtp",
    );
    expect((await adapter.core.getExecutionMetadata(ctx(), "e1")).id).toBe("e1");
    expect((await adapter.core.listVariablesMetadata(ctx()))[0]?.key).toBe(
      "ENV_LABEL",
    );
    expect((await adapter.core.getVariableMetadata(ctx(), "var1")).id).toBe(
      "var1",
    );
    expect((await adapter.core.listUsers(ctx()))[0]?.email).toContain("@");
    expect((await adapter.core.getUser(ctx(), "u1")).id).toBe("u1");
    expect((await adapter.core.listProjects(ctx()))[0]?.name).toBe("Default");
    expect((await adapter.core.getProject(ctx(), "p1")).id).toBe("p1");

    const caps = adapter.core.getCapabilities();
    expect(caps.unsupportedOperations).toContain("execute");
    expect(adapter.core.getCompatibility().compatibilityStatus).toBe(
      "compatible",
    );
    expect(adapter.listCapabilityRegistration().capabilityIds.length).toBeGreaterThan(
      0,
    );
    expect(adapter.getRuntimeDiagnosticsSnapshot().adapterVersion).toBeTruthy();
    expect(adapter.diagnosticsExtension.apiStatus).toBe("reachable");

    const diagnostics = await adapter.diagnostics(ctx());
    expect(diagnostics.healthStatus).toBeTruthy();

    await disposeN8nAdapter(adapter, factory);
  });

  it("handles auth failure and variable not-supported path", async () => {
    const failing = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: { fetchFn: createMockN8nFetch({ failAuth: true }) },
    });
    await expect(failing.adapter.connect(ctx())).rejects.toThrow();
    await disposeN8nAdapter(failing.adapter, failing.factory);

    const missingVars = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: {
        fetchFn: createMockN8nFetch({ missVariables: true }),
      },
    });
    await missingVars.adapter.connect(ctx());
    await expect(
      missingVars.adapter.core.listVariablesMetadata(ctx()),
    ).rejects.toThrow(/does not support/);
    await disposeN8nAdapter(missingVars.adapter, missingVars.factory);
  });

  it("rejects oauth connect when misconfigured after force-init skip", async () => {
    await expect(
      createN8nAdapter({
        tenantId: TEST_TENANT_ID,
        n8n: {
          baseUrl: "https://n8n.example.test",
          authMode: "api_key",
          apiKeyRef: "secret://k",
          oauth: { enabled: true },
        },
        apiKey: "k",
        adapterOptions: { fetchFn: createMockN8nFetch() },
      }),
    ).rejects.toThrow();
  });

  it("covers oauth rejection, empty validation, and dispose", async () => {
    const { adapter, factory } = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: { fetchFn: createMockN8nFetch() },
    });
    await adapter.connect(ctx());

    Object.assign(adapter.n8nConfig, { authMode: "oauth" });
    const oauthResult = await adapter.testConnection(ctx());
    expect(oauthResult.ok).toBe(false);
    expect(oauthResult.message).toMatch(/OAuth/i);

    Object.assign(adapter.n8nConfig, { authMode: "api_key" });

    // Force empty graph validation path via mapper-level empty workflow through mock would need
    // override — exercise validate with getWorkflow still valid, then mapper empty case:
    expect(
      mapN8nWorkflowToCanonical({
        id: "empty",
        name: "   ",
        nodes: [],
        connections: {},
      }).nodeCount,
    ).toBe(0);

    await disposeN8nAdapter(adapter, factory);
    await expect(adapter.connect(ctx())).rejects.toThrow(/disposed|initialised/i);
  });
});
