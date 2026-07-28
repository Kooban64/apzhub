import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

async function readPersistedWorkbenchLayout(
  page: import("@playwright/test").Page,
): Promise<{
  focusedViewId: string | null;
  activeWorkspace: string | null;
}> {
  // Platform Personalisation SessionStore (M8-04) — not browser localStorage.
  const response = await page.request.get(
    "/api/platform/v1/personalisation/workbench-layout",
  );
  if (!response.ok()) {
    return { focusedViewId: null, activeWorkspace: null };
  }
  const body = (await response.json()) as {
    data?: { layout?: { focusedViewId?: string; activeWorkspace?: string } | null };
  };
  const layout = body.data?.layout;
  return {
    focusedViewId: layout?.focusedViewId ?? null,
    activeWorkspace: layout?.activeWorkspace ?? null,
  };
}

test.describe("SPR-003 workbench context and selection", () => {
  test("navigation updates persisted workbench context after sidebar selection", async ({
    page,
  }) => {
    await signInDevUser(page);

    // Deterministic sync: wait for Personalisation PUT after Overview activation
    // (debounced SessionStore persist) instead of arbitrary sleeps.
    const layoutPersist = page.waitForResponse(
      (response) =>
        response.url().includes("/api/platform/v1/personalisation/workbench-layout") &&
        response.request().method() === "PUT" &&
        response.ok(),
    );

    await page.getByRole("button", { name: "Overview" }).click();
    await expect(page).toHaveURL(/\/workspace\/home\/overview/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({
      timeout: 15_000,
    });
    await layoutPersist;

    await expect
      .poll(async () => (await readPersistedWorkbenchLayout(page)).focusedViewId, {
        timeout: 15_000,
      })
      .toBe("platform-home-overview");

    const activeWorkspace = (await readPersistedWorkbenchLayout(page)).activeWorkspace;
    expect(activeWorkspace).toBe("home");
  });
});
