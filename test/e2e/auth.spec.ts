import { expect, test } from "@playwright/test";

import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { mockAdminSession } from "@/lib/auth/mock-session";

test.describe("auth shell", () => {
  test("redirects protected workspace to login without session", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid session cookie redirects to login with reason invalid", async ({ page, context }) => {
    await context.clearCookies();
    await context.addCookies([
      {
        name: "apzhub_session",
        value: "not-a-valid-session-payload",
        url: "http://127.0.0.1:3005",
      },
    ]);
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/reason=invalid/);
  });

  test("completes mock login and reaches workspace", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill("pat@example.com");
    await page.getByLabel("Password").fill("secret");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/workspace/);
    await expect(page.getByTestId("app-shell")).toBeVisible();
  });

  test("admin can open admin and use mode switch", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill("ops.admin@example.com");
    await page.getByLabel("Password").fill("secret");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin/);
    await page.getByTestId("mode-switch-workspace").click();
    await expect(page).toHaveURL(/\/workspace/);
    await page.getByTestId("mode-switch-admin").click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test("non-admin cannot access admin", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill("pat@example.com");
    await page.getByLabel("Password").fill("secret");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/workspace/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/workspace/);
    await expect(page.getByTestId("workspace-denied-banner")).toBeVisible();
  });

  test("sign out returns to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill("pat@example.com");
    await page.getByLabel("Password").fill("secret");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/workspace/);
    await page.getByTestId("header-sign-out").click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login/);
  });

  test("expired session cookie is rejected", async ({ page }) => {
    const expired = {
      ...mockAdminSession(),
      expiresAtEpochSec: Math.floor(Date.now() / 1000) - 120,
    };
    await page.context().addCookies([
      {
        name: "apzhub_session",
        value: encodeSessionCookie(expired),
        url: "http://127.0.0.1:3005",
      },
    ]);
    await page.goto("/workspace");
    await expect(page).toHaveURL(/\/login/);
  });
});
