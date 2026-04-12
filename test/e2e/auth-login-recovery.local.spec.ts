import { expect, test } from "@playwright/test";

test.describe("login recovery (local identity shell)", () => {
  test("/login?verifyHelp=1 shows resend verification form", async ({ page }) => {
    await page.goto("/login?verifyHelp=1");
    await expect(page.getByRole("heading", { name: /Resend verification email/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Send verification link/i })).toBeVisible();
  });

  test("/login?verifyError=1 shows guidance and resend link", async ({ page }) => {
    await page.goto("/login?verifyError=1");
    await expect(page.getByText(/invalid, expired, or already used/i)).toBeVisible();
    const resend = page.getByRole("link", { name: /Resend verification email/i });
    await expect(resend).toBeVisible();
    await expect(resend).toHaveAttribute("href", "/login?verifyHelp=1");
    await expect(page.getByRole("link", { name: /^Back to sign in$/i })).toBeVisible();
  });
});
