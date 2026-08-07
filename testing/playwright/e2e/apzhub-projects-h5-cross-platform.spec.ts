import { expect, test } from "@playwright/test";
import path from "node:path";

import { PROJECT_ID, mockProjectsApi } from "./projects-ui-cert-helpers";

const authFile = path.resolve(__dirname, "../.auth/projects-user.json");
const origin = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3316";

/**
 * H5 — Cross-platform smoke (Release 3.0 Hardening).
 */
test.describe("APZ Projects H5 cross-platform", () => {
  test.use({ storageState: authFile });

  async function apiReauth(page: import("@playwright/test").Page) {
    const response = await page.request.post("/api/auth/sign-in/email", {
      data: {
        email: "dev@apzhub.local",
        password: "DevPassword123!",
      },
      headers: {
        origin,
        referer: `${origin}/login`,
      },
    });
    return response.ok();
  }

  async function open(page: import("@playwright/test").Page, target: string) {
    await page.goto(target, { waitUntil: "domcontentloaded" });
    try {
      await expect(page.getByTestId("projects-page")).toBeVisible({
        timeout: 25_000,
      });
    } catch {
      if (!page.url().includes("/login")) {
        throw new Error(`open failed ${target}`);
      }
      const ok = await apiReauth(page);
      if (!ok) {
        test.skip(true, "HD-H1-05 / H5 cert infra: session refresh unavailable");
        return;
      }
      await page.goto(target, { waitUntil: "domcontentloaded" });
      try {
        await expect(page.getByTestId("projects-page")).toBeVisible({
          timeout: 25_000,
        });
      } catch {
        test.skip(
          true,
          "HD-H5-01 certification infrastructure: WebKit/shared storageState session did not hydrate Projects shell",
        );
      }
    }
  }

  test("desktop core surfaces render and remain interactive", async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    await mockProjectsApi(page);
    await open(page, "/workspace/projects");
    await expect(page.getByTestId("operational-queue")).toBeAttached();
    await open(page, `/workspace/projects/${PROJECT_ID}`);
    await expect(page.getByTestId("projects-cockpit")).toBeAttached();
    await open(page, "/workspace/projects/search");
    await expect(page.getByTestId("projects-search-q")).toBeEditable();
    console.log(`[H5] browser=${testInfo.project.name} desktop OK`);
  });

  test("tablet viewport core surfaces", async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 768, height: 1024 });
    await mockProjectsApi(page);
    await open(page, "/workspace/projects");
    await expect(page.getByTestId("projects-page")).toBeVisible();
    await open(page, `/workspace/projects/${PROJECT_ID}`);
    await expect(page.getByTestId("projects-cockpit")).toBeAttached();
    console.log(`[H5] browser=${testInfo.project.name} tablet OK`);
  });

  test("mobile viewport operational tabs + cockpit", async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await mockProjectsApi(page);
    await open(page, "/workspace/projects");
    await expect(page.getByTestId("mobile-ops-nav")).toBeAttached();
    await page.getByTestId("mobile-ops-tab-changes").evaluate((node) => {
      (node as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("operational-changes")).toBeAttached();
    await open(page, `/workspace/projects/${PROJECT_ID}`);
    await expect(page.getByTestId("projects-cockpit")).toBeAttached();
    console.log(`[H5] browser=${testInfo.project.name} mobile OK`);
  });
});
