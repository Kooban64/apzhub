/**
 * Capture remaining APZPRD evidence screenshots (knowledge / documents / dark).
 * Uses the same quick-login path as Playwright e2e.
 */
import { chromium } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";
const EVIDENCE = "docs/frontend/workbench/evidence/apzprd";

async function login(page: import("@playwright/test").Page) {
  const credRes = await page.request.post(`${ORIGIN}/api/v1/demo/quick-login`, {
    data: { id: "org_member" },
  });
  if (!credRes.ok()) throw new Error(`quick-login ${credRes.status()}`);
  const credBody = (await credRes.json()) as {
    data?: { email?: string; password?: string };
  };
  const signIn = await page.request.post(`${ORIGIN}/api/auth/sign-in/email`, {
    data: {
      email: credBody.data!.email,
      password: credBody.data!.password,
    },
    headers: { Origin: ORIGIN, Referer: `${ORIGIN}/login` },
  });
  if (!signIn.ok()) throw new Error(`sign-in ${signIn.status()}`);
}

async function shot(page: import("@playwright/test").Page, path: string, file: string) {
  try {
    await page.goto(`${ORIGIN}${path}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.getByTestId("workbench-shell").waitFor({ timeout: 90_000 });
  } catch (err) {
    console.warn(`soft fail ${path}:`, err);
  }
  await page.screenshot({ path: `${EVIDENCE}/${file}`, fullPage: true });
  console.log("wrote", file);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await login(page);
  await shot(page, "/workspace/knowledge", "09-knowledge.png");
  await shot(page, "/workspace/knowledge/library", "10-knowledge-article.png");
  await shot(page, "/workspace/documents", "11-documents.png");
  await shot(page, "/workspace/documents/documents", "12-document-inspector.png");
  await shot(page, "/workspace/home", "15-apzprd-dark.png");
  const themeBtn = page.getByRole("button", { name: /theme|dark|light/i }).first();
  if (await themeBtn.count()) {
    await themeBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${EVIDENCE}/15-apzprd-dark.png`,
      fullPage: true,
    });
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
