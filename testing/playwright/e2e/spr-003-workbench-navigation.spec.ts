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

test.describe("SPR-003 workbench navigation", () => {
  test("activity bar renders manifest-driven workspaces", async ({ page }) => {
    await signIn(page);

    await expect(page.getByRole("button", { name: "Home workspace" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Administration workspace" }),
    ).toBeVisible();
  });

  test("sidebar renders manifest-driven items for active workspace", async ({
    page,
  }) => {
    await signIn(page);

    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
  });

  test("selecting sidebar item activates view and updates route", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Overview" }).click();
    await expect(page).toHaveURL(/\/workspace\/home\/overview/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("selecting administration workspace updates active activity bar item", async ({
    page,
  }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Administration workspace" }).click();
    await expect(page).toHaveURL(/\/workspace\/administration/);
    await expect(
      page.getByRole("button", { name: "Administration workspace" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
