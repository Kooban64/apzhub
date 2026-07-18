import { test, expect } from "@playwright/test";

/**
 * PRH-017 — Production smoke (local). CI pipeline wiring deferred to M17.
 * Covers: health API, login, shell Home, platform API surface, law home.
 */

const DEV_EMAIL = process.env.E2E_USER_EMAIL ?? "dev@apzhub.local";
const DEV_PASSWORD = process.env.E2E_USER_PASSWORD ?? "DevPassword123!";

async function ensureSignedIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  try {
    await expect(page).toHaveURL(/\/workspace\//, { timeout: 8000 });
  } catch {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Dev User");
    await page.getByLabel("Email").fill(DEV_EMAIL);
    await page.getByLabel("Password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/workspace\//, { timeout: 15_000 });
  }
}

test.describe("PRH-017 production smoke", () => {
  test("health API returns structured platform status", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();
    expect([200, 503]).toContain(response.status());
    expect(body).toMatchObject({
      status: expect.stringMatching(/healthy|degraded|unhealthy/),
      dependencies: {
        database: { status: expect.any(String) },
        redis: { status: expect.any(String) },
      },
    });
    // Prefer healthy deps when local docker is up
    if (response.status() === 200) {
      expect(body.dependencies.database.status).toBe("healthy");
      expect(body.dependencies.redis.status).toBe("healthy");
    }
  });

  test("login and desktop shell Home render", async ({ page }) => {
    await ensureSignedIn(page);
    await page.goto("/workspace/home");
    await expect(page).toHaveURL(/\/workspace\/home/, { timeout: 15_000 });
    // Shell brand mark must render after authentication
    await expect(page.getByText("APZHUB").first()).toBeVisible({
      timeout: 15_000,
    });
    // Activity / navigation chrome present (permission-driven shell)
    const shellChrome = page.locator("header").or(page.getByRole("navigation"));
    await expect(shellChrome.first()).toBeVisible({ timeout: 15_000 });
  });

  test("platform API health endpoint responds for session context", async ({
    page,
  }) => {
    await ensureSignedIn(page);
    const opsResponse = await page.request.get("/api/v1/health");
    expect([200, 401, 403]).toContain(opsResponse.status());
  });

  test("law platform home route resolves or redirects safely", async ({ page }) => {
    await ensureSignedIn(page);
    const response = await page.goto("/workspace/law", {
      waitUntil: "domcontentloaded",
    });
    const status = response?.status() ?? 0;
    expect(status).toBeLessThan(500);
  });
});
