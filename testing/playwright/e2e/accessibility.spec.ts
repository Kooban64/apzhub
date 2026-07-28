import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

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
    await signInDevUser(page);
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );
    expect(critical).toEqual([]);
  });
});
