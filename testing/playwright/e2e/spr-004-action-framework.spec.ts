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

test.describe("SPR-004 Action Framework integration", () => {
  test("health endpoint includes Action Framework hydration summary", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.commands).toMatchObject({
      status: expect.stringMatching(/healthy|degraded/),
      registeredCount: expect.any(Number),
      filteredCount: expect.any(Number),
      platformActionCount: expect.any(Number),
      capabilityActionCount: expect.any(Number),
      toolbarRegionCount: expect.any(Number),
      toolbarItemCount: expect.any(Number),
      registeredShortcutCount: expect.any(Number),
    });
    expect(body.commands.registeredCount).toBeGreaterThan(0);
  });

  test("authenticated shell hydrates workbench surfaces from Action Registry", async ({
    page,
  }) => {
    await signIn(page);

    await expect(page.getByTestId("toolbar")).toBeVisible();
    await expect(
      page.locator(
        '[data-testid="toolbar-item"][data-action-id="platform.theme.toggle"]',
      ),
    ).toBeVisible();

    const diagnostics = page.getByTestId("action-framework-diagnostics");
    await expect(diagnostics).toHaveAttribute("data-registered-count", /.+/);
    expect(
      Number(await diagnostics.getAttribute("data-filtered-count")),
    ).toBeGreaterThan(0);
    expect(
      Number(await diagnostics.getAttribute("data-toolbar-item-count")),
    ).toBeGreaterThan(0);
  });

  test("command palette opens and lists platform actions", async ({ page }) => {
    await signIn(page);

    await page.keyboard.press("Control+Shift+P");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("option", { name: /Toggle Theme/i })).toBeVisible();
  });

  test("command palette executes an action through the registry pipeline", async ({
    page,
  }) => {
    await signIn(page);

    await page.keyboard.press("Control+Shift+P");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("option", { name: /Toggle Theme/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
