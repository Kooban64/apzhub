import { expect, test } from "@playwright/test";

test.describe("login recovery (non-local identity)", () => {
  test("/login?forgot=1 shows local-only notice on mock identity", async ({ page }) => {
    await page.goto("/login?forgot=1");
    await expect(page.getByText(/APZHUB_IDENTITY_SOURCE=local/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to sign in/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Forgot password/i })).not.toBeVisible();
  });
});
