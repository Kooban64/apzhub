import { test, expect } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";

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
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByText("APZHUB", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Home workspace")).toBeVisible();
    await expect(page.getByText("Environment:")).toBeVisible();
  });

  test("theme switching persists", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEV_EMAIL);
    await page.getByLabel("Password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/workspace\/home/);

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
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEV_EMAIL);
    await page.getByLabel("Password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
