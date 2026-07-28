import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

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
    await signInDevUser(page);

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
    await signInDevUser(page);

    await page.keyboard.press("Control+Shift+P");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("option", { name: /Toggle Theme/i })).toBeVisible();
  });

  test("command palette executes an action through the registry pipeline", async ({
    page,
  }) => {
    await signInDevUser(page);

    await page.keyboard.press("Control+Shift+P");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("option", { name: /Toggle Theme/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
