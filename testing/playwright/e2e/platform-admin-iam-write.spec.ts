import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

async function loginAs(
  page: import("@playwright/test").Page,
  persona: string,
): Promise<void> {
  await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("demo-quick-login").selectOption(persona);
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 60_000,
  });
}

async function openApzorUsers(page: import("@playwright/test").Page): Promise<void> {
  await page.goto(`${ORIGIN}/platform-admin/tenants`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByTestId("platform-admin-tenants")).toBeVisible({
    timeout: 45_000,
  });

  const apzor = page.getByRole("link", { name: /APZOR/i }).first();
  if (await apzor.count()) {
    await apzor.click();
  } else {
    await page.locator("[data-testid^='tenant-link-']").first().click();
  }

  await expect(page.getByTestId("platform-admin-tenant-detail")).toBeVisible({
    timeout: 30_000,
  });
  await page.getByTestId("tenant-tab-users").click();
  await expect(page.getByTestId("platform-admin-tenant-users")).toBeVisible({
    timeout: 45_000,
  });
}

test.describe("Stream 6 IAM Write Paths Phase 1", () => {
  test("Add User Support Agent persona — provision and inspect", async ({ page }) => {
    test.setTimeout(240_000);
    await loginAs(page, "platform_admin");
    await openApzorUsers(page);

    await page.getByTestId("tenant-users-add").click();
    await expect(page.getByTestId("platform-admin-add-user")).toBeVisible();

    const stamp = Date.now();
    const email = `support.agent.${stamp}@apzor.test`;
    await page.getByTestId("add-user-email").fill(email);
    await page.getByTestId("add-user-name").fill("Support Agent Proof");
    await page.getByTestId("add-user-next").click();

    await page.getByTestId("add-user-staff-function").selectOption({
      label: "Customer Support",
    });
    await page.getByTestId("add-user-next").click(); // Access
    await page.getByTestId("add-user-next").click(); // Scopes
    await page.getByTestId("add-user-next").click(); // Review
    await page.getByTestId("add-user-provision").click();

    await expect(page.getByTestId("platform-admin-user-inspector")).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByTestId("inspector-manage-access")).toBeVisible({
      timeout: 60_000,
    });

    await page.getByTestId("inspector-tab-products").click();
    await expect(page.getByTestId("inspector-products")).toBeVisible();
    const qep = page.getByTestId("inspector-product-qep");
    if (await qep.count()) {
      await expect(qep).toHaveAttribute(
        "data-status",
        /org_subscribed_user_denied|org_not_subscribed|denied/,
      );
    }

    await page.getByTestId("inspector-tab-tools").click();
    await expect(page.getByTestId("inspector-tools")).toBeVisible();

    // Role change preview GAIN/LOSE
    await page.getByTestId("inspector-manage-access").click();
    await expect(page.getByTestId("platform-admin-manage-access")).toBeVisible();
    await page.getByTestId("manage-access-product").selectOption("support");
    const roleSelect = page.getByTestId("manage-access-role");
    const options = await roleSelect.locator("option").allTextContents();
    const target = options.find((o) => /requester/i.test(o));
    if (target) {
      await roleSelect.selectOption({ label: target });
      await page.getByTestId("manage-access-preview-btn").click();
      await expect(page.getByTestId("manage-access-preview")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("manage-access-preview")).toContainText(
        /GAIN|LOSE/,
      );
    }

    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/iam-write-support-agent.png",
      fullPage: true,
    });
  });

  test("Add User Engineering (Developer) persona — scopes without PT", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await loginAs(page, "platform_admin");
    await openApzorUsers(page);

    await page.getByTestId("tenant-users-add").click();
    await expect(page.getByTestId("platform-admin-add-user")).toBeVisible();

    const stamp = Date.now();
    await page.getByTestId("add-user-email").fill(`dev.${stamp}@apzor.test`);
    await page.getByTestId("add-user-name").fill("Developer Proof");
    await page.getByTestId("add-user-next").click();

    await page.getByTestId("add-user-staff-function").selectOption({
      label: "Engineering",
    });
    await page.getByTestId("add-user-next").click(); // Access — no PT
    await page.getByTestId("add-user-next").click(); // Scopes

    await page.getByTestId("add-user-projects").fill("apzhub,apzsign");
    await page.getByTestId("add-user-repos").fill("apzhub,apzsign");
    await page.getByTestId("add-user-qep-apps").fill("apzhub");
    await page.getByTestId("add-user-pen-apps").fill("apzsign");

    await page.getByTestId("add-user-next").click(); // Review
    await page.getByTestId("add-user-provision").click();

    await expect(page.getByTestId("platform-admin-user-inspector")).toBeVisible({
      timeout: 90_000,
    });
    await page.getByTestId("inspector-tab-products").click();
    await expect(page.getByTestId("inspector-products")).toBeVisible();

    await page.getByTestId("inspector-tab-tools").click();
    await expect(page.getByTestId("inspector-tools")).toBeVisible();

    await page.screenshot({
      path: "docs/frontend/platform-admin/evidence/iam-write-developer.png",
      fullPage: true,
    });
  });
});
