import { expect, test } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("Unified Activity Stream v1", () => {
  test("feed route + aggregator API shape", async ({ page }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);

    await page.goto("/workspace/activity", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("unified-activity-stream")).toBeVisible({
      timeout: 15_000,
    });

    const response = await page.request.get("/api/v1/platform/activity");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      data?: { capability?: string; groups?: unknown[]; total?: number };
    };
    expect(body.data?.capability).toBe("unified-activity-v1");
    expect(Array.isArray(body.data?.groups)).toBe(true);
  });
});
