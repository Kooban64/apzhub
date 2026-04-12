import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";
import { APP_THEMES, type AppThemeId } from "@/lib/theme/constants";

const THEME_LABELS: Record<AppThemeId, string> = {
  "mist-blue": "Mist Blue",
  "sage-green": "Sage Green",
  "soft-charcoal": "Soft Charcoal",
  graphite: "Graphite",
  obsidian: "Obsidian",
};

test.describe("desktop shell", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(mockAdminSession()),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("header and footer stay mounted between workspace and admin", async ({ page }) => {
    await page.goto("/workspace");
    await expect(page.getByTestId("app-header")).toBeVisible();
    await expect(page.getByTestId("app-footer")).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByTestId("app-header")).toBeVisible();
    await expect(page.getByTestId("app-footer")).toBeVisible();
  });

  test("theme menu updates html data-theme", async ({ page }) => {
    await page.goto("/workspace");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByTestId("theme-menu-trigger").click();
    await page.getByText("Graphite", { exact: true }).waitFor({ state: "visible" });
    await page.getByText("Graphite", { exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "graphite");
  });

  test("each theme exposes sample tokens and keeps html data-* hygiene", async ({ page }) => {
    await page.goto("/workspace");
    await page.setViewportSize({ width: 1280, height: 800 });

    for (const theme of APP_THEMES) {
      await page.getByTestId("theme-menu-trigger").click();
      const label = THEME_LABELS[theme];
      await page.getByText(label, { exact: true }).waitFor({ state: "visible" });
      await page.getByText(label, { exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const bg = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--background").trim(),
      );
      expect(bg.length, `--background for ${theme}`).toBeGreaterThan(0);
      const dataAttrs = await page.evaluate(() =>
        [...document.documentElement.attributes]
          .map((a) => a.name)
          .filter((n) => n.startsWith("data-")),
      );
      expect(dataAttrs.sort()).toEqual(["data-density", "data-theme"].sort());
      await page.keyboard.press("Escape");
    }
  });

  test("density toggle updates html data-density", async ({ page }) => {
    await page.goto("/workspace");
    await page.getByTestId("density-compact").click();
    await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  });

  test("primary rail collapse persists across reload", async ({ page }) => {
    await page.goto("/workspace");
    await page.getByTestId("primary-rail-toggle").click();
    await expect(page.getByTestId("primary-rail")).toHaveAttribute("data-collapsed", "true");
    await page.reload();
    await expect(page.getByTestId("primary-rail")).toHaveAttribute("data-collapsed", "true");
  });
});
