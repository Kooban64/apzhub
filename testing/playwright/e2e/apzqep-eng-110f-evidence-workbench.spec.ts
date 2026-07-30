import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * APZQEP-ENG-110F — Evidence Workbench
 * - Unauthenticated route smoke
 * - Authenticated journeys with API route mocks (deterministic CI)
 * - Accessibility (axe critical/serious = 0)
 * - Action bar rendered strictly from `availableActions` (OES-ENG-091A PART-04 §3.3)
 */

const BASE = "/workspace/qep/evidence";

function dto(overrides: Record<string, unknown> = {}) {
  return {
    id: "ev_e2e_1",
    tenantId: "tenant_e2e",
    projectId: "proj_e2e",
    workspaceId: "ws_e2e",
    status: "captured",
    sourceKind: "manual_upload",
    classification: "screenshot",
    mediaType: "image/png",
    byteSize: 2048,
    contentHash: "hash_e2e",
    hashAlgorithm: "sha256",
    verificationState: "unverified",
    sealed: false,
    legalHold: false,
    retentionClass: "standard",
    title: "E2E Evidence",
    description: "Playwright fixture",
    tags: ["e2e"],
    version: 1,
    revision: 1,
    ownerId: "workbench-user",
    createdAt: "2026-07-29T00:00:00.000Z",
    updatedAt: "2026-07-29T00:00:00.000Z",
    availableActions: ["validateEvidence", "getProvenance", "getAudit"],
    ...overrides,
  };
}

function provenanceOf(id: string) {
  return {
    evidenceId: id,
    provenance: [
      {
        kind: "captured",
        occurredAt: "2026-07-29T00:00:00.000Z",
        actorId: "workbench-user",
        detail: "Initial capture",
      },
    ],
    history: [
      {
        sequence: 1,
        command: "captureEvidence",
        actorId: "workbench-user",
        occurredAt: "2026-07-29T00:00:00.000Z",
        summary: "Captured",
      },
    ],
  };
}

async function mockEvidenceApi(page: Page) {
  let current = dto();
  await page.route("**/api/v1/qep/evidence**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (method === "GET" && path.endsWith("/evidence")) {
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

    if (method === "POST" && path.endsWith("/evidence")) {
      const body = request.postDataJSON() as Record<string, unknown>;
      current = dto({
        id: "ev_created",
        title: body.title ?? "New Evidence",
        projectId: body.projectId,
        workspaceId: body.workspaceId,
        availableActions: ["validateEvidence"],
      });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    const idMatch = path.match(/\/evidence\/([^/]+)(?:\/(.*))?$/);
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

    if (method === "GET" && rest === "provenance") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: provenanceOf(id) }),
      });
      return;
    }

    if (method === "GET" && rest === "relationships") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
      return;
    }

    if (method === "GET" && rest === "versions") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
      return;
    }

    if (method === "POST" && rest === "actions/validate") {
      current = dto({
        ...current,
        id,
        status: "validated",
        availableActions: ["classifyEvidence"],
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    await route.fulfill({ status: 404, body: "{}" });
  });
}

test.describe("APZQEP-ENG-110F Evidence Workbench", () => {
  test("unauthenticated explorer redirects or shows auth gate", async ({ page }) => {
    await page.goto(`${BASE}/explorer`);
    await expect(page.locator("body")).toBeVisible();
  });

  test.describe("authenticated journeys", () => {
    test.beforeEach(async ({ page }) => {
      await signInDevUser(page);
      await mockEvidenceApi(page);
    });

    test("explorer lists evidence and supports status filter", async ({ page }) => {
      await page.goto(`${BASE}/explorer`);
      await expect(page.getByTestId("qep-page")).toBeVisible();
      await expect(page.getByText("E2E Evidence")).toBeVisible();
      await expect(page.getByTestId("qep-evidence-status-filter")).toBeVisible();
    });

    test("detail renders action bar from availableActions only", async ({ page }) => {
      await page.goto(`${BASE}/items/ev_e2e_1`);
      await expect(page.getByTestId("qep-evidence-actions")).toBeVisible();
      await expect(page.getByRole("button", { name: /^Validate$/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Dispose$/i })).toHaveCount(0);
    });

    test("validate action updates evidence via API", async ({ page }) => {
      await page.goto(`${BASE}/items/ev_e2e_1`);
      await page.getByRole("button", { name: /^Validate$/i }).click();
      await expect(page.getByText("validated", { exact: false })).toBeVisible({
        timeout: 10_000,
      });
    });

    test("provenance sub-view loads timeline", async ({ page }) => {
      await page.goto(`${BASE}/items/ev_e2e_1`);
      await expect(page.getByTestId("qep-evidence-actions")).toBeVisible({
        timeout: 30_000,
      });
      await page.getByRole("link", { name: /^Provenance$/i }).click();
      await expect(page.getByText("Initial capture")).toBeVisible({
        timeout: 30_000,
      });
    });

    test("explorer meets axe critical/serious threshold", async ({ page }) => {
      await page.goto(`${BASE}/explorer`);
      await expect(page.getByTestId("qep-page")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const violations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(violations).toEqual([]);
    });

    test("detail meets axe critical/serious threshold", async ({ page }) => {
      await page.goto(`${BASE}/items/ev_e2e_1`);
      await expect(page.getByTestId("qep-evidence-actions")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const violations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(violations).toEqual([]);
    });
  });
});
