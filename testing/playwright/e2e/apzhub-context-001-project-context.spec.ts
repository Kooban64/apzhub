import { expect, test, type Page } from "@playwright/test";

import { PROJECT_ID, meta, mockProjectsApi, signIn } from "./projects-ui-cert-helpers";

async function mockEnterpriseContextApi(page: Page) {
  await page.route("**/api/v1/context**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          focus: {
            type: "project",
            id: PROJECT_ID,
            name: "Delivery Alpha",
            identifier: "ALPHA",
          },
          composedAt: "2026-08-06T12:00:00.000Z",
          compositionOnly: true,
          ownsBusinessState: false,
          question: "What do I need to know before I continue?",
          partial: false,
          slices: [
            {
              providerId: "workflow",
              sectionId: "workflow",
              productLabel: "APZ Workflow",
              fragments: [
                {
                  id: "workflow:approval:1",
                  providerId: "workflow",
                  productLabel: "APZ Workflow",
                  sectionHint: "approvals",
                  title: "Approve ALPHA release gate",
                  href: "/workspace/workflow/tasks/1",
                  sourceEntityRef: "wtk_1",
                  fragmentClass: "entity",
                  severity: "attention",
                },
              ],
            },
            {
              providerId: "support",
              sectionId: "support",
              productLabel: "APZ Support",
              fragments: [
                {
                  id: "support:request:1",
                  providerId: "support",
                  productLabel: "APZ Support",
                  sectionHint: "critical",
                  title: "Critical incident linked to ALPHA",
                  href: "/workspace/support/requests/1",
                  sourceEntityRef: "sup_1",
                  fragmentClass: "entity",
                  severity: "critical",
                },
              ],
            },
            {
              providerId: "documents",
              sectionId: "documents",
              productLabel: "APZ Documents",
              fragments: [
                {
                  id: "documents:doc:1",
                  providerId: "documents",
                  productLabel: "APZ Documents",
                  sectionHint: "approved",
                  title: "ALPHA charter",
                  href: "/workspace/documents/doc_1",
                  sourceEntityRef: "doc_1",
                  fragmentClass: "entity",
                },
              ],
            },
            {
              providerId: "law",
              sectionId: "law",
              productLabel: "APZ Law",
              fragments: [
                {
                  id: "law:gq-02",
                  providerId: "law",
                  productLabel: "APZ Law",
                  sectionHint: "obligations",
                  title: "Applicable delivery obligations",
                  href: "/workspace/law",
                  sourceEntityRef: "GQ-02",
                  fragmentClass: "entity",
                },
              ],
            },
            {
              providerId: "knowledge",
              sectionId: "knowledge",
              productLabel: "APZ Knowledge",
              fragments: [
                {
                  id: "knowledge:lesson",
                  providerId: "knowledge",
                  productLabel: "APZ Knowledge",
                  sectionHint: "lessons",
                  title: "Handover gaps cause rework after project close",
                  href: "/workspace/knowledge",
                  sourceEntityRef: "lesson-handover-checklist",
                  fragmentClass: "entity",
                },
              ],
            },
          ],
        },
        meta: meta(),
      }),
    });
  });
}

test.describe("APZHUB-CONTEXT-001 Project Context MVP", () => {
  test("project detail shows composed Enterprise Context panel", async ({ page }) => {
    await signIn(page);
    await mockProjectsApi(page);
    await mockEnterpriseContextApi(page);

    await page.goto(`/workspace/projects/${PROJECT_ID}`);
    await expect(page.getByTestId("enterprise-context-panel")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("enterprise-context-question")).toHaveText(
      "What do I need to know before I continue?",
    );
    await expect(page.getByTestId("context-slice-workflow")).toBeVisible();
    await expect(page.getByText("Approve ALPHA release gate")).toBeVisible();
    await expect(page.getByTestId("context-slice-support")).toBeVisible();
    await expect(page.getByTestId("context-slice-documents")).toBeVisible();
    await expect(page.getByTestId("context-slice-law")).toBeVisible();
    await expect(page.getByTestId("context-slice-knowledge")).toBeVisible();
    await expect(page.getByText("APZ Knowledge")).toBeVisible();
  });
});
