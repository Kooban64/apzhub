import { test, expect } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  try {
    await expect(page).toHaveURL(/\/workspace\/home/, { timeout: 5000 });
  } catch {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Dev User");
    await page.getByLabel("Email").fill(DEV_EMAIL);
    await page.getByLabel("Password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/workspace\/home/);
  }
}

test.describe("SPR-005 Knowledge & Discovery Framework integration", () => {
  test("health endpoint includes Knowledge Service hydration summary", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.knowledge).toMatchObject({
      status: expect.stringMatching(/healthy|degraded|unhealthy/),
      frameworkStatus: "service",
      registeredCount: expect.any(Number),
      filteredCount: expect.any(Number),
      activeSourceCount: expect.any(Number),
      registeredProviderCount: expect.any(Number),
      serviceStatus: "ready",
      queryAvailable: true,
    });
    expect(body.knowledge.registeredCount).toBeGreaterThan(0);
    expect(body.knowledge.filteredCount).toBeGreaterThan(0);
  });

  test("authenticated shell mounts KnowledgeDiscoveryProvider with live service diagnostics", async ({
    page,
  }) => {
    await signIn(page);

    const diagnostics = page.getByTestId("knowledge-discovery-diagnostics");
    await expect(diagnostics).toHaveAttribute("data-framework-status", "service");
    await expect(diagnostics).toHaveAttribute("data-service-status", "ready");
    await expect(diagnostics).toHaveAttribute("data-registry-ready", "true");
    await expect(diagnostics).toHaveAttribute("data-query-available", "true");
    await expect(diagnostics).toHaveAttribute("data-query-client-kind", "orchestrator");
    await expect(diagnostics).toHaveAttribute("data-query-client-ready", "true");
    expect(Number(await diagnostics.getAttribute("data-source-count"))).toBeGreaterThan(
      0,
    );
    expect(
      Number(await diagnostics.getAttribute("data-active-source-count")),
    ).toBeGreaterThan(0);
  });

  test("palette knowledge mode queries through Knowledge Service", async ({ page }) => {
    await signIn(page);
    await page.goto("/workspace/home?paletteMode=knowledge");
    await expect(page.getByTestId("knowledge-discovery-diagnostics")).toHaveAttribute(
      "data-query-available",
      "true",
    );

    await page.keyboard.press("Control+Shift+P");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Filter commands" })).toBeVisible();

    await page.getByRole("combobox", { name: "Filter commands" }).fill("theme");

    await expect(page.getByRole("option", { name: /Toggle Theme/i })).toBeVisible({
      timeout: 10_000,
    });

    const groups = page.getByTestId("command-palette-group");
    await expect(groups.first()).toBeVisible();
    expect(await groups.count()).toBeGreaterThan(0);
  });

  test("palette knowledge mode delegates action selection through Action Framework", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/workspace/home?paletteMode=knowledge");
    await expect(page.getByTestId("knowledge-discovery-diagnostics")).toHaveAttribute(
      "data-query-available",
      "true",
    );

    await page.keyboard.press("Control+Shift+P");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("combobox", { name: "Filter commands" }).fill("theme");

    await expect(page.getByRole("option", { name: /Toggle Theme/i })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole("option", { name: /Toggle Theme/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("palette knowledge mode delegates navigation through Workbench paths", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/workspace/home?paletteMode=knowledge");
    await expect(page.getByTestId("knowledge-discovery-diagnostics")).toHaveAttribute(
      "data-query-available",
      "true",
    );

    await page.keyboard.press("Control+Shift+P");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("combobox", { name: "Filter commands" }).fill("overview");

    const overviewOption = page.getByRole("option", { name: /overview/i }).first();
    await expect(overviewOption).toBeVisible({ timeout: 10_000 });
    await overviewOption.click();

    await expect(page).toHaveURL(/\/workspace\/home\/overview/);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
