import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("SPR-003 workbench session", () => {
  test("restores sidebar selection and active view after reload", async ({ page }) => {
    await signInDevUser(page);

    await page.getByRole("button", { name: "Overview" }).click();
    await expect(page).toHaveURL(/\/workspace\/home\/overview/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/workspace\/home\/overview/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: "Overview" })).toHaveClass(/accent/);
  });
});
