import { expect, test } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("Global Search v1", () => {
  test("Ctrl+K opens search; API returns grouped catalogue shape", async ({ page }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await page.getByTestId("global-search-trigger").click();
    await expect(page.getByTestId("global-search")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("global-search")).toHaveCount(0);

    await page.locator("body").click({ position: { x: 8, y: 8 } });
    await page.keyboard.press("Control+k");
    await expect(page.getByTestId("global-search")).toBeVisible({ timeout: 10_000 });

    const response = await page.request.get("/api/v1/platform/search?q=test");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      data?: {
        capability?: string;
        providers?: readonly { label: string }[];
        groups?: unknown[];
      };
    };
    expect(body.data?.capability).toBe("global-search-v1");
    expect(body.data?.providers).toHaveLength(7);
    expect(body.data?.providers?.map((p) => p.label)).toEqual([
      "Projects",
      "Support",
      "Workflow",
      "Knowledge",
      "Time",
      "Analytics",
      "QEP",
    ]);
  });
});
