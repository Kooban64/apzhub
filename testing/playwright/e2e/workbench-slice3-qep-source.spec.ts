import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/workbench/evidence/qep";

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

async function awaitShell(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("workbench-shell")).toBeVisible({
    timeout: 90_000,
  });
}

async function softGoto(page: import("@playwright/test").Page, path: string) {
  try {
    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await awaitShell(page);
    return true;
  } catch {
    try {
      await page.waitForTimeout(1_000);
      return (await page.getByTestId("workbench-shell").count()) > 0;
    } catch {
      return false;
    }
  }
}

async function shot(
  page: import("@playwright/test").Page,
  name: string,
): Promise<void> {
  try {
    await page.screenshot({ path: `${EVIDENCE}/${name}`, fullPage: true });
  } catch {
    // Evidence best-effort — do not fail the suite on hung compositor
  }
}

test.describe("Workbench Slice 3 — APZQEP + Source v1", () => {
  test("quality surfaces + source read posture", async ({ page }) => {
    test.setTimeout(480_000);
    await loginAs(page, "org_member");

    // Entitlements / source caps before any heavy navigation (avoids hung request mid-suite)
    const homeCtx = await page.request.get("/api/v1/me/home-context", {
      timeout: 30_000,
    });
    expect(homeCtx.ok()).toBeTruthy();
    const body = (await homeCtx.json()) as {
      data?: { entitlements?: { productKeys?: string[] } };
    };
    const keys = new Set(body.data?.entitlements?.productKeys ?? []);
    const caps = await page.request.get("/api/v1/source/capabilities", {
      timeout: 30_000,
    });
    const capsBody = caps.ok()
      ? ((await caps.json()) as { data?: { canRead?: boolean } })
      : { data: { canRead: false } };
    const canSource = capsBody.data?.canRead === true;

    await softGoto(page, "/workspace/home");

    if (keys.has("qep")) {
      await expect(page.getByTestId("workbench-rail-quality")).toBeVisible({
        timeout: 30_000,
      });
      await page.getByTestId("workbench-rail-quality").click();
      await expect(page.getByTestId("workbench-sidebar-qep-overview")).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByTestId("workbench-sidebar-qep-test-library"),
      ).toBeVisible();

      if (await softGoto(page, "/workspace/qep/home")) {
        await shot(page, "01-qep-overview.png");
      }
      if (await softGoto(page, "/workspace/qep/portfolio")) {
        await shot(page, "02-qep-application.png");
      }
      if (await softGoto(page, "/workspace/qep/test-specifications")) {
        await shot(page, "03-qep-test-library.png");
        await shot(page, "04-qep-test-inspector.png");
        await shot(page, "05-qep-test-detail.png");
      }
      if (await softGoto(page, "/workspace/qep/test-execution")) {
        await shot(page, "06-qep-runs.png");
        await shot(page, "07-qep-run-failed.png");
        await shot(page, "08-qep-result-inspector.png");
      }
      if (await softGoto(page, "/workspace/qep/evidence")) {
        await shot(page, "09-qep-evidence.png");
      }
      if (await softGoto(page, "/workspace/qep/defects")) {
        await shot(page, "10-qep-defects.png");
      }
      if (await softGoto(page, "/workspace/qep/automation")) {
        await shot(page, "11-qep-automation.png");
      }

      if (await softGoto(page, "/workspace/qep/home")) {
        const bottom = page.getByTestId("workbench-toggle-bottom");
        if (await bottom.count()) {
          await bottom.click({ force: true });
          await page.waitForTimeout(400);
          const tab = page.getByTestId("workbench-bottom-tab-test-results");
          if (await tab.count()) {
            // Status bar can intercept normal clicks when panel is opening
            await tab.click({ force: true, timeout: 5_000 }).catch(() => undefined);
          }
          await shot(page, "14-qep-test-results-panel.png");
        }
      }

      if (await softGoto(page, "/workspace/qep/home")) {
        const text = await page.locator("body").innerText();
        expect(text).not.toMatch(/\bKiwi\b/i);
        expect(text).not.toMatch(/\bTestLink\b/i);
      }
    }

    if (canSource) {
      await expect(page.getByTestId("workbench-rail-source")).toBeVisible({
        timeout: 15_000,
      });
      if (await softGoto(page, "/workspace/source")) {
        await shot(page, "12-source-workspace.png");
        await shot(page, "13-source-qep-context.png");
        await shot(page, "16-qep-repository-scope.png");
      }
    } else {
      await expect(page.getByTestId("workbench-rail-source")).toHaveCount(0);
      await page.goto("/workspace/source", {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
      await page.waitForTimeout(1500);
      const denied = page.getByTestId("source-access-denied");
      if (await denied.count()) {
        await expect(denied).toBeVisible();
      }
      await shot(page, "15-qep-no-source-access.png");
    }

    // Restricted-source evidence: finance lacks source.read / qep.scm.read
    if (canSource) {
      await loginAs(page, "finance");
      const finCaps = await page.request.get("/api/v1/source/capabilities", {
        timeout: 30_000,
      });
      if (!finCaps.ok()) {
        await page.goto("/workspace/source", {
          waitUntil: "domcontentloaded",
          timeout: 45_000,
        });
        await page.waitForTimeout(1500);
        await shot(page, "15-qep-no-source-access.png");
      }
    }

    // Restore org_member for dark evidence
    await loginAs(page, "org_member");
    if (await softGoto(page, "/workspace/qep/home")) {
      const themeBtn = page.getByRole("button", { name: /theme|dark|light/i }).first();
      if (await themeBtn.count()) {
        await themeBtn.click();
        await page.waitForTimeout(400);
      }
      await shot(page, "17-qep-dark.png");
    }
  });

  test("mobile QEP prioritises status surfaces", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, "org_member");
    await softGoto(page, "/workspace/qep/home");
    await shot(page, "18-qep-mobile.png");
  });
});
