import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import {
  createN8nAdapter,
  disposeN8nAdapter,
  N8N_UNSUPPORTED_OPERATIONS,
  createMockN8nFetch,
  DEFAULT_TEST_N8N_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  mapN8nWorkflowToCanonical,
  MOCK_WORKFLOW,
  validateN8nConfiguration,
  normalizeN8nConfiguration,
  buildN8nCompatibilityMatrix,
  N8nNotSupportedError,
} from "./index";

function ctx(): IntegrationRequestContext {
  return {
    tenantId: TEST_TENANT_ID,
    correlationId: TEST_CORRELATION_ID,
  };
}

describe("@apzhub/integration-n8n adapter", () => {
  it("creates adapter, connects, and lists canonical workflows", async () => {
    const { adapter, factory } = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: { fetchFn: createMockN8nFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(true);

    const version = await adapter.client.detectVersion(ctx());
    expect(version.tag).toBe("1.45.0");

    const workflows = await adapter.core.listWorkflows(ctx());
    expect(workflows).toHaveLength(1);
    expect(workflows[0]?.engine).toBe("n8n");
    expect(workflows[0]?.name).toBe("Onboarding Notify");
    expect(workflows[0]?.nodeCount).toBe(2);

    const viaClient = await adapter.client.listWorkflowsMetadata(ctx());
    expect(viaClient).toHaveLength(1);

    const health = await adapter.health(ctx());
    expect(health.status === "healthy" || health.status === "degraded").toBe(true);

    const diagnostics = await adapter.diagnostics(ctx());
    expect(diagnostics.recommendations.join(" ")).toMatch(/Execute/i);
    expect(JSON.stringify(diagnostics)).not.toMatch(/test-key/);
    expect(adapter.diagnosticsExtension.detectedVersionTag).toBe("1.45.0");

    await disposeN8nAdapter(adapter, factory);
  });

  it("supports credential and execution metadata without secrets/payloads", async () => {
    const { adapter, factory } = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: { fetchFn: createMockN8nFetch() },
    });
    await adapter.connect(ctx());

    const credentials = await adapter.core.listCredentialsMetadata(ctx());
    expect(credentials[0]?.secretsIncluded).toBe(false);

    const executions = await adapter.core.listExecutionsMetadata(ctx());
    expect(executions[0]?.payloadIncluded).toBe(false);

    const validation = await adapter.core.validateWorkflowMetadata(ctx(), "1");
    expect(validation.valid).toBe(true);

    await disposeN8nAdapter(adapter, factory);
  });

  it("maps edition-dependent endpoints to NOT_SUPPORTED", async () => {
    const { adapter, factory } = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: {
        fetchFn: createMockN8nFetch({ missUsers: true, missProjects: true }),
      },
    });
    await adapter.connect(ctx());

    await expect(adapter.core.listUsers(ctx())).rejects.toBeInstanceOf(
      N8nNotSupportedError,
    );
    await expect(adapter.core.listProjects(ctx())).rejects.toBeInstanceOf(
      N8nNotSupportedError,
    );

    expect(() => adapter.core.rejectUnsupported("execute")).toThrow(
      /does not support operation: execute/,
    );

    await disposeN8nAdapter(adapter, factory);
  });

  it("supports basic authentication mode", async () => {
    const { adapter, factory } = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: {
        ...DEFAULT_TEST_N8N_CONFIG,
        authMode: "basic",
        apiKeyRef: undefined,
        personalAccessTokenRef: undefined,
        basicUsernameRef: "secret://n8n/user",
        basicPasswordRef: "secret://n8n/pass",
      },
      basicUsername: "ops",
      basicPassword: "secret",
      adapterOptions: { fetchFn: createMockN8nFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(true);
    expect(adapter.diagnosticsExtension.authMode).toBe("basic");

    await disposeN8nAdapter(adapter, factory);
  });

  it("rejects oauth mode and invalid configuration", async () => {
    const invalid = validateN8nConfiguration({
      authMode: "oauth",
      oauth: { enabled: true },
    });
    expect(invalid.ok).toBe(false);

    const normalized = normalizeN8nConfiguration({
      baseUrl: "https://n8n.example.test/",
      authMode: "api_key",
      apiKeyRef: "secret://k",
    });
    expect(normalized.apiBaseUrl).toBe("https://n8n.example.test/api/v1");

    await expect(
      createN8nAdapter({
        tenantId: TEST_TENANT_ID,
        n8n: {
          ...DEFAULT_TEST_N8N_CONFIG,
          authMode: "oauth",
          oauth: { enabled: true },
        },
        apiKey: "x",
        adapterOptions: { fetchFn: createMockN8nFetch() },
      }),
    ).rejects.toThrow(/configuration validation failed|OAuth|oauth/i);
  });

  it("maps workflows deterministically and exposes compatibility matrix", () => {
    const mapped = mapN8nWorkflowToCanonical(MOCK_WORKFLOW);
    expect(mapped.connectionCount).toBeGreaterThan(0);
    expect(mapped.tagNames).toContain("ops");

    const matrix = buildN8nCompatibilityMatrix();
    expect(matrix.unsupportedOperations).toEqual(
      expect.arrayContaining([...N8N_UNSUPPORTED_OPERATIONS]),
    );
    expect(matrix.compatibilityStatus).toBe("compatible");
  });

  it("fails auth when credentials missing", async () => {
    const { adapter, factory } = await createN8nAdapter({
      tenantId: TEST_TENANT_ID,
      n8n: DEFAULT_TEST_N8N_CONFIG,
      // no apiKey — secret provider empty
      autoInitialise: true,
      adapterOptions: { fetchFn: createMockN8nFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(false);

    await disposeN8nAdapter(adapter, factory);
  });
});
