import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const ENGINE_HOME = "/workspace/workflow-engine";

const sampleWorkflow = {
  id: "1",
  name: "Onboarding Notify",
  active: false,
  createdAt: "2026-07-15T10:00:00.000Z",
  updatedAt: "2026-07-15T11:00:00.000Z",
  tagNames: ["ops"],
  nodeCount: 2,
  connectionCount: 1,
  versionHint: "v1",
  engine: "workflow_engine",
};

async function mockEngineHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/workflows/engine**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname);

    const envelope = (data: unknown) => ({
      data,
      meta: { correlationId: "pw-apzworkflow-009" },
    });

    if (
      url.pathname.endsWith("/engine/workflows") &&
      !url.pathname.includes("/workflows/")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...envelope([sampleWorkflow]),
          page: { limit: 1, hasMore: false },
        }),
      });
      return;
    }

    if (url.pathname.includes("/engine/workflows/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(envelope(sampleWorkflow)),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/templates")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...envelope([
            {
              id: "1",
              name: "Onboarding Notify",
              tagNames: ["ops"],
              engine: "workflow_engine",
              support: "partial",
            },
          ]),
          page: { limit: 1, hasMore: false },
        }),
      });
      return;
    }

    if (url.pathname.includes("/engine/templates/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          envelope({
            id: "1",
            name: "Onboarding Notify",
            tagNames: ["ops"],
            engine: "workflow_engine",
            support: "partial",
          }),
        ),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/projects")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...envelope([
            {
              id: "p1",
              name: "Default",
              type: "personal",
              engine: "workflow_engine",
              support: "partial",
            },
          ]),
          page: { limit: 1, hasMore: false },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/users")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...envelope([
            {
              id: "u1",
              email: "ops@example.test",
              displayName: "Ops User",
              role: "owner",
              engine: "workflow_engine",
            },
          ]),
          page: { limit: 1, hasMore: false },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/tags")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...envelope([
            {
              id: "t1",
              name: "ops",
              engine: "workflow_engine",
            },
          ]),
          page: { limit: 1, hasMore: false },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/capabilities")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          envelope({
            services: [
              {
                serviceId: "workflows",
                support: "supported",
                implemented: true,
                operations: ["list", "get", "validate", "metadata"],
              },
            ],
            unsupportedOperations: ["execute", "schedule"],
          }),
        ),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/health")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          envelope({
            level: "healthy",
            reasons: [],
            sdkStatus: "healthy",
          }),
        ),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/diagnostics")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          envelope({
            adapterVersion: "0.1.0",
            healthLevel: "healthy",
            reasons: [],
            apiStatus: "reachable",
            authenticationStatus: "valid",
            authMode: "api_key",
            lastLatencyMs: 12,
            coreServiceCount: 10,
            compatibilityStatus: "compatible",
          }),
        ),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/compatibility")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          envelope({
            compatibilityStatus: "compatible",
            supportedApi: "v1",
            adapterVersion: "0.1.0",
            unsupportedOperations: ["execute", "schedule"],
            notes: ["Read-only metadata adapter"],
          }),
        ),
      });
      return;
    }

    if (url.pathname.endsWith("/engine/validate")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(envelope({ ok: true, message: "Connection validated" })),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        error: { message: "not mocked", code: "NOT_FOUND" },
        meta: { correlationId: "pw-apzworkflow-009" },
      }),
    });
  });
}

test.describe("APZWORKFLOW-009 Workflow Engine Workbench", () => {
  test("overview shows READ-ONLY ENGINE via mocked typed-client path", async ({
    page,
  }) => {
    const seen: string[] = [];
    await mockEngineHttpApi(page, seen);
    await signIn(page);
    await page.goto(`${ENGINE_HOME}/overview`);

    await expect(page.getByTestId("workflow-engine-page")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("card-readonly-engine")).toContainText(
      "READ-ONLY ENGINE",
    );
    await expect(
      page.getByRole("toolbar", { name: /Workflow Engine commands/i }),
    ).toBeVisible();

    expect(seen.some((path) => path.includes("/workflows/engine"))).toBeTruthy();
  });

  test("workflows section shows list and definition viewer", async ({ page }) => {
    const seen: string[] = [];
    await mockEngineHttpApi(page, seen);
    await signIn(page);
    await page.goto(`${ENGINE_HOME}/workflows`);

    await expect(page.getByText("Onboarding Notify")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("engine-definition-viewer")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Validate Connection/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Execute/i })).toHaveCount(0);
  });
});
