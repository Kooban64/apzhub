import { expect, test } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

/**
 * Platform Services Foundation — APS-E-07 (catalogue honesty; no product UX change).
 */

const EXPECTED_SHORT_NAMES = [
  "APS-Search",
  "APS-Notifications",
  "APS-Command",
  "APS-Activity",
  "APS-Personalisation",
  "APS-Realtime",
  "APS-Audit",
] as const;

test.describe("APS-E-07 Platform Services Foundation", () => {
  test("APS catalogue API — exactly seven accepted services; no AI", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);
    const response = await page.request.get("/api/v1/platform/services");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      data?: {
        inventory?: string;
        items?: readonly { id: string; shortName: string }[];
      };
    };
    expect(body.data?.inventory).toBe("APS-002");
    const items = body.data?.items ?? [];
    expect(items).toHaveLength(7);
    expect(items.map((item) => item.shortName)).toEqual([...EXPECTED_SHORT_NAMES]);
    const joined = items.map((item) => item.id).join(" ");
    expect(joined).not.toMatch(/ai|rag|presence|inbox|navigation/i);
  });

  test("product home still loads unchanged (no-retraining gate)", async ({ page }) => {
    test.setTimeout(90_000);
    await signInDevUser(page);
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /APS-AI|Universal Inbox|Presence Service/i,
    );
  });
});
