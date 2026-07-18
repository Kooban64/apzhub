import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const DOCUMENTS_HOME = "/workspace/documents";

async function mockDocumentsHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/documents**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname + url.search);

    if (url.pathname.endsWith("/documents/diagnostics")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            providerReady: true,
            providerId: "memory",
            providerKind: "memory",
            repositoryReady: true,
            storageReady: true,
            checksumReady: true,
            reconciliationIssueCount: 0,
          },
          meta: { correlationId: "pw-apzdocs-005" },
        }),
      });
      return;
    }

    if (/\/documents\/[^/]+\/versions$/.test(url.pathname)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "ver_pw_1",
              documentId: "doc_pw_1",
              versionNumber: 1,
              mimeType: "application/pdf",
              byteLength: 2048,
              checksumHex: "pwchecksum",
              storageStatus: "verified",
              createdAt: "2026-07-13T10:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzdocs-005" },
        }),
      });
      return;
    }

    if (
      /\/documents\/[^/]+$/.test(url.pathname) &&
      route.request().method() === "GET"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "doc_pw_1",
            title: "Playwright Policy",
            status: "published",
            classification: { code: "internal" },
            documentType: "file",
            description: "PW mock",
            folderId: "folder_pw",
            categoryId: "collection_pw",
            creatorUserId: "user_pw",
            createdAt: "2026-07-13T10:00:00.000Z",
            updatedAt: "2026-07-13T12:00:00.000Z",
          },
          meta: { correlationId: "pw-apzdocs-005" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/documents") || url.pathname.endsWith("/documents/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              documentId: "doc_pw_1",
              title: "Playwright Policy",
              status: "published",
              classification: "internal",
              documentType: "file",
              updatedAt: "2026-07-13T12:00:00.000Z",
              tagNames: ["policy"],
              folderId: "folder_pw",
              collectionId: "collection_pw",
              ownerUserId: "user_pw",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzdocs-005" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        page: { limit: 0, hasMore: false },
        meta: { correlationId: "pw-apzdocs-005" },
      }),
    });
  });
}

test.describe("APZDOCS-005 Platform Documents workbench", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("opens Documents workbench through mocked /api/v1/documents", async ({
    page,
  }) => {
    const seen: string[] = [];
    await mockDocumentsHttpApi(page, seen);

    await page.goto(DOCUMENTS_HOME, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("documents-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("heading", { level: 1, name: /Overview/i }),
    ).toBeVisible();
    await expect(page.getByText("Playwright Policy")).toBeVisible();

    expect(seen.some((p) => p.includes("/api/v1/documents"))).toBe(true);
  });

  test("exposes command toolbar and a11y landmarks", async ({ page }) => {
    const seen: string[] = [];
    await mockDocumentsHttpApi(page, seen);

    await page.goto(DOCUMENTS_HOME, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("documents-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("toolbar", { name: /Documents commands/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/Filter documents by metadata/i)).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("documents-page")).toBeVisible();
  });
});
