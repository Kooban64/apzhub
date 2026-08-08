import { expect, test } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("Personalisation v1", () => {
  test("centre loads; prefs and favourites APIs work", async ({ page }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);

    await page.goto("/workspace/personalisation", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("personalisation-centre")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("personalisation-landing-page")).toBeVisible();

    const prefs = await page.request.get("/api/platform/v1/preferences");
    expect(prefs.ok()).toBeTruthy();

    await page.getByTestId("personalisation-favorite-current").click();
    await page.getByTestId("personalisation-tab-favourites").click();
    await expect(page.getByTestId("personalisation-favourites")).toBeVisible();
  });
});
