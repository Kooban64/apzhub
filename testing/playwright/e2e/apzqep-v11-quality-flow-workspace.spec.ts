import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * QX-HD-01 — V1.1 Quality Flow Workspace critical journey (mocked API).
 */

const BASE = "/workspace/qep/quality-flows";

function instance(overrides: Record<string, unknown> = {}) {
  return {
    instanceId: "qfi_e2e_1",
    qualityFlowId: "qf_e2e_1",
    flowDefinitionId: "qf_continuous_cert",
    definitionVersion: "1.0.0",
    currentState: "awaiting_approval",
    paused: false,
    tenantId: "tenant_e2e",
    correlationId: "corr_e2e",
    createdAt: "2026-08-07T00:00:00.000Z",
    nextAction: "Complete required approvals",
    blockedRelease: true,
    outstandingApprovalCount: 1,
    outstandingEvidenceCount: 0,
    ...overrides,
  };
}

function commandCentre() {
  return {
    summary: {
      activeCount: 1,
      waitingCount: 1,
      exceptionCount: 0,
      blockedReleaseCount: 1,
      decisionCount: 0,
      definitionCount: 1,
    },
    active: [instance()],
    waiting: [
      {
        instanceId: "qfi_e2e_1",
        qualityFlowId: "qf_e2e_1",
        currentState: "awaiting_approval",
        paused: false,
        nextAction: "Complete required approvals",
      },
    ],
    exceptions: [],
    recentChanges: [
      {
        instanceId: "qfi_e2e_1",
        qualityFlowId: "qf_e2e_1",
        fromState: "awaiting_gates",
        toState: "awaiting_approval",
        timestamp: "2026-08-07T00:01:00.000Z",
        actor: "system",
        reason: "progress",
      },
    ],
    decisions: [],
  };
}

function detail() {
  return {
    instance: instance(),
    timeline: [
      {
        transitionId: "qft_1",
        fromState: "registered",
        toState: "ready",
        timestamp: "2026-08-07T00:00:30.000Z",
        actor: "quality_lead",
        reason: "start",
      },
    ],
    allowedTransitions: ["recommendation_ready"],
    nextAction: "Complete required approvals",
    decisions: [],
    approvals: [
      {
        bundleId: "apb_e2e",
        finalStatus: "pending",
        requiredAuthorities: ["release_manager"],
      },
    ],
    outstandingApprovals: [
      {
        bundleId: "apb_e2e",
        authorityId: "release_manager",
        finalStatus: "pending",
      },
    ],
    evidencePackages: [],
    outstandingEvidence: [],
    failedGates: [],
    blockedRelease: true,
    waiting: true,
    exception: false,
    definition: {
      name: "Continuous Certification",
      version: "1.0.0",
      description: "E2E fixture",
    },
  };
}

async function mockQualityFlowApi(page: Page) {
  await page.route("**/api/v1/qep/quality-flows**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (method === "GET" && path.endsWith("/quality-flows")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: commandCentre() }),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/instances")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { instances: [instance()] } }),
      });
      return;
    }

    if (method === "GET" && path.includes("/instances/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: detail() }),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/instances")) {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: detail() }),
      });
      return;
    }

    if (method === "POST" && path.includes("/instances/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: detail() }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });
}

test.describe("QX-HD-01 V1.1 Quality Flow Workspace", () => {
  test("command centre loads active flows and waiting work", async ({ page }) => {
    await signInDevUser(page);
    await mockQualityFlowApi(page);
    await page.goto(BASE);
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Quality Flow Workspace")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Active Quality Flows" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "qf_e2e_1", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Complete required approvals").first()).toBeVisible();
  });

  test("flow detail shows stage, approvals, and timeline", async ({ page }) => {
    await signInDevUser(page);
    await mockQualityFlowApi(page);
    await page.goto(`${BASE}/flows/qfi_e2e_1`);
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Continuous Certification")).toBeVisible();
    await expect(page.getByText("Next required action")).toBeVisible();
    await expect(page.getByText("Operational history / timeline")).toBeVisible();
    await expect(page.getByText("apb_e2e")).toBeVisible();
  });

  test("command centre has no critical/serious axe violations", async ({ page }) => {
    await signInDevUser(page);
    await mockQualityFlowApi(page);
    await page.goto(BASE);
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(serious).toEqual([]);
  });
});
