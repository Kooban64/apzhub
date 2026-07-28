/**
 * APZHUB-ENG-0019 / RG-AUTH-SHELL-RESIDUAL — deterministic DEV sign-in for SPR + workbench certs.
 * Prefer Better Auth HTTP sign-in (Origin-aware) so controlled React login inputs cannot leave
 * an empty password in component state (historical "Invalid password" / browser-closed races).
 * APZHUB-ENG-0006 introduced shared UI sign-in; this residual ports the Law API pattern (ENG-0007).
 */
import { expect, type Page } from "@playwright/test";

export const DEV_EMAIL = "dev@apzhub.local";
export const DEV_PASSWORD = "DevPassword123!";
export const DEV_NAME = "Dev User";

const WEB_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_WEB_PORT ?? "3300"}`;

function assertPageOpen(page: Page, action: string): void {
  if (page.isClosed()) {
    throw new Error(`RG-AUTH-SHELL-RESIDUAL: page/context closed before ${action}`);
  }
}

/**
 * Shared shell hydration gate after authenticated navigation.
 */
export async function ensureHomeWorkspace(page: Page): Promise<void> {
  assertPageOpen(page, "ensureHomeWorkspace");
  if (!/\/workspace\//.test(page.url())) {
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
  }
  await expect(page).toHaveURL(/\/workspace\//, { timeout: 20_000 });
  await expect(page.getByText("APZHUB", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByLabel("Home workspace")).toBeVisible({
    timeout: 20_000,
  });
}

async function apiSignIn(page: Page): Promise<boolean> {
  assertPageOpen(page, "apiSignIn");
  try {
    const response = await page.request.post("/api/auth/sign-in/email", {
      data: {
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      },
      headers: {
        origin: WEB_ORIGIN,
        referer: `${WEB_ORIGIN}/login`,
      },
    });
    return response.ok();
  } catch (error) {
    if (page.isClosed()) {
      throw new Error(
        `RG-AUTH-SHELL-RESIDUAL: page closed during API sign-in (${
          error instanceof Error ? error.message : "unknown"
        })`,
      );
    }
    return false;
  }
}

async function apiSignUp(page: Page): Promise<boolean> {
  assertPageOpen(page, "apiSignUp");
  try {
    const response = await page.request.post("/api/auth/sign-up/email", {
      data: {
        name: DEV_NAME,
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      },
      headers: {
        origin: WEB_ORIGIN,
        referer: `${WEB_ORIGIN}/register`,
      },
    });
    return response.ok();
  } catch {
    return false;
  }
}

async function uiSignInFallback(page: Page): Promise<void> {
  assertPageOpen(page, "uiSignInFallback");
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").click();
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("");
  await page.getByLabel("Password").pressSequentially(DEV_PASSWORD, {
    delay: 10,
  });
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/workspace\/|\/$/, { timeout: 20_000 });
  await ensureHomeWorkspace(page);
}

/**
 * Sign in as the seeded DEV user (global-setup guarantees credentials).
 * API-first; UI path only as last resort with pressSequentially.
 */
export async function signInDevUser(page: Page): Promise<void> {
  assertPageOpen(page, "signInDevUser");

  if (await apiSignIn(page)) {
    await ensureHomeWorkspace(page);
    return;
  }

  if (await apiSignUp(page)) {
    await ensureHomeWorkspace(page);
    return;
  }

  // Credentials may race with first-time seed — one API sign-in retry after brief wait.
  await page.waitForTimeout(500);
  if (await apiSignIn(page)) {
    await ensureHomeWorkspace(page);
    return;
  }

  await uiSignInFallback(page);
}
