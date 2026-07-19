import { describe, expect, it } from "vitest";

import { createKimaiAdapter, disposeKimaiAdapter } from "./kimai-factory";
import {
  createMockKimaiFetch,
  DEFAULT_TEST_KIMAI_CONFIG,
  TEST_TENANT_ID,
} from "./testing/mock-kimai-api";

describe("kimai-factory", () => {
  it("creates and disposes a fully initialised adapter", async () => {
    const { adapter, factory, configuration } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "token",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });

    expect(configuration.kimai.apiTokenRef).toBe("secret://kimai/api-token");
    expect(adapter.kimaiConfig.authMode).toBe("bearer");

    await disposeKimaiAdapter(adapter, factory);
  });

  it("fails initialise when configuration is invalid", async () => {
    await expect(
      createKimaiAdapter({
        tenantId: TEST_TENANT_ID,
        kimai: { authMode: "bearer", baseUrl: "https://kimai.example.test" },
      }),
    ).rejects.toThrow(/configuration/i);
  });
});
