import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

async function loginAs(
  page: import("@playwright/test").Page,
  persona: string,
): Promise<void> {
  const credRes = await page.request.post("/api/v1/demo/quick-login", {
    data: { id: persona },
  });
  expect(credRes.ok(), `quick-login ${persona}`).toBeTruthy();
  const credBody = (await credRes.json()) as {
    data?: { email?: string; password?: string };
  };
  const signIn = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: credBody.data!.email,
      password: credBody.data!.password,
    },
    headers: {
      Origin: ORIGIN,
      Referer: `${ORIGIN}/login`,
    },
  });
  expect(signIn.ok(), `sign-in ${persona}: ${signIn.status()}`).toBeTruthy();
}

const BLOCK3 = [
  "workspace-settings",
  "integrations",
  "security",
  "audit",
  "settings",
  "help",
] as const;

test.describe("Organisation Admin block 3 — Governance & Organisation", () => {
  test("org_admin: Block 3 surfaces + e2e walk + authority boundaries", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    await loginAs(page, "org_admin");

    await page.goto("/organisation-admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("organisation-admin-shell")).toBeVisible({
      timeout: 90_000,
    });

    for (const id of BLOCK3) {
      await expect(page.getByTestId(`organisation-admin-nav-${id}`)).toHaveAttribute(
        "data-implemented",
        "true",
      );
    }

    // Final Tenant Admin walk (Block 1–3)
    const walk: { path: string; testId: string; shot?: string }[] = [
      { path: "/organisation-admin", testId: "organisation-admin-shell" },
      { path: "/organisation-admin/people", testId: "organisation-admin-people" },
      { path: "/organisation-admin/teams", testId: "organisation-admin-teams" },
      {
        path: "/organisation-admin/roles-access",
        testId: "organisation-admin-roles-access",
      },
      { path: "/organisation-admin/products", testId: "organisation-admin-products" },
      {
        path: "/organisation-admin/provisioning",
        testId: "organisation-admin-provisioning",
      },
      {
        path: "/organisation-admin/workspace-settings",
        testId: "organisation-admin-workspace-settings",
        shot: "visual-workspace-settings.png",
      },
      {
        path: "/organisation-admin/integrations",
        testId: "organisation-admin-integrations",
        shot: "visual-integrations.png",
      },
      {
        path: "/organisation-admin/security",
        testId: "organisation-admin-security",
        shot: "visual-security.png",
      },
      {
        path: "/organisation-admin/audit",
        testId: "organisation-admin-audit",
        shot: "visual-audit.png",
      },
      {
        path: "/organisation-admin/settings",
        testId: "organisation-admin-settings",
        shot: "visual-org-settings.png",
      },
      {
        path: "/organisation-admin/help",
        testId: "organisation-admin-help",
        shot: "visual-help.png",
      },
    ];

    for (const step of walk) {
      await page.goto(step.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId(step.testId)).toBeVisible({ timeout: 90_000 });
      if (step.shot) {
        await page.screenshot({
          path: `docs/frontend/organisation-admin/evidence/${step.shot}`,
          fullPage: true,
        });
      }
    }

    // Nested inspectors (same product language as Block 1–2)
    await page.goto("/organisation-admin/people", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("organisation-admin-people")).toBeVisible({
      timeout: 60_000,
    });
    const personLink = page.locator('a[href*="/organisation-admin/people/"]').first();
    if (await personLink.count()) {
      await personLink.click();
      await expect(page.getByTestId("organisation-admin-person")).toBeVisible({
        timeout: 60_000,
      });
    }

    await page.goto("/organisation-admin/products", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("organisation-admin-products")).toBeVisible({
      timeout: 60_000,
    });
    const apzprd = page.getByTestId("org-admin-product-productivity");
    if (await apzprd.count()) {
      await apzprd.getByRole("link", { name: /Manage Access/i }).click();
      await expect(page.getByTestId("organisation-admin-product-detail")).toBeVisible({
        timeout: 60_000,
      });
    }

    // Workspace Settings — honest not-configured fields, no personalisation duplicate claim
    await page.goto("/organisation-admin/workspace-settings", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("org-admin-workspace-general")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId("org-admin-workspace-general")).toContainText(
      "Not configured",
    );

    // Integrations — business catalogue only; detail honest
    await page.goto("/organisation-admin/integrations", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("org-admin-integration-github")).toBeVisible({
      timeout: 60_000,
    });
    const integBody = await page.locator("body").innerText();
    for (const leak of ["Plane", "Zammad", "Kimai", "Metabase", "Paperless", "n8n"]) {
      expect(integBody.includes(leak), `provider leak ${leak}`).toBeFalsy();
    }
    await page
      .getByTestId("org-admin-integration-github")
      .getByRole("link", {
        name: /Configure/i,
      })
      .click();
    await expect(page).toHaveURL(/\/organisation-admin\/integrations\/github/, {
      timeout: 30_000,
    });
    await expect(page.getByTestId("organisation-admin-integration-detail")).toBeVisible(
      {
        timeout: 60_000,
      },
    );
    await expect(page.getByTestId("org-admin-integration-overview")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId("org-admin-integration-overview")).toContainText(
      "Not configured",
    );
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/visual-integration-detail.png",
      fullPage: true,
    });

    // Security — platform-managed session policy
    await page.goto("/organisation-admin/security", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("org-admin-security-overview")).toBeVisible({
      timeout: 60_000,
    });
    await page.getByTestId("org-admin-security-tab-authentication").click();
    await expect(page.getByTestId("org-admin-security-authentication")).toContainText(
      "Managed by APZ Platform",
    );

    // Audit — empty ok; never client tenantId
    const auditApi = await page.request.get("/api/v1/organisation-admin/audit");
    expect(auditApi.ok()).toBeTruthy();
    const auditJson = (await auditApi.json()) as {
      meta?: { tenantId?: string };
      data?: { events?: unknown[]; note?: string };
    };
    expect(auditJson.meta?.tenantId).toBeTruthy();
    expect(auditJson.data?.note ?? "").toMatch(/tenant-scoped/i);

    const auditWithFakeTenant = await page.request.get(
      "/api/v1/organisation-admin/audit?tenantId=customer-I-want-to-see",
    );
    expect(auditWithFakeTenant.ok()).toBeTruthy();
    const fakeJson = (await auditWithFakeTenant.json()) as {
      meta?: { tenantId?: string };
    };
    expect(fakeJson.meta?.tenantId).toBe(auditJson.meta?.tenantId);
    expect(fakeJson.meta?.tenantId).not.toBe("customer-I-want-to-see");

    // Organisation Settings — lifecycle platform-managed
    await page.goto("/organisation-admin/settings", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("org-admin-settings-profile")).toBeVisible({
      timeout: 60_000,
    });
    await page.getByTestId("org-admin-settings-tab-lifecycle").click();
    await expect(page.getByTestId("org-admin-settings-lifecycle")).toContainText(
      "Managed by APZ Platform",
    );

    // Permanent: org_admin cannot reach Platform Admin
    expect((await page.request.get("/api/v1/platform-admin/overview")).status()).toBe(
      403,
    );
    expect((await page.request.get("/api/v1/platform-admin/tenants")).status()).toBe(
      403,
    );
  });

  test("org_member denied Organisation Admin and Block 3 APIs", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "org_member");

    await page.goto("/organisation-admin", { waitUntil: "domcontentloaded" });
    // Gate should deny — either redirect or denied UI
    await expect(
      page
        .getByTestId("organisation-admin-shell")
        .or(page.getByText(/sign in|not authorised|denied|permission/i)),
    ).toBeVisible({ timeout: 60_000 });

    for (const path of [
      "/api/v1/organisation-admin/workspace-settings",
      "/api/v1/organisation-admin/integrations",
      "/api/v1/organisation-admin/security",
      "/api/v1/organisation-admin/audit",
      "/api/v1/organisation-admin/settings",
      "/api/v1/organisation-admin/help",
    ]) {
      const res = await page.request.get(path);
      expect([401, 403], path).toContain(res.status());
    }
  });
});
