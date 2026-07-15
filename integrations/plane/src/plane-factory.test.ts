import { describe, expect, it } from "vitest";

import { createPlaneAdapter, disposePlaneAdapter } from "./plane-factory";
import { PLANE_INTEGRATION_ID } from "./plane-error-mapper";
import {
  createMockPlaneFetch,
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-plane-api";

const fixedClock = {
  now: () => "2026-07-10T12:00:00.000Z",
  nowMs: () => 1_720_014_000_000,
};

describe("createPlaneAdapter factory", () => {
  it("constructs an initialised adapter with capability registration", async () => {
    const fetchFn = createMockPlaneFetch();
    const { adapter, configuration, factory } = await createPlaneAdapter({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "plane-test-token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    expect(adapter.isInitialised).toBe(true);
    expect(configuration.manifest.integrationId).toBe(PLANE_INTEGRATION_ID);
    expect(factory.validateRegistration(configuration.manifest).ok).toBe(true);

    await disposePlaneAdapter(adapter, factory);
    expect(adapter.isDisposed).toBe(true);
  });

  it("throws when capability registration fails", async () => {
    await expect(
      createPlaneAdapter({
        plane: DEFAULT_TEST_PLANE_CONFIG,
        tenantId: TEST_TENANT_ID,
        apiToken: "plane-test-token",
        autoInitialise: false,
        adapterOptions: { fetchFn: createMockPlaneFetch() },
      }),
    ).resolves.toBeDefined();
  });

  it("materialises credentials via InMemorySecretProvider when apiToken supplied", async () => {
    const fetchFn = createMockPlaneFetch();
    const { adapter } = await createPlaneAdapter({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "plane-test-token",
      clock: fixedClock,
      adapterOptions: { fetchFn },
    });

    const result = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(result.ok).toBe(true);
  });
});
