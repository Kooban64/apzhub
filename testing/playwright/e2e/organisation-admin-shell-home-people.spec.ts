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

test.describe("Organisation Admin Shell + Home + People", () => {
  test("org_admin: shell, home honesty, people, isolation from Platform Admin", async ({
    page,
  }) => {
    test.setTimeout(420_000);
    await loginAs(page, "org_admin");

    await page.goto("/organisation-admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("organisation-admin-shell")).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByTestId("organisation-admin-status-bar")).toContainText(
      "Organisation Administration",
    );
    await expect(page.getByTestId("organisation-admin-nav-home")).toHaveAttribute(
      "data-implemented",
      "true",
    );
    await expect(page.getByTestId("organisation-admin-nav-people")).toHaveAttribute(
      "data-implemented",
      "true",
    );
    await expect(page.getByTestId("organisation-admin-nav-teams")).toHaveAttribute(
      "data-implemented",
      "false",
    );

    await expect(page.getByTestId("organisation-admin-home")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId("org-admin-attention")).toContainText(
      "Not configured",
    );
    await expect(page.getByTestId("org-admin-activity")).toContainText(
      "Not configured",
    );
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/home.png",
      fullPage: true,
    });

    await page.goto("/organisation-admin/people", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("organisation-admin-people")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId("org-admin-add-person")).toHaveAttribute(
      "data-availability",
      "not_configured",
    );
    // Wait for durable memberships (or empty) before capturing evidence.
    await expect(
      page
        .getByTestId("org-admin-people-table")
        .or(page.getByTestId("org-admin-people-empty")),
    ).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "docs/frontend/organisation-admin/evidence/people.png",
      fullPage: true,
    });

    const firstPerson = page.locator("[data-testid^='org-admin-person-link-']").first();
    const personCount = await page
      .locator("[data-testid^='org-admin-person-link-']")
      .count();
    if (personCount > 0) {
      await expect(firstPerson).toBeVisible();
      await firstPerson.click();
      await expect(page.getByTestId("organisation-admin-person")).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.getByTestId("inspector-manage-access")).toHaveAttribute(
        "data-availability",
        "not_configured",
      );
      await page.screenshot({
        path: "docs/frontend/organisation-admin/evidence/person.png",
        fullPage: true,
      });
    }

    const homeApi = await page.request.get("/api/v1/organisation-admin/home");
    expect(homeApi.ok(), `org-admin home ${homeApi.status()}`).toBeTruthy();
    const homeBody = (await homeApi.json()) as {
      meta?: { tenantId?: string };
      data?: { tenant?: { tenantId?: string } };
    };
    const sessionTenant = homeBody.meta?.tenantId ?? homeBody.data?.tenant?.tenantId;
    expect(sessionTenant).toBeTruthy();

    const peopleApi = await page.request.get("/api/v1/organisation-admin/people");
    expect(peopleApi.ok()).toBeTruthy();
    const peopleBody = (await peopleApi.json()) as {
      data?: { users?: { userId: string }[]; tenant?: { tenantId: string } };
    };
    expect(peopleBody.data?.tenant?.tenantId).toBe(sessionTenant);

    const paOverview = await page.request.get("/api/v1/platform-admin/overview");
    expect(paOverview.status(), "org_admin must not reach Platform Admin").toBe(403);

    const paTenants = await page.request.get("/api/v1/platform-admin/tenants");
    expect(paTenants.status()).toBe(403);
  });

  test("org_member: denied Organisation Admin shell and APIs", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, "org_member");

    await page.goto("/organisation-admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("organisation-admin-access-denied")).toBeVisible({
      timeout: 90_000,
    });

    const homeApi = await page.request.get("/api/v1/organisation-admin/home");
    expect([401, 403]).toContain(homeApi.status());

    const peopleApi = await page.request.get("/api/v1/organisation-admin/people");
    expect([401, 403]).toContain(peopleApi.status());
  });
});
