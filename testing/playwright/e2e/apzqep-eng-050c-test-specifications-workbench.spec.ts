import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * APZQEP-ENG-050C — Test Specifications Workbench
 * - Unauthenticated route smoke
 * - Authenticated journeys with API route mocks (deterministic CI)
 * - Accessibility (axe critical/serious = 0) + keyboard path
 */

const BASE = "/workspace/qep/test-specifications";

function dto(overrides: Record<string, unknown> = {}) {
  return {
    id: "tsp_e2e_1",
    tenantId: "tenant_e2e",
    number: "TS-E2E-001",
    title: "E2E Login Spec",
    description: "Description",
    objective: "Objective",
    scope: "Scope",
    status: "draft",
    version: { major: 1, minor: 0, label: "1.0" },
    type: "functional",
    priority: "medium",
    complexity: "medium",
    classification: "internal",
    owner: "workbench-user",
    author: "workbench-user",
    preconditions: [],
    postconditions: [],
    acceptanceCriteria: ["Criteria"],
    risks: [],
    dependencies: [],
    tags: ["e2e"],
    isAuthoritative: false,
    metadata: {},
    relationships: [
      {
        id: "rel_1",
        specificationId: "tsp_e2e_1",
        kind: "requirement",
        artefactId: "req_1",
        createdAt: "2026-07-27T00:00:00.000Z",
        createdBy: "user_1",
      },
    ],
    revision: 1,
    createdAt: "2026-07-27T00:00:00.000Z",
    createdBy: "user_1",
    updatedAt: "2026-07-27T00:00:00.000Z",
    updatedBy: "user_1",
    correlationId: "corr_e2e",
    versionLineage: ["tsp_e2e_1"],
    historySummaries: [
      {
        at: "2026-07-27T00:00:00.000Z",
        by: "user_1",
        kind: "created",
        summary: "Created",
      },
    ],
    availableActions: [
      "updateDraft",
      "submitForReview",
      "cancel",
      "withdraw",
      "addRelationship",
      "removeRelationship",
    ],
    ...overrides,
  };
}

async function mockSpecificationsApi(page: Page, options?: { forbidDetail?: boolean }) {
  let current = dto();
  await page.route("**/api/v1/qep/specifications**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (
      options?.forbidDetail &&
      method === "GET" &&
      /\/specifications\/[^/]+$/.test(path)
    ) {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "FORBIDDEN", message: "Forbidden" },
        }),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/specifications")) {
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

    if (method === "POST" && path.endsWith("/specifications")) {
      const body = request.postDataJSON() as Record<string, unknown>;
      current = dto({
        id: "tsp_created",
        number: body.number ?? "TS-NEW",
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

    const idMatch = path.match(/\/specifications\/([^/]+)(?:\/(.*))?$/);
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
      const body = request.postDataJSON() as { content?: { title?: string } };
      if (url.searchParams.get("forceConflict") === "1") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: "CONFLICT", message: "Revision conflict" },
          }),
        });
        return;
      }
      current = dto({
        ...current,
        id,
        title: body.content?.title ?? current.title,
        revision: Number(current.revision) + 1,
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "review") {
      current = dto({
        ...current,
        id,
        status: "under_review",
        availableActions: ["approve", "reject", "withdraw", "cancel"],
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
        isAuthoritative: true,
        availableActions: ["supersede", "retire", "withdraw"],
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
        availableActions: ["withdraw", "cancel"],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "withdraw") {
      current = dto({ ...current, id, status: "withdrawn", availableActions: [] });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "supersede") {
      const successor = dto({
        id: "tsp_successor",
        status: "draft",
        version: { major: 1, minor: 1, label: "1.1" },
        availableActions: ["updateDraft", "submitForReview"],
      });
      current = dto({
        ...current,
        id,
        status: "superseded",
        successorSpecificationId: successor.id,
        availableActions: [],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { predecessor: current, successor } }),
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
        body: JSON.stringify({
          data: [
            current,
            dto({
              id: "tsp_prev",
              title: "Previous",
              version: { major: 0, minor: 9, label: "0.9" },
            }),
          ],
        }),
      });
      return;
    }

    if (method === "GET" && rest === "relationships") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current.relationships }),
      });
      return;
    }

    if (method === "POST" && rest === "relationships") {
      const body = request.postDataJSON() as {
        id: string;
        kind: string;
        artefactId: string;
      };
      current = {
        ...current,
        relationships: [
          ...current.relationships,
          {
            id: body.id,
            specificationId: id,
            kind: body.kind,
            artefactId: body.artefactId,
            createdAt: "2026-07-27T01:00:00.000Z",
            createdBy: "user_1",
          },
        ],
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "DELETE" && rest.startsWith("relationships/")) {
      const relId = rest.split("/")[1]!;
      current = {
        ...current,
        relationships: current.relationships.filter((r) => r.id !== relId),
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
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

test.describe("APZQEP-ENG-050C smoke (unauthenticated)", () => {
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
      `${BASE}/specifications/tsp_smoke`,
      `${BASE}/specifications/tsp_smoke/history`,
      `${BASE}/specifications/tsp_smoke/versions`,
      `${BASE}/specifications/tsp_smoke/relationships`,
      `${BASE}/specifications/tsp_smoke/compare?with=tsp_other`,
      `${BASE}/specifications/tsp_smoke/edit`,
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
    }
  });
});

test.describe("APZQEP-ENG-050C authenticated journeys (mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await signInDevUser(page);
    await mockSpecificationsApi(page);
  });

  test("dashboard, explorer, review, search load", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("qep-spec-dashboard")).toBeVisible();

    await page.goto(`${BASE}/explorer`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("TS-E2E-001")).toBeVisible({ timeout: 30_000 });

    await page.goto(`${BASE}/review`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-page")).toBeVisible();

    await page.goto(`${BASE}/search`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Search specifications").fill("Login");
    await page.getByRole("button", { name: /^Search$/i }).click();
    await expect(page.getByText("TS-E2E-001")).toBeVisible({ timeout: 30_000 });
  });

  test("create Specification journey", async ({ page }) => {
    await page.goto(`${BASE}/new`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-spec-create")).toBeVisible({ timeout: 30_000 });
    await page.getByLabel("Number").fill("TS-NEW-1");
    await page.getByLabel("Title").fill("New Spec");
    await page.getByLabel("Description").fill("Desc");
    await page.getByLabel("Objective").fill("Obj");
    await page.getByLabel("Scope").fill("Scope");
    await page.getByRole("button", { name: /Create draft/i }).click();
    await expect(page).toHaveURL(/specifications\/tsp_created/, { timeout: 30_000 });
  });

  test("edit draft, submit for review, approve", async ({ page }) => {
    await page.goto(`${BASE}/specifications/tsp_e2e_1/edit`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("qep-spec-edit")).toBeVisible({ timeout: 30_000 });
    await page.getByLabel("Title").fill("Edited title");
    await page.getByRole("button", { name: /Save draft/i }).click();
    await expect(page).toHaveURL(/specifications\/tsp_e2e_1$/, { timeout: 30_000 });

    await page.getByRole("button", { name: /Submit for review/i }).click();
    await expect(page.getByTestId("qep-spec-action-dialog")).toBeVisible();
    await page.getByRole("button", { name: /^Submit$/i }).click();
    await expect(page.getByText(/under review/i).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole("button", { name: /^Approve$/i }).click();
    await expect(page.getByTestId("qep-spec-action-dialog")).toBeVisible();
    await page.getByTestId("qep-spec-confirm-approve").click();
    await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("reject with rationale", async ({ page }) => {
    await page.route("**/api/v1/qep/specifications/tsp_e2e_1", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: dto({
              status: "under_review",
              availableActions: ["approve", "reject"],
            }),
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`${BASE}/specifications/tsp_e2e_1`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("button", { name: /^Reject$/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /^Reject$/i }).click();
    await page.getByLabel(/Rationale/i).fill("Missing criteria");
    await page.getByTestId("qep-spec-confirm-reject").click();
    await expect(page.getByText(/rejected/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("supersede approved navigates to successor", async ({ page }) => {
    await page.route("**/api/v1/qep/specifications/tsp_e2e_1", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: dto({
              status: "approved",
              isAuthoritative: true,
              availableActions: ["supersede", "retire"],
            }),
          }),
        });
        return;
      }
      await route.continue();
    });

    page.once("dialog", (dialog) => dialog.accept());
    await page.goto(`${BASE}/specifications/tsp_e2e_1`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("button", { name: /Supersede/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /Supersede/i }).click();
    await expect(page).toHaveURL(/tsp_successor/, { timeout: 30_000 });
  });

  test("compare versions and relationships", async ({ page }) => {
    await page.goto(`${BASE}/specifications/tsp_e2e_1/compare?with=tsp_prev`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("qep-spec-compare")).toBeVisible({ timeout: 30_000 });

    await page.goto(`${BASE}/specifications/tsp_e2e_1/relationships`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText(/requirement/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("permission denial shows governed forbidden state", async ({ page }) => {
    await mockSpecificationsApi(page, { forbidDetail: true });
    await page.goto(`${BASE}/specifications/tsp_forbidden`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText(/do not have permission/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("filter query persists across refresh", async ({ page }) => {
    await page.goto(`${BASE}/explorer?status=draft&q=Login`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("qep-spec-status-filter")).toBeVisible({
      timeout: 30_000,
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/status=draft/);
    await expect(page).toHaveURL(/q=Login|q=Login/i);
  });

  test("deep links open Inspector", async ({ page }) => {
    await page.goto(`${BASE}/specifications/tsp_e2e_1`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("qep-spec-inspector")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("TS-E2E-001")).toBeVisible();
  });

  test("keyboard path Explorer to Inspector action", async ({ page }) => {
    await page.goto(`${BASE}/explorer`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("TS-E2E-001")).toBeVisible({ timeout: 30_000 });
    await page.getByTestId("qep-spec-status-filter").focus();
    await page.keyboard.press("Tab");
    await page.getByRole("link", { name: "TS-E2E-001" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/specifications\/tsp_e2e_1/, { timeout: 30_000 });
    await expect(page.getByTestId("qep-spec-actions")).toBeVisible();
  });

  test("axe: dashboard, explorer, inspector, review, compare have no critical/serious", async ({
    page,
  }) => {
    for (const path of [
      BASE,
      `${BASE}/explorer`,
      `${BASE}/review`,
      `${BASE}/specifications/tsp_e2e_1`,
      `${BASE}/specifications/tsp_e2e_1/compare?with=tsp_prev`,
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
      await expectNoCriticalAxeViolations(page);
    }
  });

  test("dialog focus trap and Escape close", async ({ page }) => {
    await page.goto(`${BASE}/specifications/tsp_e2e_1`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("button", { name: /Submit for review/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /Submit for review/i }).click();
    const dialog = page.getByTestId("qep-spec-action-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("button, input").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});
