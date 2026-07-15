import { describe, expect, it } from "vitest";

import { createZammadAdapter, disposeZammadAdapter } from "./zammad-factory";
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

describe("createZammadAdapter factory", () => {
  it("constructs an initialised adapter with capability registration", async () => {
    const fetchFn = createMockZammadFetch();
    const { adapter, configuration, factory } = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "zammad-test-token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    expect(adapter.isInitialised).toBe(true);
    expect(configuration.manifest.integrationId).toBe(ZAMMAD_INTEGRATION_ID);
    expect(factory.validateRegistration(configuration.manifest).ok).toBe(true);

    await disposeZammadAdapter(adapter, factory);
    expect(adapter.isDisposed).toBe(true);
  });

  it("materialises credentials via InMemorySecretProvider when apiToken supplied", async () => {
    const fetchFn = createMockZammadFetch();
    const { adapter } = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "zammad-test-token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    const result = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(result.ok).toBe(true);
  });

  it("can skip auto-initialise", async () => {
    const { adapter } = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "zammad-test-token",
      autoInitialise: false,
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });

    expect(adapter.isInitialised).toBe(false);
  });
});
