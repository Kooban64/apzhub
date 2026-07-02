import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  try {
    await expect(page).toHaveURL(/\/workspace\/home/, { timeout: 5000 });
  } catch {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Dev User");
    await page.getByLabel("Email").fill(DEV_EMAIL);
    await page.getByLabel("Password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/workspace\/home/);
  }
}

test.describe("Accessibility", () => {
  test("login page has no critical axe violations", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );
    expect(critical).toEqual([]);
  });

  test("desktop shell has no critical axe violations", async ({ page }) => {
    await signIn(page);
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );
    expect(critical).toEqual([]);
  });
});
