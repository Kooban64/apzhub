import { test, expect } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/workspace\/home/);
}

test.describe("SPR-003 workbench session", () => {
  test("restores sidebar selection and active view after reload", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Overview" }).click();
    await expect(page).toHaveURL(/\/workspace\/home\/overview/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/\/workspace\/home\/overview/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Overview" })).toHaveClass(/accent/);
  });
});
