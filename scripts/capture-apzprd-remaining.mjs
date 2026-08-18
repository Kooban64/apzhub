import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3300";
const EVIDENCE = "docs/frontend/workbench/evidence/apzprd";

async function login(page) {
  const credRes = await page.request.post(`${ORIGIN}/api/v1/demo/quick-login`, {
    data: { id: "org_member" },
  });
  const credBody = await credRes.json();
  const signIn = await page.request.post(`${ORIGIN}/api/auth/sign-in/email`, {
    data: {
      email: credBody.data.email,
      password: credBody.data.password,
    },
    headers: { Origin: ORIGIN, Referer: `${ORIGIN}/login` },
  });
  if (!signIn.ok()) throw new Error(`sign-in ${signIn.status()}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ baseURL: ORIGIN });
const page = await context.newPage();
await login(page);

for (const [path, file] of [
  ["/workspace/knowledge", "09-knowledge.png"],
  ["/workspace/knowledge/library", "10-knowledge-article.png"],
  ["/workspace/documents", "11-documents.png"],
  ["/workspace/documents/documents", "12-document-inspector.png"],
]) {
  try {
    await page.goto(`${ORIGIN}${path}`, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.getByTestId("workbench-shell").waitFor({ timeout: 120000 });
    await page.screenshot({ path: `${EVIDENCE}/${file}`, fullPage: true });
    console.log("ok", file);
  } catch (e) {
    console.log("fail", file, String(e).slice(0, 200));
    try {
      await page.screenshot({ path: `${EVIDENCE}/${file}`, fullPage: true });
    } catch {
      /* ignore */
    }
  }
}

try {
  const themeBtn = page.getByRole("button", { name: /theme|dark|light/i }).first();
  if (await themeBtn.count()) await themeBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${EVIDENCE}/15-apzprd-dark.png`, fullPage: true });
  console.log("ok 15-apzprd-dark.png");
} catch (e) {
  console.log("fail dark", e);
}

await browser.close();
