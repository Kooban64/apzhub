import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("SPR-003 workbench navigation", () => {
  test("activity bar renders manifest-driven workspaces", async ({ page }) => {
    await signInDevUser(page);

    await expect(page.getByRole("button", { name: "Home workspace" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Administration workspace" }),
    ).toBeVisible();
  });

  test("sidebar renders manifest-driven items for active workspace", async ({
    page,
  }) => {
    await signInDevUser(page);

    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
  });

  test("selecting sidebar item activates view and updates route", async ({ page }) => {
    await signInDevUser(page);

    await page.getByRole("button", { name: "Overview" }).click();
    await expect(page).toHaveURL(/\/workspace\/home\/overview/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("selecting administration workspace updates active activity bar item", async ({
    page,
  }) => {
    await signInDevUser(page);

    await page.getByRole("button", { name: "Administration workspace" }).click();
    await expect(page).toHaveURL(/\/workspace\/administration/);
    await expect(
      page.getByRole("button", { name: "Administration workspace" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
