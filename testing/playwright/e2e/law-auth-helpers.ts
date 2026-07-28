/**
 * APZHUB-ENG-0007 / RG-LAW-DNS — Law Platform deterministic DEV sign-in.
 * Prefer Better Auth HTTP sign-in (Origin-aware) so controlled React login
 * inputs cannot leave an empty password in component state.
 */
import { expect, type Page } from "@playwright/test";

import { DEV_EMAIL, DEV_NAME, DEV_PASSWORD } from "./auth-helpers";

const LAW_ORIGIN =
  process.env.PLAYWRIGHT_LAW_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_LAW_PORT ?? "3302"}`;

async function ensureLawWorkspace(page: Page): Promise<void> {
  if (!/\/workspace\//.test(page.url())) {
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
  }
  await expect(page).toHaveURL(/\/workspace\//, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: /workspace/i }).first()).toBeVisible({
    timeout: 20_000,
  });
}

async function apiSignIn(page: Page): Promise<boolean> {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
    },
    headers: {
      origin: LAW_ORIGIN,
      referer: `${LAW_ORIGIN}/login`,
    },
  });
  return response.ok();
}

async function apiSignUp(page: Page): Promise<boolean> {
  const response = await page.request.post("/api/auth/sign-up/email", {
    data: {
      name: DEV_NAME,
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
    },
    headers: {
      origin: LAW_ORIGIN,
      referer: `${LAW_ORIGIN}/register`,
    },
  });
  return response.ok();
}

export async function signInLawDevUser(page: Page): Promise<void> {
  if (await apiSignIn(page)) {
    await ensureLawWorkspace(page);
    return;
  }

  if (await apiSignUp(page)) {
    await ensureLawWorkspace(page);
    return;
  }

  // Last resort: UI path with pressSequentially for controlled inputs.
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").click();
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("");
  await page.getByLabel("Password").pressSequentially(DEV_PASSWORD, {
    delay: 10,
  });
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/workspace\//, { timeout: 20_000 });
  await ensureLawWorkspace(page);
}
