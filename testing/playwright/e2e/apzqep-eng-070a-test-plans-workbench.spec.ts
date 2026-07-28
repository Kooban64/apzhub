import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * APZQEP-ENG-070A — Test Plans Workbench
 * - Unauthenticated route smoke
 * - Authenticated journeys with API route mocks (deterministic CI)
 * - Accessibility (axe critical/serious = 0) + keyboard path
 * - Compare route is governed unavailable only — never calls GET .../compare
 */

const BASE = "/workspace/qep/test-plans";

function dto(overrides: Record<string, unknown> = {}) {
  return {
    id: "tpl_e2e_1",
    tenantId: "tenant_e2e",
    number: "TP-E2E-001",
    revision: 1,
    title: "E2E Regression Plan",
    description: "Description",
    objective: "Objective",
    scope: { class: "regression", label: "Login" },
    status: "draft",
    priority: "medium",
    planType: "regression",
    ownerId: "workbench-user",
    versionLabel: "0.1",
    createdAt: "2026-07-27T00:00:00.000Z",
    createdBy: "user_1",
    updatedAt: "2026-07-27T00:00:00.000Z",
    updatedBy: "user_1",
    items: [
      {
        id: "item_1",
        specificationId: "tsp_e2e_1",
        sequence: 1,
        itemStatus: "included",
        notes: "Core login coverage",
      },
    ],
    schedule: { plannedStart: "2026-08-01", plannedEnd: "2026-08-15" },
    assignment: {
      leadId: "workbench-user",
      assigneeIds: ["workbench-user"],
      updatedAt: "2026-07-27T00:00:00.000Z",
      updatedBy: "user_1",
    },
    approvals: [],
    revisions: [],
    externalReferences: ["EXT-REF-1"],
    metadata: {},
    metrics: {
      totalItems: 1,
      includedCount: 1,
      optionalCount: 0,
      deferredCount: 0,
      pinnedIncludedCount: 0,
    },
    historySummaries: [
      {
        sequence: 1,
        at: "2026-07-27T00:00:00.000Z",
        actorId: "user_1",
        action: "created",
        summary: "Created",
      },
    ],
    availableActions: ["updateContent", "submitForReview", "cancel"],
    ...overrides,
  };
}

async function mockPlansApi(page: Page, options?: { forbidDetail?: boolean }) {
  let current = dto();
  await page.route("**/api/v1/qep/plans**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (options?.forbidDetail && method === "GET" && /\/plans\/[^/]+$/.test(path)) {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "FORBIDDEN", message: "Forbidden" },
        }),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/plans")) {
      const status = url.searchParams.get("status");
      const query = url.searchParams.get("query");
      let items = [current];
      if (status) items = items.filter((i) => i.status === status);
      if (query)
        items = items.filter(
          (i) => i.title.includes(query) || i.number.includes(query),
        );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          page: { total: items.length, limit: 50, offset: 0 },
        }),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/plans")) {
      const body = request.postDataJSON() as Record<string, unknown>;
      current = dto({
        id: "tpl_created",
        number: "TP-NEW",
        title: body.title ?? "Created",
        status: "draft",
      });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    const idMatch = path.match(/\/plans\/([^/]+)(?:\/(.*))?$/);
    if (!idMatch) {
      await route.fulfill({ status: 404, body: "{}" });
      return;
    }
    const id = decodeURIComponent(idMatch[1]!);
    const rest = idMatch[2] ?? "";

    if (method === "GET" && rest === "") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { ...current, id } }),
      });
      return;
    }

    if (method === "PATCH" && rest === "") {
      const body = request.postDataJSON() as { title?: string };
      current = dto({
        ...current,
        id,
        title: body.title ?? current.title,
        revision: Number(current.revision) + 1,
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "submit") {
      current = dto({
        ...current,
        id,
        status: "review",
        availableActions: ["approve", "reject", "cancel"],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "approve") {
      current = dto({
        ...current,
        id,
        status: "approved",
        availableActions: ["markReady", "supersede", "cancel"],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "reject") {
      current = dto({
        ...current,
        id,
        status: "rejected",
        availableActions: ["returnToDraft", "cancel"],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "return-to-draft") {
      current = dto({
        ...current,
        id,
        status: "draft",
        availableActions: ["updateContent", "submitForReview", "cancel"],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "supersede") {
      current = dto({
        ...current,
        id,
        status: "superseded",
        successorPlanId: "tpl_successor",
        availableActions: ["clone"],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { ...current, successor: { id: "tpl_successor" } },
        }),
      });
      return;
    }

    if (method === "POST" && rest === "clone") {
      const cloned = dto({ id: "tpl_cloned", status: "draft", number: "TP-CLONE-1" });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: cloned }),
      });
      return;
    }

    if (method === "GET" && rest === "history") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current.historySummaries }),
      });
      return;
    }

    if (method === "GET" && rest === "versions") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [current] }),
      });
      return;
    }

    if (rest === "compare" || rest.startsWith("compare")) {
      throw new Error(
        "Compare API must never be called for Test Plans (governed unavailable)",
      );
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: current }),
    });
  });
}

async function expectNoCriticalAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
}

test.describe("APZQEP-ENG-070A smoke (unauthenticated)", () => {
  test("dashboard route reserved under QEP workspace", async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(500);
    const url = page.url();
    expect(
      url.includes(BASE) || url.includes("/login") || url.includes("/auth"),
    ).toBeTruthy();
  });

  test("primary and secondary routes do not 500", async ({ page }) => {
    for (const path of [
      `${BASE}/explorer`,
      `${BASE}/review`,
      `${BASE}/search`,
      `${BASE}/new`,
      `${BASE}/plans/tpl_smoke`,
      `${BASE}/plans/tpl_smoke/history`,
      `${BASE}/plans/tpl_smoke/versions`,
      `${BASE}/plans/tpl_smoke/items`,
      `${BASE}/plans/tpl_smoke/relationships`,
      `${BASE}/plans/tpl_smoke/compare`,
      `${BASE}/plans/tpl_smoke/audit`,
      `${BASE}/plans/tpl_smoke/edit`,
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
    }
  });
});

test.describe("APZQEP-ENG-070A authenticated journeys (mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await signInDevUser(page);
    await mockPlansApi(page);
  });

  test("dashboard, explorer, review, search load", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("qep-plan-dashboard")).toBeVisible();

    await page.goto(`${BASE}/explorer`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("TP-E2E-001")).toBeVisible({ timeout: 30_000 });

    await page.goto(`${BASE}/review`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-page")).toBeVisible();

    await page.goto(`${BASE}/search`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Search plans").fill("Regression");
    await page.getByRole("button", { name: /^Search$/i }).click();
    await expect(page.getByText("TP-E2E-001")).toBeVisible({ timeout: 30_000 });
  });

  test("create Plan journey", async ({ page }) => {
    await page.goto(`${BASE}/new`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-plan-create")).toBeVisible({ timeout: 30_000 });
    await page.getByLabel("Title").fill("New plan");
    await page.getByLabel("Objective").fill("Obj");
    await page.getByLabel("Description").fill("Desc");
    await page.getByLabel("Scope class").fill("regression");
    await page.getByRole("button", { name: /Create draft/i }).click();
    await expect(page).toHaveURL(/plans\/tpl_created/, { timeout: 30_000 });
  });

  test("edit draft, submit for review, approve", async ({ page }) => {
    await page.goto(`${BASE}/plans/tpl_e2e_1/edit`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-plan-edit")).toBeVisible({ timeout: 30_000 });
    await page.getByLabel("Title").fill("Edited title");
    await page.getByRole("button", { name: /Save draft/i }).click();
    await expect(page).toHaveURL(/plans\/tpl_e2e_1$/, { timeout: 30_000 });

    await page.getByRole("button", { name: /Submit for review/i }).click();
    await expect(page.getByTestId("qep-plan-action-dialog")).toBeVisible();
    await page.getByRole("button", { name: /^Submit$/i }).click();
    await expect(page.getByText(/^review$/i).first()).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: /^Approve$/i }).click();
    await expect(page.getByTestId("qep-plan-action-dialog")).toBeVisible();
    await page.getByTestId("qep-plan-confirm-approve").click();
    await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("reject with rationale", async ({ page }) => {
    await page.route("**/api/v1/qep/plans/tpl_e2e_1", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: dto({ status: "review", availableActions: ["approve", "reject"] }),
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`${BASE}/plans/tpl_e2e_1`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /^Reject$/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /^Reject$/i }).click();
    await page.getByLabel(/Rationale/i).fill("Missing coverage");
    await page.getByTestId("qep-plan-confirm-reject").click();
    await expect(page.getByText(/rejected/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("returnToDraft is offered when the server exposes it on rejected", async ({
    page,
  }) => {
    await page.route("**/api/v1/qep/plans/tpl_e2e_1", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: dto({
              status: "rejected",
              availableActions: ["returnToDraft", "cancel"],
            }),
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`${BASE}/plans/tpl_e2e_1`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /Return to draft/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /Return to draft/i }).click();
    await expect(page.getByTestId("qep-plan-action-dialog")).toBeVisible();
    await page.getByTestId("qep-plan-confirm-returnToDraft").click();
    await expect(page.getByText(/^draft$/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("compare route shows governed unavailable and never calls compare API", async ({
    page,
  }) => {
    await page.goto(`${BASE}/plans/tpl_e2e_1/compare`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("qep-plan-compare-unavailable")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/not yet available for Test Plans/i)).toBeVisible();
    await page.getByRole("link", { name: /View Versions/i }).click();
    await expect(page).toHaveURL(/plans\/tpl_e2e_1\/versions/, { timeout: 30_000 });
  });

  test("permission denial shows governed forbidden state", async ({ page }) => {
    await mockPlansApi(page, { forbidDetail: true });
    await page.goto(`${BASE}/plans/tpl_forbidden`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/do not have permission/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("filter query persists across refresh", async ({ page }) => {
    await page.goto(`${BASE}/explorer?status=draft&q=Regression`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("qep-plan-status-filter")).toBeVisible({
      timeout: 30_000,
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/status=draft/);
    await expect(page).toHaveURL(/q=Regression/i);
  });

  test("deep links open Inspector", async ({ page }) => {
    await page.goto(`${BASE}/plans/tpl_e2e_1`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-plan-inspector")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("TP-E2E-001")).toBeVisible();
  });

  test("keyboard path Explorer to Inspector action", async ({ page }) => {
    await page.goto(`${BASE}/explorer`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("TP-E2E-001")).toBeVisible({ timeout: 30_000 });
    await page.getByTestId("qep-plan-status-filter").focus();
    await page.keyboard.press("Tab");
    await page.getByRole("link", { name: "TP-E2E-001" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/plans\/tpl_e2e_1/, { timeout: 30_000 });
    await expect(page.getByTestId("qep-plan-actions")).toBeVisible();
  });

  test("axe: dashboard, explorer, inspector, review, compare have no critical/serious", async ({
    page,
  }) => {
    for (const path of [
      BASE,
      `${BASE}/explorer`,
      `${BASE}/review`,
      `${BASE}/plans/tpl_e2e_1`,
      `${BASE}/plans/tpl_e2e_1/compare`,
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
      await expectNoCriticalAxeViolations(page);
    }
  });

  test("dialog focus trap and Escape close", async ({ page }) => {
    await page.goto(`${BASE}/plans/tpl_e2e_1`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /Submit for review/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /Submit for review/i }).click();
    const dialog = page.getByTestId("qep-plan-action-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("button, input").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});
