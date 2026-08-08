import { expect, test } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("Unified Notifications v1", () => {
  test("centre route + aggregator API + shortcut entry", async ({ page }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);

    await page.goto("/workspace/notifications/inbox", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("unified-notification-centre")).toBeVisible({
      timeout: 15_000,
    });

    const response = await page.request.get("/api/v1/platform/notifications");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      data?: { capability?: string; groups?: unknown[] };
    };
    expect(body.data?.capability).toBe("unified-notifications-v1");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await page.locator("body").click({ position: { x: 8, y: 8 } });
    await page.keyboard.press("Control+Shift+n");
    await expect(page).toHaveURL(/\/workspace\/notifications\/inbox/, {
      timeout: 15_000,
    });
  });
});
