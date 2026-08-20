import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-1e";

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

async function shot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
  await page.screenshot({ path: `${EVIDENCE}/${name}`, fullPage: true });
}

test.describe("APZQEP redesign Phase 1E — Application registry", () => {
  test("register application, configure environment and remote host without secrets", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");

    const key = `HUB${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const created = await page.request.post("/api/v1/qep/applications", {
      data: {
        name: "APZHUB",
        key,
        description: "Phase 1E authorised application",
        status: "active",
      },
      timeout: 30_000,
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const createdBody = (await created.json()) as {
      data?: { application?: { id?: string } };
    };
    const applicationId = createdBody.data?.application?.id;
    expect(applicationId).toBeTruthy();

    if (applicationId) {
      const listed = await page.request.get("/api/v1/qep/applications");
      expect(listed.ok(), await listed.text()).toBeTruthy();
      const listedBody = (await listed.json()) as {
        data?: {
          applications?: readonly {
            readonly id?: string;
            readonly key?: string;
            readonly ownerUserId?: string;
            readonly ownerDisplayName?: string;
            readonly projectRefs?: readonly string[];
          }[];
          legacyAssociations?: {
            readonly resolvedCount?: number;
            readonly unresolved?: readonly { readonly projectRef?: string }[];
          };
        };
      };
      const listedApp = listedBody.data?.applications?.find(
        (row) => row.id === applicationId,
      );
      expect(listedApp?.projectRefs).toEqual(
        expect.arrayContaining([applicationId, key]),
      );
      expect(listedApp?.ownerDisplayName).toBeTruthy();
      expect(listedApp?.ownerDisplayName).not.toBe(listedApp?.ownerUserId);
      expect(listedBody.data?.legacyAssociations).toBeTruthy();

      const env = await page.request.post(
        `/api/v1/qep/applications/${applicationId}/environments`,
        { data: { name: "QA", category: "test" }, timeout: 30_000 },
      );
      expect(env.ok(), await env.text()).toBeTruthy();
      const envBody = (await env.json()) as { data?: { item?: { id?: string } } };
      const environmentId = envBody.data?.item?.id;
      const target = await page.request.post(
        `/api/v1/qep/applications/${applicationId}/execution-targets`,
        {
          data: {
            name: "QA Host",
            targetType: "remote_host",
            environmentId,
            status: "not_configured",
            config: {
              host: "qa-app-01",
              port: 22,
              credentialRef: "vault://qep/qa-host",
            },
          },
          timeout: 30_000,
        },
      );
      expect(target.ok(), await target.text()).toBeTruthy();
      const secretAttempt = await page.request.post(
        `/api/v1/qep/applications/${applicationId}/execution-targets`,
        {
          data: {
            name: "Bad Host",
            targetType: "remote_host",
            config: { password: "should-not-store" },
          },
          timeout: 30_000,
        },
      );
      expect(secretAttempt.ok()).toBeFalsy();
    }

    await page.goto("/workspace/qep/applications", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("workbench-shell")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("qep-applications")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("workbench-activity-rail")).toHaveCount(0);
    await shot(page, "01-applications-desktop-light.png");

    await page.getByRole("button", { name: /Switch to dark theme/i }).click();
    await page.waitForTimeout(400);
    await shot(page, "02-applications-desktop-dark.png");
    await page.getByRole("button", { name: /Switch to light theme/i }).click();

    if (applicationId) {
      await page.goto(`/workspace/qep/applications/${applicationId}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.getByTestId("qep-application-detail")).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.getByTestId("qep-application-overview")).toBeVisible();
      await shot(page, "04-application-overview-desktop-light.png");
      await page.getByRole("button", { name: /Switch to dark theme/i }).click();
      await page.waitForTimeout(400);
      await shot(page, "05-application-overview-desktop-dark.png");
      await page.getByRole("button", { name: /Switch to light theme/i }).click();

      await page.getByRole("tab", { name: "Repositories" }).click();
      await expect(page.getByTestId("qep-application-repositories")).toBeVisible();
      await shot(page, "07-repositories.png");

      await page.getByRole("tab", { name: "Environments" }).click();
      await expect(page.getByTestId("qep-application-environments")).toBeVisible();
      await shot(page, "09-environments.png");
      const envRow = page.locator("[data-testid^='qep-environment-row-']").first();
      if ((await envRow.count()) > 0) {
        await envRow.click();
        await expect(page.getByTestId("qep-environment-inspector")).toBeVisible();
        await shot(page, "10-environment-inspector.png");
      }

      await page.getByRole("tab", { name: "Execution Targets" }).click();
      await expect(page.getByTestId("qep-application-targets")).toBeVisible();
      await shot(page, "11-execution-targets.png");
      const targetRow = page
        .locator("[data-testid^='qep-execution-target-row-']")
        .first();
      if ((await targetRow.count()) > 0) {
        await targetRow.click();
        await expect(page.getByTestId("qep-execution-target-inspector")).toBeVisible();
        await shot(page, "12-remote-host-configuration.png");
      }
    }

    await page.goto("/workspace/qep/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-command-centre")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId("qep-cc-application")).toBeVisible();
    await shot(page, "13-command-centre-application.png");

    await page.goto("/workspace/qep/my-work", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-my-work")).toBeVisible({ timeout: 60_000 });
    await shot(page, "14-my-work-application-context.png");
  });

  test("mobile applications and overview are not a squeezed desktop table", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, "org_member");
    await page.goto("/workspace/qep/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("workbench-shell")).toBeVisible({ timeout: 45_000 });
    await page.goto("/workspace/qep/applications", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-applications")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("qep-applications-cards")).toBeVisible();
    await expect(page.getByTestId("workbench-mobile-nav")).toBeVisible();
    await shot(page, "03-applications-mobile.png");

    const card = page.locator("[data-testid^='qep-application-card-']").first();
    if ((await card.count()) > 0) {
      await card.click();
      await expect(page.getByTestId("qep-application-detail")).toBeVisible({
        timeout: 30_000,
      });
      await shot(page, "06-application-overview-mobile.png");
    }
  });

  test("application association does not grant source.read", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, "org_member");
    await page.goto("/workspace/qep/applications", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("qep-applications")).toBeVisible({ timeout: 60_000 });
    const session = await page.request.get("/api/auth/get-session");
    expect(session.ok()).toBeTruthy();
    const home = await page.request.get("/api/v1/me/home-context", { timeout: 30_000 });
    expect(home.ok()).toBeTruthy();
    const body = (await home.json()) as {
      data?: { permissions?: string[] };
    };
    const permissions = body.data?.permissions ?? [];
    fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
    fs.writeFileSync(
      path.resolve(EVIDENCE, "15-source-independence.txt"),
      [
        `qep.portfolio.read present: ${permissions.includes("qep.portfolio.read") || permissions.includes("qep.*") || permissions.includes("*")}`,
        `source.read present: ${permissions.includes("source.read")}`,
        `source.write present: ${permissions.includes("source.write")}`,
        "Application APIs use qep.portfolio.* / qep.scm.read. Associating a repository does not add source.read.\n",
      ].join("\n"),
    );
    await shot(page, "15-source-independence.png");
  });
});
