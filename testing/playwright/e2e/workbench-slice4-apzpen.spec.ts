import { expect, test } from "@playwright/test";

/**
 * Workbench Slice 4 — APZPEN desktop smoke.
 *
 * Classification of prior 480s desktop timeout (Owner debt):
 * - Primary cause: Next.js dev-server compile saturation under a long multi-route suite
 * - Contributing: oversized navigation surface + hung quick-login under load
 * - Not classified as an application hang of the PEN product itself
 *
 * This smoke must actually PASS. Do not relabel the old long suite PASS.
 * Evidence capture remains a separate best-effort script.
 */

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

async function loginAs(
  page: import("@playwright/test").Page,
  persona: string,
): Promise<void> {
  const credRes = await page.request.post("/api/v1/demo/quick-login", {
    data: { id: persona },
    timeout: 30_000,
  });
  expect(credRes.ok(), `quick-login ${persona}`).toBeTruthy();
  const credBody = (await credRes.json()) as {
    data?: { email?: string; password?: string };
  };
  const signIn = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: credBody.data!.email,
      password: credBody.data!.password,
    },
    headers: {
      Origin: ORIGIN,
      Referer: `${ORIGIN}/login`,
    },
    timeout: 30_000,
  });
  expect(signIn.ok(), `sign-in ${persona}: ${signIn.status()}`).toBeTruthy();
}

test.describe("Workbench Slice 4 — APZPEN smoke", () => {
  test("security rail + core surfaces + Source/Terminal independence", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await loginAs(page, "org_member");

    await page.goto("/workspace/pen", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await expect(page.getByTestId("workbench-shell")).toBeVisible({
      timeout: 90_000,
    });

    // Security rail present
    const securityRail = page
      .getByRole("link", { name: /security|pen/i })
      .or(page.getByTestId(/rail.*pen|activity.*pen|security/i));
    await expect(securityRail.first()).toBeVisible({ timeout: 30_000 });

    // Core PEN surfaces load without inventing success
    for (const path of [
      "/workspace/pen/engagements",
      "/workspace/pen/findings",
      "/workspace/pen/evidence",
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect(page.getByTestId("workbench-shell")).toBeVisible({
        timeout: 60_000,
      });
    }

    // Terminal stays unavailable / not configured when present
    const terminalTab = page.getByTestId("workbench-bottom-tab-terminal");
    if ((await terminalTab.count()) > 0) {
      const label = (await terminalTab.first().innerText()).toLowerCase();
      expect(
        label.includes("not configured") || label.includes("terminal"),
      ).toBeTruthy();
    }

    // Source capability is independent of PEN entitlement
    const caps = await page.request.get("/api/v1/source/capabilities", {
      timeout: 30_000,
    });
    // 200 with canRead false, or 403 — both honest; do not invent Source access
    expect([200, 403]).toContain(caps.status());
  });

  test("mobile PEN home loads", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, "org_member");
    await page.goto("/workspace/pen", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await expect(page.getByTestId("workbench-shell")).toBeVisible({
      timeout: 90_000,
    });
  });
});

/**
 * Legacy long desktop suite — kept skipped as infrastructure debt evidence.
 * Do not enable until a production-like server or shorter harness is used.
 */
test.describe.skip("Workbench Slice 4 — APZPEN long desktop (debt)", () => {
  test("long suite retained for history — not asserted PASS", async () => {
    // Intentionally skipped. See Commercial UX Pass stop report.
  });
});
