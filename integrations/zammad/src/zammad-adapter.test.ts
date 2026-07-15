import { describe, expect, it } from "vitest";

import { buildAdapterContext } from "@apzhub/integration-sdk/adapter";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { ZammadAdapter } from "./zammad-adapter";
import { createZammadBootstrapConfiguration } from "./zammad-bootstrap";
import { ZAMMAD_INTEGRATION_ID } from "./zammad-error-mapper";
import {
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-zammad-api";

const fixedClock = {
  now: () => "2026-07-10T18:00:00.000Z",
  nowMs: () => 1_720_035_600_000,
};

function createTestAdapter(options?: {
  fetchFn?: ReturnType<typeof createMockZammadFetch>;
  apiToken?: string;
}) {
  const configuration = createZammadBootstrapConfiguration({
    zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
    tenantId: TEST_TENANT_ID,
    edition: "community",
  });

  const secretProvider = new InMemorySecretProvider({
    secrets: {
      [DEFAULT_TEST_ZAMMAD_CONFIG.apiTokenRef]:
        options?.apiToken ?? "zammad-test-token",
    },
  });

  const context = buildAdapterContext({
    configuration,
    secretProvider,
    clock: fixedClock,
  });

  const adapter = new ZammadAdapter(context, configuration, {
    fetchFn: options?.fetchFn ?? createMockZammadFetch(),
    secretProvider,
  });

  return { adapter, context, configuration };
}

describe("ZammadAdapter lifecycle", () => {
  it("initialises, connects, performs health checks, collects diagnostics, and disconnects", async () => {
    const { adapter } = createTestAdapter();

    const init = await adapter.initialise();
    expect(init.ok).toBe(true);

    const connect = await adapter.connect({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(connect.ok).toBe(true);
    expect(adapter.isConnected).toBe(true);

    const health = await adapter.performHealthCheck({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(
      health.checks.some(
        (check) => check.name === "zammad_api" && check.status === "pass",
      ),
    ).toBe(true);
    expect(
      health.checks.some(
        (check) => check.name === "zammad_authentication" && check.status === "pass",
      ),
    ).toBe(true);
    expect(health.checks.some((check) => check.name === "zammad_version")).toBe(true);
    expect(health.checks.some((check) => check.name === "zammad_edition")).toBe(true);
    expect(health.checks.some((check) => check.name === "zammad_capabilities")).toBe(
      true,
    );

    const diagnostics = await adapter.collectDiagnostics({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(diagnostics.integrationId).toBe(ZAMMAD_INTEGRATION_ID);
    expect(diagnostics.engineVersion).toBe("6.3.1");

    const extension = adapter.zammadDiagnosticsExtension;
    expect(extension.apiStatus).toBe("reachable");
    expect(extension.authenticationStatus).toBe("valid");
    expect(extension.edition).toBe("community");
    expect(extension.extendedCapabilities).toContain("tickets");
    expect(extension.extendedCapabilities).toContain("organizations");
    expect(extension.supportServiceAvailable).toBe(true);
    expect(extension.organizationServiceAvailable).toBe(true);
    expect(extension.groupServiceAvailable).toBe(true);
    expect(extension.userServiceAvailable).toBe(true);
    expect(extension.coreServices.map((s) => s.serviceId)).toEqual([
      "support",
      "organizations",
      "groups",
      "users",
      "articles",
      "search",
      "history",
      "analytics",
      "webhooks",
      "events",
      "synchronisation",
    ]);
    expect(extension.searchServiceAvailable).toBe(true);
    expect(extension.historyServiceAvailable).toBe(true);
    expect(extension.analyticsServiceAvailable).toBe(true);
    expect(extension.syncEventsCapability.webhooksRegistered).toBe(true);
    expect(extension.articleServiceRegistered).toBe(true);
    expect(
      extension.placeholderCapabilities.every((cap) => cap.implemented === false),
    ).toBe(true);
    expect(extension.placeholderCapabilities.map((c) => c.capabilityId)).not.toContain(
      "support",
    );

    const disconnect = await adapter.disconnect({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(disconnect.ok).toBe(true);

    const dispose = await adapter.dispose("shutdown");
    expect(dispose.ok).toBe(true);
    expect(adapter.isDisposed).toBe(true);
  });

  it("validates configuration and rejects invalid settings", async () => {
    const configuration = createZammadBootstrapConfiguration({
      zammad: { ...DEFAULT_TEST_ZAMMAD_CONFIG, baseUrl: "" },
      tenantId: TEST_TENANT_ID,
    });

    const context = buildAdapterContext({ configuration, clock: fixedClock });
    const adapter = new ZammadAdapter(context, configuration, {
      fetchFn: createMockZammadFetch(),
      secretProvider: new InMemorySecretProvider({ secrets: {} }),
    });

    const validation = await adapter.validateConfiguration();
    expect(validation.ok).toBe(false);
    expect(validation.issues?.some((issue) => issue.includes("baseUrl"))).toBe(true);
  });

  it("discovers Zammad engine version and edition", async () => {
    const { adapter } = createTestAdapter({
      fetchFn: createMockZammadFetch({ engineVersion: "6.4.0", edition: "community" }),
    });
    await adapter.initialise();

    const version = await adapter.discoverVersion({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(version).toBe("6.4.0");
    expect(adapter.getDetectedEdition()).toBe("community");
  });

  it("reports authentication missing when secret provider cannot resolve token", async () => {
    const configuration = createZammadBootstrapConfiguration({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
    });
    const context = buildAdapterContext({ configuration, clock: fixedClock });
    const adapter = new ZammadAdapter(context, configuration, {
      fetchFn: createMockZammadFetch(),
      secretProvider: new InMemorySecretProvider({ secrets: {} }),
    });
    await adapter.initialise();

    const result = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(result.ok).toBe(false);
    expect(adapter.zammadDiagnosticsExtension.authenticationStatus).toBe("missing");
  });

  it("exposes deferred placeholders and implemented core capabilities", async () => {
    const { adapter } = createTestAdapter();
    await adapter.initialise();

    const ids = adapter.listPlaceholderCapabilities();
    expect(ids).toContain("attachments");
    expect(ids).not.toContain("events");
    expect(ids).not.toContain("synchronisation");
    expect(ids).not.toContain("webhooks");
    expect(ids).not.toContain("search");
    expect(ids).not.toContain("analytics");
    expect(ids).not.toContain("history");
    expect(ids).not.toContain("articles");
    expect(adapter.core.discoverCapabilities().map((c) => c.serviceId)).toEqual([
      "support",
      "organizations",
      "groups",
      "users",
      "articles",
      "search",
      "history",
      "analytics",
      "webhooks",
      "events",
      "synchronisation",
    ]);
  });
});
