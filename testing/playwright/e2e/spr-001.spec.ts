import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

test.describe("SPR-001 acceptance", () => {
  test("login page renders without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Sign in to APZHUB" }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("health endpoint returns platform status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      status: "healthy",
      platformVersion: expect.any(String),
      buildNumber: expect.any(String),
      dependencies: {
        database: { status: "healthy" },
        redis: { status: "healthy" },
      },
    });
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("registration and desktop shell", async ({ page }) => {
    await signInDevUser(page);
    await expect(page.getByTestId("my-work-view")).toBeVisible();
    await expect(page.getByText("APZHUB", { exact: true })).toBeVisible();
    await expect(page.getByLabel(/^(Home|My Work) workspace$/)).toBeVisible();
    await expect(page.getByText("Environment:")).toBeVisible();
  });

  test("theme switching persists", async ({ page }) => {
    await signInDevUser(page);

    const html = page.locator("html");
    const before = await html.evaluate((el) => el.className);

    await page.locator("header").getByRole("button", { name: "Toggle theme" }).click();
    await page.waitForTimeout(300);
    const after = await html.evaluate((el) => el.className);
    expect(after).not.toBe(before);

    await page.reload();
    const reloaded = await html.evaluate((el) => el.className);
    expect(reloaded).toBe(after);
  });

  test("sign out returns to login", async ({ page }) => {
    await signInDevUser(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
