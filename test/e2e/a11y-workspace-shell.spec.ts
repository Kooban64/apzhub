import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

const linkedAdmin = {
  ...mockAdminSession(),
  linkedAccounts: { google: "linked" as const },
};

test.describe("workspace shell accessibility", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(linkedAdmin),
        url: "http://127.0.0.1:3005",
      },
    ]);
  });

  test("exposes main landmark, labeled primary nav, and focusable rail toggle", async ({ page }) => {
    await page.goto("/workspace");
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await page.getByTestId("primary-rail-toggle").focus();
    await expect(page.getByTestId("primary-rail-toggle")).toBeFocused();
  });

  test("context tablist exposes roles and keyboard-activable tab", async ({ page }) => {
    await page.goto("/workspace");
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByRole("tablist", { name: "Workspace context panel" })).toBeVisible();
    const reminders = page.getByTestId("right-panel-tab-reminders");
    await reminders.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("tabpanel")).toContainText(/reminders/i);
  });

  test("launcher tiles expose descriptive accessible names", async ({ page }) => {
    await page.goto("/workspace");
    await expect(page.getByRole("button", { name: /Calendar/i })).toBeVisible();
  });
});
