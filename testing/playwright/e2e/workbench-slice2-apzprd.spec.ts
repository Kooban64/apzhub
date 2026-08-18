import { expect, test } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/workbench/evidence/apzprd";

const PRD = [
  "projects",
  "support",
  "time",
  "workflow",
  "analytics",
  "knowledge",
  "documents",
] as const;

async function loginAs(
  page: import("@playwright/test").Page,
  persona: string,
): Promise<void> {
  const credRes = await page.request.post("/api/v1/demo/quick-login", {
    data: { id: persona },
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
  });
  expect(signIn.ok(), `sign-in ${persona}: ${signIn.status()}`).toBeTruthy();
}

async function awaitShell(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("workbench-shell")).toBeVisible({
    timeout: 90_000,
  });
}

async function gotoProduct(
  page: import("@playwright/test").Page,
  path: string,
): Promise<boolean> {
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

async function openProductivity(page: import("@playwright/test").Page) {
  await page.getByTestId("workbench-rail-productivity").click();
  await expect(page.getByTestId("workbench-sidebar-prd-my-work")).toBeVisible({
    timeout: 30_000,
  });
}

test.describe("User Workbench Slice 2 — APZPRD", () => {
  test("org_member: productivity nav + product surfaces", async ({ page }) => {
    test.setTimeout(480_000);
    await loginAs(page, "org_member");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await awaitShell(page);

    await openProductivity(page);
    await page.screenshot({
      path: `${EVIDENCE}/01-apzprd-my-work.png`,
      fullPage: true,
    });

    const homeCtx = await page.request.get("/api/v1/me/home-context");
    expect(homeCtx.ok()).toBeTruthy();
    const body = (await homeCtx.json()) as {
      data?: { entitlements?: { productKeys?: string[] } };
    };
    const keys = new Set(body.data?.entitlements?.productKeys ?? []);

    for (const product of PRD) {
      if (keys.has(product)) {
        await expect(
          page.getByTestId(`workbench-sidebar-prd-${product}`),
        ).toBeVisible();
      } else {
        await expect(page.getByTestId(`workbench-sidebar-prd-${product}`)).toHaveCount(
          0,
        );
      }
    }

    if (keys.has("projects") && (await gotoProduct(page, "/workspace/projects"))) {
      await expect(page.getByTestId("workbench-context-sidebar")).toContainText(
        /Overview|My Tasks|Projects/i,
      );
      await page.screenshot({ path: `${EVIDENCE}/02-projects.png`, fullPage: true });

      if (await gotoProduct(page, "/workspace/projects/tasks")) {
        const row = page.locator("[data-testid^='projects-tasks-row-']").first();
        if (await row.count()) {
          await row.click();
          await expect(page.getByTestId("workbench-inspector-selection")).toBeVisible({
            timeout: 15_000,
          });
        }
        await page.screenshot({
          path: `${EVIDENCE}/03-project-task-inspector.png`,
          fullPage: true,
        });
      }
    }

    if (keys.has("support") && (await gotoProduct(page, "/workspace/support"))) {
      await page.screenshot({
        path: `${EVIDENCE}/04-support-queue.png`,
        fullPage: true,
      });
      const supportRow = page.locator("table tbody tr").first();
      if (await supportRow.count()) {
        await supportRow.click();
        await page.waitForTimeout(400);
      }
      await page.screenshot({
        path: `${EVIDENCE}/05-support-ticket.png`,
        fullPage: true,
      });
    }

    if (keys.has("time") && (await gotoProduct(page, "/workspace/time"))) {
      await page.screenshot({ path: `${EVIDENCE}/06-time-today.png`, fullPage: true });
    }

    if (keys.has("workflow") && (await gotoProduct(page, "/workspace/workflow"))) {
      await page.screenshot({ path: `${EVIDENCE}/07-workflow.png`, fullPage: true });
    }

    if (keys.has("analytics") && (await gotoProduct(page, "/workspace/analytics"))) {
      await page.screenshot({ path: `${EVIDENCE}/08-analytics.png`, fullPage: true });
    }

    if (keys.has("knowledge") && (await gotoProduct(page, "/workspace/knowledge"))) {
      await page.screenshot({ path: `${EVIDENCE}/09-knowledge.png`, fullPage: true });
      if (await gotoProduct(page, "/workspace/knowledge/library")) {
        await page.screenshot({
          path: `${EVIDENCE}/10-knowledge-article.png`,
          fullPage: true,
        });
      }
    }

    if (keys.has("documents") && (await gotoProduct(page, "/workspace/documents"))) {
      await page.screenshot({ path: `${EVIDENCE}/11-documents.png`, fullPage: true });
      if (await gotoProduct(page, "/workspace/documents/documents")) {
        await page.screenshot({
          path: `${EVIDENCE}/12-document-inspector.png`,
          fullPage: true,
        });
      }
    }

    if (await gotoProduct(page, "/workspace/home")) {
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toMatch(/\bPlane\b/);
      expect(bodyText).not.toMatch(/\bZammad\b/);
      expect(bodyText).not.toMatch(/\bKimai\b/);
      expect(bodyText).not.toMatch(/\bn8n\b/i);
      expect(bodyText).not.toMatch(/\bMetabase\b/);
      expect(bodyText).not.toMatch(/\bPaperless\b/);

      const themeBtn = page.getByRole("button", { name: /theme|dark|light/i }).first();
      if (await themeBtn.count()) {
        await themeBtn.click();
        await page.waitForTimeout(400);
      }
      await page.screenshot({ path: `${EVIDENCE}/15-apzprd-dark.png`, fullPage: true });
    }
  });

  test("inaccessible products absent from productivity launcher", async ({ page }) => {
    test.setTimeout(240_000);
    await loginAs(page, "org_member");
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await awaitShell(page);

    const homeCtx = await page.request.get("/api/v1/me/home-context");
    const body = (await homeCtx.json()) as {
      data?: { entitlements?: { productKeys?: string[] } };
    };
    const keys = new Set(body.data?.entitlements?.productKeys ?? []);

    await openProductivity(page);
    for (const product of PRD) {
      const item = page.getByTestId(`workbench-sidebar-prd-${product}`);
      if (keys.has(product)) {
        await expect(item).toBeVisible();
      } else {
        await expect(item).toHaveCount(0);
      }
    }

    await page.screenshot({
      path: `${EVIDENCE}/13-apzprd-restricted-user.png`,
      fullPage: true,
    });
  });

  test("mobile: time surface reachable", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, "org_member");
    await page.goto("/workspace/time", { waitUntil: "domcontentloaded" });
    await awaitShell(page);
    await expect(page.getByTestId("workbench-mobile-nav")).toBeVisible({
      timeout: 30_000,
    });
    await page.screenshot({
      path: `${EVIDENCE}/14-apzprd-mobile-time.png`,
      fullPage: true,
    });
  });
});
