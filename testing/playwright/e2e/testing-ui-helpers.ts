import { expect, type Page } from "@playwright/test";

export { DEV_EMAIL, DEV_PASSWORD, signIn } from "./support-ui-cert-helpers";

export const PLAN_ID = "plan_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1";
export const EXECUTION_ID = "exec_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4";
export const CERTIFICATION_ID = "cert_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa7";

export const TESTING_ROUTES = {
  dashboard: "/workspace/testing",
  plans: "/workspace/testing/plans",
  executions: "/workspace/testing/executions",
  certification: "/workspace/testing/certification",
  evidence: "/workspace/testing/evidence",
  reports: "/workspace/testing/reports",
  releaseReadiness: "/workspace/testing/release-readiness",
} as const;

export async function gotoTestingSection(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(route.replace(/\//g, "\\/")), {
    timeout: 20_000,
  });
}

export async function expectTestingPageVisible(page: Page) {
  await expect(page.getByTestId("testing-page")).toBeVisible({ timeout: 20_000 });
}

export async function expectTestingHeading(page: Page, name: RegExp | string) {
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible({
    timeout: 20_000,
  });
}

/**
 * Permission gating is covered by Vitest component tests; HTTP behavior is
 * covered by mock-routed Playwright tests rather than live runners.
 */
export const TESTING_E2E_NOTE =
  "UI permission gating is validated in Vitest; Playwright asserts shell load, navigation, and mock-routed HTTP.";
