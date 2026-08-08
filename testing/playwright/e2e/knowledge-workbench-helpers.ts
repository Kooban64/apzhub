import { type Page, type Route } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, signInDevUser } from "./auth-helpers";

export { DEV_EMAIL, DEV_PASSWORD };

export const LESSON_ID = "kobj_e2e_lesson_001";

export function meta() {
  return { requestId: "req_knowledge_e2e", correlationId: "corr_knowledge_e2e" };
}

export function lessonObject(overrides: Record<string, unknown> = {}) {
  return {
    id: LESSON_ID,
    tenantId: "tenant_e2e",
    kind: "lesson",
    title: "E2E operational lesson",
    summary: "Capture learning from a delivery incident.",
    body: {
      context: "delivery",
      situation: "handoff missed",
      resolution: "checklist added",
      recommendation: "use Memory Companion before release",
    },
    owner: "user_e2e",
    version: 1,
    status: "approved",
    tags: ["delivery"],
    relatedProducts: ["projects"],
    relatedCapabilities: [],
    versionHistory: [
      {
        version: 1,
        status: "approved",
        at: "2026-07-01T00:00:00.000Z",
        actor: "user_e2e",
      },
    ],
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-19T00:00:00.000Z",
    ...overrides,
  };
}

export async function signIn(page: Page): Promise<void> {
  await signInDevUser(page);
}

export async function mockKnowledgeApi(page: Page): Promise<void> {
  await page.route("**/api/v1/knowledge/**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const kind = url.searchParams.get("kind");

    if (path.endsWith("/knowledge/objects") && method === "GET") {
      const items =
        !kind || kind === "lesson"
          ? [lessonObject()]
          : kind === "best_practice"
            ? [
                lessonObject({
                  id: "kobj_e2e_library_001",
                  kind: "best_practice",
                  title: "E2E best practice",
                  libraryCategory: "best_practices",
                }),
              ]
            : [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { items }, meta: meta() }),
      });
    }

    if (path.includes("/knowledge/objects/") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: lessonObject(), meta: meta() }),
      });
    }

    if (path.endsWith("/knowledge/quality") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            totalObjects: 1,
            approvedCount: 1,
            draftCount: 0,
            reviewCount: 0,
            archivedCount: 0,
            staleCount: 0,
            duplicateGroups: 0,
            issues: [],
            computedAt: "2026-07-19T00:00:00.000Z",
          },
          meta: meta(),
        }),
      });
    }

    if (
      (path.endsWith("/knowledge/lessons") ||
        path.endsWith("/knowledge/library") ||
        path.endsWith("/knowledge/decision-knowledge")) &&
      method === "POST"
    ) {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: lessonObject({ status: "draft" }), meta: meta() }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {}, meta: meta() }),
    });
  });
}
