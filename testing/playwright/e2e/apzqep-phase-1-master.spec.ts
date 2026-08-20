import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-1";

async function loginAs(page: Page, persona: string): Promise<void> {
  const credRes = await page.request.post("/api/v1/demo/quick-login", {
    data: { id: persona },
    timeout: 60_000,
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

async function awaitShell(page: Page): Promise<boolean> {
  try {
    await expect(page.getByTestId("workbench-shell")).toBeVisible({
      timeout: 45_000,
    });
    return true;
  } catch {
    return false;
  }
}

async function shot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
  await page.screenshot({ path: `${EVIDENCE}/${name}`, fullPage: true });
}

async function seedAssignedDefect(page: Page): Promise<string | null> {
  const sessionRes = await page.request.get("/api/auth/get-session", {
    timeout: 30_000,
  });
  if (!sessionRes.ok()) return null;
  const session = (await sessionRes.json()) as { user?: { id?: string } };
  const userId = session.user?.id;
  if (!userId) return null;

  const created = await page.request.post("/api/v1/qep/defects", {
    data: {
      title: "Payment retry failure",
      description: "Phase 1V visual conformance — sanctioned assigned work",
      severity: "critical",
      assigneeId: userId,
    },
    timeout: 30_000,
  });
  if (!created.ok()) return null;
  const body = (await created.json()) as {
    data?: { defectId?: string; assigneeId?: string };
  };
  const defectId = body.data?.defectId;
  if (!defectId) return null;
  if (!body.data?.assigneeId) {
    const assigned = await page.request.post(
      `/api/v1/qep/defects/${encodeURIComponent(defectId)}/assign`,
      { data: { assigneeId: userId }, timeout: 30_000 },
    );
    if (!assigned.ok()) return null;
  }
  return defectId;
}

test.describe("APZQEP redesign Phase 1V — visual conformance", () => {
  test("QEP entitled user sees Command Centre, Master IA, and My Work", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    const seededId = await seedAssignedDefect(page);

    await page.goto("/workspace/qep/home", { waitUntil: "domcontentloaded" });
    await awaitShell(page);

    await expect(page.getByTestId("qep-command-centre")).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByRole("heading", { name: "Quality Command Centre" }),
    ).toBeVisible();
    await expect(page.getByTestId("workbench-activity-rail")).toHaveCount(0);
    await expect(page.getByTestId("workbench-product-label")).toHaveText("APZQEP");
    await expect(page.getByTestId("global-search-trigger")).toContainText(
      "Search QEP...",
    );
    await expect(page.getByTestId("qep-release-selector")).toHaveCount(0);
    await expect(page.getByLabel("Release")).toHaveCount(0);
    await expect(page.getByTestId("workbench-header")).not.toContainText("t-demo-o");
    await expect(page.getByTestId("qep-command-centre")).not.toContainText(
      "unavailable:none",
    );
    await expect(page.getByTestId("qep-command-centre")).not.toContainText(
      "bridge.security_assurance",
    );
    await expect(page.getByText(/\bAT RISK\b/)).toHaveCount(0);
    await expect(page.getByTestId("qep-home-verdict")).toHaveCount(0);

    const emptyAttention = page.getByTestId("qep-cc-attention-empty");
    if ((await emptyAttention.count()) > 0) {
      await expect(emptyAttention.first()).toContainText(
        "No quality items currently require your attention.",
      );
      await expect(page.getByText(/Critical\s+0/)).toHaveCount(0);
    }

    const sidebar = page.getByTestId("workbench-context-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText("Home");
    await expect(sidebar).toContainText("Overview");
    await expect(sidebar).toContainText("My Work");
    await expect(sidebar).toContainText("Define");
    await expect(sidebar).toContainText("Test Cases");
    await expect(sidebar).toContainText("Settings");
    await expect(sidebar).not.toContainText("User Stories");
    await expect(sidebar).not.toContainText("Test Library");
    await expect(sidebar).toContainText("Exploratory Sessions");
    await expect(sidebar).toContainText("UI / UX Plans");

    await page.getByTestId("workbench-account-trigger").click();
    await expect(page.getByTestId("workbench-account-dropdown")).toBeVisible();
    await expect(page.getByText("Platform Administration")).toHaveCount(0);
    await page.getByTestId("workbench-account-trigger").click();
    await expect(page.getByTestId("workbench-account-dropdown")).toHaveCount(0);

    await shot(page, "01-qep-command-centre-desktop-light.png");
    await shot(page, "05-qep-master-navigation.png");

    const themeBtn = page.getByRole("button", { name: /Switch to dark theme/i });
    await themeBtn.click();
    await page.waitForTimeout(400);
    await shot(page, "02-qep-command-centre-desktop-dark.png");
    await page.getByRole("button", { name: /Switch to light theme/i }).click();

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    await shot(page, "03-qep-command-centre-laptop.png");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/workspace/qep/my-work", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-my-work")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("qep-my-work-table")).toBeVisible();
    await expect(page.getByPlaceholder("Search work...")).toBeVisible();
    await shot(page, "06-qep-my-work-desktop.png");
    await page.getByRole("button", { name: /Switch to dark theme/i }).click();
    await page.waitForTimeout(400);
    await shot(page, "06-qep-my-work-desktop-dark.png");
    await page.getByRole("button", { name: /Switch to light theme/i }).click();
    await page.waitForTimeout(300);

    const row = page.locator("[data-testid^='qep-my-work-row-']").first();
    if ((await row.count()) > 0) {
      await row.click();
      await expect(page.getByTestId("qep-my-work-inspector")).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByTestId("workbench-inspector-selection")).toBeVisible();
    }
    fs.writeFileSync(
      path.resolve(EVIDENCE, "07-inspector-status.txt"),
      seededId && (await row.count()) > 0
        ? `Inspector captured against sanctioned assigned defect ${seededId}.\n`
        : "Inspector not provable — sanctioned seed did not produce a visible assigned work row.\n",
    );
    await shot(page, "07-qep-my-work-inspector.png");
  });

  test("mobile foundation uses bottom nav, not a squeezed desktop sidebar", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, "org_member");
    await seedAssignedDefect(page);
    await page.goto("/workspace/qep/home", { waitUntil: "domcontentloaded" });
    await awaitShell(page);
    await expect(page.getByTestId("qep-command-centre")).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByRole("heading", { name: "Quality Command Centre" }),
    ).toBeVisible();
    await expect(page.getByTestId("qep-cc-mobile")).toBeVisible();
    await expect(page.getByTestId("qep-cc-context")).toBeVisible();
    await expect(page.getByTestId("workbench-mobile-nav")).toBeVisible();
    await expect(page.getByTestId("workbench-mobile-nav")).toContainText("Home");
    await expect(page.getByTestId("workbench-mobile-nav")).toContainText("Work");
    await expect(page.getByTestId("workbench-mobile-nav")).toContainText("Defects");
    await expect(page.getByTestId("workbench-mobile-nav")).toContainText("More");
    await expect(page.getByTestId("workbench-context-sidebar")).toHaveCount(0);
    await expect(page.getByTestId("workbench-activity-rail")).toHaveCount(0);
    await shot(page, "04-qep-command-centre-mobile.png");

    await page.goto("/workspace/qep/my-work", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-my-work")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("workbench-context-sidebar")).toHaveCount(0);
    await expect(page.getByTestId("qep-my-work-cards")).toBeVisible();
    await shot(page, "08-qep-my-work-mobile.png");
    const card = page.locator("[data-testid^='qep-my-work-card-']").first();
    if ((await card.count()) > 0) {
      await card.click();
      await expect(page.getByTestId("qep-my-work-mobile-inspector")).toBeVisible({
        timeout: 15_000,
      });
      await shot(page, "08-qep-my-work-mobile-inspector.png");
    }
  });

  test("non-QEP user does not receive the APZQEP experience", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "finance");
    const homeCtx = await page.request.get("/api/v1/me/home-context", {
      timeout: 30_000,
    });
    expect(homeCtx.ok()).toBeTruthy();
    const body = (await homeCtx.json()) as {
      data?: { entitlements?: { productKeys?: string[] }; kind?: string };
    };
    const keys = body.data?.entitlements?.productKeys ?? [];
    expect(keys).not.toContain("qep");
    expect(body.data?.kind).not.toBe("org_admin");
    expect(body.data?.kind).not.toBe("superadmin");

    await page.goto("/workspace/qep/home", {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForTimeout(2_000);
    await expect(page.getByTestId("qep-command-centre")).toHaveCount(0);
  });

  test("09 is not produced without a QEP-entitled Source-denied persona", async () => {
    fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
    const note = [
      "09-qep-source-hidden-no-access.png was not produced.",
      "",
      "Required visual: QEP shell for a QEP-entitled user with Source independently unavailable.",
      "No DEMO_PERSONAS entry is QEP-entitled and Source-denied.",
      "org_member is QEP entitled and typically has source.read.",
      "finance is not QEP entitled; using it would not show the QEP shell.",
      "Source permissions were not altered for this pass.",
      "",
    ].join("\n");
    fs.writeFileSync(path.resolve(EVIDENCE, "09-NOT-PRODUCED.txt"), note);
    const stale = path.resolve(EVIDENCE, "09-qep-source-hidden-no-access.png");
    if (fs.existsSync(stale)) fs.unlinkSync(stale);
  });

  test("source.read present shows Source; write stays unused in Phase 1 UX", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    const caps = await page.request.get("/api/v1/source/capabilities", {
      timeout: 30_000,
    });
    const capBody = (await caps.json()) as {
      data?: { canRead?: boolean; canWrite?: boolean };
    };
    await page.goto("/workspace/qep/home", { waitUntil: "domcontentloaded" });
    expect(await awaitShell(page)).toBe(true);
    await expect(page.getByTestId("qep-command-centre")).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByRole("heading", { name: "Quality Command Centre" }),
    ).toBeVisible();
    if (capBody.data?.canRead === true) {
      await expect(page.getByTestId("workbench-sidebar-qep-source")).toBeVisible();
    } else {
      await expect(page.getByTestId("workbench-sidebar-qep-source")).toHaveCount(0);
    }
    await shot(page, "10-qep-source-visible-read-access.png");
    await expect(page.getByRole("button", { name: /commit|push|merge/i })).toHaveCount(
      0,
    );
  });
});
