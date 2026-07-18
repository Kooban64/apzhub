import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const PUBLICATION_HOME = "/workspace/search/publication";

/**
 * APZSEARCH-017 Publication Operations Workbench E2E (mocked HTTP).
 * LIMITED: same webServer caveats as APZSEARCH-007.
 */

async function mockPublicationHttp(page: Page) {
  await page.route("**/api/v1/search/publication**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith("/publication/queue")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            queueDepth: 1,
            retryingCount: 0,
            failedCount: 0,
            deadLetterCount: 0,
            publishedCount: 2,
            backlog: 1,
            throughputPublished: 2,
            oldestQueuedAt: "2026-07-18T10:00:00.000Z",
            averageAttempts: 1,
          },
          meta: { correlationId: "pw-apzsearch-017" },
        }),
      });
      return;
    }

    if (path.endsWith("/publication/products")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              productId: "projects",
              queued: 1,
              publishing: 0,
              published: 2,
              failed: 0,
              retrying: 0,
              deadLetter: 0,
              total: 3,
            },
          ],
          page: { cursor: null, nextCursor: null, limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzsearch-017" },
        }),
      });
      return;
    }

    if (path.endsWith("/publication/diagnostics")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            adminVersion: "0.1.0",
            journalReady: true,
            retryEngineReady: true,
            bootstrapEnabled: true,
            compositionRegistered: true,
            publicationHealth: "healthy",
            orchestrator: {
              enabled: true,
              frameworkVersion: "0.1.0",
              queueDepth: 1,
              backlog: 1,
              deadLetterCount: 0,
              failedCount: 0,
              throughputPublished: 2,
            },
          },
          meta: { correlationId: "pw-apzsearch-017" },
        }),
      });
      return;
    }

    if (path.endsWith("/publication") || path.includes("/publication?")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            items: [
              {
                id: "pub_pw_1",
                tenantId: "tenant_a",
                entityId: "proj_1",
                entityType: "project",
                productId: "projects",
                operation: "publish",
                status: "queued",
                attemptCount: 0,
                maxAttempts: 5,
                correlationId: "corr_pw",
                createdAt: "2026-07-18T10:00:00.000Z",
                updatedAt: "2026-07-18T10:00:00.000Z",
              },
            ],
            total: 1,
            offset: 0,
            limit: 50,
          },
          meta: { correlationId: "pw-apzsearch-017" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { ok: true },
        meta: { correlationId: "pw-apzsearch-017" },
      }),
    });
  });
}

test.describe("APZSEARCH-017 Publication Operations", () => {
  test("renders publication operations section", async ({ page }) => {
    test.skip(
      process.env.APZHUB_PLAYWRIGHT_WEBSERVER_FAILED === "1",
      "webServer unavailable",
    );
    await mockPublicationHttp(page);
    await signIn(page);
    await page.goto(PUBLICATION_HOME);
    await expect(page.getByTestId("search-publication-ops")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("Publication Operations")).toBeVisible();
    await expect(page.getByText("Depth: 1")).toBeVisible();
  });
});
