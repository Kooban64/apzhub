import { expect, test } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("Global Quick Actions v1", () => {
  test("launcher opens; API returns permission-filtered create actions", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });

    await page.getByTestId("global-quick-actions-trigger").click();
    await expect(page.getByTestId("global-quick-actions")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("global-quick-actions")).toHaveCount(0);

    await page.locator("body").click({ position: { x: 8, y: 8 } });
    await page.keyboard.press("Control+Shift+A");
    await expect(page.getByTestId("global-quick-actions")).toBeVisible({
      timeout: 10_000,
    });

    const response = await page.request.get("/api/v1/platform/quick-actions");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      data?: {
        capability?: string;
        actions?: readonly { id: string; label: string; href: string }[];
      };
    };
    expect(body.data?.capability).toBe("global-quick-actions-v1");
    const ids = body.data?.actions?.map((action) => action.id) ?? [];
    expect(ids).toContain("qa-new-project");
    expect(ids).toContain("qa-new-ticket");
    expect(ids).toContain("qa-log-time");

    await page.getByTestId("global-quick-action-qa-new-project").click();
    await expect(page).toHaveURL(/\/workspace\/projects\/new/, { timeout: 15_000 });
  });
});
