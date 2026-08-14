import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * SPR-APZQEP-201 — Home + Release Readiness Release Control Centre (mocked API).
 */

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
    active: [
      {
        instanceId: "qfi_home_1",
        qualityFlowId: "qf_home_1",
        currentState: "awaiting_approval",
        paused: false,
        nextAction: "Complete required approvals",
        blockedRelease: true,
        outstandingApprovalCount: 1,
        outstandingEvidenceCount: 0,
        createdAt: "2026-08-14T00:00:00.000Z",
      },
    ],
    waiting: [],
    exceptions: [],
    recentChanges: [],
    decisions: [],
  };
}

function securityAssurance(reviewClear: boolean) {
  return {
    summary: {
      entitled: true,
      linked: true,
      engagementId: "eng_e2e",
      href: "/apzpen/engagements/eng_e2e",
      assessmentPosition: reviewClear ? "complete" : "blocked",
      critical: reviewClear ? 0 : 1,
      high: reviewClear ? 0 : 2,
      openCount: reviewClear ? 0 : 3,
      reviewClear,
      detail: reviewClear
        ? "APZPEN engagement eng_e2e assessment complete with no open critical findings."
        : "APZPEN assessment is blocked on eng_e2e (critical 1 / high 2 open 3).",
    },
    externalRef: null,
    changeEventId: null,
    engagementCount: 1,
  };
}

async function mockReleaseControlApis(page: Page, reviewClear: boolean) {
  await page.route("**/api/v1/qep/quality-flows**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: commandCentre() }),
    });
  });
  await page.route("**/api/v1/qep/security-assurance**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: securityAssurance(reviewClear) }),
    });
  });
}

test.describe("SPR-APZQEP-201 Release Control Centre", () => {
  test("Home shows release confidence and APZPEN security posture", async ({
    page,
  }) => {
    await signInDevUser(page);
    await mockReleaseControlApis(page, false);
    await page.goto("/workspace/qep/home");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("qep-home-verdict")).toBeVisible();
    await expect(page.getByTestId("qep-home-metrics")).toBeVisible();
    await expect(page.getByTestId("qep-home-security")).toContainText(/blocked/i);
    await expect(page.getByRole("link", { name: "Release Candidate" })).toBeVisible();
  });

  test("Release Readiness security check is honest (not auto-ok)", async ({ page }) => {
    await signInDevUser(page);
    await mockReleaseControlApis(page, false);
    await page.goto("/workspace/qep/release-readiness");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("qep-release-readiness-overall")).toContainText(
      /check\(s\) still open/i,
    );
    await expect(page.getByTestId("qep-release-readiness-checklist")).toContainText(
      /Security assurance/i,
    );
    await expect(page.getByTestId("qep-release-readiness-checklist")).toContainText(
      /blocked/i,
    );
  });
});
