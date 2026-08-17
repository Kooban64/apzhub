import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

async function loginAs(
  page: import("@playwright/test").Page,
  persona: string,
): Promise<void> {
  await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded" });
  const quick = page.getByTestId("demo-quick-login");
  if (await quick.count()) {
    await quick.selectOption(persona);
    try {
      await page.waitForURL((url) => !url.pathname.includes("/login"), {
        timeout: 45_000,
      });
      return;
    } catch {
      // Fall through to credential login when Better Auth origin/CSP blocks
      // the client sign-in path on ephemeral ports.
    }
  }

  const credRes = await page.request.post(`${ORIGIN}/api/v1/demo/quick-login`, {
    data: { id: persona },
  });
  expect(credRes.ok()).toBeTruthy();
  const credBody = (await credRes.json()) as {
    data?: { email?: string; password?: string };
  };
  expect(credBody.data?.email).toBeTruthy();
  expect(credBody.data?.password).toBeTruthy();

  await page.getByLabel("Email").fill(credBody.data!.email!);
  await page.getByLabel("Password").fill(credBody.data!.password!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 60_000,
  });
}

test.describe("Platform Admin governance control plane", () => {
  test("Identity & Access → Security → Audit", async ({ page }) => {
    test.setTimeout(300_000);
    await loginAs(page, "platform_admin");

    await page.goto(`${ORIGIN}/platform-admin/identity-access`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-identity-access")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("identity-administrators")).toBeVisible();
    await expect(page.getByTestId("identity-add-admin")).toHaveAttribute(
      "data-availability",
      "not_configured",
    );
    // Org-admin label must not appear as a fabricated platform role column invent
    await expect(page.getByText("Platform Owner")).toHaveCount(0);

    await page.getByTestId("identity-tab-platform-roles").click();
    await expect(page.getByTestId("identity-roles")).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/governance-identity-roles.png",
      fullPage: true,
    });

    const firstRole = page.locator("[data-testid^='identity-role-'] a").first();
    if (await firstRole.count()) {
      await firstRole.click();
      await expect(page.getByTestId("platform-admin-identity-role")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("role-cap-tenant-business-data")).toContainText(
        "No implied access",
      );
      await page.screenshot({
        path: "docs/frontend/platform-admin/evidence/governance-identity-role-detail.png",
        fullPage: true,
      });
    }

    await page.goto(`${ORIGIN}/platform-admin/identity-access`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByTestId("identity-tab-privileged-access").click();
    await expect(page.getByTestId("identity-privileged")).toContainText(
      "Not configured",
    );
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/governance-identity-privileged.png",
      fullPage: true,
    });

    await page.getByTestId("identity-tab-sessions").click();
    await expect(page.getByTestId("identity-sessions")).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/governance-identity-sessions.png",
      fullPage: true,
    });

    await page.goto(`${ORIGIN}/platform-admin/security`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-security")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("security-overview")).toBeVisible();
    const securityBody = await page.locator("body").innerText();
    expect(securityBody.toLowerCase()).not.toContain("security score");
    await expect(page.getByText("Unavailable").first()).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/governance-security-overview.png",
      fullPage: true,
    });

    await page.getByTestId("security-tab-access-reviews").click();
    await expect(page.getByTestId("security-access-reviews")).toContainText(
      "Not configured",
    );

    await page.goto(`${ORIGIN}/platform-admin/audit`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("platform-admin-audit")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("audit-feed")).toBeVisible();
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/governance-audit.png",
      fullPage: true,
    });

    await page.getByTestId("audit-tab-tenant-access").click();
    await expect(page.getByTestId("audit-tenant-access")).toContainText(
      "Not configured",
    );
    await page.getByTestId("audit-tab-exports").click();
    await expect(page.getByTestId("audit-exports")).toContainText("Not configured");
    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/governance-audit-gaps.png",
      fullPage: true,
    });
  });
});
