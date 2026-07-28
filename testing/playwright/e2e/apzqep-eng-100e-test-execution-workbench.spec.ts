import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * APZQEP-ENG-100E — Test Execution Workbench
 * - Unauthenticated route smoke
 * - Authenticated journeys with API route mocks (deterministic CI)
 * - Accessibility (axe critical/serious = 0)
 * - Action bar rendered strictly from `availableActions` (OES-ENG-090A PART-04 §3.3)
 */

const BASE = "/workspace/qep/test-execution";

function dto(overrides: Record<string, unknown> = {}) {
  return {
    id: "exec_e2e_1",
    executionNumber: "TE-E2E-001",
    tenantId: "tenant_e2e",
    projectId: "proj_e2e",
    workspaceId: "ws_e2e",
    status: "assigned",
    mode: "manual",
    outcome: null,
    revision: 1,
    planRef: { capability: "plan", id: "tpl_e2e_1", versionLabel: "0.1" },
    assignment: {
      ownerId: "workbench-user",
      executorId: "workbench-user",
    },
    manifest: {
      contentHash: "hash_1",
      sealedAt: "2026-07-29T00:00:00.000Z",
      sealedBy: "workbench-user",
      stepCount: 1,
    },
    steps: [
      {
        order: 1,
        instruction: "Open the login page",
        expectedResult: "Login page renders",
        evidenceIds: [],
        attemptCount: 0,
      },
    ],
    observations: [],
    evidenceReferences: [],
    review: null,
    createdAt: "2026-07-29T00:00:00.000Z",
    createdBy: "user_1",
    updatedAt: "2026-07-29T00:00:00.000Z",
    updatedBy: "user_1",
    availableActions: [
      {
        action: "startExecution",
        label: "Start",
        requiresConfirmation: false,
        reasonRequired: false,
      },
    ],
    ...overrides,
  };
}

function historyOf(current: Record<string, unknown>) {
  return {
    executionId: current.id,
    entries: [
      {
        sequence: 1,
        at: "2026-07-29T00:00:00.000Z",
        actorId: "user_1",
        action: "created",
        summary: "Created",
        toStatus: "draft",
      },
    ],
  };
}

async function mockExecutionsApi(page: Page, options?: { forbidDetail?: boolean }) {
  let current = dto();
  await page.route("**/api/v1/qep/executions**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (
      options?.forbidDetail &&
      method === "GET" &&
      /\/executions\/[^/]+$/.test(path)
    ) {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "FORBIDDEN", message: "Forbidden" } }),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/executions")) {
      const status = url.searchParams.get("status");
      let items = [current];
      if (status) items = items.filter((i) => i.status === status);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          page: { total: items.length, limit: 25, offset: 0 },
        }),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/executions/assigned")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [current],
          page: { total: 1, limit: 25, offset: 0 },
        }),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/executions/review-queue")) {
      const items = current.status === "submitted_for_review" ? [current] : [];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: items,
          page: { total: items.length, limit: 25, offset: 0 },
        }),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/executions")) {
      const body = request.postDataJSON() as Record<string, unknown>;
      current = dto({
        id: "exec_created",
        executionNumber: "TE-NEW",
        projectId: body.projectId,
        workspaceId: body.workspaceId,
        sourceRefs: body.sourceRefs,
        status: "draft",
        availableActions: [
          {
            action: "prepareExecution",
            label: "Prepare",
            requiresConfirmation: false,
            reasonRequired: false,
          },
        ],
      });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    const idMatch = path.match(/\/executions\/([^/]+)(?:\/(.*))?$/);
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

    if (method === "GET" && rest === "history") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: historyOf(current) }),
      });
      return;
    }

    if (method === "POST" && rest === "actions/start") {
      current = dto({
        ...current,
        status: "in_progress",
        availableActions: [
          {
            action: "recordStepResult",
            label: "Record step result",
            requiresConfirmation: false,
            reasonRequired: false,
          },
          {
            action: "completeExecution",
            label: "Complete",
            requiresConfirmation: true,
            reasonRequired: false,
          },
        ],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "actions/block") {
      current = dto({
        ...current,
        status: "blocked",
        availableActions: [
          {
            action: "resumeExecution",
            label: "Resume",
            requiresConfirmation: false,
            reasonRequired: false,
          },
        ],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && /^steps\/\d+\/results$/.test(rest)) {
      current = dto({ ...current, revision: (current.revision as number) + 1 });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "evidence-references") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (method === "POST" && rest === "observations") {
      await route.fulfill({
        status: 201,
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

test.describe("APZQEP-ENG-100E smoke (unauthenticated)", () => {
  test("home route reserved under QEP workspace", async ({ page }) => {
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
      `${BASE}/assigned`,
      `${BASE}/review`,
      `${BASE}/new`,
      `${BASE}/executions/exec_smoke`,
      `${BASE}/executions/exec_smoke/history`,
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
    }
  });
});

test.describe("APZQEP-ENG-100E authenticated journeys (mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await signInDevUser(page);
    await mockExecutionsApi(page);
  });

  test("home, explorer, assigned, review load", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("qep-execution-dashboard")).toBeVisible();

    await page.goto(`${BASE}/explorer`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("TE-E2E-001")).toBeVisible({ timeout: 30_000 });

    await page.goto(`${BASE}/assigned`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("TE-E2E-001")).toBeVisible({ timeout: 30_000 });

    await page.goto(`${BASE}/review`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-page")).toBeVisible();
  });

  test("create Execution journey", async ({ page }) => {
    await page.goto(`${BASE}/new`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-execution-create")).toBeVisible({
      timeout: 30_000,
    });
    await page.getByLabel("Project ID").fill("proj_e2e");
    await page.getByLabel("Workspace ID").fill("ws_e2e");
    await page.getByLabel("Plan ID").fill("tpl_e2e_1");
    await page.getByLabel("Plan version label").fill("0.1");
    await page.getByRole("button", { name: /Create draft/i }).click();
    await expect(page).toHaveURL(/executions\/exec_created/, { timeout: 30_000 });
  });

  test("action bar renders solely from availableActions and executes start", async ({
    page,
  }) => {
    await page.goto(`${BASE}/executions/exec_e2e_1`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("qep-execution-actions")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: /^Start$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Complete$/i })).toHaveCount(0);

    await page.getByRole("button", { name: /^Start$/i }).click();
    await expect(page.getByText(/^in progress$/i).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: /^Complete$/i })).toBeVisible();
  });

  test("block requires a reason before confirming (reasonRequired descriptor)", async ({
    page,
  }) => {
    await page.route(`**/api/v1/qep/executions/exec_e2e_1`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: dto({
              status: "in_progress",
              availableActions: [
                {
                  action: "blockExecution",
                  label: "Block",
                  requiresConfirmation: true,
                  reasonRequired: true,
                },
              ],
            }),
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`${BASE}/executions/exec_e2e_1`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("button", { name: /^Block$/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: /^Block$/i }).click();
    const confirm = page.getByTestId("qep-execution-confirm-blockExecution");
    await expect(confirm).toBeDisabled();
    await page.getByLabel("Reason").fill("Environment unavailable");
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(page.getByText(/^blocked$/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("permission denial shows governed forbidden state", async ({ page }) => {
    await mockExecutionsApi(page, { forbidDetail: true });
    await page.goto(`${BASE}/executions/exec_forbidden`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText(/do not have permission/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("history view loads execution history entries", async ({ page }) => {
    await page.goto(`${BASE}/executions/exec_e2e_1/history`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText(/created/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("deep links open the execution workspace", async ({ page }) => {
    await page.goto(`${BASE}/executions/exec_e2e_1`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("TE-E2E-001")).toBeVisible({ timeout: 30_000 });
  });

  test("axe: home, explorer, assigned, review, detail have no critical/serious", async ({
    page,
  }) => {
    for (const path of [
      BASE,
      `${BASE}/explorer`,
      `${BASE}/assigned`,
      `${BASE}/review`,
      `${BASE}/executions/exec_e2e_1`,
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
      await expectNoCriticalAxeViolations(page);
    }
  });
});
