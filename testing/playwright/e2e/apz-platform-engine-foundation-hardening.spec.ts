import { expect, test } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * Platform Engine Foundation — PE-H1 residual (catalogue honesty; no product UX change).
 */

test.describe("PE-H1 Platform Engine Foundation", () => {
  test("APE catalogue API — foundation engines present; AI deferred", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);
    const response = await page.request.get("/api/v1/platform/engines?foundation=1");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      data?: { items?: readonly { id: string; maturity: string }[] };
    };
    const items = body.data?.items ?? [];
    expect(items.some((item) => item.id === "ape-audit")).toBe(true);
    expect(items.some((item) => item.id === "ape-search")).toBe(true);
    expect(items.some((item) => item.id === "ape-ai")).toBe(false);

    const all = await page.request.get("/api/v1/platform/engines");
    expect(all.ok()).toBeTruthy();
    const allBody = (await all.json()) as {
      data?: { items?: readonly { id: string; maturity: string }[] };
    };
    const ai = (allBody.data?.items ?? []).find((item) => item.id === "ape-ai");
    expect(ai?.maturity).toBe("deferred");
  });

  test("product home still loads unchanged (no-retraining gate)", async ({ page }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/APE-AI|RAG Engine/i);
  });
});
