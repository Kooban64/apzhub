import { test, expect } from "@playwright/test";

test.describe("SPR-002 runtime integration", () => {
  test("health endpoint includes platform runtime summary", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.runtime).toMatchObject({
      status: expect.stringMatching(/healthy|degraded/),
      platformReady: true,
      registryCount: expect.any(Number),
      capabilityCount: expect.any(Number),
      startupDurationMs: expect.any(Number),
      healthSummary: expect.stringContaining("Runtime health"),
    });
    expect(body.runtime.registryCount).toBeGreaterThan(0);
    expect(body.commands).toMatchObject({
      status: expect.stringMatching(/healthy|degraded/),
      registeredCount: expect.any(Number),
      filteredCount: expect.any(Number),
      toolbarRegionCount: expect.any(Number),
      toolbarItemCount: expect.any(Number),
    });
  });
});
