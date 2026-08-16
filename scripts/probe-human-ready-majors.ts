/**
 * Focused probe for human-ready audit majors.
 */
import { chromium } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

async function quickLogin(
  page: import("@playwright/test").Page,
  id: string,
): Promise<void> {
  await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("demo-quick-login").selectOption(id);
  await page.waitForURL((u) => !u.pathname.includes("/login"), {
    timeout: 60_000,
  });
  console.log("landed", page.url());
}

async function dump(
  page: import("@playwright/test").Page,
  label: string,
): Promise<void> {
  console.log("---", label, "---");
  console.log("url", page.url());
  console.log("title", await page.title());
  const body = (await page.locator("body").innerText()).slice(0, 900);
  console.log("body:", body.replace(/\n+/g, " | "));
  for (const id of [
    "workbench-header-chrome",
    "product-switcher",
    "org-admin-members-view",
    "iam-create-user-wizard",
    "iam-invite-email",
  ]) {
    const c = await page.getByTestId(id).count();
    const vis = c
      ? await page
          .getByTestId(id)
          .first()
          .isVisible()
          .catch(() => false)
      : false;
    console.log(id, "count", c, "visible", vis);
  }
  const hc = await page.request.get(`${ORIGIN}/api/v1/me/home-context`);
  console.log(
    "home-context",
    hc.status(),
    JSON.stringify(await hc.json()).slice(0, 600),
  );
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    baseURL: ORIGIN,
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();

  page.setDefaultTimeout(90_000);

  await quickLogin(page, "org_admin");
  await page.goto(`${ORIGIN}/org/members`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await dump(page, "org_admin members");
  await page.waitForTimeout(8000);
  await dump(page, "org_admin members +8s");

  // Simulate audit shellNav crawl then re-check members
  for (const p of [
    "/org",
    "/org/members",
    "/org/services",
    "/org/professional-tools",
    "/org/subscriptions",
    "/org/billing",
    "/apzpen",
  ]) {
    await page.goto(`${ORIGIN}${p}`, { waitUntil: "domcontentloaded" });
    console.log("visited", p, "->", page.url());
  }
  await page.goto(`${ORIGIN}/org/members`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  await dump(page, "org_admin members after crawl");

  await ctx.clearCookies();
  await quickLogin(page, "org_member");
  await page.goto(`${ORIGIN}/workspace/home`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await dump(page, "org_member home");
  await page.waitForTimeout(8000);
  await dump(page, "org_member home +8s");

  for (const p of [
    "/workspace/projects",
    "/workspace/support",
    "/workspace/time",
    "/workspace/documents",
    "/workspace/knowledge",
    "/workspace/qep",
    "/workspace/administration/members",
    "/workspace/billing",
    "/workspace/personalisation",
    "/workspace/settings",
  ]) {
    await page.goto(`${ORIGIN}${p}`, { waitUntil: "domcontentloaded" });
    console.log("visited", p, "->", page.url());
  }
  await page.goto(`${ORIGIN}/workspace/home`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  await dump(page, "org_member home after crawl");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
