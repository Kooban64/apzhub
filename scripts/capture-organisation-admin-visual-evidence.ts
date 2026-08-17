/**
 * Capture Tenant Admin Block 2 visual evidence screenshots.
 * Run against :3300 with next-dev.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";
const OUT = join(process.cwd(), "docs/frontend/organisation-admin/evidence");

async function login(
  page: import("@playwright/test").Page,
  request: import("@playwright/test").APIRequestContext,
) {
  const cred = await request.post("/api/v1/demo/quick-login", {
    data: { id: "org_admin" },
  });
  const body = (await cred.json()) as {
    data: { email: string; password: string };
  };
  await request.post("/api/auth/sign-in/email", {
    data: { email: body.data.email, password: body.data.password },
    headers: { Origin: ORIGIN, Referer: `${ORIGIN}/login` },
  });
}

async function shot(
  page: import("@playwright/test").Page,
  name: string,
  path: string,
  waitFor: string,
  readySelector?: string,
) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(`[data-testid="${waitFor}"]`, { timeout: 90_000 });
  if (readySelector) {
    await page.waitForSelector(readySelector, { timeout: 90_000 });
  } else {
    await page.waitForFunction(
      () => {
        const t = document.body?.innerText ?? "";
        return !t.includes("Loading…") && !t.includes("Loading...");
      },
      { timeout: 90_000 },
    );
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  console.log("wrote", name);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: ORIGIN,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await login(page, context.request);

  await shot(
    page,
    "visual-teams.png",
    "/organisation-admin/teams",
    "organisation-admin-teams",
    "[data-testid=org-admin-teams-table], [data-testid=org-admin-teams-empty]",
  );

  // Team detail — first team if any
  const teamsRes = await context.request.get("/api/v1/organisation-admin/teams");
  const teamsJson = (await teamsRes.json()) as {
    data?: { teams?: { teamId: string }[] };
  };
  const firstTeam = teamsJson.data?.teams?.[0];
  if (firstTeam) {
    await shot(
      page,
      "visual-team-detail.png",
      `/organisation-admin/teams/${encodeURIComponent(firstTeam.teamId)}`,
      "organisation-admin-team-detail",
    );
  } else {
    console.log("skip visual-team-detail.png (no teams)");
  }

  await page.goto("/organisation-admin/roles-access", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector("[data-testid=organisation-admin-roles-access]", {
    timeout: 90_000,
  });
  await page.waitForFunction(
    () => {
      const t = document.body?.innerText ?? "";
      return !t.includes("Loading…") && !t.includes("Loading...");
    },
    { timeout: 90_000 },
  );
  await page
    .getByTestId("org-admin-roles-users-table")
    .or(page.getByText(/No access rows|No product role/i))
    .first()
    .waitFor({ timeout: 90_000 });
  await page.screenshot({
    path: join(OUT, "visual-roles-users.png"),
    fullPage: true,
  });
  console.log("wrote visual-roles-users.png");

  await page.getByTestId("org-admin-roles-tab-product-roles").click();
  await page.waitForSelector("[data-testid=org-admin-product-roles-catalogue]", {
    timeout: 30_000,
  });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(OUT, "visual-roles-product-roles.png"),
    fullPage: true,
  });
  console.log("wrote visual-roles-product-roles.png");

  await page.getByTestId("org-admin-roles-tab-tools").click();
  await page.waitForSelector("[data-testid=org-admin-professional-tools]", {
    timeout: 30_000,
  });
  await page.waitForSelector("[data-testid=org-admin-tools-table]", {
    timeout: 30_000,
  });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(OUT, "visual-roles-tools.png"),
    fullPage: true,
  });
  console.log("wrote visual-roles-tools.png");

  await shot(
    page,
    "visual-products.png",
    "/organisation-admin/products",
    "organisation-admin-products",
    "[data-testid^=org-admin-product-], [data-testid^=org-admin-products-section-]",
  );

  await shot(
    page,
    "visual-product-apzprd.png",
    "/organisation-admin/products/productivity",
    "organisation-admin-product-detail",
    "[data-testid=org-admin-product-capabilities], [data-testid=org-admin-product-overview]",
  );

  await shot(
    page,
    "visual-provisioning.png",
    "/organisation-admin/provisioning",
    "organisation-admin-provisioning",
    "[data-testid=org-admin-provisioning-overview]",
  );

  await browser.close();
  console.log("visual evidence complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
