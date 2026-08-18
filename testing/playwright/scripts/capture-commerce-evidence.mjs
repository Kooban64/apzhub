/* global process, console, document */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";
const EVIDENCE = "docs/frontend/workbench/evidence/commerce";
fs.mkdirSync(EVIDENCE, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function shot(name) {
  const dest = path.join(EVIDENCE, name);
  await page.screenshot({ path: dest, fullPage: true });
  console.log("ok", name);
}

async function login(persona) {
  const credRes = await page.request.post(ORIGIN + "/api/v1/demo/quick-login", {
    data: { id: persona },
    timeout: 30_000,
  });
  if (!credRes.ok()) throw new Error("quick-login " + persona + " " + credRes.status());
  const cred = await credRes.json();
  const signIn = await page.request.post(ORIGIN + "/api/auth/sign-in/email", {
    data: { email: cred.data.email, password: cred.data.password },
    headers: { Origin: ORIGIN, Referer: ORIGIN + "/login" },
    timeout: 30_000,
  });
  if (!signIn.ok()) throw new Error("sign-in " + persona + " " + signIn.status());
}

async function goto(route, waitMs = 800) {
  await page.goto(ORIGIN + route, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(waitMs);
}

await goto("/");
await shot("01-public-home.png");

await goto("/products");
await shot("02-products.png");

await goto("/products/apzprd");
await shot("03-product-apzprd.png");

await goto("/products/apzqep");
await shot("04-product-qep.png");

await goto("/products/apzpen");
await shot("05-product-pen.png");

await goto("/build?package=pkg.apzqep.starter&plan=plan.business&seats=1");
await shot("06-pricing-selection.png");

await goto("/register");
await shot("07-register.png");

await goto("/login");
await shot("08-login.png");

await goto("/forgot-password");
await shot("09-forgot-password.png");

await goto("/onboarding/organisation");
await shot("10-organisation-setup.png");

await goto("/pricing/checkout?plan=plan.business&package=pkg.apzqep.starter&seats=1");
await shot("11-payment.png");

await goto("/checkout/processing");
await shot("12-provisioning.png");

await goto("/onboarding/welcome");
await shot("13-first-login.png");

await goto("/marketplace");
await shot("14-marketplace.png");

await login("org_admin");
await goto("/organisation-admin/products", 2000);
await shot("15-marketplace-manage.png");

await goto("/workspace/home", 2500);
await shot("16-workbench-after-login.png");

await goto("/organisation-admin", 2000);
await shot("17-organisation-admin-entry.png");

try {
  await goto("/workspace/home", 1500);
  const themeBtn = page.getByRole("button", { name: /theme|dark|light/i }).first();
  if ((await themeBtn.count()) > 0) {
    await themeBtn.click({ timeout: 5_000 }).catch(() => undefined);
    await page.waitForTimeout(500);
  } else {
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(300);
  }
  await shot("18-dark-workbench.png");
} catch (error) {
  console.log("dark shot soft-fail", error instanceof Error ? error.message : error);
  await shot("18-dark-workbench.png");
}

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mobile.newPage();
await mpage.goto(ORIGIN + "/", { waitUntil: "domcontentloaded", timeout: 90_000 });
await mpage.waitForTimeout(800);
await mpage.screenshot({
  path: path.join(EVIDENCE, "19-mobile-public.png"),
  fullPage: true,
});
console.log("ok 19-mobile-public.png");

const credRes = await mpage.request.post(ORIGIN + "/api/v1/demo/quick-login", {
  data: { id: "org_member" },
  timeout: 30_000,
});
const cred = await credRes.json();
await mpage.request.post(ORIGIN + "/api/auth/sign-in/email", {
  data: { email: cred.data.email, password: cred.data.password },
  headers: { Origin: ORIGIN, Referer: ORIGIN + "/login" },
  timeout: 30_000,
});
await mpage.goto(ORIGIN + "/workspace/home", {
  waitUntil: "domcontentloaded",
  timeout: 90_000,
});
await mpage.waitForTimeout(2000);
await mpage.screenshot({
  path: path.join(EVIDENCE, "20-mobile-workbench.png"),
  fullPage: true,
});
console.log("ok 20-mobile-workbench.png");

console.log("--- files ---");
console.log(fs.readdirSync(EVIDENCE).sort().join("\n"));
await browser.close();
