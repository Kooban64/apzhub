import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("APZHUB-CAPABILITY-001-ENG-001 My Work composition", () => {
  test("landing shows My Work queues (or calm empty state)", async ({ page }) => {
    await signInDevUser(page);
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("my-work-view")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("my-work-greeting")).toBeVisible();
    await expect(page.getByTestId("my-work-needs-attention")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("my-work-due-today")).toBeVisible();
    await expect(page.getByTestId("my-work-waiting")).toBeVisible();
    await expect(page.getByTestId("my-work-completed")).toBeVisible();
  });
});
